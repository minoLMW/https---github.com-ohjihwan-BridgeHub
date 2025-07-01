const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';
const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN || 'system-token-for-socket-server';

// API 호출을 위한 공통 헤더 설정
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'X-System-Token': SYSTEM_TOKEN
});

class StudyController {
    // 스터디 참여자 목록 조회
    async getStudyParticipants(studyId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/study/${studyId}/participants`, {
                headers: getApiHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('스터디 참여자 조회 실패:', error);
            throw new Error('스터디 참여자 조회에 실패했습니다.');
        }
    }

    // 스터디 참여자 수 업데이트
    async updateStudyParticipants(studyId, count) {
        try {
            const response = await axios.put(`${API_BASE_URL}/study/${studyId}/participants`, 
                { count }, 
                { headers: getApiHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('참여자 수 업데이트 실패:', error);
            throw new Error('참여자 수 업데이트에 실패했습니다.');
        }
    }

    // 스터디 상태 업데이트
    async updateStudyStatus(studyId, status) {
        try {
            const response = await axios.put(`${API_BASE_URL}/study/${studyId}/status`, 
                { status }, 
                { headers: getApiHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('스터디 상태 업데이트 실패:', error);
            throw new Error('스터디 상태 업데이트에 실패했습니다.');
        }
    }

    // 실시간 스터디 알림 전송
    async sendStudyNotification(studyId, notification) {
        try {
            const response = await axios.post(`${API_BASE_URL}/study/${studyId}/notifications`, 
                notification, 
                { headers: getApiHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('알림 전송 실패:', error);
            throw new Error('알림 전송에 실패했습니다.');
        }
    }
}

module.exports = new StudyController(); 