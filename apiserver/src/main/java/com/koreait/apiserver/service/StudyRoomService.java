package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.StudyRoomDTO;
import com.koreait.apiserver.dto.StudyRoomMemberDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface StudyRoomService {
    List<StudyRoomDTO> getStudyRoomList();
    StudyRoomDTO getStudyRoom(Integer studyRoomId);
    StudyRoomDTO createStudyRoom(StudyRoomDTO studyRoomDTO);
    StudyRoomDTO updateStudyRoom(StudyRoomDTO studyRoomDTO);
    void deleteStudyRoom(Integer studyRoomId);
    List<StudyRoomDTO> getStudyRoomsByDepartment(String department);
    List<StudyRoomDTO> getStudyRoomsByRegion(String region);
    List<StudyRoomDTO> getStudyRoomsByTime(String time);
    void incrementCurrentMembers(Integer studyRoomId);
    void decrementCurrentMembers(Integer studyRoomId);
    void joinStudyRoom(Integer studyRoomId, Integer memberId);
    List<StudyRoomMemberDTO> getStudyRoomMembers(Integer studyRoomId);
    void updateMemberStatus(Integer studyRoomId, Integer memberId, String status, Integer bossId);
    void leaveStudyRoom(Integer studyRoomId, Integer memberId);
    List<StudyRoomMemberDTO> getPendingMembers(Integer studyRoomId, Integer bossId);
    boolean isMemberOfStudy(Integer studyRoomId, Integer memberId);
    
    // front-server 연동을 위한 새로운 메서드들
    List<StudyRoomDTO> getHotStudyRooms(int limit);
    List<StudyRoomDTO> getStudyRoomsByMemberId(Integer memberId);
    List<StudyRoomDTO> getStudyRoomsByBossId(Integer bossId);
}