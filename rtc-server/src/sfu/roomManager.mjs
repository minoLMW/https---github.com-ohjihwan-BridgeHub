// src/sfu/roomManager.mjs

import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
dotenv.config()


class RoomManager {
  constructor() {
    this.rooms = new Map() // { roomId: { peers: Map<socketId, { socket, nickname }>, createdAt } }
  }

    // 방 ID가 없으면 새로 생성하고, 있으면 기존 방을 반환
  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        peers: new Map(),
        createdAt: new Date(),
        maxPeers: parseInt(process.env.MAX_PEERS || 10)
      })
    }
  }

  // 방에 입장 시 소켓과 닉네임 등록
  joinRoom(roomId, socket, nickname) {
    const room = this.rooms.get(roomId)
    if (!room) return false
    if (room.peers.size >= room.maxPeers) return false

    room.peers.set(socket.id, { socket, nickname })
    return true
  }

  // 퇴장 시 소켓 제거, 아무도 없으면 방 삭제
  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId)
    if (room) {
      room.peers.delete(socketId)
      if (room.peers.size === 0) this.rooms.delete(roomId)
    }
  }

  // 연결된 peer의 ID + nickname 목록 반환
  getPeers(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) return []
    return Array.from(room.peers.entries()).map(([id, { nickname }]) => ({ id, nickname }))
  }

  // 특정 소켓 ID로 소켓 객체 반환
  getSocketById(roomId, socketId) {
    const room = this.rooms.get(roomId)
    return room?.peers.get(socketId)?.socket || null
  }



  getNicknames(roomId) {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room.peers.values()).map(p => p.nickname) : []
  }

  getRoom(roomId) {
  return this.rooms.get(roomId)
}

setHost(roomId, socketId) {
  const room = this.rooms.get(roomId)
  if (room) room.host = socketId
}

getHost(roomId) {
  return this.rooms.get(roomId)?.host
}
}



export const roomManager = new RoomManager()
