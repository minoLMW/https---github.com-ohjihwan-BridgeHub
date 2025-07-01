package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyRoom {
    
    private Integer studyRoomId;
    private Integer roomId;  // ChatRoom과 연결
    private Integer bossId;  // 방장 ID
    private String title;
    private String description;  // content를 description으로 변경
    private String education;
    private String department;
    private String region;
    private String district;
    private Integer capacity = 10;
    private Integer currentMembers = 1;
    private String time;
    private String thumbnail;
    private Boolean isPublic = true;
    private LocalDateTime createdAt;
    
    // 생성자 정보 (JOIN 결과) - 이름 제거, 닉네임만 유지
    private String bossNickname;
    private String bossProfileImage;
    
    // 기존 Board와의 호환성을 위한 getter/setter
    public Long getBoardId() {
        return this.studyRoomId != null ? this.studyRoomId.longValue() : null;
    }
    
    public void setBoardId(Long boardId) {
        this.studyRoomId = boardId != null ? boardId.intValue() : null;
    }
    
    public String getContent() {
        return this.description;
    }
    
    public void setContent(String content) {
        this.description = content;
    }
    
    public String getUsername() {
        return null;  // StudyRoom에서는 bossId를 사용
    }
    
    public void setUsername(String username) {
        // StudyRoom에서는 사용하지 않음
    }
    
    public int getViewCount() {
        return this.currentMembers;
    }
    
    public void setViewCount(int viewCount) {
        this.currentMembers = viewCount;
    }
    
    public LocalDateTime getRegDate() {
        return this.createdAt;
    }
    
    public void setRegDate(LocalDateTime regDate) {
        this.createdAt = regDate;
    }
    
    public LocalDateTime getModDate() {
        return this.createdAt;  // StudyRoom에서는 수정일을 별도로 관리하지 않음
    }
    
    public void setModDate(LocalDateTime modDate) {
        // StudyRoom에서는 사용하지 않음
    }
} 