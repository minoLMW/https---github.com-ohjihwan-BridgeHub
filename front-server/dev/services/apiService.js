import axios from 'axios';

// API 서버 기본 URL
const API_BASE_URL = 'http://localhost:7100/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API 요청 시 토큰:', token);
        console.log('요청 URL:', config.url);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization 헤더 설정:', config.headers.Authorization);
        } else {
            console.warn('토큰이 없습니다!');
        }
        return config;
    },
    (error) => {
        console.error('요청 인터셉터 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 로그아웃 처리
            localStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

// 스터디룸 관련 API
export const studyRoomAPI = {
    // 스터디룸 목록 조회
    getStudyRoomList: () => apiClient.get('/studies'),
    
    // 인기 스터디룸 조회
    getHotStudyRooms: (limit = 6) => apiClient.get(`/studies/hot?limit=${limit}`),
    
    // 내 참여 스터디룸 조회
    getMyStudyRooms: () => apiClient.get('/studies/my-studies'),
    
    // 내가 개설한 스터디룸 조회
    getMyCreatedStudyRooms: () => apiClient.get('/studies/my-created'),
    
    // 스터디룸 상세 조회
    getStudyRoom: (studyRoomId) => apiClient.get(`/studies/${studyRoomId}`),
    
    // 스터디룸 생성
    createStudyRoom: (studyRoomData) => apiClient.post('/studies', studyRoomData),
    
    // 스터디룸 수정
    updateStudyRoom: (studyRoomId, studyRoomData) => apiClient.put(`/studies/${studyRoomId}`, studyRoomData),
    
    // 스터디룸 삭제
    deleteStudyRoom: (studyRoomId) => apiClient.delete(`/studies/${studyRoomId}`),
    
    // 스터디 참가 신청
    joinStudyRoom: (studyRoomId) => apiClient.post(`/studies/${studyRoomId}/join`),
    
    // 스터디 탈퇴
    leaveStudyRoom: (studyRoomId) => apiClient.delete(`/studies/${studyRoomId}/leave`),
    
    // 스터디 멤버 조회
    getStudyRoomMembers: (studyRoomId) => apiClient.get(`/studies/${studyRoomId}/members`),
    
    // 참가 신청 승인/거절
    updateMemberStatus: (studyRoomId, memberId, status) => 
        apiClient.put(`/studies/${studyRoomId}/members/${memberId}/status`, { status }),
    
    // 학과별 스터디룸 조회
    getStudyRoomsByDepartment: (department) => apiClient.get(`/studies/department/${department}`),
    
    // 지역별 스터디룸 조회
    getStudyRoomsByRegion: (region) => apiClient.get(`/studies/region/${region}`),
    
    // 시간대별 스터디룸 조회
    getStudyRoomsByTime: (time) => apiClient.get(`/studies/time/${time}`)
};

// 채팅 관련 API
export const chatAPI = {
    // 채팅 히스토리 조회
    getChatHistory: (roomId, page = 1, size = 50, beforeDate = null) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (beforeDate) params.append('beforeDate', beforeDate);
        return apiClient.get(`/messages/history/${roomId}?${params}`);
    },
    
    // 최근 메시지 조회
    getRecentMessages: (roomId) => apiClient.get(`/messages/recent/${roomId}`),
    
    // 메시지 개수 조회
    getMessageCount: (roomId) => apiClient.get(`/messages/count/${roomId}`),
    
    // 채팅방 목록 조회
    getChatRoomList: () => apiClient.get('/chatrooms'),
    
    // 채팅방 상세 조회
    getChatRoom: (roomId) => apiClient.get(`/chatrooms/${roomId}`)
};

// 파일 관련 API
export const fileAPI = {
    // 파일 업로드 (스터디룸용)
    uploadFile: (formData) => {
        return apiClient.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    
    // 프로필 이미지 업로드
    uploadProfileImage: (formData) => {
        return apiClient.post('/files/upload/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    
    // 파일 다운로드
    downloadFile: (fileId) => apiClient.get(`/files/${fileId}`, {
        responseType: 'blob'
    }),
    
    // 파일 목록 조회
    getFileList: (roomId) => apiClient.get(`/files/room/${roomId}`)
};

// 사용자 관련 API
export const userAPI = {
    // 사용자 정보 조회
    getUserInfo: () => apiClient.get('/members/me'),
    
    // 사용자 정보 수정
    updateUserInfo: (userData) => apiClient.put('/members/me', userData)
};

// 신고 관련 API
export const reportAPI = {
    // 신고 접수
    createReport: (reportData) => apiClient.post('/reports', reportData),
    
    // 내 신고 목록 조회
    getMyReports: () => apiClient.get('/reports/my')
};

// 비밀번호 재설정 관련 API
export const passwordResetAPI = {
    // 비밀번호 재설정 코드 요청
    sendResetCode: (email) => apiClient.post('/auth/forgot-password', { email }),
    
    // 비밀번호 재설정 완료
    resetPassword: (username, email, resetCode, newPassword) => 
        apiClient.post('/auth/reset-password', { username, email, resetCode, newPassword })
};

export default apiClient; 