package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Mapper
public interface MessageDao {
    
    // 메시지 등록
    int insertMessage(Message message);
    
    // 메시지 조회 (ID로)
    Optional<Message> findById(Integer messageId);
    
    // 채팅 히스토리 조회 (페이징 포함)
    List<Message> findChatHistory(@Param("roomId") Integer roomId, 
                                 @Param("offset") int offset, 
                                 @Param("size") int size, 
                                 @Param("beforeDate") LocalDateTime beforeDate);
    
    // 채팅방별 메시지 조회
    List<Message> findByRoomId(Integer roomId);
    
    // 발신자별 메시지 조회
    List<Message> findBySenderId(Integer senderId);
    
    // 최근 메시지 조회 (페이징)
    List<Message> findRecentMessages(@Param("roomId") Integer roomId, @Param("limit") int limit);
    
    // 채팅방 메시지 개수 조회
    int countByRoomId(Integer roomId);
    
    // 메시지 수정
    int updateMessage(Message message);
    
    // 메시지 소프트 삭제
    int softDeleteMessage(Integer messageId);
    
    // 메시지 완전 삭제
    int deleteMessage(Integer messageId);
    
    // 채팅방의 모든 메시지 삭제
    int deleteByRoomId(Integer roomId);
    
    // 오래된 임시 메시지 삭제 (로그 파일에 저장된 메시지)
    int deleteOldTempMessages(@Param("cutoffDate") LocalDateTime cutoffDate);
} 