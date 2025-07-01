package com.koreait.apiserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDTO {
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
    
    // 추가 정보 (JOIN 결과)
    private String reporterName;
    private String reportedUserName;
    private String messageContent;
    private String roomName;
    private String studyRoomTitle;
} 