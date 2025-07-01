import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@dev/hooks/useSocket';

const Detail = ({ room, isClosing, onClose }) => {
	const [isActive, setIsActive] = useState(false);
	const classNames = ['detail'];
	if (isActive) {
		classNames.push('detail--active');
		document.body.style.overflow = 'hidden';
	}
	if (isClosing) {
		classNames.push('detail--closing');
		document.body.style.overflow = '';
	}
	
	useEffect(() => {
		if (!isClosing) {
			const timer = setTimeout(() => {
				setIsActive(true);
			}, 0);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);

	const navigate = useNavigate();
	const { socketService } = useSocket(); // 소켓 서비스 접근

	// JWT 토큰에서 사용자 정보 추출
	const extractUserFromToken = (token) => {
		try {
			if (!token) {
				console.warn('토큰이 없습니다');
				return null;
			}

			const parts = token.split('.');
			if (parts.length !== 3) {
				console.warn('잘못된 JWT 토큰 형식입니다');
				return null;
			}

			// Base64 URL-safe 디코딩을 위한 패딩 추가
			let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
			while (base64.length % 4) {
				base64 += '=';
			}

			const payload = JSON.parse(atob(base64));
			return {
				userId: payload.userId || payload.username,
				username: payload.username,
				memberId: payload.memberId
			};
		} catch (error) {
			console.warn('토큰에서 사용자 정보 추출 실패:', error);
			return null;
		}
	};

	if (!room) return null;

	const handleJoinStudy = async () => {
		// 현재 사용자 정보 확인
		const token = localStorage.getItem('token');
		if (!token) {
			alert('로그인이 필요합니다.');
			navigate('/login');
			return;
		}

		const userInfo = extractUserFromToken(token);
		if (!userInfo) {
			alert('사용자 인증에 실패했습니다. 다시 로그인해주세요.');
			navigate('/login');
			return;
		}
		
		// 방장인지 확인
		if (room.bossId === userInfo.userId) {
			// 방장이면 바로 입장
			navigate('/chat', { 
				state: { 
					studyRoom: { 
						studyRoomId: room.studyRoomId || room.id,
						roomId: room.roomId,
						title: room.title 
					} 
				} 
			});
			return;
		}
		
		// 스터디 멤버 목록 조회해서 본인 상태 확인
		try {
			const response = await fetch(`/api/studies/${room.studyRoomId || room.id}/members`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			const result = await response.json();
			
			if (result.status === 'success') {
				const members = result.data;
				console.log('members:', members);
				console.log('userInfo:', userInfo);
				const myMember = members.find(
					member =>
						String(member.memberId) === String(userInfo.memberId) ||
						String(member.userId) === String(userInfo.userId)
				);
				console.log('myMember:', myMember);
				
				if (myMember && myMember.status === 'APPROVED') {
					// 승인된 멤버면 바로 입장
					navigate('/chat', { 
						state: { 
							studyRoom: { 
								studyRoomId: room.studyRoomId || room.id,
								roomId: room.roomId,
								title: room.title 
							} 
						} 
					});
					return;
				} else if (myMember && (myMember.status === 'WAITING' || myMember.status === 'PENDING')) {
					console.log('myMember status:', myMember.status); // 상태값 디버깅
					console.log('🔍 소켓 상태 확인:', {
						hasSocketService: !!socketService,
						isSocketConnected: socketService?.isSocketConnected(),
						hasSocket: !!socketService?.socket,
						socketConnected: socketService?.socket?.connected,
						socketId: socketService?.socket?.id
					});
					// 자동 승인 환경에서는 바로 입장
					navigate('/chat', { 
						state: { 
							studyRoom: { 
								studyRoomId: room.studyRoomId || room.id,
								roomId: room.roomId,
								title: room.title 
							} 
						} 
					});
					return;
				} else {
					// 신규 사용자 - 참여 신청
					const joinResponse = await fetch(`/api/studies/${room.studyRoomId || room.id}/join`, {
						method: 'POST',
						headers: { 
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (joinResponse.ok) {
						const joinResult = await joinResponse.json();
						
						if (joinResult.status === 'success') {
							// 소켓으로 방장에게 실시간 알림 전송 (자동 승인 환경에서는 emit/alert 주석처리)
							// let notificationSent = false;
							// if (socketService?.isSocketConnected() && socketService.socket) {
							// 	try {
							// 		socketService.socket.emit('study-join-request', {
							// 			studyId: room.studyRoomId || room.id,
							// 			applicantId: userInfo.userId,
							// 			applicantName: userInfo.nickname || userInfo.username || '사용자',
							// 			applicantProfileImage: null // 프로필 이미지가 있다면 추가
							// 		});
							// 		notificationSent = true;
							// 		console.log('📨 참가 신청 알림 전송 성공:', {
							// 			studyId: room.studyRoomId || room.id,
							// 			applicantId: userInfo.userId,
							// 			applicantName: userInfo.nickname || userInfo.username,
							// 			socketId: socketService.socket.id,
							// 			socketConnected: socketService.socket.connected
							// 		});
							// 	} catch (error) {
							// 		console.error('❌ 참가 신청 알림 전송 실패:', error);
							// 		notificationSent = false;
							// 	}
							// } else {
							// 	console.log('⚠️ 소켓이 연결되지 않아 실시간 알림을 전송할 수 없습니다.');
							// 	notificationSent = false;
							// }
							// const message = notificationSent 
							// 	? '참여 신청이 완료되었습니다. 방장에게 실시간 알림이 전송되었습니다.'
							// 	: '참여 신청이 완료되었습니다. 방장의 승인을 기다려주세요.';
							// alert(message);
							// 팝업 닫기 전에 잠시 대기 (소켓 이벤트 전송 완료를 위해)
							// setTimeout(() => {
							// 	onClose();
							// }, 100);
							// 자동 승인 환경에서는 바로 입장
							navigate('/chat', { 
								state: { 
									studyRoom: { 
										studyRoomId: room.studyRoomId || room.id,
										roomId: room.roomId,
										title: room.title 
									} 
								} 
							});
							return;
						} else {
							alert(joinResult.message || '참여 신청에 실패했습니다.');
						}
					} else {
						// HTTP 상태 코드가 400, 500 등인 경우
						try {
							const errorResult = await joinResponse.json();
							console.error('❌ 참가 신청 실패:', errorResult);
							// JOIN_ERROR는 이미 참가 신청한 경우로 처리하여 방장에게 알림 재전송 (자동 승인 환경에서는 emit/alert 주석처리)
							// if (joinResponse.status === 400 && errorResult.errorCode === 'JOIN_ERROR') {
							// 	console.log('🔄 JOIN_ERROR - 이미 신청한 것으로 간주하고 방장에게 알림 재전송');
							// 	if (socketService?.isSocketConnected() && socketService.socket) {
							// 		socketService.socket.emit('study-join-request', {
							// 			studyId: room.studyRoomId || room.id,
							// 			applicantId: userInfo.userId,
							// 			applicantName: userInfo.nickname || userInfo.username || '사용자',
							// 			applicantProfileImage: null
							// 		});
							// 		console.log('📨 참가 신청 재알림 전송:', {
							// 			studyId: room.studyRoomId || room.id,
							// 			applicantId: userInfo.userId,
							// 			applicantName: userInfo.nickname || userInfo.username
							// 		});
							// 	}
							// 	alert('이미 참가 신청을 하셨습니다. 방장에게 알림을 다시 전송했습니다.');
							// }
							// else {
							// 	const errorMessage = errorResult.errorCode === 'ALREADY_MEMBER' ? '이미 참가 중인 스터디입니다.' :
							// 		errorResult.errorCode === 'ROOM_FULL' ? '스터디 정원이 가득 찼습니다.' :
							// 		errorResult.errorCode === 'PREVIOUSLY_REJECTED' ? '이전에 참가가 거절된 스터디입니다.' :
							// 		'참가 신청에 실패했습니다.';
							// 	alert(errorMessage);
							// }
						} catch (parseError) {
							console.error('❌ 에러 응답 파싱 실패:', parseError);
							alert('참가 신청 처리 중 오류가 발생했습니다.');
						}
					}
				}
			} else {
				alert('스터디 정보를 가져오는데 실패했습니다.');
			}
		} catch (error) {
			console.error('참여 처리 실패:', error);
			alert('참여 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
		}
	};

	return (
		<div className={classNames.join(' ')}>
			<div className="detail__header">
				<button className="detail__close" onClick={onClose} aria-label="팝업 닫기"></button>
			</div>
			
			<div className="detail__content">
				<div className="detail__infos">
					<img src={`/uploads/thumbnail/${room.thumbnail}`} alt="스터디 이미지" className="img-thumbnail"/>
					<div className="detail__info">
						<h3 className="title">{room.title}</h3>
						<ul className="room-info">
							<li>{room.region}</li>
							<li>{room.time}</li>
							<li>{room.currentMembers} / {room.capacity}명</li>
						</ul>
					</div>
				</div>

				<div className="detail__members">
					<h3 className="detail__subtitle">참여 멤버</h3>
					<ul className="detail__member-list">
						{room.members?.map((member, idx) => (
							<li key={idx} className={idx === 0 ? 'detail__leader' : 'detail__member'}>
								{member}
							</li>
						))}
					</ul>
				</div>
				
				<div className="detail__description">
					<h3 className="detail__subtitle">스터디 설명</h3>
					<p className="detail__text">{room.description}</p>
				</div>
			</div>

			<div className="fixed">
				<button type="button" className="button button-primary" onClick={handleJoinStudy}>참여하기</button>
			</div>
		</div>
	);
};

export default Detail; 