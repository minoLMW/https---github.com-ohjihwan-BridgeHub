import  RoomManager  from '../sfu/roomManager.mjs';

export const handleSocketEvents = (io, socket) => {
  socket.on('join', ({ roomId, nickname }) => {
    if (!RoomManager.getRoom(roomId)) {
      RoomManager.createRoom(roomId);
      RoomManager.setHost(roomId, socket.id);
    }

    const success = RoomManager.joinRoom(roomId, socket, nickname);
    if (!success) {
      socket.emit('room-full');
      return;
    }

    socket.data.roomId = roomId;
    socket.data.nickname = nickname;

    // 본인에게 현재 peer 목록 전송
    const peers = RoomManager.getPeers(roomId);
    socket.emit('peer-list', peers);

    // 다른 사용자에게 새 유저 참여 알림
    peers.forEach(({ id }) => {
      if (id !== socket.id) {
        const peerSocket = RoomManager.getSocketById(roomId, id);
        peerSocket?.emit('peer-joined', { id: socket.id, nickname });
      }
    });
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

    const hostId = RoomManager.getHost(roomId);
    RoomManager.leaveRoom(roomId, socket.id);

    if (socket.id === hostId) {
      RoomManager.deleteRoom(roomId);
    } else {
      const peers = RoomManager.getPeers(roomId);
      peers.forEach(({ id }) => {
        const peerSocket = RoomManager.getSocketById(roomId, id);
        peerSocket?.emit('peer-left', { id: socket.id });
      });
    }
  });
};
