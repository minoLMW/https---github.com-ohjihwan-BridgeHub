package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.LinkPreviewDTO;

public interface LinkPreviewService {
    
    /**
     * URL에서 메타데이터를 추출하여 링크 미리보기 정보를 반환
     * @param url 메타데이터를 추출할 URL
     * @return LinkPreviewDTO 링크 미리보기 정보
     */
    LinkPreviewDTO extractLinkPreview(String url);
    
    /**
     * 텍스트에서 URL을 추출
     * @param text 텍스트 내용
     * @return URL 목록
     */
    java.util.List<String> extractUrls(String text);
    
    /**
     * URL이 유효한지 검사
     * @param url 검사할 URL
     * @return 유효성 여부
     */
    boolean isValidUrl(String url);
} 