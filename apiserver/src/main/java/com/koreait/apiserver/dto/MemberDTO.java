package com.koreait.apiserver.dto;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MemberDTO {
    private Integer id;
    private String userid;  // 이메일 형태의 아이디
    private String phone;
    private String nickname;
    private String name;
    private String password;
    private String education;
    private String department;  // major를 department로 변경
    private String gender;
    private String region;  // addr1, addr2를 region으로 통합
    private String district;  // 구/군
    private String time;  // ptime을 time으로 변경
    private String profileImage;
    private String status = "ACTIVE";
    private Boolean emailVerified = false;  // 이메일 인증 상태
    private String description;  // 사용자 자기소개
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 기존 필드들과의 호환성을 위한 getter/setter
    public String getUsername() {
        return this.userid;
    }
    
    public void setUsername(String username) {
        this.userid = username;
    }
    
    public String getEmail() {
        return this.userid;  // userid가 이메일 형태
    }
    
    public void setEmail(String email) {
        this.userid = email;
    }
    
    public String getMajor() {
        return this.department;
    }
    
    public void setMajor(String major) {
        this.department = major;
    }
    
    public String getPtime() {
        return this.time;
    }
    
    public void setPtime(String ptime) {
        this.time = ptime;
    }
    
    public LocalDateTime getRegDate() {
        return this.createdAt;
    }
    
    public void setRegDate(LocalDateTime regDate) {
        this.createdAt = regDate;
    }
    
    // 이메일 인증 상태 확인 메서드
    public boolean isEmailVerified() {
        return emailVerified != null && emailVerified;
    }
}