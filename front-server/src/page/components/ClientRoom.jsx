import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import ScreenShareBox from './ScreenShareBox';
import ChatBox from './rtc/ChatBox';
import './ClientRoomUI.scss';

const ClientRoom = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  const nickname = urlParams.get('name');

  const [peers, setPeers] = useState([]);
  const [status, setStatus] = useState({});
  const [socket, setSocket] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  const myVideo = useRef();
  const myStream = useRef();
  const peerVideos = useRef({});
  const peerConnections = useRef({});

  useEffect(() => {
    if (!room || !nickname) {
      alert('잘못된 접근입니다.');
      window.location.href = '/';
      return;
    }

    const s = io();
    setSocket(s);

    s.emit('join', { roomId: room, nickname });

    s.on('room-full', () => {
      alert('입장 인원 초과');
      window.location.href = '/';
    });

    s.on('peer-list', (peerList) => {
      setPeers(peerList);
    });

    s.on('rtc-message', async (msg) => {
      const { from, event, data } = JSON.parse(msg);
      const pc = peerConnections.current[from] || (await createPeerConnection(from));

      if (event === 'offer') {
        await pc.setRemoteDescription(data);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', answer, from);
      } else if (event === 'answer') {
        await pc.setRemoteDescription(data);
      } else if (event === 'candidate') {
        await pc.addIceCandidate(data);
      } else if (event === 'status') {
        setStatus((prev) => ({ ...prev, [from]: data }));
      }
    });

    s.on('peer-left', (peerId) => {
      delete peerConnections.current[peerId];
      delete peerVideos.current[peerId];
      setPeers((prev) => prev.filter((p) => p.id !== peerId));
    });

    initMedia().then(() => {
      s.emit('ready', { roomId: room });
    });

    return () => s.disconnect();
  }, []);

  const initMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    myStream.current = stream;
    if (myVideo.current) myVideo.current.srcObject = stream;
  };

  const createPeerConnection = async (peerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnections.current[peerId] = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal('candidate', e.candidate, peerId);
    };

    pc.ontrack = (e) => {
      const video = peerVideos.current[peerId];
      if (video) video.srcObject = e.streams[0];
    };

    myStream.current.getTracks().forEach((track) => pc.addTrack(track, myStream.current));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal('offer', offer, peerId);
    return pc;
  };

  const sendSignal = (event, data, to) => {
    socket.emit('rtc-message', JSON.stringify({ roomId: room, event, data, to }));
  };

  const toggleCamera = () => {
    const track = myStream.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      notifyStatus();
    }
  };

  const toggleMic = () => {
    const track = myStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      notifyStatus();
    }
  };

  const notifyStatus = () => {
    const data = {
      camera: myStream.current?.getVideoTracks()[0]?.enabled,
      mic: myStream.current?.getAudioTracks()[0]?.enabled,
    };
    peers.forEach(({ id }) => sendSignal('status', data, id));
  };

  const leaveRoom = () => {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    socket?.disconnect();
    window.location.href = '/';
  };

  return (
    <div className="client-room-wrapper">
      <h2>Room: {room} / Nickname: {nickname}</h2>

      <div className="button-group">
        <button onClick={toggleCamera}>카메라 토글</button>
        <button onClick={toggleMic}>마이크 토글</button>
        <button onClick={leaveRoom}>방 나가기</button>
      </div>

      <ScreenShareBox
        localStream={myStream.current}
        screenStream={screenStream}
        setScreenStream={setScreenStream}
        peers={peerConnections.current}
      />

      <div className="video-section">
        <div className="video-box">
          <div className="video-nickname">나</div>
          <video ref={myVideo} autoPlay muted playsInline width="300" height="200" />
        </div>
        {peers.map(({ id, nickname }) => (
          <div className="video-box" key={id}>
            <div className="video-nickname">{nickname}</div>
            <video ref={(el) => (peerVideos.current[id] = el)} autoPlay playsInline width="300" height="200" />
            <div className="video-status">
              카메라: {status[id]?.camera ? 'ON' : 'OFF'} / 마이크: {status[id]?.mic ? 'ON' : 'OFF'}
            </div>
          </div>
        ))}
      </div>

      <ChatBox socket={socket} nickname={nickname} />
    </div>
  );
};

export default ClientRoom;
