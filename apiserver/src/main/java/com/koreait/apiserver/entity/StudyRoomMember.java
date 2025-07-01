package com.koreait.apiserver.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyRoomMember {
    private Integer id;
    private Integer studyRoomId;
    private Integer memberId;
    private MemberRole role;
    private MemberStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime approvedAt;
    private Integer approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 조인된 정보
    private String memberName;
    private String memberNickname;
    private String memberEmail;
    private String memberProfileImage;
    private String memberDescription;  // 멤버 자기소개
    
    public enum MemberRole {
        BOSS, MEMBER
    }
    
    public enum MemberStatus {
        PENDING, APPROVED, REJECTED
    }
} 