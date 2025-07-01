package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.BoardCommentDao;
import com.koreait.apiserver.dto.BoardCommentDTO;
import com.koreait.apiserver.entity.BoardComment;
import com.koreait.apiserver.service.BoardCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardCommentServiceImpl implements BoardCommentService {

    private final BoardCommentDao boardCommentDao;

    @Override
    public Map<String, Object> getCommentsByBoardId(Integer boardId, int page, int size, Integer currentUserId) {
        try {
            int offset = page * size;
            
            // 댓글 목록 조회
            List<BoardComment> comments = boardCommentDao.selectCommentsByBoardId(boardId, offset, size, currentUserId);
            List<BoardCommentDTO> commentDTOs = comments.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            
            // 총 개수 조회
            int totalElements = boardCommentDao.countCommentsByBoardId(boardId);
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> result = new HashMap<>();
            result.put("comments", commentDTOs);
            result.put("totalElements", totalElements);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            
            return result;
        } catch (Exception e) {
            log.error("댓글 목록 조회 실패: boardId={}", boardId, e);
            throw new RuntimeException("댓글 목록을 조회할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public Integer createComment(BoardCommentDTO commentDTO, Integer authorId, String ipAddress) {
        try {
            BoardComment comment = new BoardComment();
            comment.setBoardId(commentDTO.getBoardId());
            comment.setAuthorId(authorId);
            comment.setContent(commentDTO.getContent());
            comment.setIsDeleted(false);
            comment.setIpAddress(ipAddress);
            
            boardCommentDao.insertComment(comment);
            return comment.getCommentId();
        } catch (Exception e) {
            log.error("댓글 작성 실패", e);
            throw new RuntimeException("댓글을 작성할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void updateComment(Integer commentId, String content, Integer authorId) {
        try {
            // 작성자 본인 확인
            if (!boardCommentDao.isCommentAuthor(commentId, authorId)) {
                throw new RuntimeException("수정 권한이 없습니다.");
            }
            
            BoardComment comment = new BoardComment();
            comment.setCommentId(commentId);
            comment.setContent(content);
            comment.setAuthorId(authorId);
            
            int updated = boardCommentDao.updateComment(comment);
            if (updated == 0) {
                throw new RuntimeException("댓글을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("댓글 수정 실패: commentId={}", commentId, e);
            throw new RuntimeException("댓글을 수정할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, Integer authorId) {
        try {
            // 작성자 본인 확인
            if (!boardCommentDao.isCommentAuthor(commentId, authorId)) {
                throw new RuntimeException("삭제 권한이 없습니다.");
            }
            
            int deleted = boardCommentDao.deleteComment(commentId, authorId);
            if (deleted == 0) {
                throw new RuntimeException("댓글을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("댓글 삭제 실패: commentId={}", commentId, e);
            throw new RuntimeException("댓글을 삭제할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public Map<String, Object> toggleCommentLike(Integer commentId, Integer memberId) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 현재 좋아요 상태 확인
            boolean isLiked = boardCommentDao.isCommentLikedByUser(commentId, memberId);
            
            if (isLiked) {
                // 좋아요 취소
                boardCommentDao.deleteCommentLike(commentId, memberId);
                result.put("isLiked", false);
                result.put("message", "좋아요가 취소되었습니다.");
            } else {
                // 좋아요 추가
                boardCommentDao.insertCommentLike(commentId, memberId);
                result.put("isLiked", true);
                result.put("message", "좋아요가 추가되었습니다.");
            }
            
            // 업데이트된 좋아요 수 조회
            Optional<BoardComment> commentOpt = boardCommentDao.selectCommentById(commentId, memberId);
            if (commentOpt.isPresent()) {
                result.put("likeCount", commentOpt.get().getLikeCount());
            }
            
            return result;
        } catch (Exception e) {
            log.error("댓글 좋아요 토글 실패: commentId={}, memberId={}", commentId, memberId, e);
            throw new RuntimeException("좋아요 처리를 할 수 없습니다.");
        }
    }

    @Override
    public boolean isCommentAuthor(Integer commentId, Integer authorId) {
        return boardCommentDao.isCommentAuthor(commentId, authorId);
    }

    // 대댓글 기능 완전 제거 - buildCommentTree 메소드 삭제됨

    // Entity -> DTO 변환 (대댓글 필드 제거)
    private BoardCommentDTO convertToDTO(BoardComment comment) {
        BoardCommentDTO dto = new BoardCommentDTO();
        dto.setCommentId(comment.getCommentId());
        dto.setBoardId(comment.getBoardId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorNickname(comment.getAuthorNickname());
        dto.setContent(comment.getContent());
        dto.setLikeCount(comment.getLikeCount());
        dto.setIsLiked(comment.getIsLiked());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
