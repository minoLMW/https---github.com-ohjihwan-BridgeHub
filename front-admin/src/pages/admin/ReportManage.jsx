import React, { useState, useEffect } from 'react';
import '../../assets/scss/ReportManage.scss';
import { fetchReports, resolveReport } from '../../services/api';

function ReportManage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // 실제 API로 신고 목록 불러오기
  useEffect(() => {
    loadReports();
  }, [paginationModel]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetchReports({ 
        page: paginationModel.page, 
        size: paginationModel.pageSize 
      });
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const content = Array.isArray(response.data?.content) ? response.data.content : [];
      const reportsData = content.map(report => ({
        id: report.reportId,
        reporterId: report.reporterId,
        reporter: report.reporterName || `사용자${report.reporterId}`,
        targetId: report.reportedUserId,
        target: report.reportedUserName || `사용자${report.reportedUserId}`,
        reportType: report.reportType,
        reason: report.reason,
        date: report.createdAt ? new Date(report.createdAt).toLocaleString() : '',
        status: report.status,
        description: report.reason,
        chatRoomName: report.roomName || '',
        messageContent: report.messageContent || '',
        reportContent: report.reason,
        penalty: report.penalty || '',
        penaltyType: report.penaltyType || '',
        adminNote: report.adminComment || ''
      }));
      
      setReports(reportsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(filteredReports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedReport(null);
  };

  const handleResolve = async (reportId, penaltyType = '', penalty = '', adminNote = '') => {
    try {
      await resolveReport(reportId, {
        penaltyType,
        penalty,
        adminNote
      });
      
      // 목록 새로고침
      loadReports();
      alert('신고가 처리되었습니다.');
    } catch (err) {
      alert('신고 처리에 실패했습니다: ' + err.message);
    }
  };

  const handleResolveSelected = async () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 처리하시겠습니까?`)) {
      try {
        for (const reportId of selectedReports) {
          await resolveReport(reportId, {
            penaltyType: '경고',
            penalty: '경고 조치',
            adminNote: '일괄 처리'
          });
        }
        
        setSelectedReports([]);
        loadReports();
        alert('선택된 신고들이 처리되었습니다.');
      } catch (err) {
        alert('신고 처리에 실패했습니다: ' + err.message);
      }
    }
  };

  const handleDelete = (reportId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      setReports(reports.filter(report => report.id !== reportId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`선택된 ${selectedReports.length}개의 신고를 정말로 삭제하시겠습니까?`)) {
      setReports(reports.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporterId.toString().includes(searchTerm) ||
      report.targetId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { text: '대기중', class: 'status-pending' },
      PROCESSING: { text: '처리중', class: 'status-processing' },
      RESOLVED: { text: '처리완료', class: 'status-resolved' },
      REJECTED: { text: '거절됨', class: 'status-rejected' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (error) {
    return (
      <div className="report-manage">
        <div className="report-header">
          <h2>신고관리</h2>
        </div>
        <div style={{ 
          color: 'red', 
          padding: '20px', 
          textAlign: 'center',
          background: '#fff',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          에러: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="report-manage">
      <div className="report-header">
        <h2>신고관리</h2>
        <div className="search-filters">
          <input
            type="text"
            placeholder="신고자, 대상자, 사유로 검색"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
            <option value="all">전체 상태</option>
            <option value="PENDING">대기중</option>
            <option value="PROCESSING">처리중</option>
            <option value="RESOLVED">처리완료</option>
            <option value="REJECTED">거절됨</option>
          </select>
          <select value={typeFilter} onChange={handleTypeFilter} className="filter-select">
            <option value="all">전체 유형</option>
            <option value="USER">사용자</option>
            <option value="MESSAGE">메시지</option>
            <option value="STUDYROOM">스터디룸</option>
            <option value="INAPPROPRIATE_CONTENT">부적절한 콘텐츠</option>
          </select>
        </div>
      </div>

      <div className="report-actions">
        <div className="bulk-actions">
          <button 
            onClick={handleResolveSelected} 
            disabled={selectedReports.length === 0}
            className="action-button resolve-button"
          >
            선택 처리 ({selectedReports.length})
          </button>
          <button 
            onClick={handleDeleteSelected} 
            disabled={selectedReports.length === 0}
            className="action-button delete-button"
          >
            선택 삭제 ({selectedReports.length})
          </button>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>신고 ID</th>
              <th>신고자</th>
              <th>대상자</th>
              <th>신고 유형</th>
              <th>사유</th>
              <th>신고일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  신고 데이터를 불러오는 중...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                  표시할 신고가 없습니다.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => handleSelectReport(report.id)}
                    />
                  </td>
                  <td>#{report.id}</td>
                  <td>{report.reporter}</td>
                  <td>{report.target}</td>
                  <td>{report.reportType}</td>
                  <td>{report.reason}</td>
                  <td>{report.date}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewDetail(report)}
                        className="detail-button"
                      >
                        상세
                      </button>
                      {report.status === 'PENDING' && (
                        <button 
                          onClick={() => handleResolve(report.id)}
                          className="resolve-button"
                        >
                          처리
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="delete-button"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 보기 모달 */}
      {showDetail && selectedReport && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>신고 상세 정보</h3>
              <button onClick={handleCloseDetail} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>기본 정보</h4>
                <p><strong>신고 ID:</strong> #{selectedReport.id}</p>
                <p><strong>신고자:</strong> {selectedReport.reporter}</p>
                <p><strong>대상자:</strong> {selectedReport.target}</p>
                <p><strong>신고 유형:</strong> {selectedReport.reportType}</p>
                <p><strong>신고 사유:</strong> {selectedReport.reason}</p>
                <p><strong>신고일:</strong> {selectedReport.date}</p>
                <p><strong>상태:</strong> {getStatusBadge(selectedReport.status)}</p>
              </div>
              
              {selectedReport.chatRoomName && (
                <div className="detail-section">
                  <h4>채팅방 정보</h4>
                  <p><strong>채팅방:</strong> {selectedReport.chatRoomName}</p>
                </div>
              )}
              
              {selectedReport.messageContent && (
                <div className="detail-section">
                  <h4>메시지 내용</h4>
                  <p>{selectedReport.messageContent}</p>
                </div>
              )}
              
              <div className="detail-section">
                <h4>신고 내용</h4>
                <p>{selectedReport.reportContent}</p>
              </div>
              
              {selectedReport.status === 'RESOLVED' && (
                <div className="detail-section">
                  <h4>처리 결과</h4>
                  <p><strong>처리 유형:</strong> {selectedReport.penaltyType}</p>
                  <p><strong>처리 내용:</strong> {selectedReport.penalty}</p>
                  <p><strong>관리자 코멘트:</strong> {selectedReport.adminNote}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedReport.status === 'PENDING' && (
                <button 
                  onClick={() => handleResolve(selectedReport.id)}
                  className="resolve-button"
                >
                  신고 처리
                </button>
              )}
              <button onClick={handleCloseDetail} className="close-button">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportManage;