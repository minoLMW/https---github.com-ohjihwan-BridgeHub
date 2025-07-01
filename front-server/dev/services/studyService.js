import { studyRoomAPI } from './apiService';

/**
 * 스터디룸 관련 비즈니스 로직을 처리하는 서비스
 */
class StudyService {
    /**
     * 스터디룸 목록 조회 (홈페이지용)
     */
    async getStudyRoomsForHome() {
        try {
            const response = await studyRoomAPI.getStudyRoomList();
            if (response.data.status === 'success') {
                return this.transformStudyRoomsForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'STUDY_LIST_ERROR');
        } catch (error) {
            console.error('스터디룸 목록 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 인기 스터디룸 조회 (홈페이지 상단용)
     */
    async getHotStudyRooms(limit = 6) {
        try {
            const response = await studyRoomAPI.getHotStudyRooms(limit);
            if (response.data.status === 'success') {
                return this.transformStudyRoomsForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'HOT_STUDY_ERROR');
        } catch (error) {
            console.error('인기 스터디룸 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 내 참여 스터디룸 조회
     */
    async getMyStudyRooms() {
        try {
            const response = await studyRoomAPI.getMyStudyRooms();
            if (response.data.status === 'success') {
                return this.transformStudyRoomsForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'MY_STUDY_ERROR');
        } catch (error) {
            console.error('내 참여 스터디룸 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 내가 개설한 스터디룸 조회
     */
    async getMyCreatedStudyRooms() {
        try {
            const response = await studyRoomAPI.getMyCreatedStudyRooms();
            if (response.data.status === 'success') {
                return this.transformStudyRoomsForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'MY_CREATED_STUDY_ERROR');
        } catch (error) {
            console.error('내가 개설한 스터디룸 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 상세 조회
     */
    async getStudyRoomDetail(studyRoomId) {
        try {
            const response = await studyRoomAPI.getStudyRoom(studyRoomId);
            if (response.data.status === 'success') {
                return this.transformStudyRoomForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'STUDY_GET_ERROR');
        } catch (error) {
            console.error('스터디룸 상세 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 생성
     */
    async createStudyRoom(studyRoomData) {
        try {
            console.log('=== 스터디 생성 디버깅 ===');
            console.log('1. 원본 데이터:', studyRoomData);
            
            // 백엔드 형식으로 변환
            const backendData = this.transformStudyRoomForBackend(studyRoomData);
            console.log('2. 변환된 데이터:', backendData);
            
            // 필수 필드 검증
            const requiredFields = ['title', 'description', 'education', 'department', 'region', 'capacity', 'time'];
            const missingFields = requiredFields.filter(field => !backendData[field]);
            if (missingFields.length > 0) {
                console.error('누락된 필수 필드:', missingFields);
                throw new Error(`필수 필드 누락: ${missingFields.join(', ')}`);
            }
            
            console.log('3. API 요청 시작...');
            const response = await studyRoomAPI.createStudyRoom(backendData);
            console.log('4. API 응답:', response.data);
            
            if (response.data.status === 'success') {
                return this.transformStudyRoomForFrontend(response.data.data);
            }
            throw new Error(response.data.errorCode || 'STUDY_CREATE_ERROR');
        } catch (error) {
            console.error('스터디룸 생성 실패:', error);
            console.error('에러 상세:', error.response?.data);
            throw error;
        }
    }

    /**
     * 스터디 참가 신청
     */
    async joinStudyRoom(studyRoomId) {
        try {
            const response = await studyRoomAPI.joinStudyRoom(studyRoomId);
            if (response.data.status === 'success') {
                return true;
            }
            throw new Error(response.data.errorCode || 'JOIN_ERROR');
        } catch (error) {
            console.error('스터디 참가 신청 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디 탈퇴
     */
    async leaveStudyRoom(studyRoomId) {
        try {
            const response = await studyRoomAPI.leaveStudyRoom(studyRoomId);
            if (response.data.status === 'success') {
                return true;
            }
            throw new Error(response.data.errorCode || 'LEAVE_ERROR');
        } catch (error) {
            console.error('스터디 탈퇴 실패:', error);
            throw error;
        }
    }

    /**
     * 스터디룸 멤버 조회
     */
    async getStudyRoomMembers(studyRoomId) {
        try {
            const response = await studyRoomAPI.getStudyRoomMembers(studyRoomId);
            if (response.data.status === 'success') {
                return response.data.data;
            }
            throw new Error(response.data.errorCode || 'MEMBERS_GET_ERROR');
        } catch (error) {
            console.error('스터디룸 멤버 조회 실패:', error);
            throw error;
        }
    }

    /**
     * 백엔드 스터디룸 데이터를 프론트엔드 형식으로 변환
     */
    transformStudyRoomsForFrontend(backendData) {
        if (!Array.isArray(backendData)) {
            return [];
        }

        return backendData.map(study => this.transformStudyRoomForFrontend(study));
    }

    /**
     * 개별 스터디룸 데이터 변환 (백엔드 → 프론트엔드)
     */
    transformStudyRoomForFrontend(backendStudy) {
        return {
            id: backendStudy.studyRoomId,
            studyRoomId: backendStudy.studyRoomId,
            roomId: backendStudy.roomId, // 채팅방 ID
            title: backendStudy.title,
            content: backendStudy.description,
            description: backendStudy.description,
            region: backendStudy.region,
            district: backendStudy.district,
            time: backendStudy.time,
            education: backendStudy.education,
            department: backendStudy.department,
            capacity: backendStudy.capacity,
            currentMembers: backendStudy.currentMembers,
            thumbnail: backendStudy.thumbnail || 'thumbnail-room1.jpg',
            isPublic: backendStudy.isPublic,
            createdAt: backendStudy.createdAt,
            
            // 방장 정보
            bossId: backendStudy.bossId,
            bossName: backendStudy.bossName,
            bossNickname: backendStudy.bossNickname,
            bossProfileImage: backendStudy.bossProfileImage,
            
            // 기존 프론트엔드 호환성
            username: backendStudy.bossNickname || backendStudy.bossName,
            viewCount: backendStudy.currentMembers,
            regDate: backendStudy.createdAt
        };
    }

    /**
     * 프론트엔드 스터디룸 데이터를 백엔드 형식으로 변환
     */
    transformStudyRoomForBackend(frontendData) {
        return {
            title: frontendData.title,
            description: frontendData.description || frontendData.content,
            education: frontendData.education,
            department: frontendData.department,
            region: frontendData.region,
            district: frontendData.district,
            capacity: frontendData.capacity || 10,
            time: frontendData.time,
            thumbnail: frontendData.thumbnail || 'thumbnail-room1.jpg',
            isPublic: frontendData.isPublic !== false // 기본값 true
        };
    }

    /**
     * 필터링된 스터디룸 목록 조회
     */
    async getFilteredStudyRooms(filters = {}) {
        try {
            let response;
            
            if (filters.department) {
                response = await studyRoomAPI.getStudyRoomsByDepartment(filters.department);
            } else if (filters.region) {
                response = await studyRoomAPI.getStudyRoomsByRegion(filters.region);
            } else if (filters.time) {
                response = await studyRoomAPI.getStudyRoomsByTime(filters.time);
            } else {
                response = await studyRoomAPI.getStudyRoomList();
            }
            
            if (response.data.status === 'success') {
                let studyRooms = this.transformStudyRoomsForFrontend(response.data.data);
                
                // 클라이언트 사이드 필터링
                if (filters.keyword) {
                    const keyword = filters.keyword.toLowerCase();
                    studyRooms = studyRooms.filter(room =>
                        room.title.toLowerCase().includes(keyword) ||
                        room.description.toLowerCase().includes(keyword) ||
                        room.region.toLowerCase().includes(keyword)
                    );
                }
                
                return studyRooms;
            }
            
            throw new Error(response.data.errorCode || 'STUDY_LIST_ERROR');
        } catch (error) {
            console.error('필터링된 스터디룸 조회 실패:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 생성
const studyService = new StudyService();

export default studyService; 