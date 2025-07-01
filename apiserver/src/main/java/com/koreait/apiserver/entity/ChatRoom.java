package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    
    private Integer roomId;
    private String roomName;
    private LocalDateTime createdAt;
    private Integer maxMembers = 10;
    private Boolean isActive = true;
    
    // 기존 Comment와의 호환성을 위한 getter/setter
    public Long getCommentId() {
        return this.roomId != null ? this.roomId.longValue() : null;
    }
    
    public void setCommentId(Long commentId) {
        this.roomId = commentId != null ? commentId.intValue() : null;
    }
    
    public Long getBoardId() {
        return null;  // ChatRoom에서는 사용하지 않음
    }
    
    public void setBoardId(Long boardId) {
        // ChatRoom에서는 사용하지 않음
    }
    
    public String getUsername() {
        return null;  // ChatRoom에서는 사용하지 않음
    }
    
    public void setUsername(String username) {
        // ChatRoom에서는 사용하지 않음
    }
    
    public String getContent() {
        return this.roomName;
    }
    
    public void setContent(String content) {
        this.roomName = content;
    }
    
    public LocalDateTime getRegDate() {
        return this.createdAt;
    }
    
    public void setRegDate(LocalDateTime regDate) {
        this.createdAt = regDate;
    }
    
    public LocalDateTime getModDate() {
        return this.createdAt;  // ChatRoom에서는 수정일을 별도로 관리하지 않음
    }
    
    public void setModDate(LocalDateTime modDate) {
        // ChatRoom에서는 사용하지 않음
    }
} 