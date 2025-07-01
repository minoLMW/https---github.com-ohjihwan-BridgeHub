package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.StudyRoomDao;
import com.koreait.apiserver.dao.ChatRoomDao;
import com.koreait.apiserver.dao.StudyRoomMemberDao;
import com.koreait.apiserver.dao.ChatRoomMemberDao;
import com.koreait.apiserver.dto.StudyRoomDTO;
import com.koreait.apiserver.dto.StudyRoomMemberDTO;
import com.koreait.apiserver.entity.StudyRoom;
import com.koreait.apiserver.entity.ChatRoom;
import com.koreait.apiserver.entity.StudyRoomMember;
import com.koreait.apiserver.entity.ChatRoomMember;
import com.koreait.apiserver.service.StudyRoomService;
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
public class StudyRoomServiceImpl implements StudyRoomService {

    private final StudyRoomDao studyRoomDao;
    private final ChatRoomDao chatRoomDao;
    private final StudyRoomMemberDao studyRoomMemberDao;
    private final ChatRoomMemberDao chatRoomMemberDao;

    @Override
    public List<StudyRoomDTO> getStudyRoomList() {
        return studyRoomDao.findAll(1000, 0) // 임시로 큰 값 설정, 실제로는 페이징 처리 필요
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StudyRoomDTO getStudyRoom(Integer studyRoomId) {
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomId);
        if (studyRoomOpt.isPresent()) {
            StudyRoom studyRoom = studyRoomOpt.get();
            StudyRoomDTO dto = convertToDTO(studyRoom);
            
            // 현재 참가 중인 모든 멤버의 닉네임 조회
            List<StudyRoomMember> approvedMembers = studyRoomMemberDao.selectApprovedMembers(studyRoomId);
            List<String> memberNicknames = approvedMembers.stream()
                    .map(StudyRoomMember::getMemberNickname)
                    .filter(nickname -> nickname != null && !nickname.trim().isEmpty())
                    .collect(Collectors.toList());
            dto.setMemberNicknames(memberNicknames);
            
            return dto;
        }
        throw new RuntimeException("스터디룸을 찾을 수 없습니다.");
    }

    @Override
    @Transactional
    public StudyRoomDTO createStudyRoom(StudyRoomDTO studyRoomDTO) {
        log.info("=== 스터디룸 생성 서비스 시작 ===");
        log.info("요청 DTO: {}", studyRoomDTO);
        
        try {
            // 정원 제한 검증
            if (studyRoomDTO.getCapacity() == null || studyRoomDTO.getCapacity() < 2 || studyRoomDTO.getCapacity() > 10) {
                throw new IllegalArgumentException("스터디 정원은 2~10명 사이여야 합니다.");
            }
            
            // 사용자별 스터디룸 개설 제한 검증
            List<StudyRoom> existingStudies = studyRoomDao.findByBossId(studyRoomDTO.getBossId());
            if (!existingStudies.isEmpty()) {
                throw new RuntimeException("이미 스터디룸을 개설한 사용자입니다. 한 사용자는 하나의 스터디룸만 개설할 수 있습니다.");
            }
            
            // 1. 먼저 채팅방 생성
            log.info("채팅방 생성 시작");
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setRoomName(studyRoomDTO.getTitle() + " 채팅방");
            // createdAt은 Mapper에서 NOW()로 자동 설정
            chatRoom.setMaxMembers(studyRoomDTO.getCapacity());
            chatRoom.setIsActive(true);
            
            int chatRoomResult = chatRoomDao.insertChatRoom(chatRoom);
            log.info("채팅방 생성 결과: {}, 생성된 ID: {}", chatRoomResult, chatRoom.getRoomId());
            
            if (chatRoomResult <= 0 || chatRoom.getRoomId() == null) {
                throw new RuntimeException("채팅방 생성에 실패했습니다.");
            }
            
            // 2. 스터디룸 생성 (생성된 채팅방 ID 포함)
            log.info("스터디룸 생성 시작 - 채팅방 ID: {}", chatRoom.getRoomId());
            StudyRoom studyRoom = new StudyRoom();
            studyRoom.setRoomId(chatRoom.getRoomId());  // 생성된 채팅방 ID 설정
            studyRoom.setTitle(studyRoomDTO.getTitle());
            studyRoom.setDescription(studyRoomDTO.getDescription());
            studyRoom.setBossId(studyRoomDTO.getBossId());
            studyRoom.setEducation(studyRoomDTO.getEducation());
            studyRoom.setDepartment(studyRoomDTO.getDepartment());
            studyRoom.setRegion(studyRoomDTO.getRegion());
            studyRoom.setDistrict(studyRoomDTO.getDistrict());
            studyRoom.setCapacity(studyRoomDTO.getCapacity());
            studyRoom.setCurrentMembers(1); // 방장 포함
            studyRoom.setTime(studyRoomDTO.getTime());
            studyRoom.setThumbnail(studyRoomDTO.getThumbnail());
            studyRoom.setIsPublic(studyRoomDTO.getIsPublic());
            
            int studyRoomResult = studyRoomDao.insertStudyRoom(studyRoom);
            log.info("스터디룸 생성 결과: {}, 생성된 ID: {}", studyRoomResult, studyRoom.getStudyRoomId());
            
            if (studyRoomResult <= 0 || studyRoom.getStudyRoomId() == null) {
                throw new RuntimeException("스터디룸 생성에 실패했습니다.");
            }
            
            // 3. 채팅방 멤버로 방장 추가
            log.info("채팅방 멤버 추가 시작 - 방장 ID: {}", studyRoomDTO.getBossId());
            ChatRoomMember chatRoomMember = new ChatRoomMember();
            chatRoomMember.setRoomId(chatRoom.getRoomId());
            chatRoomMember.setMemberId(studyRoomDTO.getBossId());
            chatRoomMember.setIsAdmin(true);
            
            int memberResult = chatRoomMemberDao.insertChatRoomMember(chatRoomMember);
            log.info("채팅방 멤버 추가 결과: {}", memberResult);
            
            if (memberResult <= 0) {
                throw new RuntimeException("채팅방 멤버 추가에 실패했습니다.");
            }
            
            log.info("스터디룸 생성 완료: studyRoomId={}, bossId={}, chatRoomId={}", 
                    studyRoom.getStudyRoomId(), studyRoomDTO.getBossId(), chatRoom.getRoomId());
            
            // 트리거에 의해 study_room_members에 방장이 자동으로 추가됨
            return convertToDTO(studyRoom);
            
        } catch (Exception e) {
            log.error("스터디룸 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("스터디룸 생성에 실패했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public StudyRoomDTO updateStudyRoom(StudyRoomDTO studyRoomDTO) {
        // 정원 제한 검증
        if (studyRoomDTO.getCapacity() == null || studyRoomDTO.getCapacity() < 2 || studyRoomDTO.getCapacity() > 10) {
            throw new IllegalArgumentException("스터디 정원은 2~10명 사이여야 합니다.");
        }
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomDTO.getStudyRoomId());
        if (studyRoomOpt.isPresent()) {
            StudyRoom studyRoom = studyRoomOpt.get();
            studyRoom.setTitle(studyRoomDTO.getTitle());
            studyRoom.setDescription(studyRoomDTO.getDescription());
            studyRoom.setEducation(studyRoomDTO.getEducation());
            studyRoom.setDepartment(studyRoomDTO.getDepartment());
            studyRoom.setRegion(studyRoomDTO.getRegion());
            studyRoom.setDistrict(studyRoomDTO.getDistrict());
            studyRoom.setCapacity(studyRoomDTO.getCapacity());
            studyRoom.setTime(studyRoomDTO.getTime());
            studyRoom.setThumbnail(studyRoomDTO.getThumbnail());
            studyRoom.setIsPublic(studyRoomDTO.getIsPublic());
            
            studyRoomDao.updateStudyRoom(studyRoom);
            return convertToDTO(studyRoom);
        }
        throw new RuntimeException("스터디룸을 찾을 수 없습니다.");
    }

    @Override
    @Transactional
    public void deleteStudyRoom(Integer studyRoomId) {
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomId);
        if (studyRoomOpt.isPresent()) {
            studyRoomDao.deleteStudyRoom(studyRoomId);
        } else {
            throw new RuntimeException("스터디룸을 찾을 수 없습니다.");
        }
    }

    @Override
    public List<StudyRoomDTO> getStudyRoomsByDepartment(String department) {
        return studyRoomDao.findByDepartment(department)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudyRoomDTO> getStudyRoomsByRegion(String region) {
        return studyRoomDao.findByRegion(region)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudyRoomDTO> getStudyRoomsByTime(String time) {
        return studyRoomDao.findByTime(time)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementCurrentMembers(Integer studyRoomId) {
        studyRoomDao.incrementCurrentMembers(studyRoomId);
    }

    @Override
    @Transactional
    public void decrementCurrentMembers(Integer studyRoomId) {
        studyRoomDao.decrementCurrentMembers(studyRoomId);
    }

    // ========== 스터디 참가 관련 메서드들 ==========
    
    @Override
    @Transactional
    public void joinStudyRoom(Integer studyRoomId, Integer memberId) {
        // 1. 스터디룸 존재 확인
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomId);
        if (!studyRoomOpt.isPresent()) {
            throw new RuntimeException("존재하지 않는 스터디룸입니다.");
        }
        
        StudyRoom studyRoom = studyRoomOpt.get();
        
        // 2. 방장이 자신의 스터디에 참가 신청하는지 확인
        if (studyRoom.getBossId().equals(memberId)) {
            throw new RuntimeException("방장은 자신의 스터디에 참가 신청할 수 없습니다.");
        }
        
        // 3. 이미 참가한 멤버인지 확인
        StudyRoomMember existingMember = studyRoomMemberDao.selectStudyRoomMember(studyRoomId, memberId);
        if (existingMember != null) {
            // String statusMessage = ""; // 원래 코드 (주석처리)
            switch (existingMember.getStatus()) {
                case PENDING:
                    // statusMessage = "이미 참가 신청한 스터디입니다. 승인을 기다려주세요."; // 원래 코드 (주석처리)
                    // PENDING 상태면 그냥 통과 (재신청 허용)
                    break;
                case APPROVED:
                    // statusMessage = "이미 참가 중인 스터디입니다."; // 원래 코드 (주석처리)
                    // APPROVED 상태면 그냥 통과 (재신청 허용)
                    break;
                case REJECTED:
                    // statusMessage = "이전에 참가가 거절된 스터디입니다."; // 원래 코드 (주석처리)
                    // REJECTED 상태면 그냥 통과 (재신청 허용)
                    break;
            }
            // throw new RuntimeException(statusMessage); // 원래 코드 (주석처리)
            // 모든 상태에서 재신청 허용 (에러 발생 안함)
        }
        
        // 4. 정원 확인
        if (studyRoom.getCurrentMembers() >= studyRoom.getCapacity()) {
            throw new RuntimeException("스터디 정원이 가득 찼습니다.");
        }
        
        // 5. 스터디 멤버 추가 (PENDING 상태)
        StudyRoomMember member = new StudyRoomMember();
        member.setStudyRoomId(studyRoomId);
        member.setMemberId(memberId);
        member.setRole(StudyRoomMember.MemberRole.MEMBER);
        member.setStatus(StudyRoomMember.MemberStatus.APPROVED);
        
        studyRoomMemberDao.insertStudyRoomMember(member);
        
        // ★ APPROVED로 바로 추가 시, 채팅방 멤버에도 추가!
        ChatRoomMember chatMember = new ChatRoomMember();
        chatMember.setRoomId(studyRoom.getRoomId());
        chatMember.setMemberId(memberId);
        chatMember.setJoinedAt(LocalDateTime.now());
        chatRoomMemberDao.insertChatRoomMember(chatMember);
        
        log.info("스터디 참가 신청 완료: studyRoomId={}, memberId={}", studyRoomId, memberId);
    }
    
    @Override
    public List<StudyRoomMemberDTO> getStudyRoomMembers(Integer studyRoomId) {
        List<StudyRoomMember> members = studyRoomMemberDao.selectStudyRoomMembers(studyRoomId);
        return members.stream()
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void updateMemberStatus(Integer studyRoomId, Integer memberId, String status, Integer bossId) {
        // 1. 방장 권한 확인
        if (!studyRoomMemberDao.isBoss(studyRoomId, bossId)) {
            throw new RuntimeException("방장만 멤버 상태를 변경할 수 있습니다.");
        }
        
        // 2. 대상 멤버 조회
        StudyRoomMember member = studyRoomMemberDao.selectStudyRoomMember(studyRoomId, memberId);
        if (member == null) {
            throw new RuntimeException("해당 멤버를 찾을 수 없습니다.");
        }
        
        // 3. 상태 업데이트
        StudyRoomMember.MemberStatus memberStatus;
        try {
            memberStatus = StudyRoomMember.MemberStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("잘못된 상태값입니다: " + status);
        }
        
        studyRoomMemberDao.updateMemberStatus(member.getId(), memberStatus, bossId);
        
        // 4. 승인 시 채팅방에도 추가
        if (memberStatus == StudyRoomMember.MemberStatus.APPROVED) {
            Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomId);
            if (studyRoomOpt.isPresent()) {
                StudyRoom studyRoom = studyRoomOpt.get();
                
                // 채팅방 멤버 추가
                ChatRoomMember chatMember = new ChatRoomMember();
                chatMember.setRoomId(studyRoom.getRoomId());
                chatMember.setMemberId(memberId);
                chatMember.setJoinedAt(LocalDateTime.now());
                
                chatRoomMemberDao.insertChatRoomMember(chatMember);
                
                log.info("스터디 승인 완료 및 채팅방 참가: studyRoomId={}, memberId={}, chatRoomId={}", 
                        studyRoomId, memberId, studyRoom.getRoomId());
            }
        }
        
        log.info("멤버 상태 업데이트 완료: studyRoomId={}, memberId={}, status={}", 
                studyRoomId, memberId, status);
    }
    
    @Override
    @Transactional
    public void leaveStudyRoom(Integer studyRoomId, Integer memberId) {
        // 1. 멤버 확인
        StudyRoomMember member = studyRoomMemberDao.selectStudyRoomMember(studyRoomId, memberId);
        if (member == null) {
            throw new RuntimeException("스터디에 참가하지 않은 사용자입니다.");
        }
        
        // 2. 방장은 탈퇴 불가
        if (member.getRole() == StudyRoomMember.MemberRole.BOSS) {
            throw new RuntimeException("방장은 스터디를 탈퇴할 수 없습니다.");
        }
        
        // 3. 스터디에서 제거
        studyRoomMemberDao.deleteStudyRoomMember(studyRoomId, memberId);
        
        // 4. 채팅방에서도 제거
        Optional<StudyRoom> studyRoomOpt = studyRoomDao.findById(studyRoomId);
        if (studyRoomOpt.isPresent()) {
            StudyRoom studyRoom = studyRoomOpt.get();
            chatRoomMemberDao.deleteChatRoomMember(studyRoom.getRoomId(), memberId);
            
            log.info("스터디 탈퇴 및 채팅방 퇴장: studyRoomId={}, memberId={}, chatRoomId={}", 
                    studyRoomId, memberId, studyRoom.getRoomId());
        }
        
        log.info("스터디 탈퇴 완료: studyRoomId={}, memberId={}", studyRoomId, memberId);
    }
    
    @Override
    public List<StudyRoomMemberDTO> getPendingMembers(Integer studyRoomId, Integer bossId) {
        // 방장 권한 확인
        if (!studyRoomMemberDao.isBoss(studyRoomId, bossId)) {
            throw new RuntimeException("방장만 대기 중인 멤버를 조회할 수 있습니다.");
        }
        
        List<StudyRoomMember> pendingMembers = studyRoomMemberDao.selectPendingMembers(studyRoomId);
        return pendingMembers.stream()
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean isMemberOfStudy(Integer studyRoomId, Integer memberId) {
        StudyRoomMember member = studyRoomMemberDao.selectStudyRoomMember(studyRoomId, memberId);
        return member != null && member.getStatus() == StudyRoomMember.MemberStatus.APPROVED;
    }

    // ========== front-server 연동을 위한 새로운 메서드들 ==========
    
    @Override
    public List<StudyRoomDTO> getHotStudyRooms(int limit) {
        // TODO: 실제 인기도 기준으로 정렬 (현재 멤버 수, 최근 활동 등)
        // 임시로 최근 생성된 스터디룸 중 인기 있는 것들 반환
        List<StudyRoom> hotStudyRooms = studyRoomDao.findHotStudyRooms(limit);
        return hotStudyRooms.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StudyRoomDTO> getStudyRoomsByMemberId(Integer memberId) {
        List<StudyRoom> studyRooms = studyRoomDao.findByMemberId(memberId);
        return studyRooms.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<StudyRoomDTO> getStudyRoomsByBossId(Integer bossId) {
        List<StudyRoom> studyRooms = studyRoomDao.findByBossId(bossId);
        return studyRooms.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ========== DTO 변환 메서드들 ==========

    private StudyRoomDTO convertToDTO(StudyRoom studyRoom) {
        StudyRoomDTO dto = new StudyRoomDTO();
        dto.setStudyRoomId(studyRoom.getStudyRoomId());
        dto.setRoomId(studyRoom.getRoomId());
        dto.setBossId(studyRoom.getBossId());
        dto.setTitle(studyRoom.getTitle());
        dto.setDescription(studyRoom.getDescription());
        dto.setEducation(studyRoom.getEducation());
        dto.setDepartment(studyRoom.getDepartment());
        dto.setRegion(studyRoom.getRegion());
        dto.setDistrict(studyRoom.getDistrict());
        dto.setCapacity(studyRoom.getCapacity());
        dto.setCurrentMembers(studyRoom.getCurrentMembers());
        dto.setTime(studyRoom.getTime());
        dto.setThumbnail(studyRoom.getThumbnail());
        dto.setIsPublic(studyRoom.getIsPublic());
        dto.setCreatedAt(studyRoom.getCreatedAt());
        
        // 방장 정보 설정 (이름 제거, 닉네임만 유지)
        dto.setBossNickname(studyRoom.getBossNickname());
        dto.setBossProfileImage(studyRoom.getBossProfileImage());
        
        return dto;
    }
    
    private StudyRoomMemberDTO convertToMemberDTO(StudyRoomMember member) {
        StudyRoomMemberDTO dto = new StudyRoomMemberDTO();
        dto.setId(member.getId());
        dto.setStudyRoomId(member.getStudyRoomId());
        dto.setMemberId(member.getMemberId());
        dto.setRole(member.getRole());
        dto.setStatus(member.getStatus());
        dto.setJoinedAt(member.getJoinedAt());
        dto.setApprovedAt(member.getApprovedAt());
        dto.setApprovedBy(member.getApprovedBy());
        
        // 멤버 정보 설정 (이름 제거, 닉네임만 유지)
        dto.setMemberNickname(member.getMemberNickname());
        dto.setMemberEmail(member.getMemberEmail());
        dto.setMemberProfileImage(member.getMemberProfileImage());
        dto.setMemberDescription(member.getMemberDescription());
        
        return dto;
    }
}
