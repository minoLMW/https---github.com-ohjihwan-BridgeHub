package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.LinkPreviewDTO;
import com.koreait.apiserver.service.LinkPreviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/link-preview")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LinkPreviewController {

    private final LinkPreviewService linkPreviewService;

    /**
     * URL 메타데이터 추출 (링크 미리보기)
     */
    @PostMapping("/extract")
    public ResponseEntity<ApiResponse<LinkPreviewDTO>> extractLinkPreview(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("URL_REQUIRED"));
            }
            
            LinkPreviewDTO preview = linkPreviewService.extractLinkPreview(url);
            return ResponseEntity.ok(ApiResponse.success(preview));
        } catch (Exception e) {
            log.error("링크 미리보기 추출 실패: {}", request.get("url"), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("LINK_PREVIEW_EXTRACT_ERROR"));
        }
    }

    /**
     * 텍스트에서 URL 추출
     */
    @PostMapping("/extract-urls")
    public ResponseEntity<ApiResponse<List<String>>> extractUrls(@RequestBody String text) {
        try {
            List<String> urls = linkPreviewService.extractUrls(text);
            return ResponseEntity.ok(ApiResponse.success(urls));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("URL_EXTRACT_ERROR"));
        }
    }

    /**
     * URL 유효성 검사
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateUrl(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");
            if (url == null || url.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("URL_REQUIRED"));
            }
            
            boolean isValid = linkPreviewService.isValidUrl(url);
            return ResponseEntity.ok(ApiResponse.success(isValid));
        } catch (Exception e) {
            log.error("URL 유효성 검사 실패: {}", request.get("url"), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("URL_VALIDATION_ERROR"));
        }
    }
} 