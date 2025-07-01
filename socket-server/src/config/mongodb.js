/**
 * MongoDB 연결 설정
 * Socket Server용 MongoDB 연결 관리
 */

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { initializeSchemas } = require('../../mongodb-schema');

class MongoDBManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/thebridgehub';
        this.dbName = process.env.DB_NAME || 'thebridgehub';
    }

    /**
     * MongoDB 연결
     */
    async connect() {
        try {
            console.log('MongoDB 연결 시도 중...');
            console.log(`연결 문자열: ${this.connectionString}`);
            
            // Mongoose 연결 (스키마 기반)
            await mongoose.connect(this.connectionString, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false
            });

            // Native MongoDB 클라이언트 연결 (성능 최적화용)
            this.client = new MongoClient(this.connectionString, {
                maxPoolSize: 20,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                w: 'majority'
            });

            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.isConnected = true;

            console.log('✅ MongoDB 연결 성공');
            
            // 스키마 초기화
            await this.initializeSchemas();
            
            // 인덱스 생성
            await this.createIndexes();
            
            return true;
        } catch (error) {
            console.error('MongoDB 연결 실패:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * 스키마 초기화
     */
    async initializeSchemas() {
        try {
            console.log('MongoDB 스키마 초기화 중...');
            await initializeSchemas();
            console.log('✅ MongoDB 스키마 초기화 완료');
        } catch (error) {
            console.error('MongoDB 스키마 초기화 실패:', error);
            // 스키마 초기화 실패해도 서버는 계속 실행
        }
    }

    /**
     * MongoDB 연결 해제
     */
    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
            }
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB 연결 해제 완료');
        } catch (error) {
            console.error('MongoDB 연결 해제 실패:', error);
        }
    }

    /**
     * 데이터베이스 인스턴스 반환
     */
    getDatabase() {
        if (!this.isConnected) {
            throw new Error('MongoDB가 연결되지 않았습니다.');
        }
        return this.db;
    }

    /**
     * 컬렉션 반환
     */
    getCollection(collectionName) {
        return this.getDatabase().collection(collectionName);
    }

    /**
     * 인덱스 생성
     */
    async createIndexes() {
        try {
            console.log('MongoDB 인덱스 생성 중...');

            // 메시지 컬렉션 인덱스
            const messagesCollection = this.getCollection('messages');
            await messagesCollection.createIndex({ studyId: 1, timestamp: -1 });
            await messagesCollection.createIndex({ senderId: 1, timestamp: -1 });
            await messagesCollection.createIndex({ messageType: 1 });
            await messagesCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30일 TTL

            // 채팅 세션 컬렉션 인덱스
            const chatSessionsCollection = this.getCollection('chatSessions');
            await chatSessionsCollection.createIndex({ studyId: 1, userId: 1 });
            await chatSessionsCollection.createIndex({ socketId: 1 });
            await chatSessionsCollection.createIndex({ status: 1 });
            await chatSessionsCollection.createIndex({ lastActivity: 1 });

            // 스터디룸 상태 컬렉션 인덱스
            const studyRoomsCollection = this.getCollection('studyRooms');
            await studyRoomsCollection.createIndex({ studyId: 1 });
            await studyRoomsCollection.createIndex({ lastActivity: 1 });
            await studyRoomsCollection.createIndex({ memberCount: -1 });

            // 사용자 상태 컬렉션 인덱스
            const userStatusCollection = this.getCollection('userStatus');
            await userStatusCollection.createIndex({ userId: 1 });
            await userStatusCollection.createIndex({ status: 1 });
            await userStatusCollection.createIndex({ lastSeen: 1 });

            // 시스템 로그 컬렉션 인덱스
            const systemLogsCollection = this.getCollection('systemLogs');
            await systemLogsCollection.createIndex({ level: 1, timestamp: -1 });
            await systemLogsCollection.createIndex({ studyId: 1, timestamp: -1 });
            await systemLogsCollection.createIndex({ userId: 1, timestamp: -1 });
            await systemLogsCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90일 TTL

            // 파일 업로드 컬렉션 인덱스
            const fileUploadsCollection = this.getCollection('fileUploads');
            await fileUploadsCollection.createIndex({ studyId: 1, uploadedAt: -1 });
            await fileUploadsCollection.createIndex({ senderId: 1, uploadedAt: -1 });
            await fileUploadsCollection.createIndex({ uploadStatus: 1 });

            console.log('✅ MongoDB 인덱스 생성 완료');
        } catch (error) {
            console.error('MongoDB 인덱스 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 연결 상태 확인
     */
    isConnected() {
        return this.isConnected;
    }

    /**
     * 헬스 체크
     */
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', message: 'MongoDB 연결되지 않음' };
            }

            // 간단한 쿼리로 연결 상태 확인
            await this.db.admin().ping();
            return { status: 'healthy', message: 'MongoDB 정상 연결' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 연결 재시도
     */
    async reconnect() {
        try {
            console.log('MongoDB 재연결 시도 중...');
            await this.disconnect();
            await this.connect();
            return true;
        } catch (error) {
            console.error('MongoDB 재연결 실패:', error);
            return false;
        }
    }
}

// 싱글톤 인스턴스 생성
const mongoDBManager = new MongoDBManager();

module.exports = mongoDBManager; 