package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.Report;
import com.koreait.apiserver.dto.ReportDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Mapper
public interface ReportDao {
    
    // 신고 등록
    int insertReport(Report report);
    
    // 신고 조회 (ID로)
    Optional<Report> findById(Integer reportId);
    
    // 모든 신고 조회
    List<Report> findAll();
    
    // 신고자별 신고 조회
    List<Report> findByReporterId(Integer reporterId);
    
    // 신고 대상별 신고 조회
    List<Report> findByReportedUserId(Integer reportedUserId);
    
    // 상태별 신고 조회
    List<Report> findByStatus(String status);
    
    // 신고 유형별 조회
    List<Report> findByReportType(String reportType);
    
    // 대기 중인 신고 조회
    List<Report> findPendingReports();
    
    // 신고 상태 업데이트
    int updateReportStatus(@Param("reportId") Integer reportId, @Param("status") String status, @Param("adminComment") String adminComment);
    
    // 신고 삭제
    int deleteReport(Integer reportId);
    
    // 상태별 신고 수 조회
    int countByStatus(String status);
    
    // 관리자 기능 추가
    List<Report> findAllWithPaging(@Param("offset") int offset, @Param("size") int size);
    int getTotalCount();
    
    // 통계용
    List<ReportDTO> findRecentReports(int limit);
    Map<String, Integer> countByReportType();
} 