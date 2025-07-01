package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.StudyRoomMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StudyRoomMemberDao {
    
    // 스터디 참가 신청
    int insertStudyRoomMember(StudyRoomMember member);
    
    // 스터디 멤버 조회
    List<StudyRoomMember> selectStudyRoomMembers(@Param("studyRoomId") Integer studyRoomId);
    
    // 승인된 멤버만 조회
    List<StudyRoomMember> selectApprovedMembers(@Param("studyRoomId") Integer studyRoomId);
    
    // 대기중인 멤버 조회 (방장용)
    List<StudyRoomMember> selectPendingMembers(@Param("studyRoomId") Integer studyRoomId);
    
    // 멤버 상태 업데이트 (승인/거절)
    int updateMemberStatus(@Param("id") Integer id, 
                          @Param("status") StudyRoomMember.MemberStatus status,
                          @Param("approvedBy") Integer approvedBy);
    
    // 특정 멤버 조회
    StudyRoomMember selectStudyRoomMember(@Param("studyRoomId") Integer studyRoomId, 
                                         @Param("memberId") Integer memberId);
    
    // 사용자의 참여 스터디 조회
    List<StudyRoomMember> selectMemberStudyRooms(@Param("memberId") Integer memberId);
    
    // 스터디에서 멤버 제거
    int deleteStudyRoomMember(@Param("studyRoomId") Integer studyRoomId, 
                             @Param("memberId") Integer memberId);
    
    // 승인된 멤버 수 조회
    int countApprovedMembers(@Param("studyRoomId") Integer studyRoomId);
    
    // 방장 여부 확인
    boolean isBoss(@Param("studyRoomId") Integer studyRoomId, 
                   @Param("memberId") Integer memberId);
} 