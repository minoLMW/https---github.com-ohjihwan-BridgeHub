import { io } from 'socket.io-client';

// 소켓 서버 URL
const SOCKET_SERVER_URL = 'http://localhost:7500';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentStudyId = null;
        this.currentUserId = null;
        this.eventListeners = new Map();
    }

    /**
     * JWT 토큰에서 사용자 정보 추출
     */
    extractUserFromToken(token) {
        try {
            console.log('🔍 토큰 디코딩 시작:', { 
                tokenLength: token?.length, 
                tokenStart: token?.substring(0, 20) + '...' 
            });

            if (!token || typeof token !== 'string') {
                console.error('❌ 유효하지 않은 토큰:', token);
                return null;
            }

            // Bearer 접두사 제거
            const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
            console.log('🧹 정리된 토큰:', { 
                cleanTokenLength: cleanToken.length,
                cleanTokenStart: cleanToken.substring(0, 20) + '...'
            });

            // JWT 형식 검증 (3개 부분으로 나뉘어야 함)
            const tokenParts = cleanToken.split('.');
            if (tokenParts.length !== 3) {
                console.error('❌ JWT 형식이 잘못됨:', {
                    expectedParts: 3,
                    actualParts: tokenParts.length,
                    parts: tokenParts.map(part => part.substring(0, 10) + '...')
                });
                return null;
            }

            // Base64 디코딩 전 패딩 추가
            let payload = tokenParts[1];
            
            // Base64 URL 디코딩 (JWT는 base64url 인코딩 사용)
            payload = payload.replace(/-/g, '+').replace(/_/g, '/');
            
            // 패딩 추가
            while (payload.length % 4) {
                payload += '=';
            }

            console.log('🔧 패딩 추가된 payload:', {
                originalLength: tokenParts[1].length,
                paddedLength: payload.length,
                payload: payload.substring(0, 20) + '...'
            });

            // Base64 디코딩
            const decodedPayload = atob(payload);
            console.log('🔓 디코딩된 payload:', decodedPayload);

            // JSON 파싱
            const parsedPayload = JSON.parse(decodedPayload);
            console.log('📄 파싱된 payload:', parsedPayload);

            const userInfo = {
                userId: parsedPayload.userId || parsedPayload.username || parsedPayload.sub,
                username: parsedPayload.username || parsedPayload.sub,
                memberId: parsedPayload.memberId || parsedPayload.userId,
                nickname: parsedPayload.nickname
            };

            console.log('✅ 추출된 사용자 정보:', userInfo);
            return userInfo;

        } catch (error) {
            console.error('❌ 토큰에서 사용자 정보 추출 실패:', {
                error: error.message,
                errorType: error.constructor.name,
                token: token?.substring(0, 50) + '...'
            });
            return null;
        }
    }

    /**
     * 소켓 연결
     */
    connect(token) {
        if (this.socket && this.isConnected) {
            console.log('이미 소켓에 연결되어 있습니다.');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                // 토큰에서 사용자 정보 추출
                const userInfo = this.extractUserFromToken(token);
                if (userInfo) {
                    this.currentUserId = userInfo.userId;
                }

                this.socket = io(SOCKET_SERVER_URL, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    timeout: 10000,
                    reconnection: true,
                    reconnectionAttempts: 10, // 재연결 시도 횟수 증가
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000, // 최대 재연결 지연 시간
                    maxReconnectionAttempts: 10 // 최대 재연결 시도 횟수
                });

                // 연결 성공
                this.socket.on('connect', () => {
                    console.log('소켓 연결 성공:', this.socket.id);
                    this.isConnected = true;
                    resolve();
                });

                // 연결 실패
                this.socket.on('connect_error', (error) => {
                    console.error('소켓 연결 실패:', error);
                    this.isConnected = false;
                    reject(error);
                });

                // 연결 끊김
                this.socket.on('disconnect', (reason) => {
                    console.log('소켓 연결 끊김:', reason);
                    this.isConnected = false;
                    
                    // 자동 재연결이 활성화되어 있으므로 currentStudyId는 유지
                    // this.currentStudyId = null; // 이 줄을 주석 처리
                    
                    // 재연결 시도 중임을 표시
                    if (reason === 'io client disconnect') {
                        console.log('사용자가 의도적으로 연결을 끊었습니다.');
                    } else {
                        console.log('연결이 끊어졌습니다. 자동 재연결을 시도합니다...');
                    }
                });

                // 에러 처리
                this.socket.on('error', (error) => {
                    console.error('소켓 에러:', error);
                });

                // 재연결 시도
                this.socket.on('reconnect', (attemptNumber) => {
                    console.log('소켓 재연결 성공:', attemptNumber);
                    this.isConnected = true;
                    
                    // 재연결 시 이전 스터디룸에 다시 참가
                    if (this.currentStudyId && this.currentUserId) {
                        console.log('재연결 후 스터디룸 재참가 시도:', this.currentStudyId);
                        this.joinStudy(this.currentStudyId, this.currentUserId);
                    }
                });

                // 재연결 시도 중
                this.socket.on('reconnect_attempt', (attemptNumber) => {
                    console.log('소켓 재연결 시도 중:', attemptNumber);
                });

                // 재연결 실패
                this.socket.on('reconnect_failed', () => {
                    console.error('소켓 재연결 실패');
                    this.isConnected = false;
                });

            } catch (error) {
                console.error('소켓 연결 중 예외 발생:', error);
                reject(error);
            }
        });
    }

    /**
     * 소켓 연결 해제
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentStudyId = null;
            this.currentUserId = null;
            console.log('소켓 연결 해제됨');
        }
    }

    /**
     * 스터디룸 참가
     */
    joinStudy(studyId, userId) {
        console.log('🏠 SocketService - 스터디룸 참가 요청:', {
            studyId,
            userId,
            socketExists: !!this.socket,
            isConnected: this.isConnected,
            socketConnected: this.socket?.connected,
            previousStudyId: this.currentStudyId,
            previousUserId: this.currentUserId
        });

        if (!this.socket || !this.isConnected) {
            console.error('❌ 소켓이 연결되어 있지 않습니다:', {
                hasSocket: !!this.socket,
                isConnected: this.isConnected,
                socketConnected: this.socket?.connected
            });
            return false;
        }

        if (!studyId || !userId) {
            console.error('❌ studyId 또는 userId가 누락되었습니다:', {
                studyId,
                userId
            });
            return false;
        }

        console.log(`🏠 스터디룸 참가 시도: studyId=${studyId}, userId=${userId}`);
        
        this.currentStudyId = studyId;
        this.currentUserId = userId;
        
        try {
            this.socket.emit('join-study', { studyId, userId });
            console.log('✅ join-study 이벤트 emit 성공');
            return true;
        } catch (error) {
            console.error('❌ join-study 이벤트 emit 실패:', error);
            return false;
        }
    }

    /**
     * 스터디룸 퇴장
     */
    leaveStudy() {
        if (!this.socket || !this.isConnected) {
            return false;
        }

        console.log(`스터디룸 퇴장: studyId=${this.currentStudyId}`);
        
        this.socket.emit('leave-study');
        this.currentStudyId = null;
        return true;
    }

    /**
     * 메시지 전송
     */
    sendMessage(messageData) {
        console.log('📡 SocketService - 메시지 전송 요청:', {
            messageData,
            socketExists: !!this.socket,
            isConnected: this.isConnected,
            socketConnected: this.socket?.connected,
            currentStudyId: this.currentStudyId,
            currentUserId: this.currentUserId
        });

        if (!this.socket || !this.isConnected) {
            console.error('❌ 소켓이 연결되어 있지 않습니다:', {
                hasSocket: !!this.socket,
                isConnected: this.isConnected,
                socketConnected: this.socket?.connected
            });
            return false;
        }

        if (!this.currentStudyId) {
            console.error('❌ 스터디룸에 참가되어 있지 않습니다:', {
                currentStudyId: this.currentStudyId
            });
            return false;
        }

        if (!this.currentUserId) {
            console.error('❌ 사용자 ID가 설정되지 않았습니다:', {
                currentUserId: this.currentUserId
            });
            return false;
        }

        const fullMessageData = {
            studyId: this.currentStudyId,
            userId: this.currentUserId,
            ...messageData
        };

        console.log('📤 메시지 전송 데이터:', fullMessageData);
        
        try {
            this.socket.emit('send-message', fullMessageData);
            console.log('✅ 메시지 emit 성공');
            return true;
        } catch (error) {
            console.error('❌ 메시지 emit 실패:', error);
            return false;
        }
    }

    /**
     * 파일 업로드 완료 알림
     */
    notifyFileUploadComplete(fileInfo) {
        if (!this.socket || !this.isConnected || !this.currentStudyId) {
            return false;
        }

        this.socket.emit('file-upload-complete', {
            studyId: this.currentStudyId,
            userId: this.currentUserId,
            fileInfo
        });
        return true;
    }

    /**
     * 타이핑 시작 알림
     */
    startTyping() {
        if (!this.socket || !this.isConnected || !this.currentStudyId || !this.currentUserId) {
            return false;
        }

        this.socket.emit('typing-start', {
            studyId: this.currentStudyId,
            userId: this.currentUserId
        });
        return true;
    }

    /**
     * 타이핑 중지 알림
     */
    stopTyping() {
        if (!this.socket || !this.isConnected || !this.currentStudyId || !this.currentUserId) {
            return false;
        }

        this.socket.emit('typing-stop', {
            studyId: this.currentStudyId,
            userId: this.currentUserId
        });
        return true;
    }

    /**
     * 이벤트 리스너 등록
     */
    on(eventName, callback) {
        if (!this.socket) {
            console.error('소켓이 초기화되지 않았습니다.');
            return;
        }

        // 기존 리스너 제거
        if (this.eventListeners.has(eventName)) {
            this.socket.off(eventName, this.eventListeners.get(eventName));
        }

        // 새 리스너 등록
        this.socket.on(eventName, callback);
        this.eventListeners.set(eventName, callback);
    }

    /**
     * 이벤트 리스너 제거
     */
    off(eventName) {
        if (!this.socket) return;

        if (this.eventListeners.has(eventName)) {
            this.socket.off(eventName, this.eventListeners.get(eventName));
            this.eventListeners.delete(eventName);
        }
    }

    /**
     * 연결 상태 확인
     */
    isSocketConnected() {
        return this.isConnected && this.socket?.connected;
    }

    /**
     * 현재 스터디 ID 반환
     */
    getCurrentStudyId() {
        return this.currentStudyId;
    }

    /**
     * 현재 사용자 ID 반환
     */
    getCurrentUserId() {
        return this.currentUserId;
    }
}

// 싱글톤 인스턴스 생성
const socketService = new SocketService();

export default socketService; 