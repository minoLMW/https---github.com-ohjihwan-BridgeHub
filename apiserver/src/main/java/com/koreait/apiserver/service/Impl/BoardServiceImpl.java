package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.BoardDao;
import com.koreait.apiserver.dao.BoardCategoryDao;
import com.koreait.apiserver.dao.FileDao;
import com.koreait.apiserver.dto.BoardDTO;
import com.koreait.apiserver.dto.BoardCategoryDTO;
import com.koreait.apiserver.dto.FileDTO;
import com.koreait.apiserver.entity.Board;
import com.koreait.apiserver.entity.BoardCategory;
import com.koreait.apiserver.entity.File;
import com.koreait.apiserver.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardDao boardDao;
    private final BoardCategoryDao boardCategoryDao;
    private final FileDao fileDao;

    @Override
    public Map<String, Object> getBoardList(Integer categoryId, String search, String sort, 
                                          int page, int size, Integer currentUserId) {
        try {
            int offset = page * size;
            
            // 게시글 목록 조회
            List<Board> boards = boardDao.selectBoardList(categoryId, search, sort, offset, size, currentUserId);
            List<BoardDTO> boardDTOs = boards.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            // 총 개수 조회
            int totalElements = boardDao.countBoards(categoryId, search);
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> result = new HashMap<>();
            result.put("boards", boardDTOs);
            result.put("totalElements", totalElements);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            
            return result;
        } catch (Exception e) {
            log.error("게시글 목록 조회 실패", e);
            throw new RuntimeException("게시글 목록을 조회할 수 없습니다.");
        }
    }

    @Override
    public BoardDTO getBoardById(Integer boardId, Integer currentUserId) {
        try {
            Optional<Board> boardOpt = boardDao.selectBoardById(boardId, currentUserId);
            if (boardOpt.isPresent()) {
                Board board = boardOpt.get();
                BoardDTO boardDTO = convertToDTO(board);
                
                // 첨부파일 목록 조회
                List<File> attachments = boardDao.selectBoardAttachments(boardId);
                List<FileDTO> attachmentDTOs = attachments.stream()
                        .map(this::convertFileToDTO)
                        .collect(Collectors.toList());
                boardDTO.setAttachments(attachmentDTOs);
                
                return boardDTO;
            }
            throw new RuntimeException("게시글을 찾을 수 없습니다.");
        } catch (Exception e) {
            log.error("게시글 조회 실패: boardId={}", boardId, e);
            throw new RuntimeException("게시글을 조회할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public Integer createBoard(BoardDTO boardDTO, Integer authorId, String ipAddress) {
        try {
            Board board = new Board();
            board.setCategoryId(boardDTO.getCategoryId());
            board.setAuthorId(authorId);
            board.setTitle(boardDTO.getTitle());
            board.setContent(boardDTO.getContent());
            board.setIsNotice(boardDTO.getIsNotice() != null ? boardDTO.getIsNotice() : false);
            board.setIpAddress(ipAddress);
            
            boardDao.insertBoard(board);
            
            // 첨부파일 연결
            if (boardDTO.getAttachmentIds() != null && !boardDTO.getAttachmentIds().isEmpty()) {
                linkAttachments(board.getBoardId(), boardDTO.getAttachmentIds());
            }
            
            return board.getBoardId();
        } catch (Exception e) {
            log.error("게시글 작성 실패", e);
            throw new RuntimeException("게시글을 작성할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void updateBoard(Integer boardId, BoardDTO boardDTO, Integer authorId) {
        try {
            // 작성자 본인 확인
            if (!boardDao.isAuthor(boardId, authorId)) {
                throw new RuntimeException("수정 권한이 없습니다.");
            }
            
            Board board = new Board();
            board.setBoardId(boardId);
            board.setAuthorId(authorId);
            board.setCategoryId(boardDTO.getCategoryId());
            board.setTitle(boardDTO.getTitle());
            board.setContent(boardDTO.getContent());
            
            int updated = boardDao.updateBoard(board);
            if (updated == 0) {
                throw new RuntimeException("게시글을 찾을 수 없습니다.");
            }
            
            // 기존 첨부파일 삭제 후 새로 연결
            if (boardDTO.getAttachmentIds() != null) {
                // 기존 첨부파일 연결 해제
                unlinkAttachments(boardId);
                
                // 새 첨부파일 연결
                if (!boardDTO.getAttachmentIds().isEmpty()) {
                    linkAttachments(boardId, boardDTO.getAttachmentIds());
                }
            }
        } catch (Exception e) {
            log.error("게시글 수정 실패: boardId={}", boardId, e);
            throw new RuntimeException("게시글을 수정할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void deleteBoard(Integer boardId, Integer authorId) {
        try {
            int deleted = boardDao.deleteBoard(boardId, authorId);
            if (deleted == 0) {
                throw new RuntimeException("삭제 권한이 없거나 게시글을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("게시글 삭제 실패: boardId={}", boardId, e);
            throw new RuntimeException("게시글을 삭제할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public Map<String, Object> toggleBoardLike(Integer boardId, Integer memberId) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 현재 좋아요 상태 확인
            boolean isLiked = boardDao.isLikedByUser(boardId, memberId);
            
            if (isLiked) {
                // 좋아요 취소
                boardDao.deleteLike(boardId, memberId);
                result.put("isLiked", false);
                result.put("message", "좋아요가 취소되었습니다.");
            } else {
                // 좋아요 추가
                boardDao.insertLike(boardId, memberId);
                result.put("isLiked", true);
                result.put("message", "좋아요가 추가되었습니다.");
            }
            
            // 업데이트된 좋아요 수 조회
            Optional<Board> boardOpt = boardDao.selectBoardById(boardId, memberId);
            if (boardOpt.isPresent()) {
                result.put("likeCount", boardOpt.get().getLikeCount());
            }
            
            return result;
        } catch (Exception e) {
            log.error("게시글 좋아요 토글 실패: boardId={}, memberId={}", boardId, memberId, e);
            throw new RuntimeException("좋아요 처리를 할 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public void incrementViewCount(Integer boardId) {
        try {
            boardDao.incrementViewCount(boardId);
        } catch (Exception e) {
            log.error("조회수 증가 실패: boardId={}", boardId, e);
            // 조회수 증가 실패는 전체 로직에 영향을 주지 않도록 예외를 던지지 않음
        }
    }

    @Override
    public List<BoardCategoryDTO> getActiveCategories() {
        try {
            List<BoardCategory> categories = boardCategoryDao.selectAllActiveCategories();
            return categories.stream()
                    .map(this::convertCategoryToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("카테고리 목록 조회 실패", e);
            throw new RuntimeException("카테고리 목록을 조회할 수 없습니다.");
        }
    }

    @Override
    public boolean isAuthor(Integer boardId, Integer authorId) {
        return boardDao.isAuthor(boardId, authorId);
    }

    // 첨부파일 연결
    private void linkAttachments(Integer boardId, List<Integer> attachmentIds) {
        for (Integer fileId : attachmentIds) {
            fileDao.linkToBoardAttachment(fileId, boardId);
        }
    }

    // 첨부파일 연결 해제
    private void unlinkAttachments(Integer boardId) {
        fileDao.unlinkBoardAttachments(boardId);
    }

    // Entity -> DTO 변환
    private BoardDTO convertToDTO(Board board) {
        BoardDTO dto = new BoardDTO();
        dto.setBoardId(board.getBoardId());
        dto.setCategoryId(board.getCategoryId());
        dto.setCategoryName(board.getCategoryName());
        dto.setAuthorId(board.getAuthorId());
        dto.setAuthorNickname(board.getAuthorNickname());
        dto.setTitle(board.getTitle());
        dto.setContent(board.getContent());
        dto.setViewCount(board.getViewCount());
        dto.setLikeCount(board.getLikeCount());
        dto.setCommentCount(board.getCommentCount());
        dto.setIsNotice(board.getIsNotice());
        dto.setIsLiked(board.getIsLiked());
        dto.setAttachmentCount(board.getAttachmentCount());
        dto.setCreatedAt(board.getCreatedAt());
        dto.setUpdatedAt(board.getUpdatedAt());
        return dto;
    }

    // BoardCategory Entity -> DTO 변환
    private BoardCategoryDTO convertCategoryToDTO(BoardCategory category) {
        BoardCategoryDTO dto = new BoardCategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setSortOrder(category.getSortOrder());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        return dto;
    }

    // File Entity -> DTO 변환
    private FileDTO convertFileToDTO(File file) {
        FileDTO dto = new FileDTO();
        dto.setFileId(file.getFileId());
        dto.setOriginalFilename(file.getOriginalFilename());
        dto.setStoredFilename(file.getStoredFilename());
        dto.setFileSize(file.getFileSize());
        dto.setMimeType(file.getMimeType());
        dto.setUploadedAt(file.getUploadedAt());
        return dto;
    }
} 