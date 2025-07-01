// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7100/api';
const IS_PRODUCTION = false; // 개발 환경에서는 false
const USE_MOCK_DATA = true; // 개발 환경에서는 목 데이터 사용

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 인증 실패
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// 관리자 인증 관련 API
// =============================================

export const adminLogin = async (credentials) => {
  try {
    // 임시 로그인 (백엔드 서버가 실행되지 않을 때)
    if (credentials.username === 'admin' && credentials.password === 'admin1234') {
      const mockToken = 'mock-admin-token-' + Date.now();
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'ADMIN'
      };
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockUser));
      return {
        data: {
          success: true,
          message: '로그인 성공',
          token: mockToken,
          user: mockUser
        }
      };
    }
    
    // 실제 API 호출 (백엔드 서버가 실행될 때)
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      const { status, data, errorCode } = response.data;
      
      if (status === 'success' && data && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data));
        return { data: { success: true, token: data.token, user: data } };
      } else {
        return { data: { success: false, message: errorCode || '로그인에 실패했습니다.' } };
      }
    } catch (apiError) {
      // 백엔드 서버가 실행되지 않으면 목 데이터 사용
      console.log('백엔드 서버가 실행되지 않아 목 데이터를 사용합니다.');
      const mockToken = 'mock-admin-token-' + Date.now();
      const mockUser = {
        id: 1,
        username: credentials.username,
        role: 'ADMIN'
      };
      localStorage.setItem('adminToken', mockToken);
      localStorage.setItem('adminUser', JSON.stringify(mockUser));
      return {
        data: {
          success: true,
          message: '로그인 성공 (목 데이터)',
          token: mockToken,
          user: mockUser
        }
      };
    }
  } catch (error) {
    throw new Error(error.response?.data?.errorCode || '로그인에 실패했습니다.');
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  return Promise.resolve({ success: true });
};

export const checkAuthStatus = () => {
  const token = localStorage.getItem('adminToken');
  return Promise.resolve({ isAuthenticated: !!token });
};

// =============================================
// 통계 관련 API
// =============================================

export const fetchStatistics = async () => {
  try {
    // 개발 환경에서만 목 데이터 사용 (프로덕션에서는 실제 API만 사용)
    if (!IS_PRODUCTION && USE_MOCK_DATA) {
      console.log('개발 환경에서 목 데이터를 사용합니다.');
      const mockStats = {
        memberStats: {
          gender: {
            '남성': 10,
            '여성': 10
          },
          education: {
            고졸: 4,
            대학교: 12,
            대학원: 4
          },
          time: {
            '06:00~12:00': 7,
            '12:00~18:00': 8,
            '18:00~24:00': 5
          },
          major: {
            '인문•사회': 3,
            '상경': 2,
            '자연': 4,
            '공학': 3,
            '예체능': 2,
            '의학': 2,
            '법학': 1,
            '융합': 3
          }
        },
        reportStats: {
          recentReports: [
            { id: 1, date: '2024-01-15', reporter: '김민우', target: '이지환', reason: '욕설' },
            { id: 2, date: '2024-01-14', reporter: '김유나', target: '김민우', reason: '스팸' },
            { id: 3, date: '2024-01-13', reporter: '박성민', target: '정우진', reason: '부적절한 콘텐츠' },
            { id: 4, date: '2024-01-12', reporter: '강민수', target: '윤승우', reason: '괴롭힘' },
            { id: 5, date: '2024-01-11', reporter: '한종석', target: '신태원', reason: '저작권 침해' },
            { id: 6, date: '2024-01-10', reporter: '이소연', target: '박지원', reason: '음란물' },
            { id: 7, date: '2024-01-09', reporter: '최은지', target: '정혜린', reason: '사기' },
            { id: 8, date: '2024-01-08', reporter: '강서연', target: '윤민지', reason: '도배' },
            { id: 9, date: '2024-01-07', reporter: '한예린', target: '신채원', reason: '개인정보 유출' },
            { id: 10, date: '2024-01-06', reporter: '오수진', target: '김민우', reason: '폭력적 발언' }
          ],
          reportTypes: {
            '욕설': 1,
            '스팸': 2,
            '부적절한 콘텐츠': 2,
            '괴롭힘': 1,
            '저작권 침해': 1,
            '음란물': 1,
            '사기': 1,
            '도배': 1,
            '개인정보 유출': 1,
            '폭력적 발언': 1
          }
        },
        activityStats: {
          quarterlySignups: {
            q1: 200,
            q2: 400,
            q3: 300,
            q4: 500,
            q5: 600,
            q6: 700,
            q7: 800
          },
          quarterlyVisitors: {
            q1: 400,
            q2: 800,
            q3: 600,
            q4: 1000,
            q5: 1200,
            q6: 1400,
            q7: 1600
          },
          topActiveUsers: [
            { name: '김민우', activity: 120 },
            { name: '이지환', activity: 110 },
            { name: '박성민', activity: 100 },
            { name: '최동현', activity: 95 },
            { name: '정우진', activity: 90 },
            { name: '강민수', activity: 85 },
            { name: '윤승우', activity: 80 },
            { name: '한종석', activity: 75 },
            { name: '신태원', activity: 70 },
            { name: '오경민', activity: 65 }
          ],
          popularRooms: [
            { name: '프로그래밍 스터디 A', count: 45 },
            { name: '영어 스터디 B', count: 38 },
            { name: '취미 공유방', count: 32 },
            { name: '자유게시판', count: 28 },
            { name: '정보공유방', count: 25 },
            { name: '취업 준비방', count: 22 },
            { name: '토익 스터디', count: 20 },
            { name: '운동 동호회', count: 18 },
            { name: '독서 모임', count: 15 },
            { name: '요리 레시피방', count: 12 }
          ],
          totalVisitors: 1600
        }
      };
      return { data: mockStats };
    }

    // 실제 API 호출 (프로덕션 환경 또는 개발 환경에서 실제 데이터 사용)
    try {
      const response = await apiClient.get('/admin/statistics');
      console.log('백엔드 통계 응답:', response.data);
      
      // 백엔드에서 데이터가 비어있으면 에러 처리 (프로덕션에서는 목 데이터 사용하지 않음)
      const backendData = response.data.data;
      if (!backendData || 
          !backendData.memberStats || 
          Object.keys(backendData.memberStats).length === 0 ||
          Object.values(backendData.memberStats).every(stat => Object.keys(stat).length === 0)) {
        console.log('백엔드 데이터가 비어있습니다.');
        if (IS_PRODUCTION) {
          throw new Error('통계 데이터를 불러올 수 없습니다.');
        } else {
          // 개발 환경에서만 목 데이터 사용
          console.log('개발 환경에서 목 데이터를 사용합니다.');
          return { data: mockStats };
        }
      }
      
      return response;
    } catch (error) {
      if (IS_PRODUCTION) {
        throw new Error('통계 데이터를 불러오는데 실패했습니다.');
      } else {
        // 개발 환경에서만 목 데이터 반환
        console.log('백엔드 서버가 실행되지 않아 목 데이터를 사용합니다.');
        return { data: mockStats };
      }
    }
  } catch (error) {
    throw new Error('통계 데이터를 불러오는데 실패했습니다.');
  }
};

// =============================================
// 회원 관리 관련 API
// =============================================

export const fetchUsers = async (params = {}) => {
  try {
    // 백엔드 서버가 실행되지 않을 때를 위한 목 데이터
    const mockUsers = [
      {
        id: 1,
        userid: 'kim.minwoo@email.com',
        name: '김민우',
        nickname: '민우',
        region: '서울특별시',
        education: '대학교',
        department: '컴퓨터공학과',
        time: '오후',
        createdAt: '2024-01-15T10:30:00',
        status: 'ACTIVE',
        phone: '010-1234-5678',
        gender: '남자'
      },
      {
        id: 2,
        userid: 'lee.jihwan@email.com',
        name: '이지환',
        nickname: '지환',
        region: '서울특별시',
        education: '대학교',
        department: '전자공학과',
        time: '오전',
        createdAt: '2024-01-20T14:20:00',
        status: 'ACTIVE',
        phone: '010-2345-6789',
        gender: '남자'
      },
      {
        id: 3,
        userid: 'park.sungmin@email.com',
        name: '박성민',
        nickname: '성민',
        region: '부산광역시',
        education: '대학원',
        department: '기계공학과',
        time: '저녁',
        createdAt: '2024-02-05T09:15:00',
        status: 'ACTIVE',
        phone: '010-3456-7890',
        gender: '남자'
      },
      {
        id: 4,
        userid: 'choi.donghyun@email.com',
        name: '최동현',
        nickname: '동현',
        region: '대구광역시',
        education: '고졸',
        department: '고등학교',
        time: '오후',
        createdAt: '2024-02-10T16:45:00',
        status: 'ACTIVE',
        phone: '010-4567-8901',
        gender: '남자'
      },
      {
        id: 5,
        userid: 'jung.woojin@email.com',
        name: '정우진',
        nickname: '우진',
        region: '인천광역시',
        education: '대학교',
        department: '경영학과',
        time: '오전',
        createdAt: '2024-02-15T11:30:00',
        status: 'ACTIVE',
        phone: '010-5678-9012',
        gender: '남자'
      },
      {
        id: 6,
        userid: 'kang.minsu@email.com',
        name: '강민수',
        nickname: '민수',
        region: '광주광역시',
        education: '대학교',
        department: '통계학과',
        time: '저녁',
        createdAt: '2024-02-20T13:20:00',
        status: 'ACTIVE',
        phone: '010-6789-0123',
        gender: '남자'
      },
      {
        id: 7,
        userid: 'yoon.seungwoo@email.com',
        name: '윤승우',
        nickname: '승우',
        region: '대전광역시',
        education: '대학원',
        department: '심리학과',
        time: '오후',
        createdAt: '2024-02-25T15:10:00',
        status: 'ACTIVE',
        phone: '010-7890-1234',
        gender: '남자'
      },
      {
        id: 8,
        userid: 'han.jongseok@email.com',
        name: '한종석',
        nickname: '종석',
        region: '울산광역시',
        education: '고졸',
        department: '고등학교',
        time: '오전',
        createdAt: '2024-03-01T10:45:00',
        status: 'ACTIVE',
        phone: '010-8901-2345',
        gender: '남자'
      },
      {
        id: 9,
        userid: 'shin.taewon@email.com',
        name: '신태원',
        nickname: '태원',
        region: '세종특별자치시',
        education: '대학교',
        department: '건축학과',
        time: '저녁',
        createdAt: '2024-03-05T14:30:00',
        status: 'ACTIVE',
        phone: '010-9012-3456',
        gender: '남자'
      },
      {
        id: 10,
        userid: 'oh.kyungmin@email.com',
        name: '오경민',
        nickname: '경민',
        region: '경기도',
        education: '대학교',
        department: '의학과',
        time: '오후',
        createdAt: '2024-03-10T12:15:00',
        status: 'ACTIVE',
        phone: '010-0123-4567',
        gender: '남자'
      }
    ];

    // 실제 API 호출 시도
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response;
    } catch (error) {
      // 백엔드 서버가 실행되지 않으면 목 데이터 반환
      console.log('백엔드 서버가 실행되지 않아 목 데이터를 사용합니다.');
      const { page = 0, size = 10 } = params;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedUsers = mockUsers.slice(startIndex, endIndex);
      
      return {
        data: {
          content: paginatedUsers,
          totalElements: mockUsers.length,
          totalPages: Math.ceil(mockUsers.length / size),
          currentPage: page,
          size: size
        }
      };
    }
  } catch (error) {
    throw new Error('회원 목록을 불러오는데 실패했습니다.');
  }
};

export const updateUserStatus = async (memberId, status) => {
  try {
    const response = await apiClient.patch(`/admin/users/${memberId}/status?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('회원 상태 변경 실패:', error);
    throw error;
  }
};

// 회원 삭제
export const deleteUser = async (memberId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('회원 삭제 실패:', error);
    throw error;
  }
};

// =============================================
// 신고 관리 관련 API
// =============================================

export const fetchReports = async (params = {}) => {
  try {
    // 백엔드 서버가 실행되지 않을 때를 위한 목 데이터
    const mockReports = [
      {
        reportId: 1,
        reporterId: 1,
        reporterName: '김민우',
        reportedUserId: 2,
        reportedUserName: '이지환',
        reportType: 'USER',
        reason: '욕설',
        createdAt: '2024-01-15T14:30:25',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 2,
        reporterId: 11,
        reporterName: '김유나',
        reportedUserId: 1,
        reportedUserName: '김민우',
        reportType: 'USER',
        reason: '스팸',
        createdAt: '2024-01-14T09:15:42',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 3,
        reporterId: 3,
        reporterName: '박성민',
        reportedUserId: 5,
        reportedUserName: '정우진',
        reportType: 'USER',
        reason: '부적절한 콘텐츠',
        createdAt: '2024-01-13T16:45:18',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 4,
        reporterId: 6,
        reporterName: '강민수',
        reportedUserId: 7,
        reportedUserName: '윤승우',
        reportType: 'USER',
        reason: '괴롭힘',
        createdAt: '2024-01-12T11:20:33',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 5,
        reporterId: 8,
        reporterName: '한종석',
        reportedUserId: 9,
        reportedUserName: '신태원',
        reportType: 'USER',
        reason: '저작권 침해',
        createdAt: '2024-01-11T13:55:07',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 6,
        reporterId: 12,
        reporterName: '이소연',
        reportedUserId: 13,
        reportedUserName: '박지원',
        reportType: 'USER',
        reason: '음란물',
        createdAt: '2024-01-10T10:20:15',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 7,
        reporterId: 14,
        reporterName: '최은지',
        reportedUserId: 15,
        reportedUserName: '정혜린',
        reportType: 'USER',
        reason: '사기',
        createdAt: '2024-01-09T15:30:45',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 8,
        reporterId: 16,
        reporterName: '강서연',
        reportedUserId: 17,
        reportedUserName: '윤민지',
        reportType: 'USER',
        reason: '도배',
        createdAt: '2024-01-08T12:45:30',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 9,
        reporterId: 18,
        reporterName: '한예린',
        reportedUserId: 19,
        reportedUserName: '신채원',
        reportType: 'USER',
        reason: '개인정보 유출',
        createdAt: '2024-01-07T17:10:20',
        status: 'PENDING',
        adminComment: null
      },
      {
        reportId: 10,
        reporterId: 20,
        reporterName: '오수진',
        reportedUserId: 1,
        reportedUserName: '김민우',
        reportType: 'USER',
        reason: '폭력적 발언',
        createdAt: '2024-01-06T14:25:10',
        status: 'PENDING',
        adminComment: null
      }
    ];

    // 실제 API 호출 시도
    try {
      const response = await apiClient.get('/admin/reports', { params });
      return response;
    } catch (error) {
      // 백엔드 서버가 실행되지 않으면 목 데이터 반환
      console.log('백엔드 서버가 실행되지 않아 목 데이터를 사용합니다.');
      const { page = 0, size = 10 } = params;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedReports = mockReports.slice(startIndex, endIndex);
      
      return {
        data: {
          content: paginatedReports,
          totalElements: mockReports.length,
          totalPages: Math.ceil(mockReports.length / size),
          currentPage: page,
          size: size
        }
      };
    }
  } catch (error) {
    throw new Error('신고 목록을 불러오는데 실패했습니다.');
  }
};

export const resolveReport = async (reportId, resolveData) => {
  try {
    // 실제 API 호출 시도
    try {
      const response = await apiClient.post(`/admin/reports/${reportId}/resolve`, resolveData);
      return response;
    } catch (error) {
      // 백엔드 서버가 실행되지 않으면 성공 응답 반환
      console.log('백엔드 서버가 실행되지 않아 목 응답을 사용합니다.');
      return {
        data: {
          success: true,
          message: '신고가 처리되었습니다.',
          reportId: reportId,
          status: 'RESOLVED',
          ...resolveData
        }
      };
    }
  } catch (error) {
    throw new Error('신고 처리에 실패했습니다.');
  }
};

export default apiClient;