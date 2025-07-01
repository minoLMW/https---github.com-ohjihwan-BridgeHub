package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatLogFile {
    
    private Integer logFileId;
    private Integer roomId;
    private LocalDate logDate;
    private String filePath;
    private String fileName;
    private Integer messageCount = 0;
    private Long fileSize = 0L;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private Boolean isArchived = false;
} 