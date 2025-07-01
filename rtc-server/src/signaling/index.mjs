import { roomManager } from '../sfu/roomManager.mjs'

export const handleConnection = (socket) => {
  socket.on('join', ({ roomId, nickname }) => {
    // 방이 없으면 생성 후 방장 지정
    if (!roomManager.getRoom(roomId)) {
      roomManager.createRoom(roomId)
      roomManager.setHost(roomId, socket.id)
    }

    const success = roomManager.joinRoom(roomId, socket, nickname)
    if (!success) {
      socket.emit('room-full')
      return
    }

    const peers = roomManager.getPeers(roomId)
    socket.emit('peer-list', peers)

    // 나를 제외한 다른 참가자에게 새 참가자 알림
    peers.forEach(({ id }) => {
      if (id !== socket.id) {
        const peerSocket = roomManager.getSocketById(roomId, id)
        peerSocket?.emit('peer-joined', { id: socket.id, nickname })
      }
    })

    // 연결 종료 처리
    socket.on('disconnect', () => {
      const hostId = roomManager.getHost(roomId)

      roomManager.leaveRoom(roomId, socket.id)

      // 방장이 나갔으면 방 삭제
      if (socket.id === hostId) {
        roomManager.deleteRoom(roomId)
      } else {
        // 다른 유저에게 나간 사람 알림
        const remainingPeers = roomManager.getPeers(roomId)
        remainingPeers.forEach(({ id }) => {
          const peerSocket = roomManager.getSocketById(roomId, id)
          peerSocket?.emit('peer-left', socket.id)
        })
      }
    })
  })
}
