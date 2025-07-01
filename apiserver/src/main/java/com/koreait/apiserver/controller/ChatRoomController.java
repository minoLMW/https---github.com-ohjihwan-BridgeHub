package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ChatRoomDTO;
import com.koreait.apiserver.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatrooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    // 채팅방 목록 조회
    @GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getChatRoomList() {
        return ResponseEntity.ok(chatRoomService.getChatRoomList());
    }

    // 채팅방 상세 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> getChatRoom(@PathVariable Integer roomId) {
        return ResponseEntity.ok(chatRoomService.getChatRoom(roomId));
    }

    // 채팅방 생성
    @PostMapping
    public ResponseEntity<ChatRoomDTO> createChatRoom(@RequestBody ChatRoomDTO chatRoomDTO) {
        return ResponseEntity.ok(chatRoomService.createChatRoom(chatRoomDTO));
    }

    // 채팅방 수정
    @PutMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> updateChatRoom(
            @PathVariable Integer roomId,
            @RequestBody ChatRoomDTO chatRoomDTO) {
        chatRoomDTO.setRoomId(roomId);
        return ResponseEntity.ok(chatRoomService.updateChatRoom(chatRoomDTO));
    }

    // 채팅방 삭제
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Integer roomId) {
        chatRoomService.deleteChatRoom(roomId);
        return ResponseEntity.ok().build();
    }
}
