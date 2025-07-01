const studyService = require('../services/studyService');
const mongoService = require('../services/mongoService');
const { 
    handleJoinStudy, 
    handleFileUploadComplete,
    handleGetSystemStatus,
    handleForceReconnect
} = require('../controllers/socketController');

class ChatHandler {
    constructor(io) {
        this.io = io;
        this.rooms = new Map(); // 채팅방 정보 저장
        this.typingUsers = new Map(); // 타이핑 중인 사용자 관리 (studyId -> Set<userId>)
        this.typingTimeouts = new Map(); // 타이핑 타임아웃 관리 (socketId -> timeoutId)
        this.pendingNotifications = new Map(); // 미읽음 알림 저장 (userId -> Array<notification>)
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('🔌 ChatHandler - 클라이언트 연결됨:', socket.id, new Date().toISOString());

            // 모든 소켓 이벤트 로깅 (디버깅용)
            const originalEmit = socket.emit;
            const originalOn = socket.on;
            
            socket.on = function(event, callback) {
                console.log(`📥 [${socket.id}] 이벤트 리스너 등록:`, event);
                return originalOn.call(this, event, (...args) => {
                    console.log(`📥 [${socket.id}] 이벤트 수신:`, event, args.length > 0 ? args[0] : '(no data)');
                    return callback(...args);
                });
            };
            
            socket.emit = function(event, ...args) {
                console.log(`📤 [${socket.id}] 이벤트 전송:`, event, args.length > 0 ? args[0] : '(no data)');
                return originalEmit.call(this, event, ...args);
            };

            // 스터디룸 참가 (socketRouter에서 가져온 핸들러 사용)
            socket.on('join-study', async (data) => {
                try {
                    console.log('📥 ChatHandler - join-study 이벤트 수신:', data);
                    const { studyId, userId } = data;
                    if (!studyId || !userId) {
                        throw new Error('스터디 ID와 사용자 ID가 필요합니다.');
                    }
                    
                    // 채팅방 참가 로직만 실행 (handleJoinStudy는 중복 메시지 발생으로 제외)
                    await this.joinChatRoom(socket, studyId, userId);
                    
                } catch (error) {
                    console.error('❌ ChatHandler - 스터디룸 참가 처리 실패:', error);
                    socket.emit('error', {
                        message: '스터디룸 참가에 실패했습니다.',
                        error: error.message
                    });
                }
            });

            // 채팅방 참가
            socket.on('join-chat', async (data) => {
                try {
                    const { studyId, userId } = data;
                    console.log(`사용자 ${userId}가 채팅방 ${studyId}에 참가 시도`);
                    
                    await this.joinChatRoom(socket, studyId, userId);
                    
                } catch (error) {
                    console.error('채팅방 참가 실패:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            // 파일 업로드 완료 (socketRouter에서 가져온 핸들러 사용)
            socket.on('file-upload-complete', async (data) => {
                try {
                    console.log('📁 ChatHandler - file-upload-complete 이벤트 수신:', data);
                    const { studyId, userId, fileInfo } = data;
                    
                    if (!studyId || !userId || !fileInfo) {
                        throw new Error('파일 업로드 정보가 누락되었습니다.');
                    }

                    await handleFileUploadComplete(socket, data);
                } catch (error) {
                    console.error('❌ ChatHandler - 파일 업로드 완료 처리 실패:', error);
                    socket.emit('error', {
                        message: '파일 업로드 완료 처리에 실패했습니다.',
                        error: error.message
                    });
                }
            });

            // 시스템 상태 조회
            socket.on('get-system-status', () => {
                console.log('📊 ChatHandler - get-system-status 이벤트 수신');
                handleGetSystemStatus(socket);
            });

            // 강제 재연결
            socket.on('force-reconnect', () => {
                console.log('🔄 ChatHandler - force-reconnect 이벤트 수신');
                handleForceReconnect(socket);
            });

            // 스터디룸 퇴장
            socket.on('leave-study', async () => {
                try {
                    console.log('📤 ChatHandler - leave-study 이벤트 수신:', socket.userId);
                    const studyId = socket.currentStudyId;
                    if (studyId) {
                        socket.leave(studyId);
                        delete socket.currentStudyId;
                        
                        // 다른 참가자들에게 퇴장 알림
                        socket.to(studyId).emit('user-left', {
                            userId: socket.userId,
                            timestamp: new Date().toISOString()
                        });
                        
                        console.log(`👋 사용자 ${socket.userId}가 스터디 ${studyId}에서 퇴장했습니다.`);
                    }
                } catch (error) {
                    console.error('❌ ChatHandler - 스터디룸 퇴장 처리 실패:', error);
                    socket.emit('error', {
                        message: '스터디룸 퇴장에 실패했습니다.',
                        error: error.message
                    });
                }
            });

            // 스터디 참가 신청 알림
            socket.on('study-join-request', async (data) => {
                try {
                    const { studyId, applicantId, applicantName, applicantProfileImage } = data;
                    console.log(`스터디 참가 신청 알림: studyId=${studyId}, applicant=${applicantName}`);

                    // 스터디 정보 조회 (방장 정보 포함)
                    const study = await studyService.getStudy(studyId);
                    if (!study) {
                        throw new Error('스터디를 찾을 수 없습니다.');
                    }

                    const bossId = study.bossId || study.createdBy; // 방장 ID
                    
                    // 알림 데이터 생성
                    const notification = {
                        type: 'join-request',
                        studyId: studyId,
                        studyTitle: study.title,
                        applicantId: applicantId,
                        applicantName: applicantName,
                        applicantProfileImage: applicantProfileImage || '/default-profile.png',
                        timestamp: new Date().toISOString(),
                        message: `${applicantName}님이 "${study.title}" 스터디 참가를 신청했습니다.`
                    };

                    // 방장이 현재 채팅방에 있는지 확인
                    const room = this.rooms.get(studyId);
                    let bossInRoom = false;
                    
                    if (room) {
                        for (const [socketId, participant] of room.participants) {
                            if (participant.userId === bossId) {
                                // 방장이 채팅방에 있으면 실시간 알림
                                this.io.to(socketId).emit('join-request-notification', notification);
                                bossInRoom = true;
                                console.log(`방장 ${bossId}에게 실시간 알림 전송됨`);
                                break;
                            }
                        }
                    }

                    // 방장이 채팅방에 없으면 미읽음 알림 저장
                    if (!bossInRoom) {
                        if (!this.pendingNotifications.has(bossId)) {
                            this.pendingNotifications.set(bossId, []);
                        }
                        this.pendingNotifications.get(bossId).push(notification);
                        console.log(`방장 ${bossId}의 미읽음 알림 저장됨`);
                    }

                    // 신청자에게 성공 응답
                    socket.emit('join-request-sent', {
                        success: true,
                        message: '참가 신청이 전송되었습니다.'
                    });

                } catch (error) {
                    console.error('스터디 참가 신청 알림 실패:', error);
                    socket.emit('join-request-error', {
                        message: error.message
                    });
                }
            });

            // 참가 신청 응답 (승인/거절)
            socket.on('study-join-response', async (data) => {
                try {
                    const { studyId, applicantId, response, bossId } = data; // response: 'approved' or 'rejected'
                    console.log(`스터디 참가 응답: studyId=${studyId}, applicantId=${applicantId}, response=${response}`);

                    // 스터디 정보 조회
                    const study = await studyService.getStudy(studyId);
                    if (!study) {
                        throw new Error('스터디를 찾을 수 없습니다.');
                    }

                    // 응답 메시지 생성
                    const responseNotification = {
                        type: 'join-response',
                        studyId: studyId,
                        studyTitle: study.title,
                        response: response,
                        timestamp: new Date().toISOString(),
                        message: response === 'approved' 
                            ? `"${study.title}" 스터디 참가가 승인되었습니다!`
                            : `"${study.title}" 스터디 참가가 거절되었습니다.`
                    };

                    // 신청자에게 알림 전송 (온라인이면 실시간, 오프라인이면 저장)
                    let applicantNotified = false;
                    
                    // 모든 방에서 신청자 찾기
                    for (const [roomId, room] of this.rooms) {
                        for (const [socketId, participant] of room.participants) {
                            if (participant.userId === applicantId) {
                                this.io.to(socketId).emit('join-response-notification', responseNotification);
                                applicantNotified = true;
                                console.log(`신청자 ${applicantId}에게 실시간 응답 알림 전송됨`);
                                break;
                            }
                        }
                        if (applicantNotified) break;
                    }

                    // 신청자가 온라인이 아니면 미읽음 알림 저장
                    if (!applicantNotified) {
                        if (!this.pendingNotifications.has(applicantId)) {
                            this.pendingNotifications.set(applicantId, []);
                        }
                        this.pendingNotifications.get(applicantId).push(responseNotification);
                        console.log(`신청자 ${applicantId}의 미읽음 응답 알림 저장됨`);
                    }

                    // 방장에게 성공 응답
                    socket.emit('join-response-sent', {
                        success: true,
                        message: '응답이 전송되었습니다.'
                    });

                } catch (error) {
                    console.error('스터디 참가 응답 실패:', error);
                    socket.emit('join-response-error', {
                        message: error.message
                    });
                }
            });

            // 메시지 전송
            socket.on('send-message', async (data) => {
                try {
                    const { studyId, userId, message, fileType, fileUrl, fileName } = data;
                    console.log(`💬 ChatHandler - 메시지 수신:`, {
                        studyId: studyId,
                        userId: userId,
                        messageLength: message?.length || 0,
                        messagePreview: message?.length > 40 ? message.substring(0, 40) + '...' : message,
                        fileType: fileType || 'none',
                        timestamp: new Date().toISOString()
                    });
                    
                    // 메시지 전송 시 타이핑 상태 자동 해제
                    this.stopTyping(socket, studyId, userId);
                    
                    const timestamp = new Date().toISOString();
                    const room = this.rooms.get(studyId);
                    
                    if (room) {
                        // 메시지 데이터 생성 (프론트엔드 호환)
                        const messageData = {
                            userId,
                            senderId: userId,
                            message: message,  // 프론트엔드가 기대하는 필드
                            text: message,     // 백업 필드
                            timestamp,
                            fileType,
                            fileUrl,
                            fileName
                        };
                        
                        // 메모리에 메시지 저장
                        room.messages.push(messageData);
                        
                        console.log(`📝 ChatHandler - 메모리에 메시지 저장:`, {
                            studyId: studyId,
                            userId: userId,
                            totalMessagesInRoom: room.messages.length,
                            savedAt: timestamp
                        });

                        // MongoDB에 메시지 저장
                        console.log(`💾 ChatHandler - MongoDB 메시지 저장 시작...`, {
                            studyId: studyId,
                            userId: userId,
                            messageType: fileType ? 'FILE' : 'TEXT'
                        });

                        try {
                            const messageId = await mongoService.saveMessage({
                                studyId: studyId,
                                senderId: userId,
                                senderName: socket.userName || userId,
                                senderNickname: socket.userNickname || userId,
                                content: message,
                                messageType: fileType ? 'FILE' : 'TEXT',
                                fileInfo: fileType ? {
                                    fileName: fileName,
                                    fileUrl: fileUrl,
                                    fileSize: 0,
                                    mimeType: fileType
                                } : null,
                                linkPreviews: null
                            });

                            console.log(`✅ ChatHandler - MongoDB 메시지 저장 성공!`, {
                                messageId: messageId,
                                studyId: studyId,
                                userId: userId,
                                content: message?.length > 50 ? message.substring(0, 50) + '...' : message,
                                timestamp: new Date().toISOString()
                            });

                            // 저장된 메시지 ID를 메시지 데이터에 추가
                            messageData.messageId = messageId;

                        } catch (mongoError) {
                            console.error(`❌ ChatHandler - MongoDB 메시지 저장 실패:`, {
                                error: mongoError.message,
                                studyId: studyId,
                                userId: userId,
                                timestamp: new Date().toISOString()
                            });
                        }

                        // 같은 방의 모든 클라이언트에게 메시지 전송
                        this.io.to(studyId).emit('new-message', messageData);
                        
                        console.log(`📤 ChatHandler - 클라이언트 브로드캐스트 완료:`, {
                            studyId: studyId,
                            userId: userId,
                            participantCount: room.participants.size,
                            broadcastAt: new Date().toISOString()
                        });
                    } else {
                        console.error(`❌ ChatHandler - 채팅방을 찾을 수 없음:`, {
                            studyId: studyId,
                            userId: userId,
                            availableRooms: Array.from(this.rooms.keys()),
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.error(`❌ ChatHandler - 메시지 처리 중 오류:`, {
                        error: error.message,
                        stack: error.stack,
                        studyId: data?.studyId,
                        userId: data?.userId,
                        timestamp: new Date().toISOString()
                    });
                    
                    socket.emit('error', {
                        message: '메시지 전송에 실패했습니다.',
                        error: error.message
                    });
                }
            });

            // 타이핑 시작
            socket.on('typing-start', (data) => {
                const { studyId, userId } = data;
                console.log(`타이핑 시작 - 방: ${studyId}, 사용자: ${userId}`);
                
                this.startTyping(socket, studyId, userId);
            });

            // 타이핑 중지
            socket.on('typing-stop', (data) => {
                const { studyId, userId } = data;
                console.log(`타이핑 중지 - 방: ${studyId}, 사용자: ${userId}`);
                
                this.stopTyping(socket, studyId, userId);
            });

            // 연결 해제
            socket.on('disconnect', () => {
                console.log('클라이언트 연결 해제:', socket.id);
                
                // 타이핑 상태 정리
                this.clearTypingStatus(socket);
                
                // 참가 중인 모든 채팅방에서 사용자 제거
                this.rooms.forEach((room, studyId) => {
                    if (room.participants.has(socket.id)) {
                        const participant = room.participants.get(socket.id);
                        room.participants.delete(socket.id);
                        
                        if (room.participants.size === 0) {
                            this.rooms.delete(studyId);
                            // 채팅방이 비어있으면 타이핑 사용자 목록도 정리
                            this.typingUsers.delete(studyId);
                        } else {
                            // 참여자 수 업데이트
                            this.io.to(studyId).emit('member-count', {
                                count: room.participants.size,
                                capacity: 10
                            });

                            // 퇴장 메시지 전송 (닉네임 사용)
                            this.io.to(studyId).emit('new-message', {
                                userId: '시스템',
                                senderId: '시스템',
                                message: `${participant.displayName || participant.userId}님이 퇴장하셨습니다.`,
                                text: `${participant.displayName || participant.userId}님이 퇴장하셨습니다.`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            });
        });
    }

    // 채팅방 참가 공통 로직
    async joinChatRoom(socket, studyId, userId) {
        console.log(`💬 ChatHandler - 채팅방 참가 로직 시작: studyId=${studyId}, userId=${userId}`);
        
        // 스터디 정보 조회
        const study = await studyService.getStudy(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }

        // 사용자 정보 조회
        const userInfo = await studyService.getUserInfo(userId);
        const userDisplayName = userInfo ? (userInfo.nickname || userInfo.name) : `사용자${userId}`;

        // 현재 참가자 수 확인
        const room = this.rooms.get(studyId);
        const currentParticipants = room ? room.participants.size : 0;

        // 이미 참가한 사용자인지 확인 (중복 입장 방지)
        const isAlreadyInRoom = room && Array.from(room.participants.values()).some(p => p.userId === userId);
        
        if (isAlreadyInRoom) {
            console.log(`⚠️ ChatHandler - 이미 참가한 사용자: ${userDisplayName} (${userId})`);
            // 이미 참가한 사용자에게는 채팅 기록만 전송하고 입장 메시지는 보내지 않음
            const currentRoom = this.rooms.get(studyId);
            
            try {
                console.log(`📜 ChatHandler - 기존 사용자에게 MongoDB 채팅 기록 전송: studyId=${studyId}`);
                const recentMessages = await mongoService.getRecentMessages(studyId, 50);
                console.log(`✅ ChatHandler - MongoDB 채팅 기록 조회 성공: ${recentMessages.length}개 메시지`);
                
                const formattedMessages = recentMessages.map(msg => ({
                    userId: msg.senderId,
                    senderId: msg.senderId,
                    message: msg.content,  // 프론트엔드가 기대하는 필드
                    text: msg.content,     // 백업 필드
                    timestamp: msg.timestamp,
                    messageId: msg._id,
                    senderName: msg.senderName,
                    senderNickname: msg.senderNickname,
                    messageType: msg.messageType,
                    fileInfo: msg.fileInfo,
                    linkPreviews: msg.linkPreviews
                }));
                
                socket.emit('chat-history', formattedMessages);
            } catch (error) {
                console.error('❌ ChatHandler - MongoDB 채팅 기록 조회 실패:', error);
                socket.emit('chat-history', currentRoom.messages);
            }
            
            // 참여자 수 업데이트
            this.io.to(studyId).emit('member-count', {
                count: currentRoom.participants.size,
                capacity: study.capacity
            });
            
            return; // 입장 메시지 없이 종료
        }

        // 정원 체크
        if (currentParticipants >= study.capacity) {
            throw new Error('채팅방 정원이 초과되었습니다.');
        }
    
        // 이전 방에서 나가기
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            // 이전 방에서 타이핑 상태 정리
            this.clearTypingStatus(socket);
        }
        
        // 새 방 참가
        socket.join(studyId);
        socket.currentRoom = studyId;
        socket.currentStudyId = studyId; // socketController와 호환성을 위해 추가
        socket.userId = userId;
        socket.userDisplayName = userDisplayName; // 표시명 저장
        socket.userName = userInfo ? userInfo.name : `사용자${userId}`;
        socket.userNickname = userInfo ? userInfo.nickname : `사용자${userId}`;

        // MongoDB에 채팅 세션 저장
        try {
            await mongoService.updateChatSession({
                studyId: studyId,
                userId: userId,
                userName: socket.userName,
                userNickname: socket.userNickname,
                status: 'ACTIVE',
                socketId: socket.id,
                userAgent: socket.handshake.headers['user-agent'],
                ipAddress: socket.handshake.address
            });
            console.log(`💾 MongoDB 채팅 세션 저장 완료: ${userDisplayName} (${userId})`);
        } catch (error) {
            console.error('❌ MongoDB 채팅 세션 저장 실패:', error);
        }
        
        // 채팅방 정보 초기화
        if (!this.rooms.has(studyId)) {
            this.rooms.set(studyId, {
                messages: [],
                participants: new Map(),
                capacity: study.capacity
            });
        }
        
        // 참가자 정보 저장
        this.rooms.get(studyId).participants.set(socket.id, {
            userId: userId,
            socketId: socket.id,
            displayName: userDisplayName
        });

        // 채팅 기록 전송 (MongoDB에서 가져오기)
        const currentRoom = this.rooms.get(studyId);
        try {
            console.log(`📜 ChatHandler - MongoDB에서 채팅 기록 조회 시작: studyId=${studyId}`);
            const recentMessages = await mongoService.getRecentMessages(studyId, 50); // 최근 50개 메시지
            console.log(`✅ ChatHandler - MongoDB 채팅 기록 조회 성공: ${recentMessages.length}개 메시지`);
            
            // MongoDB에서 가져온 메시지를 클라이언트 형식으로 변환
                            const formattedMessages = recentMessages.map(msg => ({
                    userId: msg.senderId,
                    senderId: msg.senderId,
                    message: msg.content,  // 프론트엔드가 기대하는 필드
                    text: msg.content,     // 백업 필드
                    timestamp: msg.timestamp,
                messageId: msg._id,
                senderName: msg.senderName,
                senderNickname: msg.senderNickname,
                messageType: msg.messageType,
                fileInfo: msg.fileInfo,
                linkPreviews: msg.linkPreviews
            }));
            
            socket.emit('chat-history', formattedMessages);
        } catch (error) {
            console.error('❌ ChatHandler - MongoDB 채팅 기록 조회 실패:', error);
            // MongoDB 조회 실패 시 메모리의 메시지라도 전송
            socket.emit('chat-history', currentRoom.messages);
        }

        // 참여자 수 업데이트
        this.io.to(studyId).emit('member-count', {
            count: currentRoom.participants.size,
            capacity: study.capacity
        });

        // 현재 타이핑 중인 사용자 목록 전송
        const typingUsers = this.typingUsers.get(studyId);
        if (typingUsers && typingUsers.size > 0) {
            socket.emit('typing-users-update', {
                typingUsers: Array.from(typingUsers)
            });
        }

        // 미읽음 알림 전송 (방장이 들어올 때)
        const pendingNotifications = this.pendingNotifications.get(userId);
        if (pendingNotifications && pendingNotifications.length > 0) {
            socket.emit('pending-notifications', {
                notifications: pendingNotifications
            });
            // 전송 후 삭제
            this.pendingNotifications.delete(userId);
        }

        // 스터디룸 상태 업데이트
        try {
            const participants = Array.from(currentRoom.participants.values());
            await mongoService.updateStudyRoomStatus(studyId, {
                studyTitle: study.title,
                currentMembers: participants.map(p => ({
                    userId: p.userId,
                    userName: p.displayName || p.userId,
                    userNickname: p.displayName || p.userId,
                    joinedAt: new Date(),
                    status: 'ACTIVE'
                })),
                memberCount: participants.length
            });
            console.log(`📊 스터디룸 상태 업데이트 완료: ${participants.length}명`);
        } catch (error) {
            console.error('❌ 스터디룸 상태 업데이트 실패:', error);
        }

        // 참가한 사용자에게 성공 응답
        socket.emit('study-joined', {
            studyId: studyId,
            userId: userId,
            participants: Array.from(currentRoom.participants.values()),
            message: '스터디룸에 성공적으로 참가했습니다.'
        });

        // 시스템 로그 기록
        try {
            await mongoService.logSystemEvent('INFO', 'STUDY', studyId, userId, '스터디룸 참가');
        } catch (error) {
            console.error('❌ 시스템 로그 기록 실패:', error);
        }

        // 입장 메시지 전송 (닉네임 사용)
        this.io.to(studyId).emit('new-message', {
            userId: '시스템',
            senderId: '시스템',
            message: `${userDisplayName}님이 입장하셨습니다.`,
            text: `${userDisplayName}님이 입장하셨습니다.`,
            timestamp: new Date().toISOString()
        });
        
        console.log(`✅ ChatHandler - 채팅방 참가 완료: studyId=${studyId}, user=${userDisplayName} (${userId}), 참가자수=${currentRoom.participants.size}`);
    }

    // 타이핑 시작 처리
    startTyping(socket, studyId, userId) {
        // 타이핑 사용자 목록 초기화
        if (!this.typingUsers.has(studyId)) {
            this.typingUsers.set(studyId, new Set());
        }

        const typingUsersInRoom = this.typingUsers.get(studyId);
        
        // 이미 타이핑 중이 아닌 경우에만 추가
        if (!typingUsersInRoom.has(userId)) {
            typingUsersInRoom.add(userId);
            
            // 다른 사용자들에게 타이핑 시작 알림
            socket.to(studyId).emit('typing-users-update', {
                typingUsers: Array.from(typingUsersInRoom)
            });
        }

        // 기존 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
        }

        // 3초 후 자동으로 타이핑 상태 해제
        const timeoutId = setTimeout(() => {
            this.stopTyping(socket, studyId, userId);
        }, 3000);

        this.typingTimeouts.set(socket.id, timeoutId);
    }

    // 타이핑 중지 처리
    stopTyping(socket, studyId, userId) {
        // 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
            this.typingTimeouts.delete(socket.id);
        }

        const typingUsersInRoom = this.typingUsers.get(studyId);
        if (typingUsersInRoom && typingUsersInRoom.has(userId)) {
            typingUsersInRoom.delete(userId);
            
            // 모든 사용자에게 타이핑 상태 업데이트 알림
            this.io.to(studyId).emit('typing-users-update', {
                typingUsers: Array.from(typingUsersInRoom)
            });

            // 타이핑 사용자가 없으면 Set 정리
            if (typingUsersInRoom.size === 0) {
                this.typingUsers.delete(studyId);
            }
        }
    }

    // 소켓 연결 해제 시 타이핑 상태 정리
    clearTypingStatus(socket) {
        // 타임아웃 클리어
        if (this.typingTimeouts.has(socket.id)) {
            clearTimeout(this.typingTimeouts.get(socket.id));
            this.typingTimeouts.delete(socket.id);
        }

        // 모든 채팅방에서 해당 사용자의 타이핑 상태 제거
        if (socket.currentRoom && socket.userId) {
            this.stopTyping(socket, socket.currentRoom, socket.userId);
        }
    }
}

module.exports = ChatHandler; 