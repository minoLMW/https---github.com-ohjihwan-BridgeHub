package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.ChatRoomMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatRoomMemberDao {
    
    // 채팅방 멤버 등록
    int insertChatRoomMember(ChatRoomMember chatRoomMember);
    
    // 채팅방별 멤버 조회
    List<ChatRoomMember> findByRoomId(Integer roomId);
    
    // 회원별 참여 채팅방 조회
    List<ChatRoomMember> findByMemberId(Integer memberId);
    
    // 특정 채팅방의 특정 멤버 조회
    Optional<ChatRoomMember> findByRoomIdAndMemberId(@Param("roomId") Integer roomId, @Param("memberId") Integer memberId);
    
    // 채팅방 관리자 조회
    List<ChatRoomMember> findAdminsByRoomId(Integer roomId);
    
    // 채팅방 멤버 수 조회
    int countMembersByRoomId(Integer roomId);
    
    // 관리자 권한 변경
    int updateAdminStatus(@Param("roomId") Integer roomId, @Param("memberId") Integer memberId, @Param("isAdmin") boolean isAdmin);
    
    // 채팅방 멤버 삭제
    int deleteChatRoomMember(@Param("roomId") Integer roomId, @Param("memberId") Integer memberId);
    
    // 채팅방의 모든 멤버 삭제
    int deleteByRoomId(Integer roomId);
    
    // 회원의 모든 채팅방 참여 삭제
    int deleteByMemberId(Integer memberId);
} 