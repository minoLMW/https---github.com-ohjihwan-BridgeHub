package com.koreait.apiserver.controller;
import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.LoginResponseDTO;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.EmailService;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final EmailService emailService;
    private final JwtService jwtService;

    // 이메일 인증 코드 발송 (회원가입 전)
    @PostMapping("/api/auth/send-verification")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            
            emailService.sendVerificationEmail(email);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_SEND_ERROR"));
        }
    }

    // 이메일 인증 확인 (회원가입 전)
    @PostMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("CODE_REQUIRED"));
            }
            
            boolean verified = emailService.verifyEmail(email, code);
            if (verified) {
                return ResponseEntity.ok(ApiResponse.success());
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_FAILED"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_ERROR"));
        }
    }

    // 회원가입 (이메일 인증 완료 후)
    @PostMapping("/api/auth/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody MemberDTO memberDTO) {
        try {
            // 이메일 인증 상태 확인
            if (!emailService.isEmailVerified(memberDTO.getEmail())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_VERIFICATION_REQUIRED"));
            }
            
            // 이메일 인증이 완료된 경우에만 emailVerified를 true로 설정
            memberDTO.setEmailVerified(true);
            
            memberService.register(memberDTO);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("REGISTRATION_ERROR"));
        }
    }

    // 로그인
    @PostMapping("/api/auth/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@RequestBody MemberDTO memberDTO) {
        try {
            MemberDTO result = memberService.login(memberDTO.getUsername(), memberDTO.getPassword());
            if (result != null) {
                // 이메일 인증이 완료되지 않은 경우 로그인 거부
                if (!result.getEmailVerified()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.error("EMAIL_VERIFICATION_REQUIRED"));
                }
                
                // JWT 토큰 생성
                String token = jwtService.generateToken(result.getUsername());
                
                // 로그인 응답 DTO 생성
                LoginResponseDTO loginResponse = new LoginResponseDTO();
                loginResponse.setToken(token);
                loginResponse.setUsername(result.getUsername());
                loginResponse.setEmail(result.getEmail());
                loginResponse.setEmailVerified(result.getEmailVerified());
                
                return ResponseEntity.ok(ApiResponse.success(loginResponse));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("LOGIN_FAILED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("LOGIN_ERROR"));
        }
    }

    // 이메일 인증 상태 확인
    @GetMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailVerification(@RequestParam String email) {
        try {
            boolean isVerified = emailService.isEmailVerified(email);
            return ResponseEntity.ok(ApiResponse.success(isVerified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_STATUS_ERROR"));
        }
    }

    // 회원 정보 조회 (username 기반)
    @GetMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(@PathVariable String username) {
        try {
            MemberDTO member = memberService.getMemberByUsername(username);
            return ResponseEntity.ok(ApiResponse.success(member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_GET_ERROR"));
        }
    }

    // 회원 정보 조회 (ID 기반) - 소켓 서버용
    @GetMapping("/api/members/id/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMemberById(@PathVariable Long id) {
        try {
            log.debug("소켓 서버에서 사용자 정보 요청: ID={}", id);
            MemberDTO member = memberService.getMemberById(id);
            if (member != null) {
                log.debug("사용자 정보 조회 성공: ID={}, nickname={}, name={}", id, member.getNickname(), member.getName());
                return ResponseEntity.ok(ApiResponse.success(member));
            } else {
                log.warn("사용자를 찾을 수 없음: ID={}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("USER_NOT_FOUND"));
            }
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: ID={}, error={}", id, e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_GET_ERROR"));
        }
    }

    // 회원 정보 수정
    @PutMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<MemberDTO>> updateMember(
            @PathVariable String username,
            @RequestBody MemberDTO memberDTO) {
        try {
            memberDTO.setUsername(username);
            MemberDTO updatedMember = memberService.updateMember(memberDTO);
            return ResponseEntity.ok(ApiResponse.success(updatedMember));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_UPDATE_ERROR"));
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<String>> deleteMember(@PathVariable String username) {
        try {
            memberService.deleteMember(username);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("MEMBER_DELETE_ERROR"));
        }
    }

    // 관리자 권한 체크 (front-server에서 관리자 페이지 전환용)
    @GetMapping("/api/auth/check-admin")
    public ResponseEntity<ApiResponse<Boolean>> checkAdminRole(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            
            return ResponseEntity.ok(ApiResponse.success(false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("ADMIN_CHECK_ERROR"));
        }
    }

    // 현재 사용자 정보 조회 (JWT 토큰 기반)
    @GetMapping("/api/members/me")
    public ResponseEntity<ApiResponse<MemberDTO>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("AUTHORIZATION_REQUIRED"));
            }
            
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.getUsernameFromToken(token);
            
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("INVALID_TOKEN"));
            }
            
            MemberDTO member = memberService.getMemberByUsername(username);
            if (member == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("USER_NOT_FOUND"));
            }
            
            return ResponseEntity.ok(ApiResponse.success(member));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("TOKEN_VALIDATION_ERROR"));
        }
    }

    // 현재 사용자 정보 수정 (JWT 토큰 기반)
    @PutMapping("/api/members/me")
    public ResponseEntity<ApiResponse<MemberDTO>> updateCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MemberDTO memberDTO) {
        try {
            log.info("사용자 정보 수정 요청 시작");
            log.info("요청 데이터: {}", memberDTO);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Authorization 헤더가 없거나 잘못됨");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("AUTHORIZATION_REQUIRED"));
            }
            
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.getUsernameFromToken(token);
            log.info("토큰에서 추출한 사용자명: {}", username);
            
            if (username == null) {
                log.warn("토큰에서 사용자명을 추출할 수 없음");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("INVALID_TOKEN"));
            }
            
            // 현재 사용자의 username으로 설정
            memberDTO.setUsername(username);
            log.info("업데이트할 사용자: {}", username);
            
            MemberDTO updatedMember = memberService.updateMember(memberDTO);
            log.info("사용자 정보 수정 완료");
            return ResponseEntity.ok(ApiResponse.success(updatedMember));
        } catch (Exception e) {
            log.error("사용자 정보 수정 실패", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_UPDATE_ERROR"));
        }
    }

    // 비밀번호 재설정 코드 발송
    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            
            // 사용자 존재 여부 확인
            MemberDTO member = memberService.getMemberByUsername(email);
            if (member == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("USER_NOT_FOUND"));
            }
            
            // 비밀번호 재설정 이메일 발송
            emailService.sendPasswordResetEmail(email);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PASSWORD_RESET_SEND_ERROR"));
        }
    }

    // 비밀번호 재설정 완료
    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String resetCode = request.get("resetCode");
            String newPassword = request.get("newPassword");
            
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("USERNAME_REQUIRED"));
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            if (resetCode == null || resetCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("RESET_CODE_REQUIRED"));
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("NEW_PASSWORD_REQUIRED"));
            }
            
            // 비밀번호 재설정 처리 (사용자명과 이메일 일치 검증 포함)
            boolean success = memberService.resetPassword(username, email, resetCode, newPassword);
            if (success) {
                return ResponseEntity.ok(ApiResponse.success());
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("PASSWORD_RESET_FAILED"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PASSWORD_RESET_ERROR"));
        }
    }

    // 관리자 계정 생성 (개발/테스트용 - 실제 운영에서는 제거 권장)
    @PostMapping("/api/auth/create-admin")
    public ResponseEntity<ApiResponse<String>> createAdminAccount(@RequestBody MemberDTO adminMember) {
        try {
            // 관리자 권한으로 설정
            adminMember.setEmailVerified(true); // 관리자는 이메일 인증 생략
            
            memberService.register(adminMember);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("ADMIN_CREATE_ERROR"));
        }
    }
}

