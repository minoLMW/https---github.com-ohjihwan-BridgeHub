import React, { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import * as mediasoupClient from "mediasoup-client"

const Video = ({ onClose, userNickname, roomId }) => {
  const [device, setDevice] = useState(null)
  const [socket, setSocket] = useState(null)
  const [sendTransport, setSendTransport] = useState(null)
  const [recvTransport, setRecvTransport] = useState(null)
  const [producer, setProducer] = useState(null)
  const [audioProducer, setAudioProducer] = useState(null)
  const [consumers, setConsumers] = useState(new Map())
  const [peers, setPeers] = useState([])
  const [localStream, setLocalStream] = useState(null)

  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenSharerId, setScreenSharerId] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("연결 중...")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  const localVideoRef = useRef(null)
  const remoteVideosRef = useRef(new Map())
  const screenStreamRef = useRef(null)

  const getServerURL = () => {
    const hostname = window.location.hostname
    return hostname === "localhost" || hostname === "127.0.0.1"
      ? "http://localhost:7600"
      : `http://${hostname}:7600`
  }

  useEffect(() => {
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream)
        console.log("✅ getUserMedia 성공!", stream)
      })
      .catch((err) => {
        console.error("❌ getUserMedia 실패:", err)
        setError("카메라/마이크 접근 실패")
      })
  } else {
    console.warn("⚠️ navigator.mediaDevices.getUserMedia를 지원하지 않는 환경입니다.")
    setError("이 브라우저는 WebRTC를 지원하지 않습니다.")
  }
}, [])

  useEffect(() => {
    if (!roomId || !userNickname) return
    initializeRTC()
    return cleanup
  }, [roomId, userNickname])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (sendTransport && localStream) {
      startLocalMedia()
    }
  }, [sendTransport])

  const initializeRTC = async () => {
    try {
      setConnectionStatus("RTC 서버에 연결 중...")
      setError(null)

      const token = localStorage.getItem("token") || "dev-token"
      const rtcSocket = io(getServerURL(), {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 10000,
      })
      setSocket(rtcSocket)

      rtcSocket.on("connect", async () => {
        setIsConnected(true)
        setConnectionStatus("미디어 초기화 중...")

        try {
          const dev = new mediasoupClient.Device()
          const rtpCapabilities = await socketRequest(rtcSocket, "getRouterRtpCapabilities")
          await dev.load({ routerRtpCapabilities: rtpCapabilities.routerRtpCapabilities })
          setDevice(dev)

          setConnectionStatus("방 참가 중...")
          const joinResult = await socketRequest(rtcSocket, "joinRoom", {
            roomId,
            rtpCapabilities: dev.rtpCapabilities,
          })

          const sendTrans = dev.createSendTransport(joinResult.transport)
          setupTransportEvents(sendTrans, rtcSocket)
          setSendTransport(sendTrans)
          setPeers(joinResult.peers || [])
          setConnectionStatus("연결 완료!")
          setTimeout(() => setConnectionStatus(""), 2000)
        } catch (error) {
          setError(`초기화 실패: ${error.message}`)
          setConnectionStatus("초기화 실패")
        }
      })

      rtcSocket.on("connect_error", () => {
        setError("RTC 서버 연결 실패")
        setConnectionStatus("연결 실패")
      })

      rtcSocket.on("peerJoined", (data) => setPeers((prev) => [...prev, data]))

      rtcSocket.on("peerLeft", (data) => {
        setPeers((prev) => prev.filter((p) => p.id !== data.peerId))
        const videoEl = remoteVideosRef.current.get(data.peerId)
        if (videoEl?.parentNode) videoEl.parentNode.removeChild(videoEl)
        remoteVideosRef.current.delete(data.peerId)
      })

      rtcSocket.on("newProducer", async (data) => {
        if (data.kind === "video" && data.trackLabel?.toLowerCase().includes("screen")) {
          setScreenSharerId(data.peerId)
        }
        await handleConsume(rtcSocket, data.producerId, data.peerId, data.kind)
      })
    } catch (error) {
      setError(`초기화 실패: ${error.message}`)
      setConnectionStatus("초기화 실패")
    }
  }

  const setupTransportEvents = (transport, socket) => {
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await socketRequest(socket, "connectTransport", { dtlsParameters })
        callback()
      } catch (error) {
        errback(error)
      }
    })

    transport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
      try {
        const { id } = await socketRequest(socket, "produce", { kind, rtpParameters })
        callback({ id })
      } catch (error) {
        errback(error)
      }
    })
  }

  const startLocalMedia = async () => {
    try {
      const videoTrack = localStream.getVideoTracks()[0]
      const audioTrack = localStream.getAudioTracks()[0]

      if (videoTrack && sendTransport) {
        const videoProducer = await sendTransport.produce({ track: videoTrack })
        setProducer(videoProducer)
      }

      if (audioTrack && sendTransport) {
        const audioProducerObj = await sendTransport.produce({ track: audioTrack })
        setAudioProducer(audioProducerObj)
      }
    } catch (error) {
      console.error("❌ 로컬 미디어 시작 실패:", error)
      setError("비디오/오디오 송출 실패")
    }
  }

  const handleConsume = async (socket, producerId, peerId, kind) => {
    try {
      if (!device || !recvTransport) {
        const recvTrans = device.createRecvTransport(await socketRequest(socket, "createRecvTransport"))
        setupTransportEvents(recvTrans, socket)
        setRecvTransport(recvTrans)
      }

      const { id, kind, rtpParameters } = await socketRequest(socket, "consume", {
        producerId,
        rtpCapabilities: device.rtpCapabilities,
      })

      const consumer = await recvTransport.consume({ id, producerId, kind, rtpParameters })

      const stream = new MediaStream([consumer.track])
      const videoEl = document.createElement("video")
      videoEl.srcObject = stream
      videoEl.autoplay = true
      videoEl.playsInline = true
      videoEl.style.width = "100%"
      videoEl.style.borderRadius = "10px"

      remoteVideosRef.current.set(peerId, videoEl)
      setConsumers((prev) => new Map(prev.set(consumer.id, consumer)))
    } catch (err) {
      console.error("consume 실패", err)
    }
  }

  const toggleVideo = () => {
    const track = localStream?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setVideoOn(track.enabled)
    }
  }

  const toggleAudio = () => {
    const track = localStream?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setAudioOn(track.enabled)
    }
  }

  const toggleScreenShare = async () => {
  // 중지할 경우
  if (isScreenSharing) {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    setIsScreenSharing(false)
    setScreenSharerId(null)

    // 로컬 카메라 다시 보이게
    setVideoOn(true)
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }

    return
  }

  // 시작할 경우
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
    const screenTrack = screenStream.getVideoTracks()[0]

    // 기존 비디오 끄고 화면 공유만 표시
    setVideoOn(false)
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream
    }

    // produce로 전송
    if (sendTransport) {
      await sendTransport.produce({ track: screenTrack })
    }

    screenStreamRef.current = screenStream
    setIsScreenSharing(true)

    // 공유 종료 이벤트 감지
    screenTrack.onended = () => {
      toggleScreenShare()
    }

  } catch (err) {
    console.error("❌ 화면 공유 실패:", err)
    setError("화면 공유 권한이 거부되었습니다.")
  }
}

  const cleanup = () => {
    localStream?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    producer?.close()
    audioProducer?.close()
    consumers.forEach((c) => c.close())
    sendTransport?.close()
    recvTransport?.close()
    socket?.disconnect()
    remoteVideosRef.current.forEach((el) => el?.parentNode?.removeChild(el))
    remoteVideosRef.current.clear()
  }

  const socketRequest = (socket, event, data = {}) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`${event} 요청 시간 초과`)), 10000)
      socket.emit(event, data, (response) => {
        clearTimeout(timeout)
        response.error ? reject(new Error(response.error)) : resolve(response)
      })
    })
  }

  return (
    <div className="video-rtc">
      <style>{`
        .video-rtc__main {
            padding: 10px;
            max-width: 100%;
          }
          .screen-share-wrapper {
            width: 100%;
            height: 400px;
            background: #000;
            margin-bottom: 20px;
            border: 2px solid #0a84ff;
            border-radius: 10px;
            overflow: hidden;
          }
          .remote-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
            justify-items: center;
            align-items: center;
          }
          video {
            border-radius: 10px;
            background: #000;
            width: 100%;
            height: auto;
            max-height: 250px;
            object-fit: cover;
          }
          .video-rtc__controls {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
            gap: 10px;
          }
          button {
            padding: 8px 12px;
            font-size: 14px;
            border: none;
            border-radius: 6px;
            background: #0a84ff;
            color: white;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover {
            background: #006fd6;
          }
      `}</style>

      <video ref={localVideoRef} muted autoPlay playsInline style={{ width: '100%', height: '300px', objectFit: 'cover', backgroundColor: '#000' }} />

      <div className="video-rtc__main">
        {screenSharerId && remoteVideosRef.current.get(screenSharerId) && (
          <div className="screen-share-wrapper">
            {remoteVideosRef.current.get(screenSharerId)}
          </div>
        )}
        <div className="remote-grid">
          {[...remoteVideosRef.current.entries()].map(([peerId, el]) =>
            peerId !== screenSharerId ? el : null
          )}
        </div>
      </div>

      <div className="video-rtc__controls">
        <button onClick={toggleVideo}>{videoOn ? '📷 비디오 끄기' : '📷 비디오 켜기'}</button>
        <button onClick={toggleAudio}>{audioOn ? '🎤 음소거' : '🎤 마이크 켜기'}</button>
        <button onClick={toggleScreenShare}>{isScreenSharing ? '🛑 공유 중지' : '🖥️ 화면 공유'}</button>
        <button onClick={onClose}>📞 나가기</button>
      </div>
    </div>
  )
}

export default Video
