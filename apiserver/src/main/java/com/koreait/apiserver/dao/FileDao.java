package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.File;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FileDao {
    
    // 파일 등록
    int insertFile(File file);
    
    // 파일 조회 (ID로)
    Optional<File> findById(Integer fileId);
    
    // 파일 조회 (ID로) - null 반환 가능
    File getFileById(Integer fileId);
    
    // 메시지별 파일 조회
    List<File> findByMessageId(Integer messageId);
    
    // 메시지별 파일 조회 (서비스용)
    List<File> getFilesByMessageId(Integer messageId);
    
    // 회원별 파일 조회 (프로필 이미지 등)
    List<File> findByMemberId(Integer memberId);
    
    // 회원별 파일 조회 (서비스용)
    List<File> getFilesByMemberId(Integer memberId);
    
    // 스터디룸별 파일 조회
    List<File> findByStudyroomId(Integer studyroomId);
    
    // 스터디룸별 파일 조회 (서비스용)
    List<File> getFilesByStudyRoomId(Integer studyRoomId);
    
    // 파일 타입별 조회
    List<File> findByFileType(String fileType);
    
    // 파일 해시로 조회 (중복 방지)
    Optional<File> findByFileHash(String fileHash);
    
    // 파일 정보 수정
    int updateFile(File file);
    
    // 파일 소프트 삭제
    int softDeleteFile(Integer fileId);
    
    // 파일 완전 삭제
    int deleteFile(Integer fileId);
    
    // 저장된 파일명으로 조회 (기존 호환성)
    Optional<File> findByStoredName(String storedName);
    
    // 게시판 첨부파일 조회
    List<File> findByBoardId(Integer boardId);
    
    // 게시판 첨부파일 연결
    int linkToBoardAttachment(Integer fileId, Integer boardId);
    
    // 게시판 첨부파일 연결 해제
    int unlinkBoardAttachments(Integer boardId);
    
    // 게시판 첨부파일 조회 (BOARD_ATTACHMENT 타입만)
    List<File> findByBoardAttachment(Integer boardId);
    
    // 게시판 첨부파일 개수 조회
    int countBoardAttachments(Integer boardId);
} 