package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    private Integer reportId;
    private Integer reporterId;  // 신고자 ID
    private Integer reportedUserId;  // 신고 대상 회원 ID
    private String reportType;  // USER, MESSAGE, STUDYROOM
    private Integer messageId;  // 신고한 메시지 ID
    private Integer roomId;  // 신고한 채팅방 ID
    private Integer studyRoomId;  // 스터디룸 ID
    private String reason;
    private LocalDateTime createdAt;
    private String status = "PENDING";  // PENDING, PROCESSING, RESOLVED, REJECTED
    private String adminComment;
    
    // 로그 시스템 관련 필드
    private Integer logFileId;      // 신고 관련 로그 파일 ID
    private Integer logMessageIndex; // 로그 파일 내 메시지 인덱스
} 