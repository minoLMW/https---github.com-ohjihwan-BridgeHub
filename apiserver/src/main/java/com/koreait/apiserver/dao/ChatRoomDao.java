package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.ChatRoom;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatRoomDao {
    
    // 채팅방 등록
    int insertChatRoom(ChatRoom chatRoom);
    
    // 채팅방 조회 (ID로)
    Optional<ChatRoom> findById(Integer roomId);
    
    // 모든 채팅방 조회
    List<ChatRoom> findAll();
    
    // 채팅방 정보 수정
    int updateChatRoom(ChatRoom chatRoom);
    
    // 채팅방 삭제
    int deleteChatRoom(Integer roomId);
    
    // 사용자별 채팅방 조회 (기존 Comment와의 호환성)
    List<ChatRoom> findByUsername(String username);
    
    // 스터디룸별 채팅방 조회 (기존 Comment와의 호환성)
    List<ChatRoom> findByBoardId(Integer boardId);
} 