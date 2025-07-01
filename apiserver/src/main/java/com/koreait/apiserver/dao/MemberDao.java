package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Mapper
public interface MemberDao {
    
    // 회원 등록
    int insertMember(Member member);
    
    // 회원 조회 (ID로)
    Optional<Member> findById(Integer id);
    
    // 회원 조회 (username으로)
    Optional<Member> findByUsername(String username);
    
    // 회원 조회 (email로)
    Optional<Member> findByEmail(String email);
    
    // 모든 회원 조회
    List<Member> findAll();
    
    // 회원 정보 수정
    int updateMember(Member member);
    
    // 이메일 인증 정보 업데이트
    int updateEmailVerification(@Param("id") Integer id, 
                               @Param("emailVerified") Boolean emailVerified);
    
    // 회원 삭제
    int deleteMember(Integer id);
    
    // username 중복 확인
    boolean existsByUsername(String username);
    
    // email 중복 확인
    boolean existsByEmail(String email);
    
    // 학과별 회원 조회
    List<Member> findByDepartment(String department);
    
    // 지역별 회원 조회
    List<Member> findByRegion(String region);
    
    // 시간대별 회원 조회
    List<Member> findByTime(String time);
    
    // 관리자 기능 추가
    List<Member> findAllWithPaging(@Param("offset") int offset, @Param("size") int size);
    int getTotalCount();
    int updateMemberStatus(@Param("memberId") Integer memberId, @Param("status") String status);
    
    // 통계용
    Map<String, Integer> countByGender();
    Map<String, Integer> countByEducation();
    Map<String, Integer> countByTime();
    Map<String, Integer> countByDepartment();
    
    // 활동 통계용
    Map<String, Integer> getQuarterlySignups();
    Map<String, Integer> getQuarterlyVisitors();
    List<Map<String, Object>> getTopActiveUsers();
    List<Map<String, Object>> getPopularRooms();
    Integer getTotalVisitors();
} 