package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.dto.ReportDTO;
import com.koreait.apiserver.service.MemberService;
import com.koreait.apiserver.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')")  // 인증 제거
public class AdminController {

    private final ReportService reportService;
    private final MemberService memberService;

   
    /**
     * 관리자용 신고 목록 조회 (페이징)
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<ReportDTO> reports = reportService.getReportsWithPaging(page, size);
            int totalElements = reportService.getTotalReportsCount();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", reports);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("관리자 신고 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_LIST_ERROR"));
        }
    }

    /**
     * 신고 처리 (관리자)
     */
    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<ReportDTO>> resolveReport(
            @PathVariable Integer reportId,
            @RequestBody ResolveReportRequest request) {
        try {
            ReportDTO resolvedReport = reportService.resolveReport(
                reportId, 
                request.getPenaltyType(), 
                request.getPenalty(), 
                request.getAdminNote()
            );
            return ResponseEntity.ok(ApiResponse.success(resolvedReport));
        } catch (Exception e) {
            log.error("신고 처리 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_RESOLVE_ERROR"));
        }
    }

    
    // 회원 관리 API
   

    /**
     * 관리자용 회원 목록 조회 (페이징)
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<MemberDTO> members = memberService.getMembersWithPaging(page, size);
            int totalElements = memberService.getTotalMembersCount();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", members);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("관리자 회원 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_LIST_ERROR"));
        }
    }

    /**
     * 회원 계정 상태 변경 (정지/활성화)
     */
    @PatchMapping("/users/{memberId}/status")
    public ResponseEntity<ApiResponse<MemberDTO>> updateUserStatus(
            @PathVariable Integer memberId,
            @RequestParam String status) {
        try {
            MemberDTO updatedMember = memberService.updateMemberStatus(memberId, status);
            return ResponseEntity.ok(ApiResponse.success(updatedMember));
        } catch (Exception e) {
            log.error("회원 상태 변경 실패: memberId={}, status={}", memberId, status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_STATUS_UPDATE_ERROR"));
        }
    }

    /**
     * 회원 삭제 (관리자)
     */
    @DeleteMapping("/users/{memberId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Integer memberId) {
        try {
            memberService.deleteMember(memberId);
            return ResponseEntity.ok(ApiResponse.success("회원이 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            log.error("회원 삭제 실패: memberId={}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_DELETE_ERROR"));
        }
    }

    // =============================================
    // 통계 API
    // =============================================

    /**
     * 관리자 대시보드 통계 조회
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // 1. 회원 통계
            Map<String, Object> memberStats = buildMemberStatistics();
            statistics.put("memberStats", memberStats);
            
            // 2. 신고 통계
            Map<String, Object> reportStats = buildReportStatistics();
            statistics.put("reportStats", reportStats);
            
            // 3. 플랫폼 활동 통계
            Map<String, Object> activityStats = buildActivityStatistics();
            statistics.put("activityStats", activityStats);
            
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("STATISTICS_ERROR"));
        }
    }

    /**
     * 회원 통계 조회 (성별, 학력, 활동시간대, 전공별)
     */
    @GetMapping("/statistics/members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMemberStatisticsApi() {
        try {
            Map<String, Object> memberStats = buildMemberStatistics();
            return ResponseEntity.ok(ApiResponse.success(memberStats));
        } catch (Exception e) {
            log.error("회원 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("MEMBER_STATISTICS_ERROR"));
        }
    }

    /**
     * 신고 통계 조회
     */
    @GetMapping("/statistics/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportStatisticsApi() {
        try {
            Map<String, Object> reportStats = buildReportStatistics();
            return ResponseEntity.ok(ApiResponse.success(reportStats));
        } catch (Exception e) {
            log.error("신고 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_STATISTICS_ERROR"));
        }
    }

    
    // 통계 데이터 생성 헬퍼 메서드들
    

    private Map<String, Object> buildMemberStatistics() {
        return memberService.getMemberStatistics();
    }

    private Map<String, Object> buildReportStatistics() {
        return reportService.getReportStatistics();
    }

    private Map<String, Object> buildActivityStatistics() {
        return memberService.getActivityStatistics();
    }

    
    // 내부 클래스 (Request DTO)
    

    public static class ResolveReportRequest {
        private String penaltyType;
        private String penalty;
        private String adminNote;

        // 기본 생성자
        public ResolveReportRequest() {}

        // Getters and Setters
        public String getPenaltyType() { return penaltyType; }
        public void setPenaltyType(String penaltyType) { this.penaltyType = penaltyType; }
        
        public String getPenalty() { return penalty; }
        public void setPenalty(String penalty) { this.penalty = penalty; }
        
        public String getAdminNote() { return adminNote; }
        public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    }
} 