package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.FileDTO;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.FileService;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.service.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private MemberService memberService;

    // 파일 업로드 (스터디룸용)
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileDTO>> uploadFile(@RequestParam("file") MultipartFile file,
                                                         @RequestParam("studyRoomId") Integer studyRoomId,
                                                         @RequestParam("uploaderId") Integer uploaderId,
                                                         @RequestParam(value = "fileType", required = false) String fileType) {
        try {
            log.info("파일 업로드 요청: studyRoomId={}, uploaderId={}, fileType={}", studyRoomId, uploaderId, fileType);
            FileDTO uploadedFile = fileService.uploadFile(file, fileType, studyRoomId, uploaderId);
            return ResponseEntity.ok(ApiResponse.success(uploadedFile));
        } catch (Exception e) {
            log.error("파일 업로드 실패: studyRoomId={}, uploaderId={}", studyRoomId, uploaderId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("FILE_UPLOAD_ERROR"));
        }
    }

    // 프로필 이미지 업로드 (단순 업로드)
    @PostMapping("/upload/profile")
    public ResponseEntity<ApiResponse<FileDTO>> uploadProfileImage(@RequestParam("file") MultipartFile file,
                                                                 @RequestParam(value = "type", required = false) String type,
                                                                 @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            log.info("프로필 이미지 업로드 요청: fileName={}, type={}", file.getOriginalFilename(), type);
            
            // JWT 토큰에서 사용자 정보 추출
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
            
            // 사용자 ID 조회
            MemberDTO member = memberService.getMemberByUsername(username);
            if (member == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("USER_NOT_FOUND"));
            }
            
            // 이미지 파일 검증
            if (!isImageFile(file)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_IMAGE_FILE"));
            }
            
            // 파일 크기 검증 (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("FILE_SIZE_EXCEEDED"));
            }
            
            // 프로필 이미지용 업로드 (memberId 포함)
            FileDTO uploadedFile = fileService.uploadProfileImage(file, type, member.getId());
            return ResponseEntity.ok(ApiResponse.success(uploadedFile));
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 실패: fileName={}", file.getOriginalFilename(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("PROFILE_IMAGE_UPLOAD_ERROR"));
        }
    }
    
    // 이미지 파일 검증 메서드
    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    // 파일 다운로드
    @GetMapping("/download/{fileId}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable Integer fileId) {
        try {
            FileDTO fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileData = fileService.downloadFile(fileId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + fileInfo.getOriginalFilename() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(fileData.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 파일 정보 조회
    @GetMapping("/info/{fileId}")
    public ResponseEntity<ApiResponse<FileDTO>> getFileInfo(@PathVariable Integer fileId) {
        try {
            FileDTO fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ApiResponse.success(fileInfo));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("FILE_INFO_ERROR"));
        }
    }

    // 메시지별 파일 목록 조회
    @GetMapping("/message/{messageId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByMessageId(@PathVariable Integer messageId) {
        try {
            List<FileDTO> files = fileService.getFilesByMessageId(messageId);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_FILES_ERROR"));
        }
    }

    // 스터디룸별 파일 목록 조회
    @GetMapping("/studyroom/{studyRoomId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByStudyRoomId(@PathVariable Integer studyRoomId) {
        try {
            List<FileDTO> files = fileService.getFilesByStudyRoomId(studyRoomId);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("STUDYROOM_FILES_ERROR"));
        }
    }

    // 회원별 파일 목록 조회
    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByMemberId(@PathVariable Integer memberId) {
        try {
            List<FileDTO> files = fileService.getFilesByMemberId(memberId);
            return ResponseEntity.ok(ApiResponse.success(files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MEMBER_FILES_ERROR"));
        }
    }

    // 파일 삭제 (논리적 삭제)
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Integer fileId) {
        try {
            boolean deleted = fileService.deleteFile(fileId);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success());
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("FILE_DELETE_ERROR"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("FILE_DELETE_ERROR"));
        }
    }

    // 파일 물리적 삭제
    @DeleteMapping("/{fileId}/permanent")
    public ResponseEntity<ApiResponse<Void>> deleteFilePermanently(@PathVariable Integer fileId) {
        try {
            boolean deleted = fileService.deleteFilePhysically(fileId);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success());
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("FILE_PERMANENT_DELETE_ERROR"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("FILE_PERMANENT_DELETE_ERROR"));
        }
    }

    // 이미지 미리보기 (썸네일)
    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<ByteArrayResource> getThumbnail(@PathVariable Integer fileId) {
        try {
            FileDTO fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null || !fileService.isImageFile(fileInfo.getOriginalFilename())) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileData = fileService.downloadFile(fileId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // 또는 적절한 이미지 타입
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 파일 업로드 상태 확인
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Void>> getFileServiceStatus() {
        return ResponseEntity.ok(ApiResponse.success());
    }
}

