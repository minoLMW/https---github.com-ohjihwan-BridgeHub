package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.ChatRoomMemberDao;
import com.koreait.apiserver.dao.ChatRoomDao;
import com.koreait.apiserver.dao.StudyRoomDao;
import com.koreait.apiserver.dao.StudyRoomMemberDao;
import com.koreait.apiserver.dto.ChatRoomMemberDTO;
import com.koreait.apiserver.entity.ChatRoomMember;
import com.koreait.apiserver.entity.ChatRoom;
import com.koreait.apiserver.entity.StudyRoom;
import com.koreait.apiserver.entity.StudyRoomMember;
import com.koreait.apiserver.service.ChatRoomMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomMemberServiceImpl implements ChatRoomMemberService {

    private final ChatRoomMemberDao chatRoomMemberDao;
    private final ChatRoomDao chatRoomDao;
    private final StudyRoomDao studyRoomDao;
    private final StudyRoomMemberDao studyRoomMemberDao;

    @Override
    public List<ChatRoomMemberDTO> getChatRoomMembers(Integer roomId) {
        List<ChatRoomMember> members = chatRoomMemberDao.findByRoomId(roomId);
        return members.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void joinChatRoom(Integer roomId, Integer memberId) {
        // 1. 채팅방 존재 확인
        Optional<ChatRoom> chatRoomOpt = chatRoomDao.findById(roomId);
        if (!chatRoomOpt.isPresent()) {
            throw new RuntimeException("존재하지 않는 채팅방입니다.");
        }
        
        ChatRoom chatRoom = chatRoomOpt.get();
        
        // 2. 이미 참가한 멤버인지 확인
        Optional<ChatRoomMember> existingMemberOpt = chatRoomMemberDao.findByRoomIdAndMemberId(roomId, memberId);
        if (existingMemberOpt.isPresent()) {
            log.info("이미 참가한 채팅방입니다: roomId={}, memberId={}", roomId, memberId);
            return; // 이미 참가한 경우 성공으로 처리
        }
        
        // 3. 정원 확인
        int currentMemberCount = chatRoomMemberDao.countMembersByRoomId(roomId);
        if (currentMemberCount >= chatRoom.getMaxMembers()) {
            throw new RuntimeException("채팅방 정원이 가득 찼습니다.");
        }
        
        // 4. 스터디룸 정보 조회 (채팅방과 연결된 스터디룸)
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findByRoomId(roomId);
        if (!studyRoomOpt.isPresent()) {
            throw new RuntimeException("채팅방과 연결된 스터디룸을 찾을 수 없습니다.");
        }
        
        StudyRoom studyRoom = studyRoomOpt.get();
        
        // 5. 입장 권한 확인
        boolean canJoin = checkJoinPermission(studyRoom, memberId);
        if (!canJoin) {
            throw new RuntimeException("방장의 허락이 필요합니다. 스터디룸에 먼저 참가 신청해주세요.");
        }
        
        // 6. 채팅방 멤버 추가
        ChatRoomMember member = new ChatRoomMember();
        member.setRoomId(roomId);
        member.setMemberId(memberId);
        member.setJoinedAt(LocalDateTime.now());
        member.setIsAdmin(false);
        
        chatRoomMemberDao.insertChatRoomMember(member);
        
        log.info("채팅방 입장 완료: roomId={}, memberId={}", roomId, memberId);
    }

    /**
     * 채팅방 입장 권한 확인
     * - 방장: 자유롭게 입장 가능
     * - 승인된 스터디 멤버: 자유롭게 입장 가능
     * - 첫 방문자: 방장의 허락 필요 (스터디룸에 먼저 참가 신청해야 함)
     */
    private boolean checkJoinPermission(StudyRoom studyRoom, Integer memberId) {
        // 1. 방장인지 확인
        if (studyRoom.getBossId().equals(memberId)) {
            log.info("방장이므로 채팅방 입장 가능: studyRoomId={}, memberId={}", studyRoom.getStudyRoomId(), memberId);
            return true;
        }
        
        // 2. 승인된 스터디 멤버인지 확인
        try {
            StudyRoomMember studyMember = studyRoomMemberDao.selectStudyRoomMember(studyRoom.getStudyRoomId(), memberId);
            if (studyMember != null && studyMember.getStatus() == StudyRoomMember.MemberStatus.APPROVED) {
                log.info("승인된 스터디 멤버이므로 채팅방 입장 가능: studyRoomId={}, memberId={}", studyRoom.getStudyRoomId(), memberId);
                return true;
            }
        } catch (Exception e) {
            log.warn("스터디 멤버 확인 중 오류: studyRoomId={}, memberId={}", studyRoom.getStudyRoomId(), memberId, e);
        }
        
        // 3. 첫 방문자인 경우 (방장의 허락 필요)
        log.info("첫 방문자이므로 방장의 허락이 필요: studyRoomId={}, memberId={}", studyRoom.getStudyRoomId(), memberId);
        return false;
    }

    @Override
    @Transactional
    public void leaveChatRoom(Integer roomId, Integer memberId) {
        // 1. 멤버 확인
        Optional<ChatRoomMember> memberOpt = chatRoomMemberDao.findByRoomIdAndMemberId(roomId, memberId);
        if (!memberOpt.isPresent()) {
            throw new RuntimeException("채팅방에 참가하지 않은 사용자입니다.");
        }
        
        ChatRoomMember member = memberOpt.get();
        
        // 2. 채팅방에서 제거 (모든 사용자 퇴장 가능)
        chatRoomMemberDao.deleteChatRoomMember(roomId, memberId);
        
        log.info("채팅방 퇴장 완료: roomId={}, memberId={}", roomId, memberId);
    }

    @Override
    public boolean isMemberOfChatRoom(Integer roomId, Integer memberId) {
        Optional<ChatRoomMember> memberOpt = chatRoomMemberDao.findByRoomIdAndMemberId(roomId, memberId);
        return memberOpt.isPresent();
    }

    private ChatRoomMemberDTO convertToDTO(ChatRoomMember member) {
        ChatRoomMemberDTO dto = new ChatRoomMemberDTO();
        dto.setRoomId(member.getRoomId());
        dto.setMemberId(member.getMemberId());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setIsAdmin(member.getIsAdmin());
        
        // TODO: 멤버 정보 (이름, 닉네임, 프로필 이미지) 조회 추가
        // 현재는 기본 정보만 설정
        
        return dto;
    }
} 