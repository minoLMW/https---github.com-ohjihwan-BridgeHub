package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.StudyRoomDTO;
import com.koreait.apiserver.dto.StudyRoomMemberDTO;
import com.koreait.apiserver.service.StudyRoomService;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
public class StudyRoomController {
    @Autowired
    private final StudyRoomService studyRoomService;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final MemberService memberService;

    // 스터디룸 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getStudyRoomList() {
        try {
            log.info("스터디룸 목록 조회 요청");
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomList();
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("스터디룸 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_LIST_ERROR"));
        }
    }

    // 스터디룸 상세 조회
    @GetMapping("/{studyRoomId}")
    public ResponseEntity<ApiResponse<StudyRoomDTO>> getStudyRoom(@PathVariable Integer studyRoomId) {
        try {
            log.info("스터디룸 상세 조회 요청: {}", studyRoomId);
            StudyRoomDTO studyRoom = studyRoomService.getStudyRoom(studyRoomId);
            return ResponseEntity.ok(ApiResponse.success(studyRoom));
        } catch (Exception e) {
            log.error("스터디룸 조회 실패: {}", studyRoomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_GET_ERROR"));
        }
    }

    // 스터디룸 생성
    @PostMapping
    public ResponseEntity<ApiResponse<StudyRoomDTO>> createStudyRoom(@RequestBody StudyRoomDTO studyRoomDTO, 
                                                       @RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("=== 스터디룸 생성 API 시작 ===");
        try {
            // 요청 데이터 검증
            if (studyRoomDTO == null) {
                log.error("StudyRoomDTO가 null입니다");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST_DATA"));
            }
            
            log.info("스터디룸 생성 요청: {}", studyRoomDTO.getTitle());
            log.info("요청 데이터: {}", studyRoomDTO);
            
            // 필수 필드 검증
            if (studyRoomDTO.getTitle() == null || studyRoomDTO.getTitle().trim().isEmpty()) {
                log.error("제목이 없습니다");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("TITLE_REQUIRED"));
            }
            if (studyRoomDTO.getDescription() == null || studyRoomDTO.getDescription().trim().isEmpty()) {
                log.error("설명이 없습니다");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("DESCRIPTION_REQUIRED"));
            }
            
            // Authorization 헤더 확인
            if (authHeader == null || authHeader.trim().isEmpty()) {
                log.error("Authorization 헤더가 없습니다");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("AUTH_REQUIRED"));
            }
            
            // JWT 토큰에서 사용자 ID 추출
            String token = authHeader.replace("Bearer ", "");
            log.info("토큰: {}", token);
            Integer memberId = jwtService.extractMemberId(token);
            
            if (memberId == null) {
                log.error("토큰에서 사용자 ID 추출 실패");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("AUTH_ERROR"));
            }
            
            // 실제 로그인한 사용자의 ID를 bossId로 설정
            studyRoomDTO.setBossId(memberId);
            log.info("스터디룸 생성자 ID 설정: {}", memberId);
            log.info("최종 DTO: {}", studyRoomDTO);
            
            StudyRoomDTO createdStudyRoom = studyRoomService.createStudyRoom(studyRoomDTO);
            log.info("스터디룸 생성 성공: {}", createdStudyRoom);
            return ResponseEntity.ok(ApiResponse.success(createdStudyRoom));
        } catch (Exception e) {
            log.error("스터디룸 생성 실패 - 상세 에러: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("STUDY_CREATE_ERROR"));
        }
    }

    // 스터디룸 수정
    @PutMapping("/{studyRoomId}")
    public ResponseEntity<ApiResponse<StudyRoomDTO>> updateStudyRoom(
            @PathVariable Integer studyRoomId,
            @RequestBody StudyRoomDTO studyRoomDTO) {
        try {
            log.info("스터디룸 수정 요청: {}", studyRoomId);
            studyRoomDTO.setStudyRoomId(studyRoomId);
            StudyRoomDTO updatedStudyRoom = studyRoomService.updateStudyRoom(studyRoomDTO);
            return ResponseEntity.ok(ApiResponse.success(updatedStudyRoom));
        } catch (Exception e) {
            log.error("스터디룸 수정 실패: {}", studyRoomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_UPDATE_ERROR"));
        }
    }

    // 스터디룸 삭제
    @DeleteMapping("/{studyRoomId}")
    public ResponseEntity<ApiResponse<Void>> deleteStudyRoom(@PathVariable Integer studyRoomId) {
        try {
            log.info("스터디룸 삭제 요청: {}", studyRoomId);
            studyRoomService.deleteStudyRoom(studyRoomId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("스터디룸 삭제 실패: {}", studyRoomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_DELETE_ERROR"));
        }
    }

    // ========== 스터디 참가 관련 API ==========
    
    // 스터디 참가 신청
    @PostMapping("/{studyRoomId}/join")
    public ResponseEntity<ApiResponse<String>> joinStudyRoom(
            @PathVariable Integer studyRoomId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("스터디 참가 신청: studyRoomId={}", studyRoomId);
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            studyRoomService.joinStudyRoom(studyRoomId, memberId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (RuntimeException e) {
            log.error("스터디 참가 신청 실패: studyRoomId={}", studyRoomId, e);
            
            // 구체적인 에러 메시지를 클라이언트에 전달
            String errorMessage = e.getMessage();
            String errorCode = "JOIN_ERROR";
            
            // 특정 에러에 따른 에러 코드 분류
            if (errorMessage.contains("이미 참가 신청")) {
                errorCode = "ALREADY_APPLIED";
            } else if (errorMessage.contains("이미 참가 중")) {
                errorCode = "ALREADY_MEMBER";
            } else if (errorMessage.contains("정원이 가득")) {
                errorCode = "ROOM_FULL";
            } else if (errorMessage.contains("거절된 스터디")) {
                errorCode = "PREVIOUSLY_REJECTED";
            }
            
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(errorMessage));
        } catch (Exception e) {
            log.error("스터디 참가 신청 시스템 오류: studyRoomId={}", studyRoomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("SYSTEM_ERROR", "시스템 오류가 발생했습니다."));
        }
    }
    
    // 스터디 멤버 조회
    @GetMapping("/{studyRoomId}/members")
    public ResponseEntity<ApiResponse<List<StudyRoomMemberDTO>>> getStudyRoomMembers(
            @PathVariable Integer studyRoomId) {
        try {
            log.info("스터디 멤버 조회: studyRoomId={}", studyRoomId);
            List<StudyRoomMemberDTO> members = studyRoomService.getStudyRoomMembers(studyRoomId);
            return ResponseEntity.ok(ApiResponse.success(members));
        } catch (Exception e) {
            log.error("스터디 멤버 조회 실패: studyRoomId={}", studyRoomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MEMBERS_GET_ERROR"));
        }
    }
    
    // 참가 신청 승인/거절 (방장만)
    @PutMapping("/{studyRoomId}/members/{memberId}/status")
    public ResponseEntity<ApiResponse<String>> updateMemberStatus(
            @PathVariable Integer studyRoomId,
            @PathVariable Integer memberId,
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("멤버 상태 업데이트: studyRoomId={}, memberId={}, status={}", studyRoomId, memberId, status);
            String token = authHeader.replace("Bearer ", "");
            Integer bossId = jwtService.extractMemberId(token);
            
            studyRoomService.updateMemberStatus(studyRoomId, memberId, status, bossId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("멤버 상태 업데이트 실패", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("STATUS_UPDATE_ERROR"));
        }
    }
    
    // 대기중인 멤버 조회 (방장만)
    @GetMapping("/{studyRoomId}/pending-members")
    public ResponseEntity<ApiResponse<List<StudyRoomMemberDTO>>> getPendingMembers(
            @PathVariable Integer studyRoomId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("대기중인 멤버 조회: studyRoomId={}", studyRoomId);
            String token = authHeader.replace("Bearer ", "");
            Integer bossId = jwtService.extractMemberId(token);
            
            List<StudyRoomMemberDTO> pendingMembers = studyRoomService.getPendingMembers(studyRoomId, bossId);
            return ResponseEntity.ok(ApiResponse.success(pendingMembers));
        } catch (Exception e) {
            log.error("대기중인 멤버 조회 실패: studyRoomId={}", studyRoomId, e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("PENDING_MEMBERS_ERROR"));
        }
    }
    
    // 스터디 탈퇴
    @DeleteMapping("/{studyRoomId}/leave")
    public ResponseEntity<ApiResponse<String>> leaveStudyRoom(
            @PathVariable Integer studyRoomId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("스터디 탈퇴: studyRoomId={}", studyRoomId);
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            studyRoomService.leaveStudyRoom(studyRoomId, memberId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("스터디 탈퇴 실패", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAVE_ERROR"));
        }
    }

    // 학과별 스터디룸 조회
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getStudyRoomsByDepartment(@PathVariable String department) {
        try {
            log.info("학과별 스터디룸 조회 요청: {}", department);
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomsByDepartment(department);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("학과별 스터디룸 조회 실패: {}", department, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_DEPARTMENT_ERROR"));
        }
    }

    // 지역별 스터디룸 조회
    @GetMapping("/region/{region}")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getStudyRoomsByRegion(@PathVariable String region) {
        try {
            log.info("지역별 스터디룸 조회 요청: {}", region);
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomsByRegion(region);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("지역별 스터디룸 조회 실패: {}", region, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_REGION_ERROR"));
        }
    }

    // 시간대별 스터디룸 조회
    @GetMapping("/time/{time}")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getStudyRoomsByTime(@PathVariable String time) {
        try {
            log.info("시간대별 스터디룸 조회 요청: {}", time);
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomsByTime(time);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("시간대별 스터디룸 조회 실패: {}", time, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDY_TIME_ERROR"));
        }
    }

    // front-server 연동을 위한 새로운 API: 인기 스터디룸 조회
    @GetMapping("/hot")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getHotStudyRooms(
            @RequestParam(defaultValue = "6") int limit) {
        try {
            log.info("인기 스터디룸 조회 요청: limit={}", limit);
            List<StudyRoomDTO> studyRooms = studyRoomService.getHotStudyRooms(limit);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("인기 스터디룸 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("HOT_STUDY_ERROR"));
        }
    }

    // front-server 연동을 위한 새로운 API: 사용자의 참여 스터디룸 조회
    @GetMapping("/my-studies")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getMyStudyRooms(
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("참여 스터디룸 조회 요청");
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomsByMemberId(memberId);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("참여 스터디룸 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MY_STUDY_ERROR"));
        }
    }

    // front-server 연동을 위한 새로운 API: 내가 개설한 스터디룸 조회
    @GetMapping("/my-created")
    public ResponseEntity<ApiResponse<List<StudyRoomDTO>>> getMyCreatedStudyRooms(
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("개설한 스터디룸 조회 요청");
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            List<StudyRoomDTO> studyRooms = studyRoomService.getStudyRoomsByBossId(memberId);
            return ResponseEntity.ok(ApiResponse.success(studyRooms));
        } catch (Exception e) {
            log.error("개설한 스터디룸 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MY_CREATED_STUDY_ERROR"));
        }
    }
}