package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.FileDao;
import com.koreait.apiserver.dto.FileDTO;
import com.koreait.apiserver.entity.File;
import com.koreait.apiserver.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileServiceImpl implements FileService {

    @Autowired
    private FileDao fileDao;

    @Value("${file.upload.path:/uploads}")
    private String uploadPath;

    @Value("${file.max.size:10485760}") // 10MB
    private Long maxFileSize;

    @Value("${file.allowed.types:jpg,jpeg,png,gif,pdf,doc,docx,txt,zip,rar}")
    private String allowedFileTypes;

    @Override
    public FileDTO uploadFile(MultipartFile multipartFile, String fileType, Integer studyRoomId, Integer uploaderId) throws Exception {
        // 파일 검증
        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = multipartFile.getOriginalFilename();
        if (!isAllowedFileType(originalFilename)) {
            throw new IllegalArgumentException("허용되지 않는 파일 타입입니다.");
        }

        if (!isValidFileSize(multipartFile.getSize())) {
            throw new IllegalArgumentException("파일 크기가 너무 큽니다. (최대 " + (maxFileSize / 1024 / 1024) + "MB)");
        }

        // MIME 타입을 DB ENUM 타입으로 변환
        String dbFileType = convertToDbFileType(fileType, studyRoomId, uploaderId);

        // 파일 저장 경로 생성
        String storedFilename = generateStoredFilename(originalFilename);
        String relativePath = getRelativePath(dbFileType, storedFilename);
        Path fullPath = Paths.get(uploadPath, relativePath);

        // 디렉토리 생성
        Files.createDirectories(fullPath.getParent());

        // 파일 저장
        Files.copy(multipartFile.getInputStream(), fullPath);

        // 파일 해시 생성 (간단한 구현)
        String fileHash = generateFileHash(multipartFile.getBytes());

        // DB에 파일 정보 저장
        File fileEntity = new File();
        fileEntity.setFileType(dbFileType);
        fileEntity.setOriginalFilename(originalFilename);
        fileEntity.setStoredFilename(storedFilename);
        fileEntity.setFilePath(relativePath);
        fileEntity.setFileSize(multipartFile.getSize());
        fileEntity.setMimeType(multipartFile.getContentType());
        fileEntity.setFileHash(fileHash);
        fileEntity.setUploadedAt(LocalDateTime.now());

        // 파일 타입에 따른 참조 ID 설정
        switch (dbFileType) {
            case "MESSAGE":
                // 메시지 파일의 경우, 별도의 messageId가 필요하지만 일단 스터디룸으로 연결
                fileEntity.setStudyRoomId(studyRoomId);
                break;
            case "PROFILE":
                fileEntity.setMemberId(uploaderId);
                break;
            case "STUDY_THUMBNAIL":
            case "STUDY_ATTACHMENT":
            default:
                fileEntity.setStudyRoomId(studyRoomId);
                break;
        }

        fileDao.insertFile(fileEntity);

        // DTO로 변환하여 반환
        FileDTO fileDTO = convertToDTO(fileEntity);
        fileDTO.setDownloadUrl("/api/files/download/" + fileEntity.getFileId());
        
        // 이미지인 경우 썸네일 URL 추가
        if (isImageFile(originalFilename)) {
            fileDTO.setThumbnailUrl("/api/files/thumbnail/" + fileEntity.getFileId());
        }

        return fileDTO;
    }

    @Override
    public FileDTO uploadProfileImage(MultipartFile multipartFile, String type, Integer memberId) throws Exception {
        // 파일 검증
        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        String originalFilename = multipartFile.getOriginalFilename();
        
        // 이미지 파일만 허용
        if (!isImageFile(originalFilename)) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        // 파일 크기 검증 (5MB)
        if (multipartFile.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기가 너무 큽니다. (최대 5MB)");
        }

        // 파일 저장 경로 생성
        String storedFilename = generateStoredFilename(originalFilename);
        String relativePath = getRelativePath("PROFILE", storedFilename);
        Path fullPath = Paths.get(uploadPath, relativePath);

        System.out.println("=== 파일 저장 디버깅 ===");
        System.out.println("uploadPath: " + uploadPath);
        System.out.println("storedFilename: " + storedFilename);
        System.out.println("relativePath: " + relativePath);
        System.out.println("fullPath: " + fullPath.toAbsolutePath());

        // 디렉토리 생성
        Files.createDirectories(fullPath.getParent());
        System.out.println("디렉토리 생성 완료: " + fullPath.getParent().toAbsolutePath());

        // 파일 저장
        Files.copy(multipartFile.getInputStream(), fullPath);
        System.out.println("파일 저장 완료: " + fullPath.toAbsolutePath());
        System.out.println("파일 존재 확인: " + Files.exists(fullPath));

        // 파일 해시 생성
        String fileHash = generateFileHash(multipartFile.getBytes());

        // DB에 파일 정보 저장
        File fileEntity = new File();
        fileEntity.setFileType("PROFILE");
        fileEntity.setOriginalFilename(originalFilename);
        fileEntity.setStoredFilename(storedFilename);
        fileEntity.setFilePath(relativePath);
        fileEntity.setFileSize(multipartFile.getSize());
        fileEntity.setMimeType(multipartFile.getContentType());
        fileEntity.setFileHash(fileHash);
        fileEntity.setUploadedAt(LocalDateTime.now());
        fileEntity.setMemberId(memberId); // 프로필 이미지의 소유자 ID 설정

        fileDao.insertFile(fileEntity);

        // DTO로 변환하여 반환
        FileDTO fileDTO = convertToDTO(fileEntity);
        
        // 웹에서 접근 가능한 URL 생성
        String fileUrl = "http://localhost:7100/uploads/" + relativePath;
        fileDTO.setFileUrl(fileUrl);
        fileDTO.setDownloadUrl("/api/files/download/" + fileEntity.getFileId());
        fileDTO.setThumbnailUrl("/api/files/thumbnail/" + fileEntity.getFileId());
        
        System.out.println("생성된 파일 URL: " + fileUrl);
        System.out.println("=== 파일 저장 디버깅 끝 ===");

        return fileDTO;
    }

    @Override
    public byte[] downloadFile(Integer fileId) throws Exception {
        File fileEntity = fileDao.getFileById(fileId);
        if (fileEntity == null || fileEntity.getIsDeleted()) {
            throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
        }

        Path filePath = Paths.get(uploadPath, fileEntity.getFilePath());
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("파일이 존재하지 않습니다.");
        }

        return Files.readAllBytes(filePath);
    }

    @Override
    public FileDTO getFileInfo(Integer fileId) {
        File fileEntity = fileDao.getFileById(fileId);
        if (fileEntity == null || fileEntity.getIsDeleted()) {
            return null;
        }
        return convertToDTO(fileEntity);
    }

    @Override
    public List<FileDTO> getFilesByMessageId(Integer messageId) {
        List<File> files = fileDao.getFilesByMessageId(messageId);
        return files.stream()
                .filter(file -> !file.getIsDeleted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FileDTO> getFilesByStudyRoomId(Integer studyRoomId) {
        List<File> files = fileDao.getFilesByStudyRoomId(studyRoomId);
        return files.stream()
                .filter(file -> !file.getIsDeleted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FileDTO> getFilesByMemberId(Integer memberId) {
        List<File> files = fileDao.getFilesByMemberId(memberId);
        return files.stream()
                .filter(file -> !file.getIsDeleted())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteFile(Integer fileId) {
        File fileEntity = fileDao.getFileById(fileId);
        if (fileEntity == null) {
            return false;
        }
        
        fileEntity.setIsDeleted(true);
        return fileDao.updateFile(fileEntity) > 0;
    }

    @Override
    public boolean deleteFilePhysically(Integer fileId) {
        File fileEntity = fileDao.getFileById(fileId);
        if (fileEntity == null) {
            return false;
        }

        try {
            Path filePath = Paths.get(uploadPath, fileEntity.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
            return fileDao.deleteFile(fileId) > 0;
        } catch (IOException e) {
            return false;
        }
    }

    @Override
    public boolean isImageFile(String filename) {
        if (filename == null) return false;
        String extension = getFileExtension(filename).toLowerCase();
        return extension.matches("(jpg|jpeg|png|gif|bmp|webp)");
    }

    @Override
    public boolean isValidFileSize(Long fileSize) {
        return fileSize != null && fileSize <= maxFileSize;
    }

    @Override
    public boolean isAllowedFileType(String filename) {
        if (filename == null) return false;
        String extension = getFileExtension(filename).toLowerCase();
        String[] allowedTypes = allowedFileTypes.split(",");
        for (String type : allowedTypes) {
            if (type.trim().equals(extension)) {
                return true;
            }
        }
        return false;
    }

    // 유틸리티 메서드들
    private String generateStoredFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + "." + extension;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }

    private String getRelativePath(String fileType, String storedFilename) {
        String datePath = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return fileType.toLowerCase() + "/" + datePath + "/" + storedFilename;
    }

    private String generateFileHash(byte[] fileBytes) {
        // 간단한 해시 생성 (실제로는 SHA-256 등을 사용해야 함)
        return String.valueOf(fileBytes.length) + "_" + System.currentTimeMillis();
    }

    private FileDTO convertToDTO(File fileEntity) {
        FileDTO dto = new FileDTO();
        dto.setFileId(fileEntity.getFileId());
        dto.setFileType(fileEntity.getFileType());
        dto.setOriginalFilename(fileEntity.getOriginalFilename());
        dto.setStoredFilename(fileEntity.getStoredFilename());
        dto.setFilePath(fileEntity.getFilePath());
        dto.setFileSize(fileEntity.getFileSize());
        dto.setMimeType(fileEntity.getMimeType());
        dto.setFileHash(fileEntity.getFileHash());
        dto.setIsDeleted(fileEntity.getIsDeleted());
        dto.setUploadedAt(fileEntity.getUploadedAt());
        dto.setMessageId(fileEntity.getMessageId());
        dto.setMemberId(fileEntity.getMemberId());
        dto.setStudyRoomId(fileEntity.getStudyRoomId());
        return dto;
    }

    // MIME 타입을 DB ENUM 타입으로 변환
    private String convertToDbFileType(String fileType, Integer studyRoomId, Integer uploaderId) {
        // 이미 올바른 ENUM 값인 경우
        if (fileType != null && (fileType.equals("MESSAGE") || fileType.equals("PROFILE") || 
            fileType.equals("STUDY_THUMBNAIL") || fileType.equals("STUDY_ATTACHMENT"))) {
            return fileType;
        }
        
        // MIME 타입인 경우 적절한 ENUM 값으로 변환
        if (uploaderId != null && studyRoomId == null) {
            return "PROFILE";
        } else if (studyRoomId != null) {
            // 이미지 파일이고 스터디룸 관련인 경우
            if (fileType != null && fileType.startsWith("image/")) {
                return "STUDY_THUMBNAIL";
            } else {
                return "STUDY_ATTACHMENT";
            }
        } else {
            // 기본값
            return "STUDY_ATTACHMENT";
        }
    }
}