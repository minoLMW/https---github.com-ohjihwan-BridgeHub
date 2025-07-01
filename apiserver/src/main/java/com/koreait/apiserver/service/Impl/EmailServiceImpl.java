package com.koreait.apiserver.service.Impl;
import com.koreait.apiserver.dto.EmailDTO;
import com.koreait.apiserver.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final Map<String, EmailDTO> emailVerificationMap = new ConcurrentHashMap<>();
    private final Map<String, EmailDTO> passwordResetMap = new ConcurrentHashMap<>();
    private final JavaMailSender javaMailSender;

    @Override
    public void sendVerificationEmail(String email) {
        String verificationCode = generateVerificationCode();
        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setEmail(email);
        emailDTO.setVerificationCode(verificationCode);
        emailDTO.setVerified(false);
        emailDTO.setExpirationTime(System.currentTimeMillis() + 300000); // 5분 유효

        // 실제 이메일 발송
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("bglyk83@gmail.com"); // 발신자 이메일
            message.setTo(email);
            message.setSubject("[TheBridgeHub] 이메일 인증 코드");
            message.setText("안녕하세요!\n\nTheBridgeHub 이메일 인증 코드입니다.\n\n인증 코드: " + verificationCode + "\n\n이 코드는 5분간 유효합니다.\n\n감사합니다.");
            
            javaMailSender.send(message);
            
            System.out.println("=== 이메일 발송 완료 ===");
            System.out.println("이메일: " + email);
            System.out.println("인증 코드: " + verificationCode);
            System.out.println("======================");
        } catch (Exception e) {
            System.err.println("이메일 발송 실패: " + e.getMessage());
            e.printStackTrace();
            // 이메일 발송 실패 시에도 콘솔에 출력
            System.out.println("=== 이메일 인증 코드 (콘솔 출력) ===");
            System.out.println("이메일: " + email);
            System.out.println("인증 코드: " + verificationCode);
            System.out.println("======================");
        }

        emailVerificationMap.put(email, emailDTO);
    }

    @Override
    public boolean verifyEmail(String email, String code) {
        EmailDTO emailDTO = emailVerificationMap.get(email);
        if (emailDTO == null || System.currentTimeMillis() > emailDTO.getExpirationTime()) {
            return false;
        }

        if (emailDTO.getVerificationCode().equals(code)) {
            emailDTO.setVerified(true);
            return true;
        }
        return false;
    }

    @Override
    public boolean isEmailVerified(String email) {
        EmailDTO emailDTO = emailVerificationMap.get(email);
        return emailDTO != null && emailDTO.isVerified();
    }

    @Override
    public void sendPasswordResetEmail(String email) {
        String resetCode = generateVerificationCode();
        EmailDTO passwordResetDTO = new EmailDTO();
        passwordResetDTO.setEmail(email);
        passwordResetDTO.setVerificationCode(resetCode);
        passwordResetDTO.setVerified(false);
        passwordResetDTO.setExpirationTime(System.currentTimeMillis() + 600000); // 10분 유효 (비밀번호 재설정은 좀 더 길게)

        // 비밀번호 재설정 이메일 발송
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("bglyk83@gmail.com");
            message.setTo(email);
            message.setSubject("[TheBridgeHub] 비밀번호 재설정 코드");
            message.setText("안녕하세요!\n\nTheBridgeHub 비밀번호 재설정 코드입니다.\n\n재설정 코드: " + resetCode + "\n\n이 코드는 10분간 유효합니다.\n만약 비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시해주세요.\n\n감사합니다.");
            
            javaMailSender.send(message);
            
            System.out.println("=== 비밀번호 재설정 이메일 발송 완료 ===");
            System.out.println("이메일: " + email);
            System.out.println("재설정 코드: " + resetCode);
            System.out.println("====================================");
        } catch (Exception e) {
            System.err.println("비밀번호 재설정 이메일 발송 실패: " + e.getMessage());
            e.printStackTrace();
            // 이메일 발송 실패 시에도 콘솔에 출력
            System.out.println("=== 비밀번호 재설정 코드 (콘솔 출력) ===");
            System.out.println("이메일: " + email);
            System.out.println("재설정 코드: " + resetCode);
            System.out.println("====================================");
        }

        passwordResetMap.put(email, passwordResetDTO);
    }

    @Override
    public boolean verifyPasswordResetCode(String email, String code) {
        EmailDTO passwordResetDTO = passwordResetMap.get(email);
        if (passwordResetDTO == null || System.currentTimeMillis() > passwordResetDTO.getExpirationTime()) {
            return false;
        }

        if (passwordResetDTO.getVerificationCode().equals(code)) {
            passwordResetDTO.setVerified(true);
            return true;
        }
        return false;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}