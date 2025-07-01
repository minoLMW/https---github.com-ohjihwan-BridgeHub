package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.entity.ChatLogFile;

import java.time.LocalDate;
import java.util.List;

public interface ChatLogService {
    
    /**
     * 메시지를 로그 파일에 저장
     */
    void saveMessageToLog(MessageDTO message);
    
    /**
     * 특정 날짜의 채팅 로그 조회
     */
    List<MessageDTO> getChatLogByDate(Integer roomId, LocalDate date);
    
    /**
     * 채팅방의 최근 메시지 조회 (DB + 로그 파일)
     */
    List<MessageDTO> getRecentMessages(Integer roomId, int limit);
    
    /**
     * 임시 메시지를 로그 파일로 아카이브
     */
    void archiveMessages(Integer roomId, LocalDate date);
    
    /**
     * 로그 파일 정보 조회
     */
    ChatLogFile getLogFileInfo(Integer roomId, LocalDate date);
    
    /**
     * 신고용 메시지 조회 (로그 파일에서)
     */
    List<MessageDTO> getMessagesForReport(Integer roomId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 오래된 임시 메시지 정리
     */
    void cleanupOldTempMessages(int daysToKeep);
} 