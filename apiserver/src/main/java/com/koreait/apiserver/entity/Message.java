package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    private Integer messageId;
    private Integer roomId;
    private Integer senderId;
    private String content;
    private String messageType = "TEXT";
    private LocalDateTime sentAt;
    private Boolean isDeleted = false;
    private Boolean isLogged = false;
    private Integer logFileId;
    private Integer logMessageIndex;
    
    private String senderNickname;
    private String senderProfileImage;
} 