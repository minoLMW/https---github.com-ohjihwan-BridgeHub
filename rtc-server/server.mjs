import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import rtcRoutes from './routes/rtcRoutes.mjs';
import { handleChatSocket } from './signaling/chatHandler.mjs';
import { handleScreenSocket } from './signaling/screenHandler.mjs';
import { roomManager } from './sfu/roomManager.mjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/rtc', rtcRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, nickname }) => {
    // 방 생성 + 방장 지정
    if (!roomManager.getRoom(roomId)) {
      roomManager.createRoom(roomId);
      roomManager.setHost(roomId, socket.id);
    }

    const success = roomManager.joinRoom(roomId, socket, nickname);
    if (!success) {
      socket.emit('room-full');
      return;
    }

    socket.data.roomId = roomId;
    socket.data.nickname = nickname;

    // 참가자 목록 보내기
    const peers = roomManager.getPeers(roomId);
    socket.emit('peer-list', peers);

    // 나 빼고 알림
    peers.forEach(({ id }) => {
      if (id !== socket.id) {
        const peerSocket = roomManager.getSocketById(roomId, id);
        peerSocket?.emit('peer-joined', { id: socket.id, nickname });
      }
    });

    // 채팅/화면 공유 socket 핸들러
    handleChatSocket(io, socket);
    handleScreenSocket(io, socket);
  });

  socket.on('rtc-message', (msg) => {
    const { roomId, event, data } = JSON.parse(msg);
    socket.to(roomId).emit('rtc-message', JSON.stringify({
      event,
      data,
      from: socket.id,
    }));
  });

  socket.on('chat-message', (msg) => {
    const { roomId, ...rest } = JSON.parse(msg);
    io.to(roomId).emit('chat-message', JSON.stringify(rest));
  });

  socket.on('disconnect', () => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const hostId = roomManager.getHost(roomId);
    roomManager.leaveRoom(roomId, socket.id);

    if (socket.id === hostId) {
      // 방장 나가면 방 전체 삭제
      roomManager.deleteRoom(roomId);
    } else {
      // 나머지 참가자에게 알림
      const peers = roomManager.getPeers(roomId);
      peers.forEach(({ id }) => {
        const peerSocket = roomManager.getSocketById(roomId, id);
        peerSocket?.emit('peer-left', { id: socket.id });
      });
    }
  });
});

const PORT = 7600;
httpServer.listen(PORT, () => {
  console.log(`RTC 서버 실행 중: http://localhost:${PORT}`);
});
