package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.Board;
import com.koreait.apiserver.entity.File;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface BoardDao {
    
    // 게시글 목록 조회
    List<Board> selectBoardList(@Param("categoryId") Integer categoryId,
                               @Param("search") String search,
                               @Param("sort") String sort,
                               @Param("offset") int offset,
                               @Param("size") int size,
                               @Param("currentUserId") Integer currentUserId);
    
    // 게시글 총 개수 조회
    int countBoards(@Param("categoryId") Integer categoryId,
                   @Param("search") String search);
    
    // 게시글 상세 조회
    Optional<Board> selectBoardById(@Param("boardId") Integer boardId,
                                   @Param("currentUserId") Integer currentUserId);
    
    // 게시글 작성
    int insertBoard(Board board);
    
    // 게시글 수정
    int updateBoard(Board board);
    
    // 게시글 삭제 (소프트 삭제)
    int deleteBoard(@Param("boardId") Integer boardId, 
                   @Param("authorId") Integer authorId);
    
    // 조회수 증가
    int incrementViewCount(@Param("boardId") Integer boardId);
    
    // 좋아요 추가
    int insertLike(@Param("boardId") Integer boardId, 
                  @Param("memberId") Integer memberId);
    
    // 좋아요 삭제
    int deleteLike(@Param("boardId") Integer boardId, 
                  @Param("memberId") Integer memberId);
    
    // 사용자의 좋아요 상태 확인
    boolean isLikedByUser(@Param("boardId") Integer boardId, 
                         @Param("memberId") Integer memberId);
    
    // 게시글 첨부파일 목록 조회
    List<File> selectBoardAttachments(@Param("boardId") Integer boardId);
    
    // 작성자 본인 확인
    boolean isAuthor(@Param("boardId") Integer boardId, 
                    @Param("authorId") Integer authorId);
} 