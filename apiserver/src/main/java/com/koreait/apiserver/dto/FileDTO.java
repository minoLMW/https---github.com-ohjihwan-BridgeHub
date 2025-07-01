package com.koreait.apiserver.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileDTO {
    private Integer fileId;
    private String fileType;  // MESSAGE, PROFILE, STUDY_THUMBNAIL, STUDY_ATTACHMENT
    private String originalFilename;
    private String storedFilename;
    private String filePath;
    private Long fileSize;
    private String mimeType;
    private String fileHash;
    private Boolean isDeleted = false;
    private LocalDateTime uploadedAt;
    
    // 파일 유형별 참조 ID들
    private Integer messageId;  // file_type이 MESSAGE일 때
    private Integer memberId;   // file_type이 PROFILE일 때
    private Integer studyRoomId; // file_type이 STUDY_*일 때
    
    // 추가 필드 (업로드 시 사용)
    private String downloadUrl;
    private String thumbnailUrl;  // 이미지 미리보기용
    private String fileUrl;       // 웹에서 직접 접근 가능한 URL
    
    // 기존 필드들과의 호환성을 위한 getter/setter
    public Long getBoardId() {
        return this.studyRoomId != null ? this.studyRoomId.longValue() : null;
    }
    
    public void setBoardId(Long boardId) {
        this.studyRoomId = boardId != null ? boardId.intValue() : null;
    }
    
    public String getOriginalName() {
        return this.originalFilename;
    }
    
    public void setOriginalName(String originalName) {
        this.originalFilename = originalName;
    }
    
    public String getStoredName() {
        return this.storedFilename;
    }
    
    public void setStoredName(String storedName) {
        this.storedFilename = storedName;
    }
    
    public String getFileType() {
        return this.fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public LocalDateTime getRegDate() {
        return this.uploadedAt;
    }
    
    public void setRegDate(LocalDateTime regDate) {
        this.uploadedAt = regDate;
    }
    
    public LocalDateTime getModDate() {
        return this.uploadedAt;  // File에서는 수정일을 별도로 관리하지 않음
    }
    
    public void setModDate(LocalDateTime modDate) {
        // File에서는 사용하지 않음
    }
}