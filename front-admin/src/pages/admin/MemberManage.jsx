import React, { useState, useEffect } from 'react';
import '../../assets/scss/MemberManage.scss';
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { fetchUsers, updateUserStatus, deleteUser } from '../../services/api';

// DataGrid 한글 메시지 직접 지정
const localeText = {
  noRowsLabel: '표시할 데이터가 없습니다',
  noResultsOverlayLabel: '검색 결과가 없습니다',
  toolbarDensity: '밀도',
  toolbarDensityLabel: '밀도',
  toolbarDensityCompact: '좁게',
  toolbarDensityStandard: '보통',
  toolbarDensityComfortable: '넓게',
  // 필요시 추가
};

function MemberManage() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // 실제 API로 회원 목록 불러오기
  useEffect(() => {
    loadMembers();
  }, [paginationModel]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers({ 
        page: paginationModel.page, 
        size: paginationModel.pageSize 
      });
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      const content = Array.isArray(response.data?.content) ? response.data.content : [];
      const members = content.map(member => ({
        id: member.id,
        email: member.userid,
        name: member.name,
        nickname: member.nickname,
        region: member.region,
        education: member.education,
        major: member.department,
        timezone: member.time,
        signupDate: member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '',
        status: member.status,
        phone: member.phone,
        gender: member.gender
      }));
      
      setRows(members);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(member =>
    member.name?.includes(search) || member.email?.includes(search)
  );

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        await deleteUser(id);
        // 목록 새로고침
        loadMembers();
        alert('회원이 삭제되었습니다.');
      } catch (err) {
        alert('회원 삭제에 실패했습니다: ' + err.message);
      }
    }
  };

  const handleBan = async (id) => {
    if (window.confirm('정말로 이 회원을 정지하시겠습니까?')) {
      try {
        await updateUserStatus(id, 'BANNED');
        // 목록 새로고침
        loadMembers();
        alert('회원이 정지되었습니다.');
      } catch (err) {
        alert('회원 정지에 실패했습니다: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      // 목록 새로고침
      loadMembers();
      alert(`회원 상태가 ${newStatus === 'ACTIVE' ? '활성화' : '정지'}되었습니다.`);
    } catch (err) {
      alert('상태 변경에 실패했습니다: ' + err.message);
    }
  };

  // minWidth 없이 flex만 남겨서, 화면이 줄어들 때 flex 비율대로 계속 줄어듦
  const columns = [
    { field: 'id', headerName: '회원ID', flex: 0.7, minWidth: 50, renderCell: (params) => `#${params.value}` },
    {
      field: 'email',
      headerName: '이메일',
      flex: 2,
      minWidth: 100,
      renderCell: (params) => (
        <span
          title={params.value}
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', width: '100%' }}
        >
          {params.value}
        </span>
      ),
    },
    { field: 'name', headerName: '이름', flex: 1, minWidth: 60 },
    { field: 'nickname', headerName: '닉네임', flex: 1, minWidth: 60 },
    { field: 'region', headerName: '지역', flex: 1, minWidth: 60 },
    { field: 'education', headerName: '학력', flex: 1, minWidth: 60 },
    { field: 'major', headerName: '전공', flex: 1, minWidth: 60 },
    { field: 'timezone', headerName: '선호 시간대', flex: 1, minWidth: 80 },
    { field: 'signupDate', headerName: '가입일', flex: 1, minWidth: 80 },
    {
      field: 'status',
      headerName: '상태',
      flex: 1,
      minWidth: 80,
      renderCell: (params) => (
        <span style={{ 
          color: params.value === 'ACTIVE' ? '#4CAF50' : '#F44336',
          fontWeight: 'bold'
        }}>
          {params.value === 'ACTIVE' ? '활성' : '정지'}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: '관리',
      flex: 0.7,
      minWidth: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '5px' }}>
          {params.row.status === 'ACTIVE' ? (
            <>
              <IconButton 
                color="warning" 
                size="small"
                onClick={() => handleBan(params.row.id)}
                title="회원 정지"
              >
                <BlockIcon />
              </IconButton>
              <IconButton 
                color="error" 
                size="small"
                onClick={() => handleDelete(params.row.id)}
                title="회원 삭제"
              >
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <IconButton 
              color="success" 
              size="small"
              onClick={() => handleStatusChange(params.row.id, 'ACTIVE')}
              title="회원 활성화"
              style={{ color: '#4CAF50' }}
            >
              <span style={{ fontSize: '16px' }}>✓</span>
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="member-manage">
        <div className="member-header">
          <h2>회원정보관리</h2>
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
    <div className="member-manage">
      <div className="member-header">
        <h2>회원정보관리</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="이름, 이메일로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>  
      
      {/* DataGrid가 항상 가로 100%를 채우고, flex 컬럼으로 빈 공간 없이 반응형 */}
      <div
        className="member-table-container"
        style={{
          width: '100%',
          minWidth: 800,
          background: '#fff',
          overflowX: 'auto',
          padding: 0,
          margin: 0,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={paginationModel.pageSize}
          page={paginationModel.page}
          onPaginationModelChange={setPaginationModel}
          rowsPerPageOptions={[5, 10, 20, 50]}
          disableSelectionOnClick
          autoHeight
          loading={loading}
          localeText={localeText}
          sx={{
            minWidth: 800,
            width: '100%',
            maxWidth: '100%',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-virtualScroller': {
              minWidth: 800,
              width: '100%',
              maxWidth: '100%',
            },
          }}
        />
      </div>
    </div>
  );
}

export default MemberManage;