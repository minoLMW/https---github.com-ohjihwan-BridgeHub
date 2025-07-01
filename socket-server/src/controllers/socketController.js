const socketService = require('../services/socketService');
const MessageQueue = require('../services/messageQueue');
const ConnectionManager = require('../services/connectionManager');
const mongoService = require('../services/mongoService');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7100/api';
const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN || 'system-token-for-socket-server'; // 시스템용 토큰

// 메시지 큐 인스턴스
const messageQueue = new MessageQueue();

// 연결 관리자 인스턴스
const connectionManager = new ConnectionManager();

// 초기 연결 확인
connectionManager.checkConnection();

// 스터디룸 참가
const handleJoinStudy = async (socket, studyId, userId) => {
    try {
        // 소켓에 사용자 ID 저장
        socket.userId = userId;
        socket.currentStudyId = studyId;
        
        // 스터디룸 참가 (매개변수 순서 수정)
        const result = socketService.joinStudyRoom(socket, studyId, userId);
        
        if (result.success) {
            // MongoDB에 채팅 세션 저장
            await mongoService.updateChatSession({
                studyId: studyId,
                userId: userId,
                userName: socket.userName || userId,
                userNickname: socket.userNickname || userId,
                status: 'ACTIVE',
                socketId: socket.id,
                userAgent: socket.handshake.headers['user-agent'],
                ipAddress: socket.handshake.address
            });

            // 스터디룸 상태 업데이트
            const participants = socketService.getStudyRoomParticipants(studyId);
            await mongoService.updateStudyRoomStatus(studyId, {
                studyTitle: `Study Room ${studyId}`,
                currentMembers: participants.map(p => ({
                    userId: p.userId,
                    userName: p.userName,
                    userNickname: p.userNickname,
                    joinedAt: new Date(),
                    status: 'ACTIVE'
                })),
                memberCount: participants.length
            });

     
            // 참가한 사용자에게 성공 응답
            socket.emit('study-joined', {
                studyId: studyId,
                userId: userId,
                participants: participants,
                message: '스터디룸에 성공적으로 참가했습니다.'
            });
            
            // 시스템 로그 기록
            await mongoService.logSystemEvent('INFO', 'STUDY', studyId, userId, '스터디룸 참가');
            
            console.log(`사용자 ${userId}가 스터디 ${studyId}에 참가했습니다.`);
        } else {
            socket.emit('join-error', {
                message: result.error || '스터디룸 참가에 실패했습니다.'
            });
        }
    } catch (error) {
        console.error('스터디룸 참가 실패:', error);
        socket.emit('join-error', {
            message: '스터디룸 참가에 실패했습니다.',
            error: error.message
        });
    }
};

// 스터디룸 퇴장
const handleLeaveStudy = async (socket, studyId) => {
    try {
        const userId = socket.userId;
        
        // 스터디룸 퇴장
        socketService.leaveStudyRoom(studyId, socket);
        
        // MongoDB에서 채팅 세션 비활성화
        await mongoService.updateChatSession({
            studyId: studyId,
            userId: userId,
            userName: socket.userName || userId,
            userNickname: socket.userNickname || userId,
            status: 'INACTIVE',
            socketId: socket.id,
            userAgent: socket.handshake.headers['user-agent'],
            ipAddress: socket.handshake.address
        });

        // 참가자 목록 조회
        const participants = socketService.getStudyRoomParticipants(studyId);
        
        // 스터디룸 상태 업데이트
        await mongoService.updateStudyRoomStatus(studyId, {
            studyTitle: `Study Room ${studyId}`,
            currentMembers: participants.map(p => ({
                userId: p.userId,
                userName: p.userName,
                userNickname: p.userNickname,
                joinedAt: new Date(),
                status: 'ACTIVE'
            })),
            memberCount: participants.length
        });
        
        // 참가자들에게 퇴장 알림
        socketService.broadcastMessage(studyId, {
            type: 'system',
            content: `${userId}님이 퇴장했습니다.`,
            participants
        });
        
        // 시스템 로그 기록
        await mongoService.logSystemEvent('INFO', 'STUDY', studyId, userId, '스터디룸 퇴장');
        
        console.log(`사용자 ${userId}가 스터디 ${studyId}에서 퇴장했습니다.`);
    } catch (error) {
        console.error('스터디룸 퇴장 실패:', error);
        socket.emit('error', {
            message: '스터디룸 퇴장에 실패했습니다.'
        });
    }
};

// 메시지 전송 (MongoDB 연동)
const handleSendMessage = async (socket, data) => {
    try {
        const { studyId, userId, message, fileType, fileUrl, fileName } = data;
        
        console.log('📨 메시지 전송 요청 수신:', {
            studyId: studyId,
            userId: userId,
            userName: socket.userName || userId,
            userNickname: socket.userNickname || userId,
            messageLength: message?.length || 0,
            messagePreview: message?.length > 50 ? message.substring(0, 50) + '...' : message,
            fileType: fileType || 'none',
            timestamp: new Date().toISOString()
        });
        
        // URL 감지 및 링크 미리보기 추출
        const linkPreviews = await extractLinkPreviews(message);
        const hasLinks = linkPreviews.length > 0;
        
        console.log('🔗 링크 미리보기 처리 결과:', {
            studyId: studyId,
            hasLinks: hasLinks,
            linkCount: linkPreviews.length,
            linkPreviews: linkPreviews.map(preview => ({
                url: preview.url,
                title: preview.title
            }))
        });
        
        // MongoDB에 메시지 저장
        console.log('💾 MongoDB 메시지 저장 시작...', {
            studyId: studyId,
            senderId: userId,
            messageType: hasLinks ? 'LINK' : (fileType ? 'FILE' : 'TEXT')
        });
        
        const messageId = await mongoService.saveMessage({
            studyId: studyId,
            senderId: userId,
            senderName: socket.userName || userId,
            senderNickname: socket.userNickname || userId,
            content: message,
            messageType: hasLinks ? 'LINK' : (fileType ? 'FILE' : 'TEXT'),
            fileInfo: fileType ? {
                fileName: fileName,
                fileUrl: fileUrl,
                fileSize: 0, // 실제 파일 크기는 별도로 계산 필요
                mimeType: fileType
            } : null,
            linkPreviews: linkPreviews
        });
        
        console.log('🎉 MongoDB 메시지 저장 완료!', {
            messageId: messageId,
            studyId: studyId,
            senderId: userId,
            timestamp: new Date().toISOString()
        });

        // 실시간 브로드캐스트 (즉시 전송) - 링크 미리보기 포함
        console.log('📢 실시간 브로드캐스트 시작...', {
            studyId: studyId,
            messageId: messageId,
            userId: userId,
            messageType: hasLinks ? 'LINK' : (fileType ? 'FILE' : 'TEXT'),
            hasLinks: hasLinks,
            linkPreviewCount: linkPreviews.length
        });
        
        socketService.broadcastMessage(studyId, {
            type: 'message',
            messageId: messageId,
            userId,
            content: message,
            fileType,
            fileUrl,
            fileName,
            hasLinks,
            linkPreviews,
            messageType: hasLinks ? 'LINK' : (fileType ? 'FILE' : 'TEXT'),
            timestamp: new Date().toISOString()
        });
        
        console.log('📡 실시간 브로드캐스트 완료!', {
            studyId: studyId,
            messageId: messageId,
            userId: userId,
            broadcastTimestamp: new Date().toISOString()
        });
        
        // Java Server에 메시지 저장 (큐를 통한 비동기 처리)
        const messageData = {
            roomId: studyId,
            senderId: userId,
            content: message,
            messageType: hasLinks ? 'LINK' : (fileType ? 'FILE' : 'TEXT')
        };

        console.log('Java 서버로 전송할 메시지 데이터:', messageData);
        console.log('API 서버 연결 상태:', connectionManager.isConnected);
        console.log('API 서버 URL:', API_BASE_URL);

        // 연결 상태 확인
        if (connectionManager.isConnected) {
            try {
                console.log('직접 API 호출 시도...');
                // 직접 API 호출 시도
                const response = await axios.post(`${API_BASE_URL}/messages`, messageData, {
                    timeout: 5000,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-System-Token': SYSTEM_TOKEN  // 시스템 토큰 추가
                    }
                });
                console.log(`메시지가 Java Server에 저장되었습니다:`, response.data);
            } catch (error) {
                console.error('직접 API 호출 실패:', {
                    message: error.message,
                    code: error.code,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                console.warn('큐에 메시지 추가...');
                // 큐에 추가하여 나중에 재시도
                messageQueue.addMessage(messageData);
            }
        } else {
            console.warn('API 서버 연결 불가, 메시지를 큐에 추가합니다.');
            // 큐에 추가
            messageQueue.addMessage(messageData);
        }
        
        console.log('🏁 메시지 처리 완료!', {
            studyId: studyId,
            userId: userId,
            messageId: messageId,
            messagePreview: message?.length > 30 ? message.substring(0, 30) + '...' : message,
            totalProcessingTime: new Date().toISOString(),
            success: true
        });
        
    } catch (error) {
        console.error('❌ 메시지 전송 실패:', {
            studyId: studyId || 'unknown',
            userId: userId || 'unknown',
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        socket.emit('error', {
            message: '메시지 전송에 실패했습니다.',
            error: error.message
        });
    }
};

// URL 감지 및 링크 미리보기 추출 함수
const extractLinkPreviews = async (message) => {
    const urlRegex = /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[;&\w\d%_.~+=-])*)?(?:#(?:[\w\d%_.~+=-]*))?)?/g;
    const urls = message.match(urlRegex);
    
    if (!urls || urls.length === 0) {
        return [];
    }
    
    console.log('메시지에서 URL 감지됨:', urls);
    
    const linkPreviews = [];
    
    // 각 URL에 대해 링크 미리보기 추출 (Java 서버 API 호출)
    for (const url of urls) {
        try {
            const response = await axios.post(`${API_BASE_URL}/link-preview/extract`, url, {
                timeout: 10000, // 링크 미리보기는 시간이 걸릴 수 있으므로 10초
                headers: {
                    'Content-Type': 'application/json',
                    'X-System-Token': SYSTEM_TOKEN
                }
            });
            
            if (response.data.success && response.data.data.success) {
                linkPreviews.push(response.data.data);
                console.log('링크 미리보기 추출 성공:', url, '-', response.data.data.title);
            } else {
                console.warn('링크 미리보기 추출 실패:', url, '-', response.data.data?.error);
            }
        } catch (error) {
            console.error('링크 미리보기 API 호출 실패:', url, error.message);
        }
    }
    
    return linkPreviews;
};

// 파일 업로드 완료 알림 (수정된 버전)
const handleFileUploadComplete = async (socket, data) => {
    try {
        const { studyId, userId, fileInfo } = data;
        
        console.log('파일 업로드 완료 알림:', { studyId, userId, fileInfo });
        
        // 파일 업로드 완료 메시지 브로드캐스트 (API 호출 없이)
        socketService.broadcastMessage(studyId, {
            type: 'file',
            userId,
            content: `사용자 ${userId}님이 파일을 공유했습니다: ${fileInfo.originalFilename}`,
            fileInfo: fileInfo,
            timestamp: new Date().toISOString()
        });
        
        console.log(`스터디 ${studyId}에서 파일 업로드 완료 브로드캐스트: ${fileInfo.originalFilename}`);
        
        // 업로드 완료 확인 응답
        socket.emit('file-upload-acknowledged', {
            success: true,
            message: '파일 업로드가 완료되었습니다.',
            fileInfo: fileInfo
        });
        
    } catch (error) {
        console.error('파일 업로드 완료 처리 실패:', error);
        socket.emit('error', {
            message: '파일 업로드 완료 처리에 실패했습니다.',
            error: error.message
        });
    }
};

// 시스템 상태 조회
const handleGetSystemStatus = (socket) => {
    try {
        const status = {
            connection: connectionManager.getConnectionStatus(),
            messageQueue: messageQueue.getQueueStatus(),
            timestamp: new Date().toISOString()
        };
        
        socket.emit('system-status', status);
    } catch (error) {
        console.error('시스템 상태 조회 실패:', error);
        socket.emit('error', {
            message: '시스템 상태 조회에 실패했습니다.',
            error: error.message
        });
    }
};

// 강제 재연결
const handleForceReconnect = async (socket) => {
    try {
        await connectionManager.forceReconnect();
        socket.emit('reconnect-result', {
            success: connectionManager.isConnected,
            message: connectionManager.isConnected ? '재연결 성공' : '재연결 실패'
        });
    } catch (error) {
        console.error('강제 재연결 실패:', error);
        socket.emit('error', {
            message: '강제 재연결에 실패했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    handleJoinStudy,
    handleLeaveStudy,
    handleSendMessage,
    handleFileUploadComplete,
    handleGetSystemStatus,
    handleForceReconnect,
    messageQueue,
    connectionManager
}; 