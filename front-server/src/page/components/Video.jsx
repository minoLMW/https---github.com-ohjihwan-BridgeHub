import React from "react"
import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import * as mediasoupClient from "mediasoup-client"
import "../../scss/Video.css"


const Video = ({ onClose, userNickname, roomId }) => {
  // 상태 관리
  const [device, setDevice] = useState(null)
  const [socket, setSocket] = useState(null)
  const [sendTransport, setSendTransport] = useState(null)
  const [recvTransport, setRecvTransport] = useState(null)
  const [producer, setProducer] = useState(null)
  const [audioProducer, setAudioProducer] = useState(null)
  const [consumers, setConsumers] = useState(new Map())
  const [peers, setPeers] = useState([])
  const [localStream, setLocalStream] = useState(null)

  // 컨트롤 상태
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  // UI 상태
  const [connectionStatus, setConnectionStatus] = useState("연결 중...")
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  // 참조
  const localVideoRef = useRef(null)
  const remoteVideosRef = useRef(new Map())
  const screenStreamRef = useRef(null)

  // 서버 URL 자동 감지
  const getServerURL = () => {
    const hostname = window.location.hostname
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:7600"
    }
    return `http://${hostname}:7600`
  }

  useEffect(() => {
    if (!roomId || !userNickname) return

    initializeRTC()
    return cleanup
  }, [roomId, userNickname])

  const initializeRTC = async () => {
    try {
      setConnectionStatus("RTC 서버에 연결 중...")
      setError(null)

      // 토큰 가져오기
      const token = localStorage.getItem("token") || localStorage.getItem("bridgehub_token") || "development-token"

      console.log("🔑 사용할 토큰:", token)

      // 소켓 연결
      const rtcSocket = io(getServerURL(), {
        auth: { token },
        transports: ["websocket", "polling"],
        timeout: 10000,
      })

      setSocket(rtcSocket)

      // 연결 성공
      rtcSocket.on("connect", async () => {
        console.log("✅ RTC 서버 연결 성공")
        setIsConnected(true)
        setConnectionStatus("미디어 초기화 중...")

        try {
          // Mediasoup Device 초기화
          const dev = new mediasoupClient.Device()

          // Router RTP Capabilities 가져오기
          const rtpCapabilities = await socketRequest(rtcSocket, "getRouterRtpCapabilities")
          await dev.load({ routerRtpCapabilities: rtpCapabilities.routerRtpCapabilities })
          setDevice(dev)

          setConnectionStatus("방 참가 중...")

          // 방 참가
          const joinResult = await socketRequest(rtcSocket, "joinRoom", {
            roomId,
            rtpCapabilities: dev.rtpCapabilities,
          })

          // Send Transport 설정
          const transport = dev.createSendTransport(joinResult.transport)
          setupTransportEvents(transport, rtcSocket)
          setSendTransport(transport)

          // 기존 참가자들 설정
          setPeers(joinResult.peers || [])

          setConnectionStatus("카메라 시작 중...")
          await startLocalMedia()

          setConnectionStatus("연결 완료!")
          setTimeout(() => setConnectionStatus(""), 2000)
        } catch (error) {
          console.error("초기화 오류:", error)
          setError(`초기화 실패: ${error.message}`)
          setConnectionStatus("초기화 실패")
        }
      })

      // 연결 오류
      rtcSocket.on("connect_error", (err) => {
        console.error("RTC 연결 오류:", err)
        setError("RTC 서버 연결 실패")
        setConnectionStatus("연결 실패")
      })

      // 새 참가자 입장
      rtcSocket.on("peerJoined", (data) => {
        console.log("👤 새 참가자:", data.nickname)
        setPeers((prev) => [...prev, data])
      })

      // 참가자 퇴장
      rtcSocket.on("peerLeft", (data) => {
        console.log("👋 참가자 퇴장:", data.peerId)
        setPeers((prev) => prev.filter((p) => p.id !== data.peerId))

        // 해당 참가자의 비디오 제거
        const videoElement = remoteVideosRef.current.get(data.peerId)
        if (videoElement && videoElement.parentNode) {
          videoElement.parentNode.removeChild(videoElement)
          remoteVideosRef.current.delete(data.peerId)
        }
      })

      // 새 Producer 감지
      rtcSocket.on("newProducer", async (data) => {
        console.log("🎬 새 Producer:", data)
        await handleConsume(rtcSocket, data.producerId, data.peerId, data.kind)
      })
    } catch (error) {
      console.error("RTC 초기화 실패:", error)
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
        const { id } = await socketRequest(socket, "produce", {
          kind,
          rtpParameters,
        })
        callback({ id })
      } catch (error) {
        errback(error)
      }
    })
  }

  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // 비디오 Producer 생성
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack && sendTransport) {
        const videoProducer = await sendTransport.produce({ track: videoTrack })
        setProducer(videoProducer)
        console.log("🎬 비디오 Producer 생성:", videoProducer.id)
      }

      // 오디오 Producer 생성
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack && sendTransport) {
        const audioProducerObj = await sendTransport.produce({ track: audioTrack })
        setAudioProducer(audioProducerObj)
        console.log("🎤 오디오 Producer 생성:", audioProducerObj.id)
      }
    } catch (error) {
      console.error("로컬 미디어 시작 실패:", error)
      setError("카메라/마이크 접근 실패")
    }
  }

  const handleConsume = async (socket, producerId, peerId, kind) => {
    try {
      if (!device) {
        console.warn("Device가 준비되지 않음")
        return
      }

      const consumeResult = await socketRequest(socket, "consume", { producerId })

      // Recv Transport 설정
      if (!recvTransport) {
        const transport = device.createRecvTransport(consumeResult.transport)

        transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            await socketRequest(socket, "connectTransport", { dtlsParameters })
            callback()
          } catch (error) {
            errback(error)
          }
        })

        setRecvTransport(transport)
      }

      // Consumer 생성
      const consumer = await (recvTransport || device.createRecvTransport(consumeResult.transport)).consume({
        id: consumeResult.id,
        producerId,
        kind: consumeResult.kind,
        rtpParameters: consumeResult.rtpParameters,
      })

      setConsumers((prev) => new Map(prev.set(producerId, consumer)))

      // 비디오인 경우 화면에 표시
      if (kind === "video") {
        createRemoteVideoElement(consumer, peerId)
      }

      // Consumer 재개
      await socketRequest(socket, "resumeConsumer", { consumerId: consumer.id })

      console.log(`🍿 Consumer 생성 완료: ${peerId} (${kind})`)
    } catch (error) {
      console.error("Consumer 생성 실패:", error)
    }
  }

  const createRemoteVideoElement = (consumer, peerId) => {
    const stream = new MediaStream([consumer.track])

    // 기존 비디오 제거
    const existingVideo = remoteVideosRef.current.get(peerId)
    if (existingVideo && existingVideo.parentNode) {
      existingVideo.parentNode.removeChild(existingVideo)
    }

    // 새 비디오 엘리먼트 생성
    const videoElement = document.createElement("video")
    videoElement.srcObject = stream
    videoElement.autoplay = true
    videoElement.playsInline = true
    videoElement.muted = false
    videoElement.className = "remote-video"
    videoElement.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      background: #000;
    `

    // 컨테이너 생성
    const container = document.createElement("div")
    container.className = "remote-video-container"
    container.style.cssText = `
      position: relative;
      width: 300px;
      height: 200px;
      margin: 10px;
      border-radius: 8px;
      overflow: hidden;
      background: #333;
    `

    // 라벨 추가
    const label = document.createElement("div")
    label.textContent = peers.find((p) => p.id === peerId)?.nickname || peerId
    label.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      z-index: 1;
    `

    container.appendChild(videoElement)
    container.appendChild(label)

    // 원격 비디오 컨테이너에 추가
    const remoteContainer = document.getElementById("remote-videos-container")
    if (remoteContainer) {
      remoteContainer.appendChild(container)
      remoteVideosRef.current.set(peerId, container)
    }
  }

  const toggleVideo = async () => {
    if (!localStream) return

    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setVideoOn(videoTrack.enabled)

      if (producer) {
        if (videoTrack.enabled) {
          await producer.resume()
        } else {
          await producer.pause()
        }
      }
    }
  }

  const toggleAudio = async () => {
    if (!localStream) return

    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setAudioOn(audioTrack.enabled)

      if (audioProducer) {
        if (audioTrack.enabled) {
          await audioProducer.resume()
        } else {
          await audioProducer.pause()
        }
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // 화면 공유 시작
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true,
        })

        screenStreamRef.current = displayStream
        setIsScreenSharing(true)

        // 기존 비디오 Producer 교체
        const videoTrack = displayStream.getVideoTracks()[0]
        if (videoTrack && producer) {
          await producer.replaceTrack({ track: videoTrack })
        }

        // 화면 공유 종료 감지
        videoTrack.onended = () => {
          stopScreenShare()
        }

        console.log("✅ 화면 공유 시작")
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error("❌ 화면 공유 오류:", err)
      setError("화면 공유에 실패했습니다")
    }
  }

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
      screenStreamRef.current = null
    }

    // 원래 카메라로 복원
    if (localStream && producer) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        await producer.replaceTrack({ track: videoTrack })
      }
    }

    setIsScreenSharing(false)
    console.log("✅ 화면 공유 종료")
  }

  const cleanup = () => {
    console.log("🧹 Video 컴포넌트 정리 중...")

    // 로컬 스트림 정리
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    // 화면 공유 스트림 정리
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop())
    }

    // Producer 정리
    if (producer) producer.close()
    if (audioProducer) audioProducer.close()

    // Consumer 정리
    consumers.forEach((consumer) => consumer.close())

    // Transport 정리
    if (sendTransport) sendTransport.close()
    if (recvTransport) recvTransport.close()

    // 소켓 정리
    if (socket) socket.disconnect()

    // 원격 비디오 엘리먼트 정리
    remoteVideosRef.current.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    remoteVideosRef.current.clear()
  }

  const socketRequest = (socket, event, data = {}) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${event} 요청 시간 초과`))
      }, 10000)

      socket.emit(event, data, (response) => {
        clearTimeout(timeout)
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  // 연결 중 화면
  if (!isConnected) {
    return (
      <div className="video-rtc-loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">{connectionStatus}</p>
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={initializeRTC} className="retry-btn">
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="video-rtc">
      {/* 헤더 */}
      <header className="video-rtc__header">
        <div className="header-info">
          <h2>🎥 화상회의 - {roomId}</h2>
          <span className="participant-count">👥 {peers.length + 1}/10명</span>
          {connectionStatus && <span className="connection-status">{connectionStatus}</span>}
        </div>
        <button onClick={onClose} className="close-btn" title="통화 종료">
          ✕
        </button>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* 메인 비디오 영역 */}
      <div className="video-rtc__main">
        {/* 로컬 비디오 */}
        <div className="local-video-section">
          <div className="local-video-container">
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className={`local-video ${!videoOn ? "video-off" : ""}`}
            />
            <div className="video-label">
              {userNickname} (나)
              {isScreenSharing && <span className="screen-badge">🖥️ 화면공유</span>}
              {!videoOn && <span className="video-off-badge">📷 꺼짐</span>}
              {!audioOn && <span className="audio-off-badge">🎤 꺼짐</span>}
            </div>
          </div>
        </div>

        {/* 원격 비디오들 */}
        <div id="remote-videos-container" className="remote-videos-container">
          {peers.length === 0 && (
            <div className="no-peers-message">
              <p>👥 다른 참가자를 기다리는 중...</p>
              <p>다른 기기에서 같은 방 ID로 접속해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="video-rtc__controls">
        <button onClick={toggleVideo} className={`control-btn ${videoOn ? "active" : "inactive"}`} title="비디오 토글">
          {videoOn ? "📹" : "📹❌"}
        </button>

        <button onClick={toggleAudio} className={`control-btn ${audioOn ? "active" : "inactive"}`} title="오디오 토글">
          {audioOn ? "🎤" : "🎤❌"}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`control-btn ${isScreenSharing ? "active" : ""}`}
          title="화면 공유"
        >
          {isScreenSharing ? "🖥️✅" : "🖥️"}
        </button>

        <button onClick={onClose} className="control-btn end-call" title="통화 종료">
          📞 종료
        </button>
      </div>
    </div>
  )
}

export default Video
