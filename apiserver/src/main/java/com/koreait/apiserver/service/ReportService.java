package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.dto.ReportDTO;

import java.util.List;
import java.util.Map;

public interface ReportService {
    List<ReportDTO> getReportList();
    ReportDTO getReport(Integer reportId);
    ReportDTO createReport(ReportDTO reportDTO);
    ReportDTO updateReportStatus(Integer reportId, String status, String adminComment);
    List<ReportDTO> getPendingReports();
    List<ReportDTO> getReportsByReporter(Integer reporterId);
    
    // 로그 파일 기반 신고 기능
    void createReportFromChatLog(ReportDTO reportDTO);
    List<MessageDTO> getChatEvidenceFromLog(Integer reportId);
    
    // 관리자 기능 추가
    List<ReportDTO> getReportsWithPaging(int page, int size);
    int getTotalReportsCount();
    ReportDTO resolveReport(Integer reportId, String penaltyType, String penalty, String adminNote);
    
    // 통계용
    Map<String, Object> getReportStatistics();
} 