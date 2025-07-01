package com.koreait.apiserver.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatRoomMemberDTO {
    private Integer roomId;
    private Integer memberId;
    private LocalDateTime joinedAt;
    private Boolean isAdmin = false;
    
    // 멤버 정보 (JOIN 결과)
    private String memberName;
    private String memberNickname;
    private String memberProfileImage;
}
 