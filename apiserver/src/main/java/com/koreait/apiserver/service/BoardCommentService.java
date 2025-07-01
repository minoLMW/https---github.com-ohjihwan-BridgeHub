package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.BoardCommentDTO;
import java.util.List;
import java.util.Map;

public interface BoardCommentService {
    
    // 댓글 목록 조회 (대댓글 포함)
    Map<String, Object> getCommentsByBoardId(Integer boardId, int page, int size, Integer currentUserId);
    
    // 댓글 작성
    Integer createComment(BoardCommentDTO commentDTO, Integer authorId, String ipAddress);
    
    // 댓글 수정
    void updateComment(Integer commentId, String content, Integer authorId);
    
    // 댓글 삭제
    void deleteComment(Integer commentId, Integer authorId);
    
    // 댓글 좋아요/취소
    Map<String, Object> toggleCommentLike(Integer commentId, Integer memberId);
    
    // 댓글 작성자 본인 확인
    boolean isCommentAuthor(Integer commentId, Integer authorId);
} 