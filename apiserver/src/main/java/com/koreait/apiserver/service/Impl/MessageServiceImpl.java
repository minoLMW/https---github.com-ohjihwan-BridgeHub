package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.MessageDao;
import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.dto.LinkPreviewDTO;
import com.koreait.apiserver.entity.Message;
import com.koreait.apiserver.service.MessageService;
import com.koreait.apiserver.service.ChatLogService;
import com.koreait.apiserver.service.LinkPreviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageDao messageDao;
    private final ChatLogService chatLogService;
    private final LinkPreviewService linkPreviewService;

    @Override
    @Transactional
    public MessageDTO saveMessage(MessageDTO messageDTO) {
        Message message = new Message();
        message.setRoomId(messageDTO.getRoomId());
        message.setSenderId(messageDTO.getSenderId());
        message.setContent(messageDTO.getContent());
        message.setMessageType(messageDTO.getMessageType());
        message.setSentAt(LocalDateTime.now());
        message.setIsDeleted(false);

        // URL 감지 및 링크 미리보기 추출
        List<String> urls = linkPreviewService.extractUrls(messageDTO.getContent());
        if (!urls.isEmpty()) {
            log.info("메시지에서 URL 감지됨: {}", urls);
            
            // 메시지 타입을 LINK로 변경 (URL이 포함된 경우)
            if ("TEXT".equals(message.getMessageType())) {
                message.setMessageType("LINK");
            }
        }

        messageDao.insertMessage(message);
        
        MessageDTO savedMessage = convertToDTO(message);
        
        // URL이 있는 경우 링크 미리보기 추출 (비동기로 처리)
        if (!urls.isEmpty()) {
            savedMessage.setHasLinks(true);
            savedMessage.setLinkPreviews(extractLinkPreviews(urls));
        }
        
        // 로그 파일에 저장
        try {
            chatLogService.saveMessageToLog(savedMessage);
        } catch (Exception e) {
            log.error("메시지 로그 저장 실패: messageId={}", message.getMessageId(), e);
        }
        
        return savedMessage;
    }

    // 링크 미리보기 추출 (여러 URL 처리)
    private List<LinkPreviewDTO> extractLinkPreviews(List<String> urls) {
        List<LinkPreviewDTO> previews = new ArrayList<>();
        
        for (String url : urls) {
            try {
                LinkPreviewDTO preview = linkPreviewService.extractLinkPreview(url);
                if (preview.isSuccess()) {
                    previews.add(preview);
                    log.info("링크 미리보기 추출 성공: {} - {}", url, preview.getTitle());
                } else {
                    log.warn("링크 미리보기 추출 실패: {} - {}", url, preview.getError());
                }
            } catch (Exception e) {
                log.error("링크 미리보기 추출 중 오류: {}", url, e);
            }
        }
        
        return previews;
    }

    @Override
    public List<MessageDTO> getChatHistory(Integer roomId, int page, int size, String beforeDate) {
        if (page == 1) {
            List<MessageDTO> logMessages = chatLogService.getRecentMessages(roomId, size);
            if (!logMessages.isEmpty()) {
                return logMessages;
            }
        }
        
        int offset = (page - 1) * size;
        
        LocalDateTime beforeDateTime = null;
        if (beforeDate != null && !beforeDate.trim().isEmpty()) {
            try {
                beforeDateTime = LocalDateTime.parse(beforeDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception e) {
                beforeDateTime = LocalDateTime.now();
            }
        }
        
        List<Message> messages = messageDao.findChatHistory(roomId, offset, size, beforeDateTime);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> getMessagesByRoomId(Integer roomId) {
        return messageDao.findByRoomId(roomId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDTO getMessage(Integer messageId) {
        Optional<Message> messageOpt = messageDao.findById(messageId);
        return messageOpt.map(this::convertToDTO).orElse(null);
    }

    @Override
    @Transactional
    public void deleteMessage(Integer messageId) {
        Optional<Message> messageOpt = messageDao.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setIsDeleted(true);
            messageDao.updateMessage(message);
        }
    }

    @Override
    public List<MessageDTO> getMessagesBySenderId(Integer senderId) {
        return messageDao.findBySenderId(senderId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int getMessageCountByRoomId(Integer roomId) {
        return messageDao.countByRoomId(roomId);
    }

    @Override
    public List<MessageDTO> getRecentMessages(Integer roomId, int limit) {
        try {
            // 로그 파일에서 메시지 조회 시도
            List<MessageDTO> logMessages = chatLogService.getRecentMessages(roomId, limit);
            if (logMessages != null && !logMessages.isEmpty()) {
                log.debug("로그 파일에서 {} 개의 메시지 조회됨", logMessages.size());
                return logMessages;
            }
            
            // 데이터베이스에서 메시지 조회
            log.debug("데이터베이스에서 메시지 조회 시도: roomId={}, limit={}", roomId, limit);
            List<Message> messages = messageDao.findRecentMessages(roomId, limit);
            List<MessageDTO> result = messages.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.debug("데이터베이스에서 {} 개의 메시지 조회됨", result.size());
            return result;
            
        } catch (Exception e) {
            log.error("최근 메시지 조회 중 오류 발생: roomId={}, limit={}", roomId, limit, e);
            // 에러가 발생해도 빈 리스트 반환하여 서비스 중단 방지
            return new ArrayList<>();
        }
    }

    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setRoomId(message.getRoomId());
        dto.setSenderId(message.getSenderId());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType());
        dto.setSentAt(message.getSentAt());
        dto.setIsDeleted(message.getIsDeleted());
        
        dto.setSenderNickname(message.getSenderNickname());
        dto.setSenderProfileImage(message.getSenderProfileImage());
        
        return dto;
    }
} 