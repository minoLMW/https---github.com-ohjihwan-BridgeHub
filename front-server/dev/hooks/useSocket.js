import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

/**
 * 소켓 연결을 관리하는 커스텀 훅
 */
export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const reconnectTimeoutRef = useRef(null);

    /**
     * 소켓 연결
     */
    const connect = useCallback(async (token) => {
        if (isConnecting || isConnected) {
            return;
        }

        setIsConnecting(true);
        setConnectionError(null);

        try {
            await socketService.connect(token);
            setIsConnected(true);
            console.log('소켓 연결 성공');
        } catch (error) {
            console.error('소켓 연결 실패:', error);
            setConnectionError(error.message);
            
            // 자동 재연결 시도 (5초 후)
            reconnectTimeoutRef.current = setTimeout(() => {
                connect(token);
            }, 5000);
        } finally {
            setIsConnecting(false);
        }
    }, [isConnecting, isConnected]);

    /**
     * 소켓 연결 해제
     */
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        socketService.disconnect();
        setIsConnected(false);
        setConnectionError(null);
        setIsConnecting(false);
    }, []);

    /**
     * 자동 연결 (토큰이 있을 때)
     */
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('🔗 useSocket 연결 시도:', {
            hasToken: !!token,
            isConnected,
            isConnecting
        });
        
        if (token && !isConnected && !isConnecting) {
            console.log('🚀 소켓 연결 시작...');
            connect(token);
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect, isConnected, isConnecting]);

    /**
     * 컴포넌트 언마운트 시 연결 해제
     */
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isConnecting,
        connectionError,
        connect,
        disconnect,
        socketService
    };
};

/**
 * 스터디룸 소켓 이벤트를 관리하는 커스텀 훅
 */
export const useStudySocket = (studyId, userId) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const { isConnected, socketService } = useSocket();

    /**
     * 스터디룸 참가
     */
    const joinStudy = useCallback(() => {
        console.log('🏠 스터디룸 참가 시도:', {
            isConnected,
            studyId,
            userId,
            hasSocketService: !!socketService
        });

        if (!isConnected || !studyId || !userId) {
            console.error('❌ 스터디룸 참가 조건 미충족:', {
                isConnected,
                studyId,
                userId
            });
            return false;
        }

        const success = socketService.joinStudy(studyId, userId);
        console.log('🏠 스터디룸 참가 결과:', success);
        
        if (success) {
            setIsJoined(true);
            console.log('✅ 스터디룸 참가 성공');
        } else {
            console.error('❌ 스터디룸 참가 실패');
        }
        return success;
    }, [isConnected, studyId, userId, socketService]);

    /**
     * 스터디룸 퇴장
     */
    const leaveStudy = useCallback(() => {
        const success = socketService.leaveStudy();
        if (success) {
            setIsJoined(false);
        }
        return success;
    }, [socketService]);

    /**
     * 메시지 전송
     */
    const sendMessage = useCallback((messageData) => {
        console.log('💬 useStudySocket - 메시지 전송 시도:', {
            messageData,
            isConnected,
            isJoined,
            studyId,
            userId
        });

        if (!isConnected) {
            console.error('❌ 소켓이 연결되지 않음');
            return false;
        }

        if (!isJoined) {
            console.error('❌ 스터디룸에 참가되지 않음');
            return false;
        }

        const result = socketService.sendMessage(messageData);
        console.log('💬 소켓 서비스 메시지 전송 결과:', result);
        return result;
    }, [socketService, isConnected, isJoined, studyId, userId]);

    /**
     * 타이핑 시작
     */
    const startTyping = useCallback(() => {
        if (!isConnected || !isJoined || !studyId || !userId) return;
        socketService.startTyping();
    }, [isConnected, isJoined, studyId, userId, socketService]);

    /**
     * 타이핑 중지
     */
    const stopTyping = useCallback(() => {
        if (!isConnected || !isJoined || !studyId || !userId) return;
        socketService.stopTyping();
    }, [isConnected, isJoined, studyId, userId, socketService]);

    /**
     * 소켓 이벤트 리스너 설정
     */
    useEffect(() => {
        if (!isConnected) return;

        // 메시지 수신 (새 메시지)
        socketService.on('new-message', (messageData) => {
            console.log('새 메시지 수신:', messageData);
            
            // 시스템 메시지인지 확인
            const isSystemMessage = messageData.senderId === '시스템' || 
                                    messageData.userId === '시스템' ||
                                    messageData.senderId === 'system' ||
                                    messageData.userId === 'system';
            
            const processedMessage = {
                ...messageData,
                type: isSystemMessage ? 'system' : undefined,
                timestamp: messageData.timestamp || new Date().toISOString()
            };
            
            setMessages(prev => {
                // 중복 메시지 방지
                const exists = prev.find(msg => 
                    (msg.messageId && msg.messageId === processedMessage.messageId) ||
                    (msg.text === processedMessage.message && 
                     msg.senderId === processedMessage.senderId &&
                     Math.abs(new Date(msg.timestamp || 0) - new Date(processedMessage.timestamp)) < 2000)
                );
                
                if (exists) {
                    console.log('중복 메시지 방지:', processedMessage);
                    return prev;
                }
                
                return [...prev, processedMessage];
            });
        });

        // 채팅 히스토리 수신 (스터디룸 참가 시)
        socketService.on('chat-history', (historyMessages) => {
            console.log('채팅 히스토리 수신:', historyMessages.length, '개 메시지');
            
            // 히스토리 메시지에서 시스템 메시지 구분 처리
            const processedMessages = historyMessages.map(msg => {
                // 시스템 메시지인지 확인
                const isSystemMessage = msg.senderId === '시스템' || 
                                        msg.userId === '시스템' ||
                                        msg.senderId === 'system' ||
                                        msg.userId === 'system';
                
                return {
                    ...msg,
                    type: isSystemMessage ? 'system' : undefined,
                    timestamp: msg.timestamp || new Date().toISOString()
                };
            });
            
            // 타임스탬프 기준으로 정렬
            const sortedMessages = processedMessages.sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            console.log('처리된 히스토리 메시지:', sortedMessages.length, '개');
            setMessages(sortedMessages);
        });

        // 사용자 참가
        socketService.on('user-joined', (userData) => {
            setOnlineUsers(prev => {
                const exists = prev.find(user => user.userId === userData.userId);
                if (!exists) {
                    return [...prev, userData];
                }
                return prev;
            });
        });

        // 사용자 퇴장
        socketService.on('user-left', (userData) => {
            setOnlineUsers(prev => prev.filter(user => user.userId !== userData.userId));
        });

        // 온라인 사용자 목록 업데이트
        socketService.on('online-users', (users) => {
            setOnlineUsers(users);
        });

        // 파일 업로드 완료
        socketService.on('file-uploaded', (fileData) => {
            setMessages(prev => [...prev, {
                type: 'file',
                ...fileData,
                timestamp: new Date().toISOString()
            }]);
        });

        // 타이핑 사용자 업데이트
        socketService.on('typing-users-update', (data) => {
            setTypingUsers(data.typingUsers || []);
        });

        // 에러 처리
        socketService.on('error', (error) => {
            console.error('스터디 소켓 에러:', error);
        });

        // 자동 참가 (연결되면 바로 참가)
        if (studyId && userId) {
            joinStudy();
        }

        // 클린업
        return () => {
            socketService.off('new-message');
            socketService.off('chat-history');
            socketService.off('user-joined');
            socketService.off('user-left');
            socketService.off('online-users');
            socketService.off('file-uploaded');
            socketService.off('typing-users-update');
            socketService.off('error');
        };
    }, [isConnected, studyId, userId, joinStudy, socketService]);

    /**
     * 컴포넌트 언마운트 시 스터디룸 퇴장
     */
    useEffect(() => {
        return () => {
            if (isJoined) {
                leaveStudy();
            }
        };
    }, [isJoined, leaveStudy]);

    return {
        messages,
        onlineUsers,
        typingUsers,
        isJoined,
        joinStudy,
        leaveStudy,
        sendMessage,
        startTyping,
        stopTyping,
        isConnected,
        socketService
    };
};

export default useSocket; 