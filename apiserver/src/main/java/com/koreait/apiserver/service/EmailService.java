package com.koreait.apiserver.service;

public interface EmailService {
    void sendVerificationEmail(String email);
    boolean verifyEmail(String email, String code);
    boolean isEmailVerified(String email);
    
    // 비밀번호 재설정 관련 메서드 추가
    void sendPasswordResetEmail(String email);
    boolean verifyPasswordResetCode(String email, String code);
}

