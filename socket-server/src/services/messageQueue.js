const axios = require('axios');

const SYSTEM_TOKEN = process.env.SYSTEM_TOKEN || 'system-token-for-socket-server';

class MessageQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.maxRetries = parseInt(process.env.MESSAGE_MAX_RETRIES) || 3;
        this.retryDelay = parseInt(process.env.MESSAGE_RETRY_DELAY) || 1000;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:7100/api';
        this.apiTimeout = parseInt(process.env.MESSAGE_API_TIMEOUT) || 5000;
    }

    // 메시지 추가
    addMessage(messageData) {
        const message = {
            id: Date.now() + Math.random(),
            data: messageData,
            retries: 0,
            timestamp: new Date(),
            status: 'pending'
        };
        
        this.queue.push(message);
        console.log(`메시지가 큐에 추가되었습니다: ${message.id}`);
        
        // 큐 처리 시작
        this.processQueue();
        
        return message.id;
    }

    // 큐 처리
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`큐 처리 시작: ${this.queue.length}개 메시지`);

        while (this.queue.length > 0) {
            const message = this.queue[0];
            
            try {
                await this.sendMessage(message);
                // 성공 시 큐에서 제거
                this.queue.shift();
                console.log(`메시지 전송 성공: ${message.id}`);
            } catch (error) {
                console.error(`메시지 전송 실패: ${message.id}`, error.message);
                
                if (message.retries < this.maxRetries) {
                    // 재시도
                    message.retries++;
                    message.status = 'retrying';
                    console.log(`메시지 재시도 ${message.retries}/${this.maxRetries}: ${message.id}`);
                    
                    // 지연 후 재시도
                    await this.delay(this.retryDelay * message.retries);
                } else {
                    // 최대 재시도 횟수 초과
                    message.status = 'failed';
                    console.error(`메시지 전송 최종 실패: ${message.id}`);
                    
                    // 실패한 메시지를 별도 저장 (나중에 수동 처리)
                    this.saveFailedMessage(message);
                    
                    // 큐에서 제거
                    this.queue.shift();
                }
            }
        }

        this.isProcessing = false;
        console.log('큐 처리 완료');
    }

    // 메시지 전송
    async sendMessage(message) {
        try {
            const response = await axios.post(`${this.apiBaseUrl}/messages`, message.data, {
                timeout: this.apiTimeout,
                headers: {
                    'Content-Type': 'application/json',
                    'X-System-Token': SYSTEM_TOKEN
                }
            });

            if (response.status === 200) {
                message.status = 'success';
                return response.data;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('서버 연결 실패');
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error('요청 시간 초과');
            } else if (error.response) {
                throw new Error(`서버 오류: ${error.response.status}`);
            } else {
                throw new Error(`네트워크 오류: ${error.message}`);
            }
        }
    }

    // 지연 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 실패한 메시지 저장
    saveFailedMessage(message) {
        // 실제 구현에서는 파일이나 데이터베이스에 저장
        console.error('실패한 메시지 저장:', {
            id: message.id,
            data: message.data,
            error: message.error,
            timestamp: message.timestamp
        });
    }

    // 큐 상태 조회
    getQueueStatus() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(m => m.status === 'pending').length,
            retrying: this.queue.filter(m => m.status === 'retrying').length,
            failed: this.queue.filter(m => m.status === 'failed').length,
            isProcessing: this.isProcessing
        };
    }

    // 큐 초기화
    clearQueue() {
        this.queue = [];
        console.log('메시지 큐가 초기화되었습니다.');
    }

    // 특정 메시지 제거
    removeMessage(messageId) {
        const index = this.queue.findIndex(m => m.id === messageId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            console.log(`메시지가 큐에서 제거되었습니다: ${messageId}`);
            return true;
        }
        return false;
    }
}

module.exports = MessageQueue; 