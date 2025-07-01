import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

const socket = io('http://192.168.162.197:7600', { transports: ['websocket'] })

const Video = ({ userNickname = '익명', roomId: roomIdProp, onClose }) => {
  const { roomId: roomIdParam } = useParams()
  const roomId = roomIdProp || roomIdParam
  const safeNickname = userNickname || '익명'
  if (!roomId) return <div>방 ID가 없습니다</div>

  const localVideoRef = useRef(null)
  const screenShareRef = useRef(null)
  const [peers, setPeers] = useState({})
  const peerConnections = useRef({})
  const localStream = useRef(null)
  const [screenSharer, setScreenSharer] = useState(null)

  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('이 브라우저는 WebRTC를 지원하지 않습니다');
  return;}


        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localVideoRef.current.srcObject = localStream.current
        socket.emit('join', { roomId, nickname: safeNickname })

        socket.on('allUsers', users => {
          users.forEach(user => createOffer(user.socketId, user.nickname))
        })

        socket.on('getOffer', async data => {
          const pc = createPeerConnection(data.socketId, data.nickname)
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          socket.emit('sendAnswer', { sdp: answer, to: data.socketId })
        })

        socket.on('getAnswer', async data => {
          const pc = peerConnections.current[data.socketId]
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        })

        socket.on('getCandidate', async data => {
          const pc = peerConnections.current[data.socketId]
          if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        })

        socket.on('userExit', data => {
          const pc = peerConnections.current[data.socketId]
          if (pc) pc.close()
          delete peerConnections.current[data.socketId]
          setPeers(prev => {
            const updated = { ...prev }
            delete updated[data.socketId]
            return updated
          })
        })
      } catch (err) {
        console.error('❌ 초기화 실패:', err)
      }
    }

    const createPeerConnection = (socketId, nickname) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current)
      })

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('sendCandidate', { candidate: e.candidate, to: socketId })
        }
      }

      pc.ontrack = (e) => {
        setPeers(prev => ({
          ...prev,
          [socketId]: {
            stream: e.streams[0],
            nickname: nickname || '참여자'
          }
        }))
      }

      peerConnections.current[socketId] = pc
      return pc
    }

    const createOffer = async (socketId, nickname) => {
      const pc = createPeerConnection(socketId, nickname)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('sendOffer', { sdp: offer, to: socketId })
    }

    init()
    return () => {
      socket.disconnect()
      Object.values(peerConnections.current).forEach(pc => pc.close())
    }
  }, [roomId, safeNickname])

  useEffect(() => {
    if (isScreenSharing && screenShareRef.current && localVideoRef.current?.srcObject) {
      screenShareRef.current.srcObject = localVideoRef.current.srcObject
    }
  }, [isScreenSharing])

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setVideoOn(videoTrack.enabled)
    }
  }

  const toggleAudio = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setAudioOn(audioTrack.enabled)
    }
  }

const handleScreenShare = async () => {
  if (!isScreenSharing) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      // 👉 화면 공유를 localVideo에 바로 표시
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([screenTrack]);
      }

      // 👉 송신 트랙 교체
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setVideoOn(false); // 화면 공유 시 카메라 끄기
      setIsScreenSharing(true);
      setScreenSharer(userNickname);
    } catch (err) {
      console.error('❌ 화면 공유 실패:', err);
    }
  } else {
    stopScreenShare();
  }
};

const stopScreenShare = () => {
  setIsScreenSharing(false);
  setScreenSharer(null);
  setVideoOn(true);

  // 1. 공유 화면 트랙 stop
  const currentStream = localVideoRef.current?.srcObject;
  if (currentStream) {
    currentStream.getTracks().forEach(track => {
      if (track.kind === 'video' && track.label.toLowerCase().includes('screen')) {
        track.stop(); // 공유 트랙 중지
      }
    });
  }

  // 2. localStream을 새 MediaStream으로 감싸서 srcObject 교체
  const cameraTracks = localStream.current?.getTracks() || [];
  const newCameraStream = new MediaStream(cameraTracks);
  if (localVideoRef.current) {
    localVideoRef.current.srcObject = newCameraStream;
  }

  // 3. 피어에 다시 카메라 트랙 전송
  const videoTrack = localStream.current?.getVideoTracks()[0];
  Object.values(peerConnections.current).forEach(pc => {
    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
    if (sender && videoTrack) sender.replaceTrack(videoTrack);
  });
};

  return (
    <div className="video-container">
      <div className="video-header">
        <strong>방 번호:</strong> {roomId} <br />
        <strong>접속 주소:</strong> {`${window.location.origin}/webrtc/${roomId}`}
      </div>

      <div className="video-highlight">
        {isScreenSharing ? (
          <video ref={screenShareRef} autoPlay playsInline muted className="screen-video" />
        ) : (
          <>
            <video ref={localVideoRef} muted autoPlay playsInline className="local-video" />
            {!videoOn && <div className="nickname-overlay">{safeNickname}</div>}
          </>
        )}
      </div>

      <div className="video-grid-scroll">
        {Object.entries(peers).map(([peerId, info]) => (
          <div key={peerId} className="peer-box">
            <video
              ref={(el) => {
                if (el && info.stream) el.srcObject = info.stream
              }}
              autoPlay
              playsInline
              className="remote-video"
            />
            {!info.stream.getVideoTracks()[0].enabled && (
              <div className="nickname-overlay">{info.nickname}</div>
            )}
          </div>
        ))}
      </div>

      <div className="video-controls">
        <button onClick={toggleAudio}>{audioOn ? '🔈 마이크 끄기' : '🔇 마이크 켜기'}</button>
        <button onClick={toggleVideo}>{videoOn ? '📷 카메라 끄기' : '📴 카메라 켜기'}</button>
        <button onClick={handleScreenShare}>{isScreenSharing ? '🛑 공유 중지' : '🖥️ 화면 공유'}</button>
        <button onClick={onClose || (() => window.history.back())}>❌ 나가기</button>
      </div>

      <style>{`
        .video-container {
          padding: 1rem;
          background: #111;
          color: #fff;
          min-height: 100vh;
        }
        .video-header {
          text-align: center;
          padding: 10px;
          font-size: 18px;
          color: #0a84ff;
        }
        .video-highlight {
          position: relative;
          width: 100%;
          height: 400px;
          background: #000;
        }
        .screen-video, .local-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }
        .nickname-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          font-size: 20px;
          background: rgba(0,0,0,0.5);
          padding: 8px 16px;
          border-radius: 8px;
        }
        .video-grid-scroll {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          margin-top: 1rem;
        }
        .peer-box {
          position: relative;
          min-width: 250px;
          height: 200px;
          background: #000;
        }
        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }
        .video-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 1rem;
        }
        .video-controls button {
          background: #333;
          color: #fff;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .video-controls button:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}

export default Video
