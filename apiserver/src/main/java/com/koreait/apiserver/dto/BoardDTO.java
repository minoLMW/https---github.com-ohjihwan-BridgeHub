package com.koreait.apiserver.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {
    private Integer boardId;
    private Integer categoryId;
    private String categoryName;
    private Integer authorId;
    private String authorNickname;
    private String title;
    private String content;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isNotice;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 첨부파일 관련
    private Integer attachmentCount;
    private List<FileDTO> attachments;
    
    // 작성/수정용 필드
    private List<Integer> attachmentIds; // 첨부파일 ID 목록
} 