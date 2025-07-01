package com.koreait.apiserver.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinkPreviewDTO {
    private String url;
    private String title;
    private String description;
    private String image;
    private String siteName;
    private String favicon;
    private String type;
    
    // 메타데이터 추출 성공 여부
    private boolean success;
    private String error;
} 