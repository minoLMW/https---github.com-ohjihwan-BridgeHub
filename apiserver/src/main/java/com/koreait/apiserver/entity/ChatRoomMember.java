package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMember {
    
    private Integer roomId;  // ChatRoom과 연결
    private Integer memberId;  // Member와 연결
    private LocalDateTime joinedAt;
    private Boolean isAdmin = false;
} 