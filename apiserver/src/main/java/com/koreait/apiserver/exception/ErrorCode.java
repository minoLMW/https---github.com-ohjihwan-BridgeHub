package com.koreait.apiserver.exception;

public enum ErrorCode {
    
    // 인증 관련
    UNAUTHORIZED("AUTH_001", "인증이 필요합니다."),
    INVALID_TOKEN("AUTH_002", "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED("AUTH_003", "토큰이 만료되었습니다."),
    
    // 회원 관련
    MEMBER_NOT_FOUND("MEMBER_001", "회원을 찾을 수 없습니다."),
    DUPLICATE_USERID("MEMBER_002", "이미 사용 중인 아이디입니다."),
    DUPLICATE_EMAIL("MEMBER_003", "이미 사용 중인 이메일입니다."),
    INVALID_PASSWORD("MEMBER_004", "비밀번호가 올바르지 않습니다."),
    
    // 스터디룸 관련
    STUDYROOM_NOT_FOUND("STUDY_001", "스터디룸을 찾을 수 없습니다."),
    STUDYROOM_FULL("STUDY_002", "스터디룸 정원이 가득 찼습니다."),
    STUDYROOM_ACCESS_DENIED("STUDY_003", "스터디룸 접근 권한이 없습니다."),
    
    // 메시지 관련
    MESSAGE_NOT_FOUND("MESSAGE_001", "메시지를 찾을 수 없습니다."),
    MESSAGE_ACCESS_DENIED("MESSAGE_002", "메시지 접근 권한이 없습니다."),
    
    // 파일 관련
    FILE_NOT_FOUND("FILE_001", "파일을 찾을 수 없습니다."),
    FILE_UPLOAD_FAILED("FILE_002", "파일 업로드에 실패했습니다."),
    FILE_DOWNLOAD_FAILED("FILE_003", "파일 다운로드에 실패했습니다."),
    INVALID_FILE_TYPE("FILE_004", "지원하지 않는 파일 형식입니다."),
    FILE_SIZE_EXCEEDED("FILE_005", "파일 크기가 허용 범위를 초과했습니다."),
    
    // 채팅방 관련
    CHATROOM_NOT_FOUND("CHAT_001", "채팅방을 찾을 수 없습니다."),
    CHATROOM_ACCESS_DENIED("CHAT_002", "채팅방 접근 권한이 없습니다."),
    
    // 일반적인 오류
    INVALID_INPUT("COMMON_001", "잘못된 입력입니다."),
    RESOURCE_NOT_FOUND("COMMON_002", "요청한 리소스를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR("COMMON_003", "서버 내부 오류가 발생했습니다."),
    NETWORK_ERROR("COMMON_004", "네트워크 오류가 발생했습니다."),
    
    // 데이터베이스 관련
    DATABASE_ERROR("DB_001", "데이터베이스 오류가 발생했습니다."),
    TRANSACTION_FAILED("DB_002", "트랜잭션 처리에 실패했습니다."),
    
    // 외부 API 관련
    EXTERNAL_API_ERROR("API_001", "외부 API 호출에 실패했습니다."),
    API_TIMEOUT("API_002", "API 호출 시간이 초과되었습니다.");
    
    private final String code;
    private final String message;
    
    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
} 