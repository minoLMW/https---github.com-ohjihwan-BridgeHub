package com.koreait.apiserver.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MessageDTO {
    private Integer messageId;
    private Integer roomId;
    private Integer senderId;
    private String content;
    private String messageType = "TEXT";  // TEXT, FILE, IMAGE, LINK
    private LocalDateTime sentAt;
    private Boolean isDeleted = false;
    
    // 추가 필드 (Socket Server에서 사용)
    private String senderNickname;
    
    // 발신자 정보 (JOIN 결과)
    private String senderProfileImage;
    
    // 링크 미리보기 정보 (메시지에 URL이 포함된 경우)
    private List<LinkPreviewDTO> linkPreviews;
    private Boolean hasLinks = false;
} 