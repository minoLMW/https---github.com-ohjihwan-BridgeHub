package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.BoardDTO;
import com.koreait.apiserver.dto.BoardCategoryDTO;
import java.util.List;
import java.util.Map;

public interface BoardService {
    
    // 게시글 목록 조회 (페이징)
    Map<String, Object> getBoardList(Integer categoryId, String search, String sort, 
                                   int page, int size, Integer currentUserId);
    
    // 게시글 상세 조회
    BoardDTO getBoardById(Integer boardId, Integer currentUserId);
    
    // 게시글 작성
    Integer createBoard(BoardDTO boardDTO, Integer authorId, String ipAddress);
    
    // 게시글 수정
    void updateBoard(Integer boardId, BoardDTO boardDTO, Integer authorId);
    
    // 게시글 삭제
    void deleteBoard(Integer boardId, Integer authorId);
    
    // 게시글 좋아요/취소
    Map<String, Object> toggleBoardLike(Integer boardId, Integer memberId);
    
    // 조회수 증가
    void incrementViewCount(Integer boardId);
    
    // 카테고리 목록 조회
    List<BoardCategoryDTO> getActiveCategories();
    
    // 작성자 본인 확인
    boolean isAuthor(Integer boardId, Integer authorId);
} 