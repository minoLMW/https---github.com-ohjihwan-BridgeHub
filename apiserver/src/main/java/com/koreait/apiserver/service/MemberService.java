package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.MemberDTO;

import java.util.List;
import java.util.Map;

public interface MemberService {
    void register(MemberDTO member);
    MemberDTO login(String username, String password);
    void logout(String token);
    void verifyEmail(String username);
    boolean isEmailVerified(String username);
    MemberDTO getMemberByUsername(String username);
    MemberDTO getMemberById(Long id); // ID 기반 조회 추가
    MemberDTO updateMember(MemberDTO member);
    void deleteMember(String username);
    
    // 비밀번호 재설정 관련 메서드 추가
    boolean resetPassword(String username, String email, String resetCode, String newPassword);
    
    // 관리자 기능 추가
    List<MemberDTO> getMembersWithPaging(int page, int size);
    int getTotalMembersCount();
    MemberDTO updateMemberStatus(Integer memberId, String status);
    void deleteMember(Integer memberId); // memberId로 회원 삭제
    
    // 통계용
    Map<String, Object> getMemberStatistics();
    Map<String, Object> getActivityStatistics();
}
