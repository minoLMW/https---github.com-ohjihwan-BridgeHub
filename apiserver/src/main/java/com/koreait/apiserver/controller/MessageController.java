package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.MessageDTO;
import com.koreait.apiserver.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    // 메시지 저장 (Socket Server에서 호출)
    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> saveMessage(@RequestBody MessageDTO messageDTO) {
        try {
            log.info("메시지 저장 요청: roomId={}, senderId={}", messageDTO.getRoomId(), messageDTO.getSenderId());
            MessageDTO savedMessage = messageService.saveMessage(messageDTO);
            return ResponseEntity.ok(ApiResponse.success(savedMessage));
        } catch (Exception e) {
            log.error("메시지 저장 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_SAVE_ERROR"));
        }
    }

    // 채팅 히스토리 조회 (페이징 포함)
    @GetMapping("/history/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getChatHistory(
            @PathVariable Integer roomId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String beforeDate) {
        try {
            log.info("채팅 히스토리 조회 요청: roomId={}, page={}, size={}", roomId, page, size);
            List<MessageDTO> messages = messageService.getChatHistory(roomId, page, size, beforeDate);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            log.error("채팅 히스토리 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_HISTORY_ERROR"));
        }
    }

    // 채팅방별 메시지 목록 조회 (전체)
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessagesByRoomId(@PathVariable Integer roomId) {
        try {
            List<MessageDTO> messages = messageService.getMessagesByRoomId(roomId);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("MESSAGE_LIST_ERROR"));
        }
    }

    // 메시지 상세 조회
    @GetMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageDTO>> getMessage(@PathVariable Integer messageId) {
        try {
            log.info("메시지 조회 요청: messageId={}", messageId);
            MessageDTO message = messageService.getMessage(messageId);
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (Exception e) {
            log.error("메시지 조회 실패: messageId={}", messageId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_GET_ERROR"));
        }
    }

    // 메시지 삭제 (논리 삭제)
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Integer messageId) {
        try {
            log.info("메시지 삭제 요청: messageId={}", messageId);
            messageService.deleteMessage(messageId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("메시지 삭제 실패: messageId={}", messageId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_DELETE_ERROR"));
        }
    }

    // 사용자별 메시지 목록 조회
    @GetMapping("/user/{senderId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getUserMessages(@PathVariable Integer senderId) {
        try {
            log.info("사용자 메시지 목록 조회 요청: senderId={}", senderId);
            List<MessageDTO> messages = messageService.getMessagesBySenderId(senderId);
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            log.error("사용자 메시지 목록 조회 실패: senderId={}", senderId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("USER_MESSAGE_LIST_ERROR"));
        }
    }

    // 채팅방 메시지 개수 조회
    @GetMapping("/count/{roomId}")
    public ResponseEntity<ApiResponse<Integer>> getMessageCount(@PathVariable Integer roomId) {
        try {
            log.info("메시지 개수 조회 요청: roomId={}", roomId);
            int count = messageService.getMessageCountByRoomId(roomId);
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            log.error("메시지 개수 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_COUNT_ERROR"));
        }
    }

    // 최근 메시지 조회 (스크롤 업 시 사용)
    @GetMapping("/recent/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getRecentMessages(@PathVariable Integer roomId) {
        try {
            log.info("최근 메시지 조회 요청: roomId={}", roomId);
            List<MessageDTO> messages = messageService.getRecentMessages(roomId, 20); // 기본 20개
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            log.error("최근 메시지 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("RECENT_MESSAGE_ERROR"));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessageList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("메시지 목록 조회 요청: page={}, size={}", page, size);
            List<MessageDTO> messages = messageService.getMessagesByRoomId(null); // 임시로 null 전달
            return ResponseEntity.ok(ApiResponse.success(messages));
        } catch (Exception e) {
            log.error("메시지 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MESSAGE_LIST_ERROR"));
        }
    }
} 