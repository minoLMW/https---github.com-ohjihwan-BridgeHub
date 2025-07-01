package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.StudyRoom;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface StudyRoomDao {
    
    // 스터디룸 등록
    int insertStudyRoom(StudyRoom studyRoom);
    
    // 스터디룸 조회 (ID로)
    Optional<StudyRoom> findById(Integer studyRoomId);
    
    // 채팅방 ID로 스터디룸 조회
    Optional<StudyRoom> findByRoomId(Integer roomId);
    
    // 모든 스터디룸 조회 (페이징)
    List<StudyRoom> findAll(@Param("limit") int limit, @Param("offset") int offset);
    
    // 방장별 스터디룸 조회
    List<StudyRoom> findByBossId(Integer bossId);
    
    // 학과별 스터디룸 조회
    List<StudyRoom> findByDepartment(String department);
    
    // 지역별 스터디룸 조회
    List<StudyRoom> findByRegion(String region);
    
    // 시간대별 스터디룸 조회
    List<StudyRoom> findByTime(String time);
    
    // 스터디룸 정보 수정
    int updateStudyRoom(StudyRoom studyRoom);
    
    // 현재 멤버 수 증가
    int incrementCurrentMembers(Integer studyRoomId);
    
    // 현재 멤버 수 감소
    int decrementCurrentMembers(Integer studyRoomId);
    
    // 스터디룸 삭제
    int deleteStudyRoom(Integer studyRoomId);
    
    // 전체 스터디룸 수 조회
    int countAll();
    
    // 사용자별 스터디룸 조회 (기존 Board와의 호환성)
    List<StudyRoom> findByUsername(String username);
    
    // front-server 연동을 위한 필수 메서드들
    List<StudyRoom> findHotStudyRooms(@Param("limit") int limit);
    List<StudyRoom> findByMemberId(@Param("memberId") Integer memberId);
    
}