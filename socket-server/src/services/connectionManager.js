const axios = require('axios');

class ConnectionManager {
    constructor() {
        this.isConnected = false;
        this.retryInterval = parseInt(process.env.RETRY_INTERVAL) || 5000; // 환경변수로 설정
        this.maxRetries = parseInt(process.env.MAX_RETRIES) || 10; // 환경변수로 설정
        this.currentRetries = 0;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:7100/api';
        this.systemToken = process.env.SYSTEM_TOKEN || 'system-token-for-socket-server';
        this.retryTimer = null;
        this.connectionCheckInterval = null;
        this.connectionCheckIntervalTime = parseInt(process.env.CONNECTION_CHECK_INTERVAL) || 30000; // 환경변수로 설정
    }

    // API 호출을 위한 공통 헤더 설정
    getApiHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-System-Token': this.systemToken
        };
    }

    // 연결 상태 확인
    async checkConnection() {
        try {
            console.log(`API 서버 연결 확인 중: ${this.apiBaseUrl}/health`);
            const response = await axios.get(`${this.apiBaseUrl}/health`, {
                timeout: parseInt(process.env.API_TIMEOUT) || 3000, // 환경변수로 설정
                headers: this.getApiHeaders()
            });
            
            console.log(`API 서버 응답:`, {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });
            
            if (response.status === 200) {
                this.setConnected(true);
                return true;
            } else {
                this.setConnected(false);
                return false;
            }
        } catch (error) {
            this.setConnected(false);
            console.error('API 서버 연결 확인 실패:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: `${this.apiBaseUrl}/health`
            });
            return false;
        }
    }

    // 연결 상태 설정
    setConnected(status) {
        const wasConnected = this.isConnected;
        this.isConnected = status;
        
        if (status && !wasConnected) {
            console.log('API 서버에 연결되었습니다.');
            this.currentRetries = 0;
            this.stopRetryTimer();
            this.startConnectionCheck();
        } else if (!status && wasConnected) {
            console.log('API 서버 연결이 끊어졌습니다.');
            this.stopConnectionCheck();
            this.startRetryTimer();
        }
    }

    // 재연결 시도
    async attemptReconnection() {
        if (this.isConnected) {
            return;
        }

        console.log(`API 서버 재연결 시도 ${this.currentRetries + 1}/${this.maxRetries}`);
        
        const connected = await this.checkConnection();
        
        if (!connected) {
            this.currentRetries++;
            
            if (this.currentRetries >= this.maxRetries) {
                console.error('최대 재연결 시도 횟수를 초과했습니다.');
                this.stopRetryTimer();
                return;
            }
        }
    }

    // 재시도 타이머 시작
    startRetryTimer() {
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
        }
        
        this.retryTimer = setInterval(() => {
            this.attemptReconnection();
        }, this.retryInterval);
    }

    // 재시도 타이머 중지
    stopRetryTimer() {
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
            this.retryTimer = null;
        }
    }

    // 연결 상태 주기적 확인 시작
    startConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }
        
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, this.connectionCheckIntervalTime); // 환경변수로 설정된 간격 사용
    }

    // 연결 상태 확인 중지
    stopConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
            this.connectionCheckInterval = null;
        }
    }

    // 연결 상태 조회
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            currentRetries: this.currentRetries,
            maxRetries: this.maxRetries,
            apiBaseUrl: this.apiBaseUrl
        };
    }

    // 강제 재연결
    async forceReconnect() {
        console.log('강제 재연결 시도...');
        this.currentRetries = 0;
        this.stopRetryTimer();
        await this.attemptReconnection();
    }

    // 정리
    cleanup() {
        this.stopRetryTimer();
        this.stopConnectionCheck();
        console.log('ConnectionManager 정리 완료');
    }
}

module.exports = ConnectionManager; 