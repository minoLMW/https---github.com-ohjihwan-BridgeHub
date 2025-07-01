/**
 * MongoDB 스키마 정의
 * Socket.io 서버에서 사용하는 MongoDB 컬렉션들의 스키마를 정의합니다.
 */

const { MongoClient } = require('mongodb');

// MongoDB 연결 설정
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'thebridgehub';

// 스키마 정의
const schemas = {
    // 메시지 컬렉션 스키마
    messages: {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["studyId", "senderId", "content", "timestamp"],
                properties: {
                    studyId: {
                        description: "스터디룸 ID (필수)"
                    },
                    senderId: {
                        description: "발신자 ID (필수)"
                    },
                    senderName: {
                        bsonType: "string",
                        description: "발신자 이름"
                    },
                    senderNickname: {
                        bsonType: "string",
                        description: "발신자 닉네임"
                    },
                    content: {
                        bsonType: "string",
                        description: "메시지 내용 (필수)"
                    },
                    messageType: {
                        enum: ["TEXT", "FILE", "IMAGE", "LINK", "SYSTEM"],
                        description: "메시지 타입"
                    },
                    fileInfo: {
                        bsonType: "object",
                        properties: {
                            fileName: { bsonType: "string" },
                            fileUrl: { bsonType: "string" },
                            fileSize: { bsonType: "int" },
                            mimeType: { bsonType: "string" }
                        }
                    },
                    linkPreviews: {
                        bsonType: "array",
                        items: {
                            bsonType: "object",
                            properties: {
                                url: { bsonType: "string" },
                                title: { bsonType: "string" },
                                description: { bsonType: "string" },
                                image: { bsonType: "string" }
                            }
                        }
                    },
                    timestamp: {
                        bsonType: "date",
                        description: "메시지 전송 시간 (필수)"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "생성 시간"
                    },
                    updatedAt: {
                        bsonType: "date",
                        description: "수정 시간"
                    },
                    isDeleted: {
                        bsonType: "bool",
                        description: "삭제 여부"
                    }
                }
            }
        },
        indexes: [
            { key: { studyId: 1, timestamp: -1 } },
            { key: { senderId: 1, timestamp: -1 } },
            { key: { timestamp: -1 } },
            { key: { isDeleted: 1 } }
        ]
    },

    // 스터디룸 상태 컬렉션 스키마
    studyRooms: {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["studyId"],
                properties: {
                    studyId: {
                        bsonType: ["int", "string"],
                        description: "스터디룸 ID (필수)"
                    },
                    studyTitle: {
                        bsonType: "string",
                        description: "스터디 제목"
                    },
                    currentMembers: {
                        bsonType: "array",
                        items: {
                            bsonType: "object"
                        }
                    },
                    memberCount: {
                        bsonType: ["int", "long"],
                        description: "현재 멤버 수"
                    },
                    lastMessage: {
                        bsonType: "object"
                    },
                    lastActivity: {
                        bsonType: "date",
                        description: "마지막 활동 시간"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "생성 시간"
                    },
                    updatedAt: {
                        bsonType: "date",
                        description: "수정 시간"
                    }
                }
            }
        },
        indexes: [
            { key: { studyId: 1 } },
            { key: { lastActivity: -1 } },
            { key: { memberCount: -1 } }
        ]
    },

    // 채팅 세션 컬렉션 스키마
    chatSessions: {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["studyId", "userId", "status"],
                properties: {
                    studyId: {
                        bsonType: ["int", "string"],
                        description: "스터디룸 ID (필수)"
                    },
                    userId: {
                        bsonType: ["int", "string"],
                        description: "사용자 ID (필수)"
                    },
                    userName: {
                        bsonType: "string",
                        description: "사용자 이름"
                    },
                    userNickname: {
                        bsonType: "string",
                        description: "사용자 닉네임"
                    },
                    socketId: {
                        bsonType: "string",
                        description: "Socket ID"
                    },
                    status: {
                        enum: ["ACTIVE", "INACTIVE"],
                        description: "세션 상태 (필수)"
                    },
                    userAgent: {
                        bsonType: "string",
                        description: "사용자 에이전트"
                    },
                    ipAddress: {
                        bsonType: "string",
                        description: "IP 주소"
                    },
                    joinedAt: {
                        bsonType: "date",
                        description: "참가 시간"
                    },
                    lastActivity: {
                        bsonType: "date",
                        description: "마지막 활동 시간"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "생성 시간"
                    },
                    updatedAt: {
                        bsonType: "date",
                        description: "수정 시간"
                    }
                }
            }
        },
        indexes: [
            { key: { studyId: 1, userId: 1 } },
            { key: { socketId: 1 } },
            { key: { status: 1 } },
            { key: { lastActivity: -1 } }
        ]
    },

    // 시스템 로그 컬렉션 스키마
    systemLogs: {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["level", "message"],
                properties: {
                    level: {
                        bsonType: "string",
                        description: "로그 레벨"
                    },
                    category: {
                        bsonType: "string",
                        description: "로그 카테고리"
                    },
                    studyId: {
                        bsonType: ["int", "string"],
                        description: "스터디룸 ID"
                    },
                    userId: {
                        bsonType: ["int", "string"],
                        description: "사용자 ID"
                    },
                    message: {
                        bsonType: "string",
                        description: "로그 메시지 (필수)"
                    },
                    details: {
                        bsonType: "object",
                        description: "추가 상세 정보"
                    },
                    timestamp: {
                        bsonType: "date",
                        description: "로그 시간"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "생성 시간"
                    }
                }
            }
        },
        indexes: [
            { key: { timestamp: -1 } },
            { key: { level: 1, timestamp: -1 } },
            { key: { category: 1, timestamp: -1 } },
            { key: { studyId: 1, timestamp: -1 } },
            { key: { userId: 1, timestamp: -1 } }
        ]
    },

    // 파일 업로드 컬렉션 스키마
    fileUploads: {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["studyId", "senderId", "fileName", "fileUrl", "fileSize"],
                properties: {
                    studyId: {
                        bsonType: ["int", "string"],
                        description: "스터디룸 ID (필수)"
                    },
                    senderId: {
                        bsonType: ["int", "string"],
                        description: "업로드자 ID (필수)"
                    },
                    senderName: {
                        bsonType: "string",
                        description: "업로드자 이름"
                    },
                    fileName: {
                        bsonType: "string",
                        description: "파일명 (필수)"
                    },
                    originalFileName: {
                        bsonType: "string",
                        description: "원본 파일명"
                    },
                    fileUrl: {
                        bsonType: "string",
                        description: "파일 URL (필수)"
                    },
                    fileSize: {
                        bsonType: "int",
                        description: "파일 크기 (필수)"
                    },
                    mimeType: {
                        bsonType: "string",
                        description: "MIME 타입"
                    },
                    uploadStatus: {
                        enum: ["PENDING", "UPLOADING", "COMPLETED", "FAILED"],
                        description: "업로드 상태"
                    },
                    uploadedAt: {
                        bsonType: "date",
                        description: "업로드 시간"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "생성 시간"
                    },
                    updatedAt: {
                        bsonType: "date",
                        description: "수정 시간"
                    }
                }
            }
        },
        indexes: [
            { key: { studyId: 1, uploadedAt: -1 } },
            { key: { senderId: 1, uploadedAt: -1 } },
            { key: { uploadStatus: 1 } },
            { key: { uploadedAt: -1 } }
        ]
    }
};

/**
 * MongoDB 스키마 초기화 함수
 */
async function initializeSchemas() {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db(DB_NAME);
        
        console.log('MongoDB 스키마 초기화 시작...');
        
        for (const [collectionName, schema] of Object.entries(schemas)) {
            try {
                // 컬렉션이 존재하는지 확인
                const collections = await db.listCollections({ name: collectionName }).toArray();
                
                if (collections.length === 0) {
                    // 컬렉션이 없으면 생성
                    await db.createCollection(collectionName, {
                        validator: schema.validator
                    });
                    console.log(`컬렉션 생성됨: ${collectionName}`);
                } else {
                    // 컬렉션이 있으면 validator 업데이트
                    await db.command({
                        collMod: collectionName,
                        validator: schema.validator
                    });
                    console.log(`컬렉션 validator 업데이트됨: ${collectionName}`);
                }
                
                // 인덱스 생성
                for (const index of schema.indexes) {
                    try {
                        await db.collection(collectionName).createIndex(index.key, {
                            background: true,
                            ...index.options
                        });
                    } catch (indexError) {
                        console.warn(`인덱스 생성 실패 (${collectionName}):`, indexError.message);
                    }
                }
                
            } catch (error) {
                console.error(`스키마 초기화 실패 (${collectionName}):`, error.message);
            }
        }
        
        console.log('MongoDB 스키마 초기화 완료!');
        
    } catch (error) {
        console.error('MongoDB 스키마 초기화 중 오류:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * 스키마 검증 함수
 */
async function validateSchema() {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db(DB_NAME);
        
        console.log('MongoDB 스키마 검증 시작');
        
        for (const [collectionName, schema] of Object.entries(schemas)) {
            try {
                const collection = db.collection(collectionName);
                
                // 컬렉션 옵션 확인
                const options = await db.command({ listCollections: 1, filter: { name: collectionName } });
                
                if (options.cursor.firstBatch.length > 0) {
                    const collectionInfo = options.cursor.firstBatch[0];
                    console.log(`컬렉션 확인됨: ${collectionName}`);
                    
                    // 인덱스 확인
                    const indexes = await collection.indexes();
                    console.log(`인덱스 개수 (${collectionName}): ${indexes.length}`);
                }
                
            } catch (error) {
                console.error(`스키마 검증 실패 (${collectionName}):`, error.message);
            }
        }
        
        console.log('MongoDB 스키마 검증 완료!');
        
    } catch (error) {
        console.error('MongoDB 스키마 검증 중 오류:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

module.exports = {
    schemas,
    initializeSchemas,
    validateSchema,
    MONGODB_URI,
    DB_NAME
};

// 스크립트로 직접 실행될 때만 초기화 실행
if (require.main === module) {
    initializeSchemas()
        .then(() => {
            console.log('✅ 스키마 초기화 성공!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 스키마 초기화 실패:', error);
            process.exit(1);
        });
} 