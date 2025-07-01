package com.koreait.apiserver.dao;

import com.koreait.apiserver.entity.BoardComment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface BoardCommentDao {
    
    // 댓글 목록 조회 (페이징)
    List<BoardComment> selectCommentsByBoardId(@Param("boardId") Integer boardId,
                                              @Param("offset") int offset,
                                              @Param("size") int size,
                                              @Param("currentUserId") Integer currentUserId);
    
    // 댓글 총 개수 조회
    int countCommentsByBoardId(@Param("boardId") Integer boardId);
    
    // 댓글 상세 조회
    Optional<BoardComment> selectCommentById(@Param("commentId") Integer commentId,
                                           @Param("currentUserId") Integer currentUserId);
    
    // 댓글 작성
    int insertComment(BoardComment comment);
    
    // 댓글 수정
    int updateComment(BoardComment comment);
    
    // 댓글 삭제 (소프트 삭제)
    int deleteComment(@Param("commentId") Integer commentId, 
                     @Param("authorId") Integer authorId);
    
    // 댓글 좋아요 추가
    int insertCommentLike(@Param("commentId") Integer commentId, 
                         @Param("memberId") Integer memberId);
    
    // 댓글 좋아요 삭제
    int deleteCommentLike(@Param("commentId") Integer commentId, 
                         @Param("memberId") Integer memberId);
    
    // 사용자의 댓글 좋아요 상태 확인
    boolean isCommentLikedByUser(@Param("commentId") Integer commentId, 
                                @Param("memberId") Integer memberId);
    
    // 댓글 작성자 본인 확인
    boolean isCommentAuthor(@Param("commentId") Integer commentId, 
                           @Param("authorId") Integer authorId);
    
    // 대댓글 목록 조회
    List<BoardComment> selectRepliesByParentId(@Param("parentCommentId") Integer parentCommentId,
                                              @Param("currentUserId") Integer currentUserId);
} 