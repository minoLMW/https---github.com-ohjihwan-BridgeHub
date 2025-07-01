package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.MessageDao;
import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.entity.ChatLogFile;
import com.koreait.apiserver.service.ChatLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class ChatLogServiceImpl implements ChatLogService {

    @Value("${chat.log.path:./chat-logs}")
    private String logBasePath;

    private final MessageDao messageDao;
    private final ObjectMapper objectMapper;
    private final Map<String, Object> fileLocks = new ConcurrentHashMap<>();

    public ChatLogServiceImpl(MessageDao messageDao) {
        this.messageDao = messageDao;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void saveMessageToLog(MessageDTO message) {
        try {
            LocalDate today = LocalDate.now();
            String logFileName = generateLogFileName(message.getRoomId(), today);
            Path logFilePath = Paths.get(logBasePath, logFileName);

            // 디렉토리 생성
            Files.createDirectories(logFilePath.getParent());

            // 파일별 동기화를 위한 락 객체
            String lockKey = logFilePath.toString();
            Object lock = fileLocks.computeIfAbsent(lockKey, k -> new Object());

            synchronized (lock) {
                // 메시지를 JSON 형태로 저장
                String messageJson = objectMapper.writeValueAsString(message) + "\n";
                Files.write(logFilePath, messageJson.getBytes(), 
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                
                log.debug("메시지가 로그 파일에 저장됨: {}", logFilePath);
            }

        } catch (Exception e) {
            log.error("메시지 로그 저장 실패: {}", e.getMessage(), e);
        }
    }

    @Override
    public List<MessageDTO> getChatLogByDate(Integer roomId, LocalDate date) {
        List<MessageDTO> messages = new ArrayList<>();
        
        try {
            String logFileName = generateLogFileName(roomId, date);
            Path logFilePath = Paths.get(logBasePath, logFileName);

            if (!Files.exists(logFilePath)) {
                return messages;
            }

            try (BufferedReader reader = Files.newBufferedReader(logFilePath)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.trim().isEmpty()) {
                        try {
                            MessageDTO message = objectMapper.readValue(line, MessageDTO.class);
                            messages.add(message);
                        } catch (Exception e) {
                            log.warn("로그 라인 파싱 실패: {}", line, e);
                        }
                    }
                }
            }

        } catch (Exception e) {
            log.error("채팅 로그 조회 실패: roomId={}, date={}", roomId, date, e);
        }

        return messages;
    }

    @Override
    public List<MessageDTO> getRecentMessages(Integer roomId, int limit) {
        List<MessageDTO> messages = new ArrayList<>();
        
        // 최근 7일간의 로그 파일에서 메시지 조회
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 7 && messages.size() < limit; i++) {
            LocalDate targetDate = today.minusDays(i);
            List<MessageDTO> dayMessages = getChatLogByDate(roomId, targetDate);
            
            // 최신 메시지부터 추가
            Collections.reverse(dayMessages);
            for (MessageDTO message : dayMessages) {
                if (messages.size() >= limit) break;
                messages.add(0, message); // 앞쪽에 추가 (시간순 정렬)
            }
        }

        return messages.subList(0, Math.min(messages.size(), limit));
    }

    @Override
    public void archiveMessages(Integer roomId, LocalDate date) {
        // 현재는 실시간으로 저장하므로 별도 아카이브 불필요
        // 필요시 임시 메시지를 로그 파일로 이동하는 로직 구현
        log.info("메시지 아카이브 완료: roomId={}, date={}", roomId, date);
    }

    @Override
    public ChatLogFile getLogFileInfo(Integer roomId, LocalDate date) {
        try {
            String logFileName = generateLogFileName(roomId, date);
            Path logFilePath = Paths.get(logBasePath, logFileName);

            ChatLogFile logFile = new ChatLogFile();
            logFile.setRoomId(roomId);
            logFile.setLogDate(date);
            logFile.setFileName(logFileName);
            logFile.setFilePath(logFilePath.toString());

            if (Files.exists(logFilePath)) {
                logFile.setFileSize(Files.size(logFilePath));
                logFile.setCreatedAt(LocalDateTime.now()); // 실제로는 파일 생성 시간
                logFile.setLastUpdated(LocalDateTime.now()); // 실제로는 파일 수정 시간
                
                // 메시지 개수 계산
                long messageCount = Files.lines(logFilePath).count();
                logFile.setMessageCount((int) messageCount);
            }

            return logFile;

        } catch (Exception e) {
            log.error("로그 파일 정보 조회 실패: roomId={}, date={}", roomId, date, e);
            return null;
        }
    }

    @Override
    public List<MessageDTO> getMessagesForReport(Integer roomId, LocalDate startDate, LocalDate endDate) {
        List<MessageDTO> messages = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<MessageDTO> dayMessages = getChatLogByDate(roomId, currentDate);
            messages.addAll(dayMessages);
            currentDate = currentDate.plusDays(1);
        }

        // 시간순 정렬
        messages.sort(Comparator.comparing(MessageDTO::getSentAt));
        
        return messages;
    }

    @Override
    public void cleanupOldTempMessages(int daysToKeep) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
            
            // 오래된 임시 메시지 삭제 (로그 파일에 저장된 메시지만)
            int deletedCount = messageDao.deleteOldTempMessages(cutoffDate);
            
            log.info("{}일 이전의 임시 메시지 {} 개 정리 완료", daysToKeep, deletedCount);
            
        } catch (Exception e) {
            log.error("임시 메시지 정리 실패", e);
        }
    }

    private String generateLogFileName(Integer roomId, LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return String.format("room_%d_%s.log", roomId, dateStr);
    }
} 