/**
 * 스터디 서비스
 * 스터디 관련 데이터 및 기능 관리
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';
const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN || 'system-token-for-socket-server';

class StudyService {
    constructor() {
        this.apiBaseUrl = API_BASE_URL;
        this.systemToken = SYSTEM_TOKEN;
    }

    /**
     * 스터디 정보 조회
     * @param {string|number} studyId - 스터디 ID
     * @returns {Promise<Object|null>} 스터디 정보
     */
    async getStudy(studyId) {
        try {
            console.log(`📚 StudyService - 스터디 정보 조회 시작: ${studyId}`);
            
            const response = await axios.get(`${this.apiBaseUrl}/studies/${studyId}`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-System-Token': this.systemToken
                }
            });

            if (response.data && response.data.status === 'success') {
                const study = response.data.data;
                console.log(`✅ StudyService - 스터디 정보 조회 성공:`, {
                    studyId: study.id,
                    title: study.title,
                    capacity: study.capacity,
                    currentMembers: study.currentMembers || 0
                });
                
                return {
                    id: study.id,
                    title: study.title,
                    capacity: study.capacity || 10, // 기본 정원 10명
                    currentMembers: study.currentMembers || 0,
                    bossId: study.bossId || study.createdBy,
                    createdBy: study.createdBy,
                    description: study.description,
                    status: study.status
                };
            } else {
                console.warn(`⚠️ StudyService - 스터디 조회 응답 이상:`, response.data);
                return null;
            }
        } catch (error) {
            console.error(`❌ StudyService - 스터디 정보 조회 실패:`, {
                studyId: studyId,
                error: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            // API 서버 연결 실패 또는 500 에러 시 기본 정보 반환
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || 
                (error.response && error.response.status >= 500)) {
                console.warn(`🔄 StudyService - API 서버 에러 (${error.response?.status || error.code}), 기본 스터디 정보 반환`);
                return {
                    id: studyId,
                    title: `Study Room ${studyId}`,
                    capacity: 10, // 기본 정원
                    currentMembers: 0,
                    bossId: null,
                    createdBy: null,
                    description: 'API 서버 에러로 인한 기본 정보',
                    status: 'ACTIVE'
                };
            }
            
            return null;
        }
    }

    /**
     * 스터디 멤버 목록 조회
     * @param {string|number} studyId - 스터디 ID
     * @returns {Promise<Array>} 멤버 목록
     */
    async getStudyMembers(studyId) {
        try {
            console.log(`👥 StudyService - 스터디 멤버 조회 시작: ${studyId}`);
            
            const response = await axios.get(`${this.apiBaseUrl}/studies/${studyId}/members`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-System-Token': this.systemToken
                }
            });

            if (response.data && response.data.status === 'success') {
                const members = response.data.data || [];
                console.log(`✅ StudyService - 스터디 멤버 조회 성공: ${members.length}명`);
                return members;
            } else {
                console.warn(`⚠️ StudyService - 멤버 조회 응답 이상:`, response.data);
                return [];
            }
        } catch (error) {
            console.error(`❌ StudyService - 스터디 멤버 조회 실패:`, {
                studyId: studyId,
                error: error.message
            });
            return [];
        }
    }

    /**
     * 스터디 참가 권한 확인
     * @param {string|number} studyId - 스터디 ID
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<boolean>} 참가 가능 여부
     */
    async canJoinStudy(studyId, userId) {
        try {
            const study = await this.getStudy(studyId);
            if (!study) {
                return false;
            }

            const members = await this.getStudyMembers(studyId);
            
            // 이미 참가한 멤버인지 확인
            const isAlreadyMember = members.some(member => 
                member.userId === userId || member.id === userId
            );
            
            if (isAlreadyMember) {
                console.log(`✅ StudyService - 이미 참가한 멤버: ${userId}`);
                return true;
            }

            // 정원 확인
            if (members.length >= study.capacity) {
                console.log(`⚠️ StudyService - 스터디 정원 초과: ${members.length}/${study.capacity}`);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`❌ StudyService - 참가 권한 확인 실패:`, error);
            return false;
        }
    }

    /**
     * 사용자 정보 조회
     * @param {string|number} userId - 사용자 ID
     * @returns {Promise<Object|null>} 사용자 정보
     */
    async getUserInfo(userId) {
        try {
            console.log(`👤 StudyService - 사용자 정보 조회 시작: ${userId}`);
            
            const response = await axios.get(`${this.apiBaseUrl}/members/id/${userId}`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-System-Token': this.systemToken
                }
            });

            if (response.data && response.data.status === 'success') {
                const user = response.data.data;
                console.log(`✅ StudyService - 사용자 정보 조회 성공:`, {
                    userId: user.id,
                    nickname: user.nickname,
                    name: user.name
                });
                
                return {
                    id: user.id,
                    name: user.name,
                    nickname: user.nickname,
                    email: user.email,
                    profileImage: user.profileImage
                };
            } else {
                console.warn(`⚠️ StudyService - 사용자 조회 응답 이상:`, response.data);
                return null;
            }
        } catch (error) {
            console.error(`❌ StudyService - 사용자 정보 조회 실패:`, {
                userId: userId,
                error: error.message,
                status: error.response?.status
            });
            
            // API 서버 에러 시 기본 정보 반환
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || 
                (error.response && error.response.status >= 500)) {
                console.warn(`🔄 StudyService - API 서버 에러, 기본 사용자 정보 반환`);
                return {
                    id: userId,
                    name: `사용자${userId}`,
                    nickname: `사용자${userId}`,
                    email: null,
                    profileImage: null
                };
            }
            
            return null;
        }
    }

    /**
     * 연결 상태 확인
     * @returns {Promise<boolean>} API 서버 연결 상태
     */
    async checkConnection() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/health`, {
                timeout: 3000,
                headers: {
                    'X-System-Token': this.systemToken
                }
            });
            
            return response.status === 200;
        } catch (error) {
            console.error('StudyService - API 서버 연결 확인 실패:', error.message);
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
const studyService = new StudyService();

module.exports = studyService; 