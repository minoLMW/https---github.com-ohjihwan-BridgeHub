package com.koreait.apiserver.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChatRoomDTO {
    private Integer roomId;
    private String roomName;
    private LocalDateTime createdAt;
    private Integer maxMembers = 10;
    private Boolean isActive = true;
    
    // 추가 정보
    private Integer currentMemberCount;
    private List<ChatRoomMemberDTO> members;
    private List<MessageDTO> recentMessages;
} 