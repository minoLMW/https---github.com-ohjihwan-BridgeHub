package com.koreait.apiserver.dto;

import com.koreait.apiserver.entity.StudyRoomMember;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyRoomMemberDTO {
    private Integer id;
    private Integer studyRoomId;
    private Integer memberId;
    private StudyRoomMember.MemberRole role;
    private StudyRoomMember.MemberStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime approvedAt;
    private Integer approvedBy;
    
    // 멤버 정보 (이름 제거, 닉네임만 유지)
    private String memberNickname;
    private String memberEmail;
    private String memberProfileImage;
    private String memberDescription;  // 멤버 자기소개
    
    // 스터디룸 정보
    private String studyRoomTitle;
} 