package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.FileDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileService {
    
    // 파일 업로드
    FileDTO uploadFile(MultipartFile file, String fileType, Integer studyRoomId, Integer uploaderId) throws Exception;
    
    // 프로필 이미지 업로드 (간단 버전)
    FileDTO uploadProfileImage(MultipartFile file, String type, Integer memberId) throws Exception;
    
    // 파일 다운로드
    byte[] downloadFile(Integer fileId) throws Exception;
    
    // 파일 정보 조회
    FileDTO getFileInfo(Integer fileId);
    
    // 파일 목록 조회 (메시지별)
    List<FileDTO> getFilesByMessageId(Integer messageId);
    
    // 파일 목록 조회 (스터디룸별)
    List<FileDTO> getFilesByStudyRoomId(Integer studyRoomId);
    
    // 파일 목록 조회 (회원별)
    List<FileDTO> getFilesByMemberId(Integer memberId);
    
    // 파일 삭제 (논리적 삭제)
    boolean deleteFile(Integer fileId);
    
    // 파일 물리적 삭제
    boolean deleteFilePhysically(Integer fileId);
    
    // 이미지 파일인지 확인
    boolean isImageFile(String filename);
    
    // 파일 크기 검증
    boolean isValidFileSize(Long fileSize);
    
    // 허용된 파일 타입인지 확인
    boolean isAllowedFileType(String filename);
}
