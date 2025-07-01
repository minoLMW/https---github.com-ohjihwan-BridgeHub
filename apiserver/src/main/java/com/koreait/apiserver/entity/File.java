package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {
    
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
    private Integer boardId;    // file_type이 BOARD_ATTACHMENT일 때
    
    // boardId getter/setter
    public Integer getBoardId() {
        return this.boardId;
    }
    
    public void setBoardId(Integer boardId) {
        this.boardId = boardId;
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
    
    // studyRoomId getter/setter (Lombok이 인식하지 못할 경우를 대비)
    public Integer getStudyRoomId() {
        return this.studyRoomId;
    }
    
    public void setStudyRoomId(Integer studyRoomId) {
        this.studyRoomId = studyRoomId;
    }
} 