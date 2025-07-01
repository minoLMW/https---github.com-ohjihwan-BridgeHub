package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.BoardDTO;
import com.koreait.apiserver.dto.BoardCategoryDTO;
import com.koreait.apiserver.dto.BoardCommentDTO;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.BoardService;
import com.koreait.apiserver.service.BoardCommentService;
import com.koreait.apiserver.service.MemberService;
import com.koreait.apiserver.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;
    private final BoardCommentService boardCommentService;
    private final MemberService memberService;

    // ============ 게시판 카테고리 ============

    /**
     * 게시판 카테고리 목록 조회
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<BoardCategoryDTO>>> getCategories() {
        try {
            List<BoardCategoryDTO> categories = boardService.getActiveCategories();
            return ResponseEntity.ok(new ApiResponse<List<BoardCategoryDTO>>(true, "카테고리 목록을 조회했습니다.", categories));
        } catch (Exception e) {
            log.error("카테고리 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<List<BoardCategoryDTO>>(false, "카테고리 목록 조회에 실패했습니다."));
        }
    }

    // ============ 게시글 CRUD ============

    /**
     * 게시글 목록 조회 (페이징, 검색, 정렬)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBoardList(
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sort", defaultValue = "recent") String sort,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Authentication authentication) {
        try {
            Integer currentUserId = getCurrentUserId(authentication);
            Map<String, Object> result = boardService.getBoardList(categoryId, search, sort, page, size, currentUserId);
            return ResponseEntity.ok(new ApiResponse<Map<String, Object>>(true, "게시글 목록을 조회했습니다.", result));
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Map<String, Object>>(false, "게시글 목록 조회에 실패했습니다."));
        }
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{boardId}")
    public ResponseEntity<ApiResponse<BoardDTO>> getBoardDetail(
            @PathVariable Integer boardId,
            Authentication authentication) {
        try {
            Integer currentUserId = getCurrentUserId(authentication);
            
            // 조회수 증가
            boardService.incrementViewCount(boardId);
            
            // 게시글 조회
            BoardDTO board = boardService.getBoardById(boardId, currentUserId);
            return ResponseEntity.ok(new ApiResponse<BoardDTO>(true, "게시글을 조회했습니다.", board));
        } catch (Exception e) {
            log.error("게시글 상세 조회 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<BoardDTO>(false, "게시글을 찾을 수 없습니다."));
        }
    }

    /**
     * 게시글 작성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Integer>> createBoard(
            @RequestBody BoardDTO boardDTO,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Integer>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            String ipAddress = getClientIpAddress(request);
            
            Integer boardId = boardService.createBoard(boardDTO, authorId, ipAddress);
            return ResponseEntity.ok(new ApiResponse<Integer>(true, "게시글이 작성되었습니다.", boardId));
        } catch (Exception e) {
            log.error("게시글 작성 실패", e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Integer>(false, "게시글 작성에 실패했습니다."));
        }
    }

    /**
     * 게시글 수정
     */
    @PutMapping("/{boardId}")
    public ResponseEntity<ApiResponse<Void>> updateBoard(
            @PathVariable Integer boardId,
            @RequestBody BoardDTO boardDTO,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Void>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            boardService.updateBoard(boardId, boardDTO, authorId);
            return ResponseEntity.ok(new ApiResponse<Void>(true, "게시글이 수정되었습니다."));
        } catch (Exception e) {
            log.error("게시글 수정 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Void>(false, e.getMessage()));
        }
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{boardId}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(
            @PathVariable Integer boardId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Void>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            boardService.deleteBoard(boardId, authorId);
            return ResponseEntity.ok(new ApiResponse<Void>(true, "게시글이 삭제되었습니다."));
        } catch (Exception e) {
            log.error("게시글 삭제 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Void>(false, e.getMessage()));
        }
    }

    /**
     * 게시글 좋아요/취소
     */
    @PostMapping("/{boardId}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleBoardLike(
            @PathVariable Integer boardId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Map<String, Object>>(false, "로그인이 필요합니다."));
            }

            Integer memberId = getCurrentUserId(authentication);
            Map<String, Object> result = boardService.toggleBoardLike(boardId, memberId);
            return ResponseEntity.ok(new ApiResponse<Map<String, Object>>(true, (String) result.get("message"), result));
        } catch (Exception e) {
            log.error("게시글 좋아요 토글 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Map<String, Object>>(false, "좋아요 처리에 실패했습니다."));
        }
    }

    // ============ 댓글 CRUD ============

    /**
     * 댓글 목록 조회 (페이징)
     */
    @GetMapping("/{boardId}/comments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComments(
            @PathVariable Integer boardId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Authentication authentication) {
        try {
            Integer currentUserId = getCurrentUserId(authentication);
            Map<String, Object> result = boardCommentService.getCommentsByBoardId(boardId, page, size, currentUserId);
            return ResponseEntity.ok(new ApiResponse<Map<String, Object>>(true, "댓글 목록을 조회했습니다.", result));
        } catch (Exception e) {
            log.error("댓글 목록 조회 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Map<String, Object>>(false, "댓글 목록 조회에 실패했습니다."));
        }
    }

    /**
     * 댓글 작성
     */
    @PostMapping("/{boardId}/comments")
    public ResponseEntity<ApiResponse<Integer>> createComment(
            @PathVariable Integer boardId,
            @RequestBody BoardCommentDTO commentDTO,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Integer>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            String ipAddress = getClientIpAddress(request);
            
            commentDTO.setBoardId(boardId);
            Integer commentId = boardCommentService.createComment(commentDTO, authorId, ipAddress);
            return ResponseEntity.ok(new ApiResponse<Integer>(true, "댓글이 작성되었습니다.", commentId));
        } catch (Exception e) {
            log.error("댓글 작성 실패: boardId={}", boardId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Integer>(false, "댓글 작성에 실패했습니다."));
        }
    }

    /**
     * 댓글 수정
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> updateComment(
            @PathVariable Integer commentId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Void>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            String content = requestBody.get("content");
            
            boardCommentService.updateComment(commentId, content, authorId);
            return ResponseEntity.ok(new ApiResponse<Void>(true, "댓글이 수정되었습니다."));
        } catch (Exception e) {
            log.error("댓글 수정 실패: commentId={}", commentId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Void>(false, e.getMessage()));
        }
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Integer commentId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Void>(false, "로그인이 필요합니다."));
            }

            Integer authorId = getCurrentUserId(authentication);
            boardCommentService.deleteComment(commentId, authorId);
            return ResponseEntity.ok(new ApiResponse<Void>(true, "댓글이 삭제되었습니다."));
        } catch (Exception e) {
            log.error("댓글 삭제 실패: commentId={}", commentId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Void>(false, e.getMessage()));
        }
    }

    /**
     * 댓글 좋아요/취소
     */
    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleCommentLike(
            @PathVariable Integer commentId,
            Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body(new ApiResponse<Map<String, Object>>(false, "로그인이 필요합니다."));
            }

            Integer memberId = getCurrentUserId(authentication);
            Map<String, Object> result = boardCommentService.toggleCommentLike(commentId, memberId);
            return ResponseEntity.ok(new ApiResponse<Map<String, Object>>(true, (String) result.get("message"), result));
        } catch (Exception e) {
            log.error("댓글 좋아요 토글 실패: commentId={}", commentId, e);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<Map<String, Object>>(false, "좋아요 처리에 실패했습니다."));
        }
    }

    // ============ 유틸리티 메서드 ============

    /**
     * 현재 로그인한 사용자 ID 조회
     */
    private Integer getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        try {
            // authentication.getName()은 username(이메일)을 반환
            String username = authentication.getName();
            if (username == null) {
                return null;
            }
            
            // username으로 사용자 정보 조회
            MemberDTO member = memberService.getMemberByUsername(username);
            if (member == null) {
                return null;
            }
            
            return member.getId();
        } catch (Exception e) {
            log.error("사용자 ID 조회 실패", e);
            return null;
        }
    }

    /**
     * 클라이언트 IP 주소 조회
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 