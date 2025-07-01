
import express from 'express';
import {
  createRoom,
  deleteRoom,
  getRoomList,
  leaveRoom
} from '../controllers/rtcController.mjs';

const router = express.Router();

// 방 생성
router.post('/room', createRoom);

// 방 삭제
router.delete('/room/:roomId', deleteRoom);

// 방 목록 조회
router.get('/room', getRoomList); 

// 참가자 퇴장 처리
router.post('/room/leave', leaveRoom); 

export default router;
