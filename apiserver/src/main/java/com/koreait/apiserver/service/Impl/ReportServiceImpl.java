package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.ReportDao;
import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.dto.ReportDTO;
import com.koreait.apiserver.entity.Report;
import com.koreait.apiserver.service.ChatLogService;
import com.koreait.apiserver.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportDao reportDao;
    private final ChatLogService chatLogService;

    @Override
    public List<ReportDTO> getReportList() {
        return reportDao.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReportDTO getReport(Integer reportId) {
        Optional<Report> reportOpt = reportDao.findById(reportId);
        if (reportOpt.isPresent()) {
            return convertToDTO(reportOpt.get());
        }
        throw new RuntimeException("신고를 찾을 수 없습니다.");
    }

    @Override
    @Transactional
    public ReportDTO createReport(ReportDTO reportDTO) {
        Report report = new Report();
        report.setReporterId(reportDTO.getReporterId());
        report.setReportedUserId(reportDTO.getReportedUserId());
        report.setReportType(reportDTO.getReportType());
        report.setMessageId(reportDTO.getMessageId());
        report.setRoomId(reportDTO.getRoomId());
        report.setStudyRoomId(reportDTO.getStudyRoomId());
        report.setReason(reportDTO.getReason());
        report.setCreatedAt(LocalDateTime.now());
        report.setStatus("PENDING");

        reportDao.insertReport(report);
        return convertToDTO(report);
    }

    @Override
    @Transactional
    public void createReportFromChatLog(ReportDTO reportDTO) {
        try {
            Report report = new Report();
            report.setReporterId(reportDTO.getReporterId());
            report.setReportedUserId(reportDTO.getReportedUserId());
            report.setReportType(reportDTO.getReportType());
            report.setRoomId(reportDTO.getRoomId());
            report.setStudyRoomId(reportDTO.getStudyRoomId());
            report.setReason(reportDTO.getReason());
            report.setCreatedAt(LocalDateTime.now());
            report.setStatus("PENDING");

            // 로그 파일 정보 저장 (신고 날짜 기준)
            LocalDate reportDate = LocalDate.now();
            // 실제로는 신고 대상 메시지의 날짜를 사용해야 함
            // 여기서는 간단히 오늘 날짜 사용

            reportDao.insertReport(report);
            
            log.info("채팅 로그 기반 신고 생성 완료: reportId={}, roomId={}", 
                    report.getReportId(), report.getRoomId());
                    
        } catch (Exception e) {
            log.error("채팅 로그 신고 생성 실패", e);
            throw new RuntimeException("채팅 로그 신고 생성에 실패했습니다.", e);
        }
    }

    @Override
    public List<MessageDTO> getChatEvidenceFromLog(Integer reportId) {
        try {
            Optional<Report> reportOpt = reportDao.findById(reportId);
            if (!reportOpt.isPresent()) {
                throw new RuntimeException("신고를 찾을 수 없습니다.");
            }

            Report report = reportOpt.get();
            
            // 신고 전후 7일간의 채팅 로그에서 증거 수집
            LocalDate startDate = report.getCreatedAt().toLocalDate().minusDays(7);
            LocalDate endDate = report.getCreatedAt().toLocalDate().plusDays(1);
            
            List<MessageDTO> evidence = chatLogService.getMessagesForReport(
                report.getRoomId(), startDate, endDate);
            
            log.info("채팅 증거 조회 완료: reportId={}, messageCount={}", 
                    reportId, evidence.size());
            
            return evidence;
            
        } catch (Exception e) {
            log.error("채팅 증거 조회 실패: reportId={}", reportId, e);
            throw new RuntimeException("채팅 증거 조회에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public ReportDTO updateReportStatus(Integer reportId, String status, String adminComment) {
        Optional<Report> reportOpt = reportDao.findById(reportId);
        if (reportOpt.isPresent()) {
            reportDao.updateReportStatus(reportId, status, adminComment);
            Report updatedReport = reportDao.findById(reportId).orElseThrow();
            return convertToDTO(updatedReport);
        }
        throw new RuntimeException("신고를 찾을 수 없습니다.");
    }

    @Override
    public List<ReportDTO> getPendingReports() {
        return reportDao.findPendingReports()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportDTO> getReportsByReporter(Integer reporterId) {
        return reportDao.findByReporterId(reporterId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =============================================
    // 관리자 기능 구현
    // =============================================

    @Override
    public List<ReportDTO> getReportsWithPaging(int page, int size) {
        int offset = page * size;
        return reportDao.findAllWithPaging(offset, size)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalReportsCount() {
        return reportDao.getTotalCount();
    }

    @Override
    @Transactional
    public ReportDTO resolveReport(Integer reportId, String penaltyType, String penalty, String adminNote) {
        try {
            Optional<Report> reportOpt = reportDao.findById(reportId);
            if (!reportOpt.isPresent()) {
                throw new RuntimeException("신고를 찾을 수 없습니다.");
            }

            // 신고 상태를 RESOLVED로 변경하고 관리자 처리 정보 저장
            String adminComment = String.format("제재항목: %s, 제재내용: %s, 관리자메모: %s", 
                    penaltyType != null ? penaltyType : "없음",
                    penalty != null ? penalty : "없음", 
                    adminNote != null ? adminNote : "없음");

            reportDao.updateReportStatus(reportId, "RESOLVED", adminComment);
            
            Report resolvedReport = reportDao.findById(reportId).orElseThrow();
            
            log.info("신고 처리 완료: reportId={}, penaltyType={}, penalty={}", 
                    reportId, penaltyType, penalty);
            
            return convertToDTO(resolvedReport);
            
        } catch (Exception e) {
            log.error("신고 처리 실패: reportId={}", reportId, e);
            throw new RuntimeException("신고 처리에 실패했습니다.", e);
        }
    }

    @Override
    public Map<String, Object> getReportStatistics() {
        Map<String, Object> stats = new HashMap<>();
        // 최근 신고 10개
        List<ReportDTO> recentReports = reportDao.findRecentReports(10);
        stats.put("recentReports", recentReports);
        // 신고 타입별 통계
        Map<String, Integer> reportTypeStats = reportDao.countByReportType();
        stats.put("reportTypes", reportTypeStats);
        return stats;
    }

    private ReportDTO convertToDTO(Report report) {
        ReportDTO dto = new ReportDTO();
        dto.setReportId(report.getReportId());
        dto.setReporterId(report.getReporterId());
        dto.setReportedUserId(report.getReportedUserId());
        dto.setReportType(report.getReportType());
        dto.setMessageId(report.getMessageId());
        dto.setRoomId(report.getRoomId());
        dto.setStudyRoomId(report.getStudyRoomId());
        dto.setReason(report.getReason());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setStatus(report.getStatus());
        dto.setAdminComment(report.getAdminComment());
        return dto;
    }
} 