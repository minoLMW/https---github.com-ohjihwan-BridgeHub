package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.dto.ReportDTO;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getReportList() {
        try {
            List<ReportDTO> reports = reportService.getReportList();
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            log.error("신고 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_LIST_ERROR"));
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportDTO>> getReport(@PathVariable Integer reportId) {
        try {
            ReportDTO report = reportService.getReport(reportId);
            return ResponseEntity.ok(ApiResponse.success(report));
        } catch (Exception e) {
            log.error("신고 상세 조회 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_GET_ERROR"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportDTO>> createReport(
            @RequestBody @Valid ReportDTO reportDTO,
            HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Integer reporterId = jwtService.extractMemberId(token);
                reportDTO.setReporterId(reporterId);
            }
            
            ReportDTO createdReport = reportService.createReport(reportDTO);
            return ResponseEntity.ok(ApiResponse.success(createdReport));
        } catch (Exception e) {
            log.error("신고 생성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_CREATE_ERROR"));
        }
    }

    @PostMapping("/chat-log")
    public ResponseEntity<ApiResponse<Void>> reportFromChatLog(
            @RequestBody @Valid ReportDTO reportDTO,
            HttpServletRequest request) {
        
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("AUTH_REQUIRED"));
            }
            
            String token = authHeader.substring(7);
            Integer reporterId = jwtService.extractMemberId(token);
            reportDTO.setReporterId(reporterId);
            
            reportService.createReportFromChatLog(reportDTO);
            
            return ResponseEntity.ok(ApiResponse.success());
            
        } catch (Exception e) {
            log.error("채팅 로그 신고 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_CREATE_ERROR"));
        }
    }

    @GetMapping("/chat-evidence/{reportId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getChatEvidence(
            @PathVariable Integer reportId) {
        
        try {
            List<MessageDTO> evidence = reportService.getChatEvidenceFromLog(reportId);
            return ResponseEntity.ok(ApiResponse.success(evidence));
            
        } catch (Exception e) {
            log.error("채팅 증거 조회 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("CHAT_EVIDENCE_ERROR"));
        }
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<ApiResponse<ReportDTO>> updateReportStatus(
            @PathVariable Integer reportId,
            @RequestParam String status,
            @RequestParam(required = false) String adminComment) {
        try {
            ReportDTO updatedReport = reportService.updateReportStatus(reportId, status, adminComment);
            return ResponseEntity.ok(ApiResponse.success(updatedReport));
        } catch (Exception e) {
            log.error("신고 상태 업데이트 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_STATUS_UPDATE_ERROR"));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getPendingReports() {
        try {
            List<ReportDTO> reports = reportService.getPendingReports();
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            log.error("대기 중인 신고 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("PENDING_REPORTS_ERROR"));
        }
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getReportsByReporter(@PathVariable Integer reporterId) {
        try {
            List<ReportDTO> reports = reportService.getReportsByReporter(reporterId);
            return ResponseEntity.ok(ApiResponse.success(reports));
        } catch (Exception e) {
            log.error("신고자별 신고 조회 실패: reporterId={}", reporterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORTER_REPORTS_ERROR"));
        }
    }
} 