package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.MessageDTO;
import java.util.List;

public interface MessageService {
    
    // 메시지 저장
    MessageDTO saveMessage(MessageDTO messageDTO);
    
    // 채팅 히스토리 조회 (페이징 포함)
    List<MessageDTO> getChatHistory(Integer roomId, int page, int size, String beforeDate);
    
    // 채팅방별 메시지 목록 조회
    List<MessageDTO> getMessagesByRoomId(Integer roomId);
    
    // 메시지 상세 조회
    MessageDTO getMessage(Integer messageId);
    
    // 메시지 삭제 (논리 삭제)
    void deleteMessage(Integer messageId);
    
    // 사용자별 메시지 목록 조회
    List<MessageDTO> getMessagesBySenderId(Integer senderId);
    
    // 채팅방 메시지 개수 조회
    int getMessageCountByRoomId(Integer roomId);
    
    // 최근 메시지 조회 (스크롤 업 시 사용)
    List<MessageDTO> getRecentMessages(Integer roomId, int limit);
} 