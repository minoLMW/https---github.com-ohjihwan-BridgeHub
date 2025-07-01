package com.koreait.apiserver.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StudyRoomDTO {
    private Integer studyRoomId;
    private Integer roomId;  // ChatRoom과 연결
    private Integer bossId;  // 방장 ID
    private String title;
    private String description;
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
    
    // 방장 정보 (JOIN 결과) - 이름 제거, 닉네임만 유지
    private String bossNickname;
    private String bossProfileImage;
    
    // 현재 참가 중인 모든 멤버의 닉네임 목록
    private List<String> memberNicknames;
} 