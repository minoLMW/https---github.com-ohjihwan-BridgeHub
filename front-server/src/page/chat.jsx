import React,{ useState, useEffect, useRef } from 'react';
import { useLocation, useParams,useNavigate  } from 'react-router-dom';
import Header from '@common/Header';
import Layer from '@common/Layer';
import Roulette from '@components/chat/Roulette';
import ResultModal from '@components/chat/ResultModal';
import TodoList from '@components/chat/TodoListDeployment';
import { useStudySocket } from '@dev/hooks/useSocket';
import { chatAPI, userAPI } from '@dev/services/apiService';
import AttachmentList from '@components/chat/AttachmentList';


function Chat() {
	const location = useLocation();
	const params = useParams();
	const navigate = useNavigate()
	const studyInfo = location.state?.studyRoom || location.state;
	
	// URL query string에서 정보 추출
	const urlParams = new URLSearchParams(location.search);
	
	// 사용자 정보 상태
	const [currentUserId, setCurrentUserId] = useState(null);
	const [currentUserInfo, setCurrentUserInfo] = useState(null);
	
	// URL 파라미터에서 정보를 읽어오거나 location.state에서 가져오기
	const studyId = studyInfo?.studyRoomId || studyInfo?.id || params.studyId || params.id || urlParams.get('studyId') || urlParams.get('id');
	const roomId = studyInfo?.roomId || params.roomId || urlParams.get('roomId');
	
	console.log('Chat 컴포넌트 초기화:', { 
		studyInfo, 
		params, 
		urlParams: Object.fromEntries(urlParams.entries()),
		studyId, 
		roomId,
		location: location.pathname + location.search
	});
	
	// 실제 소켓 연동 (사용자 ID가 설정된 후에만)
	const { 
		messages: socketMessages, 
		onlineUsers, 
		isJoined, 
		sendMessage: socketSendMessage,
		isConnected,
		socketService // 소켓 서비스 직접 접근을 위해 추가
	} = useStudySocket(studyId, currentUserId);

	// 소켓 상태 디버깅
	useEffect(() => {
		console.log('🔥 소켓 상태 변화:', {
			studyId,
			currentUserId,
			isConnected,
			isJoined,
			socketMessagesLength: socketMessages?.length || 0,
			onlineUsersCount: onlineUsers?.length || 0
		});
		
		if (socketMessages && socketMessages.length > 0) {
			console.log('📚 소켓에서 받은 메시지들:', socketMessages.map(msg => ({
				messageId: msg.messageId || msg._id,
				senderId: msg.senderId,
				text: msg.message || msg.text,
				timestamp: msg.timestamp,
				messageType: msg.messageType
			})));
		}
	}, [studyId, currentUserId, isConnected, isJoined, socketMessages, onlineUsers]);

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const textareaRef = useRef(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [showRoulette, setShowRoulette] = useState(false);
	// 파일 업로드
	const fileInputRef = useRef(null);
	// 파일 모아보기
	const [showAttachments, setShowAttachments] = useState(false);
	const [attachments, setAttachments] = useState([]);
	// 랜덤 기능 - 방장 여부 확인
	const [isOwner, setIsOwner] = useState(false);
	const [showResult, setShowResult] = useState(false); // 모달 띄울지 여부
	const [spinning, setSpinning] = useState(false); // 룰렛 돌리는 중 여부
	const [winner, setWinner] = useState(null); // 당첨자
	// --------
	// 목표 분담
	const [showTodo, setShowTodo] = useState(false);
	const [todoList, setTodoList] = useState([]);
	const [showTodoSetting, setShowTodoSetting] = useState(false);
	const [todoSettingInputs, setTodoSettingInputs] = useState(['', '']);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [searchResults, setSearchResults] = useState([]); // 검색된 요소 배열
	const [currentIndex, setCurrentIndex] = useState(0); // 현재 몇 번째 결과인지
	// 참가 신청 알림 관련
	const [joinRequests, setJoinRequests] = useState([]); // 참가 신청 목록
	const [showNavigator, setShowNavigator] = useState(false); // 말풍선 표시 여부
	// WebRTC
	const [showVideo, setShowVideo] = useState(false);
	const handleTodoSettingAddInput = () => {
		if (todoSettingInputs.length < 10) {
			setTodoSettingInputs([...todoSettingInputs, '']);
		}
	};
	const handleInputChange = (e, idx) => {
		const newInputs = [...todoSettingInputs];
		newInputs[idx] = e.target.value;
		setTodoSettingInputs(newInputs);
	};
	const handleTodoConfirm = () => {
		const newTodos = todoSettingInputs
			.filter(title => title.trim() !== '')
			.map(title => ({
				title,
				users: []
			}));

		if (newTodos.length < 2) {
			customAlert('최소 2가지 업무가 필요합니다.');
			return;
		}

		setTodoList(newTodos);
		setShowTodo(true);
		setShowTodoSetting(false);
	};
	const handleTodoSettingDelete = (idx) => {
		const newInputs = [...todoSettingInputs];
		newInputs.splice(idx, 1);
		setTodoSettingInputs(newInputs);
	};
	// 파일 업로드 (백엔드 먼저, UI 나중)
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		console.log('📁 파일 업로드 시작:', {
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
			studyId,
			currentUserId
		});

		// 필수 조건 확인
		if (!studyId || !currentUserId) {
			console.error('❌ 파일 업로드 조건 미충족:', { studyId, currentUserId });
			customAlert('파일 업로드에 필요한 정보가 없습니다.');
			e.target.value = '';
			return;
		}

		// 로딩 메시지 추가 (임시)
		const { ampm, timeStr } = getFormattedTime();
		const tempMessage = {
			type: 'me',
			text: `파일을 업로드 중입니다... (${file.name})`,
			time: timeStr,
			ampm,
			isUploading: true
		};
		
		setMessages(prev => [...prev, tempMessage]);

		try {
			// 백엔드에 파일 업로드 먼저 실행
			const formData = new FormData();
			formData.append('file', file);
			formData.append('studyRoomId', studyId.toString());
			formData.append('uploaderId', currentUserId.toString());
			formData.append('fileType', 'STUDY');

			console.log('🚀 백엔드 파일 업로드 요청 전송:', {
				studyRoomId: studyId,
				uploaderId: currentUserId,
				fileType: 'STUDY',
				fileSize: file.size
			});

			const response = await fetch('/api/files/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				console.log('✅ 백엔드 파일 업로드 성공:', result);
				
				// 백엔드 업로드 성공 시 UI 업데이트 (실제 fileId 사용)
				const realFileId = result.data?.fileId;
				
				// setMessages(prev => {
				//   // 로딩 메시지 제거하고 실제 파일 메시지 추가
				//   const withoutLoading = prev.filter(msg => !msg.isUploading);
				//   return [...withoutLoading, {
				//     type: 'me',
				//     time: timeStr,
				//     ampm,
				//     files: [{
				//       name: file.name,
				//       fileId: realFileId,
				//       fileSize: file.size
				//     }]
				//   }];
				// });
				// 로딩 메시지 제거만 유지
				setMessages(prev => prev.filter(msg => !msg.isUploading));
				
				// 소켓으로 다른 사용자들에게 실시간 알림
				if (isConnected && socketSendMessage) {
					console.log('📡 소켓으로 파일 업로드 알림 전송');
					socketSendMessage({
						message: ` ${file.name}`,
						messageType: 'FILE',
						fileName: file.name,
						fileId: realFileId,
						fileSize: file.size
					});
				}
			} else {
				console.error('❌ 백엔드 파일 업로드 실패:', response.status, response.statusText);
				
				// 업로드 실패 시 로딩 메시지 제거하고 에러 메시지 표시
				setMessages(prev => prev.filter(msg => !msg.isUploading));
				customAlert(`파일 업로드에 실패했습니다. (${response.status})`);
			}
		} catch (error) {
			console.error('❌ 파일 업로드 에러:', error);
			
			// 에러 시 로딩 메시지 제거하고 에러 메시지 표시
			setMessages(prev => prev.filter(msg => !msg.isUploading));
			customAlert('파일 업로드 중 오류가 발생했습니다.');
		}

		e.target.value = '';
	};
	// 파일 첨부 모아보기
	const handleShowAttachments = async () => {
		console.log('📂 파일 모아보기 시작:', { studyId });
		
		try {
			// 실제 API 호출 시도
			if (studyId) {
				const response = await fetch(`/api/files/studyroom/${studyId}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json'
					}
				});

				console.log('📂 파일 목록 API 응답:', response.status);
				
				if (response.ok) {
					const result = await response.json();
					console.log('📂 파일 목록 API 결과:', result);
					
					// 백엔드의 ApiResponse 구조: {status: 'success', data: [...]}  
					if (result.status === 'success' && result.data) {
						const files = result.data.map(file => ({
							name: file.originalFilename || file.fileName,
							fileId: file.fileId,
							fileSize: file.fileSize,
							mimeType: file.mimeType,
							uploadedAt: file.uploadedAt
						}));
						
						setAttachments(files);
						setShowAttachments(true);
						console.log('✅ 실제 파일 목록 조회 성공:', files.length, '개', files);
						return;
					} else {
						console.warn('📂 파일 목록 응답 구조 예상과 다름:', result);
					}
				} else {
					console.error('📂 파일 목록 API 실패:', response.status, response.statusText);
				}
			} else {
				console.warn('📂 studyId가 없음:', studyId);
			}
			
			// API 실패 시 또는 studyId가 없을 때 가짜 데이터 사용 (fallback)
			console.log('📂 가짜 데이터로 fallback');
			setAttachments([
				{ name: '이미지샘플.jpg', fileId: 1 },
				{ name: '사진.jpeg', fileId: 2 },
				{ name: '그림.png', fileId: 3 },
				{ name: '움짤.gif', fileId: 4 },
				{ name: '문서.pdf', fileId: 5 },
				{ name: '보고서.doc', fileId: 6 },
				{ name: '회의록.docx', fileId: 7 },
				{ name: '메모.txt', fileId: 8 },
				{ name: '압축파일.zip', fileId: 9 },
				{ name: '자료집.rar', fileId: 10 },
				{ name: '문서.pdf', fileId: 11 },
			]);
			setShowAttachments(true);
		} catch (err) {
			console.error('📂 파일 목록 조회 실패:', err);
			// 에러 시에도 가짜 데이터 표시
			setAttachments([
				{ name: '이미지샘플.jpg', fileId: 1 },
				{ name: '사진.jpeg', fileId: 2 },
				{ name: '그림.png', fileId: 3 },
			]);
			setShowAttachments(true);
		}
	};
	// 랜덤 게임
	const handleAssignUser = (index) => {
		const userName = '김사과';
		const newTodos = [...todoList];

		if (selectedIndex === index) {
			// 선택 해제
			newTodos[index].users = newTodos[index].users.filter(user => user !== userName);
			setSelectedIndex(null);
			console.log("목표 선택이 취소되었습니다.");
		} else {
			// 다른 목표 내 이름 제거
			newTodos.forEach(todo => {
				todo.users = todo.users.filter(user => user !== userName);
			});
			// 새로 선택한 목표에 내 이름 추가
			newTodos[index].users.push(userName);
			setSelectedIndex(index);
			console.log(`목표 ${index}번이 선택되었습니다.`);
		}

		setTodoList(newTodos);
	};
	// --------

	// 신고하기 기능 추가
	const [showReportLayer, setShowReportLayer] = useState(false);
	const [reportTarget, setReportTarget] = useState(null);
	const [showReportButtonIndex, setShowReportButtonIndex] = useState(null);
	const handleReportSubmit = () => {
		customConfirm('신고하시겠습니까?').then((confirm) => {
			if (confirm) {
				// 실제 신고 로직
				customAlert('신고가 접수되었습니다.');
				setShowReportLayer(false);
			}
		});
	};
	// --------
	
	// 검색기능
	const removeHighlight = () => {
		document.querySelectorAll('.highlight').forEach(el => {
			const parent = el.parentNode;
			parent.innerHTML = parent.textContent;
		});
		document.querySelectorAll('.highlight-impact').forEach(el => {
			el.classList.remove('highlight-impact');
		});
	};
	const handleChatSearch = async () => {
		const keyword = await customPrompt('검색할 내용을 입력하세요', '');

		if (keyword !== null && keyword.trim() !== '') {
			removeHighlight();

			const results = [];
			const chatList = document.querySelectorAll('.user-say, .i-say');

			chatList.forEach(el => {
				const textEl = el.querySelector('.user-say__text, .i-say__text');
				if (textEl && textEl.textContent.includes(keyword)) {
					const regex = new RegExp(`(${keyword})`, 'gi');
					textEl.innerHTML = textEl.textContent.replace(regex, '<span class="highlight">$1</span>');
					results.push(el);
				}
			});

			if (results.length === 0) {
				customAlert('검색 결과가 없습니다.');
				setShowNavigator(false);
			} else if (results.length === 1) {
				setShowNavigator(false);
				setSearchResults(results);
				setCurrentIndex(0);
				results[0].scrollIntoView({ behavior: 'smooth' });
				const textEl = results[0].querySelector('.user-say__text, .i-say__text');
				if (textEl) {
					textEl.classList.add('highlight-impact');
				}
				setTimeout(() => {
					removeHighlight();
					setSearchResults([]);
					setCurrentIndex(0);
				}, 2000);
			} else {
				setShowNavigator(true);
				setSearchResults(results);
				setCurrentIndex(0);
				results[0].scrollIntoView({ behavior: 'smooth' });
			}
		}
	};
	const goToNextNavigator = () => {
		if (searchResults.length === 0) return;
		const nextIndex = (currentIndex + 1) % searchResults.length;
		setCurrentIndex(nextIndex);
		applyActiveClass(nextIndex);
		searchResults[nextIndex].scrollIntoView({ behavior: 'smooth' });
	};
	const goToPrevNavigator = () => {
		if (searchResults.length === 0) return;
		const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
		setCurrentIndex(prevIndex);
		applyActiveClass(prevIndex);
		searchResults[prevIndex].scrollIntoView({ behavior: 'smooth' });
	};
	const closeNavigator = () => {
		removeHighlight();
		setShowNavigator(false);
		setSearchResults([]);
		setCurrentIndex(0);
	};
	const applyActiveClass = (activeIndex) => {
		searchResults.forEach((el, idx) => {
			const textEl = el.querySelector('.user-say__text, .i-say__text');
			if (!textEl) return;

			if (idx === activeIndex) {
				textEl.classList.add('highlight-impact');
			} else {
				textEl.classList.remove('highlight-impact');
			}
		});
	};
	// --------

	const chatEndRef = useRef(null);

	// 시간 포맷 도우미
	const getFormattedTime = () => {
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const ampm = hours >= 12 ? '오후' : '오전';
		const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		return { ampm, timeStr };
	};

	// 시스템 메시지
	const addSystemMessage = (template, vars = {}) => {
		const text = template.replace(/\$\{(.*?)\}/g, (_, key) => vars[key] ?? '');
		setMessages(prev => [...prev, { 
			type: 'system', 
			text 
		}]);
	};

	const handleStartVideo = () => {
		const finalRoomId = roomId || studyId || `room-${Date.now()}`
	navigate(`/video/${finalRoomId}`, {
		state: {
		userNickname: currentUserInfo?.nickname || '익명'
		}
	})
	}

	// 내가 보낼 메시지
	const handleSend = () => {
		if (!message.trim()) return;

		// 실제 소켓으로 메시지 전송
		if (isConnected && studyId) {
			const messageData = {
				message: message.trim(),
				messageType: 'TEXT'
			};

			console.log('📤 소켓으로 메시지 전송:', messageData);
			const success = socketSendMessage(messageData);
			
			if (!success) {
				console.error('❌ 메시지 전송 실패 - 소켓 서비스 응답:', success);
				window.customAlert && window.customAlert('메시지 전송에 실패했습니다. 연결 상태를 확인해주세요.');
				return;
			}
		}

		// 로컬 UI 업데이트 (주석처리: 소켓 서버에서 받은 메시지만 사용)
		// const { ampm, timeStr } = getFormattedTime();
		// setMessages(prev => [
		// 	...prev,
		// 	{ type: 'me', text: message, time: timeStr, ampm, senderId: currentUserId }
		// ]);
		setMessage('');
		if (textareaRef.current) textareaRef.current.style.height = 'auto';
	};

	// '엔터'시 체팅 보냄
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleRemoveTodoList = () => {
		customConfirm('정말 제거하시겠습니까?').then((confirmDelete) => {
			if (confirmDelete) {
				setTodoList([]);
				setShowTodo(false);
			}
		});
	};

	// 체팅 입력창 높이값
	const handleChange = (e) => {
		const value = e.target.value;
		setMessage(value);
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			textarea.style.height = (textarea.scrollHeight / 10) + 'rem';
		}
	};

	// WebRTC
	

	// 사용자 정보 로드
	useEffect(() => {
		const loadUserInfo = async () => {
			try {
				console.log('사용자 정보 로드 시작...');
				
				// 토큰 확인
				const token = localStorage.getItem('token');
				console.log('저장된 토큰:', token);
				
				if (!token) {
					console.error('토큰이 없습니다!');
					window.location.href = '/auth';
					return;
				}
				
				const response = await userAPI.getUserInfo();
				console.log('API 응답:', response);
				console.log('응답 데이터:', response.data);
				
				if (response.data && response.data.status === 'success' && response.data.data) {
					setCurrentUserId(response.data.data.id);
					setCurrentUserInfo(response.data.data);
					console.log('사용자 정보 로드 성공:', response.data.data);
					console.log('설정된 사용자 ID:', response.data.data.id);
				} else {
					console.error('응답 데이터 구조가 예상과 다름:', response.data);
				}
			} catch (error) {
				console.error('사용자 정보 로드 실패:', error);
				console.error('에러 응답:', error.response);
				// 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트
				if (error.response?.status === 401) {
					console.log('인증 실패 - 로그인 페이지로 이동');
					window.location.href = '/auth';
				}
			}
		};

		loadUserInfo();
	}, []);

	// 소켓 메시지 수신 처리
	useEffect(() => {
		console.log('🔄 소켓 메시지 변화 감지:', {
			socketMessagesLength: socketMessages?.length || 0,
			currentMessagesLength: messages.length,
			isHistoryEmpty: messages.length === 0,
			isJoined,
			isConnected,
			socketMessages: socketMessages?.slice(-3) // 마지막 3개만 로그
		});

		if (socketMessages && socketMessages.length > 0) {
			// 히스토리가 비어있고 소켓 메시지가 있으면 전체 히스토리로 처리
			if (messages.length === 0) {
				console.log('📚 소켓 히스토리를 로컬 messages에 설정');
				console.log('📚 원본 소켓 메시지들:', socketMessages);
				
				const historyMessages = socketMessages.map((msg, index) => {
					console.log(`📚 메시지 ${index} 변환:`, msg);
					
					// MongoDB에서 오는 메시지 구조 처리
					const messageText = msg.message || msg.content || msg.text || '';
					const senderId = msg.senderId || msg.userId || msg.sender || '';
					const senderName = msg.senderName || msg.senderNickname || msg.nickname || msg.username || '사용자';
					const messageTime = msg.timestamp || msg.sentAt || msg.createdAt || new Date().toISOString();
					
					// 시간 포맷팅
					const timeObj = new Date(messageTime);
					const timeStr = timeObj.toLocaleTimeString('ko-KR', { 
						hour: '2-digit', 
						minute: '2-digit' 
					});
					const ampm = timeObj.getHours() >= 12 ? '오후' : '오전';
					
					const baseMessage = {
						type: senderId == currentUserId ? 'me' : 'user',
						text: messageText,
						time: timeStr,
						ampm: ampm,
						senderId: senderId,
						senderName: senderName,
						timestamp: messageTime,
						messageId: msg.messageId || msg._id || `${senderId}-${Date.now()}-${index}`
					};

					// 파일 메시지인 경우 파일 정보 추가
					if (msg.messageType === 'FILE' || msg.fileType || msg.fileName || msg.files) {
						const fileName = msg.fileName || msg.filename || (msg.files && msg.files[0]?.name) || '파일';
						const fileId = msg.fileId || (msg.files && msg.files[0]?.fileId) || null;
						
						baseMessage.files = [{
							name: fileName,
							fileId: fileId,
							fileUrl: fileId ? `/api/files/download/${fileId}` : '#'
						}];
						
						console.log(`📎 파일 메시지 처리:`, { fileName, fileId });
					}

					console.log(`✅ 변환된 메시지 ${index}:`, baseMessage);
					return baseMessage;
				});
				
				setMessages(historyMessages);
				console.log('✅ 히스토리 설정 완료:', historyMessages.length, '개 메시지');
				console.log('✅ 설정된 메시지들:', historyMessages);
			} else {
				// 새 메시지만 추가 (마지막 메시지 확인)
				const latestMessage = socketMessages[socketMessages.length - 1];
				console.log('📨 새 메시지 확인:', latestMessage);
				
				// 중복 확인 - 더 정확한 중복 검사
				const exists = messages.find(msg => {
					// messageId가 있으면 우선 비교
					if (latestMessage.messageId && msg.messageId) {
						return msg.messageId === latestMessage.messageId;
					}
					
					// 텍스트와 발신자 ID, 타임스탬프로 비교
					const textMatch = msg.text === (latestMessage.message || latestMessage.text);
					const senderMatch = msg.senderId === latestMessage.senderId;
					const timeMatch = Math.abs(
						new Date(msg.timestamp || 0) - new Date(latestMessage.timestamp || 0)
					) < 3000; // 3초 이내
					
					return textMatch && senderMatch && timeMatch;
				});
				
				if (!exists) {
					console.log('📨 새 메시지 추가:', latestMessage);
					
					// 새 메시지도 동일한 구조로 변환
					const messageText = latestMessage.message || latestMessage.content || latestMessage.text || '';
					const senderId = latestMessage.senderId || latestMessage.userId || '';
					const senderName = latestMessage.senderName || latestMessage.nickname || '사용자';
					const messageTime = latestMessage.timestamp || new Date().toISOString();
					
					const timeObj = new Date(messageTime);
					const timeStr = timeObj.toLocaleTimeString('ko-KR', { 
						hour: '2-digit', 
						minute: '2-digit' 
					});
					const ampm = timeObj.getHours() >= 12 ? '오후' : '오전';
					
					const newMessage = {
						type: senderId == currentUserId ? 'me' : 'user',
						text: messageText,
						time: timeStr,
						ampm: ampm,
						senderId: senderId,
						senderName: senderName,
						timestamp: messageTime,
						messageId: latestMessage.messageId || latestMessage._id || `${senderId}-${Date.now()}`
					};

					// 파일 메시지인 경우 파일 정보 추가
					if (latestMessage.messageType === 'FILE' || latestMessage.fileType || latestMessage.fileName) {
						newMessage.files = [{
							name: latestMessage.fileName || '파일',
							fileId: latestMessage.fileId || Date.now(),
							fileUrl: latestMessage.fileUrl || '#'
						}];
					}
					
					setMessages(prev => [...prev, newMessage]);
				} else {
					console.log('📝 중복 메시지 방지:', latestMessage);
				}
			}
		} else {
			console.log('💤 소켓 메시지 없음 또는 비어있음');
		}
	}, [socketMessages, currentUserId, messages.length, isJoined, isConnected]);

	// 중복된 히스토리 로딩 로직 제거 (위 소켓 메시지 수신 처리에서 처리됨)

	// 연결 상태 메시지 (서버에서 자동으로 전송되므로 제거)
	
	// 방장 여부 확인
	useEffect(() => {
		if (studyInfo && currentUserInfo) {
			const bossId = String(studyInfo.bossId);
			const userId = String(currentUserInfo.id);
			const isBoss = bossId === userId;
			setIsOwner(isBoss);
			console.log('🏛️ 방장 여부 확인:', {
				bossId,
				userId,
				isBoss
			});
		}
	}, [studyInfo, currentUserInfo]);

	// 참가 신청 알림 수신 (방장만)
	useEffect(() => {
		console.log('🎯 참가 신청 알림 리스너 설정:', {
			isConnected,
			isOwner,
			hasSocketService: !!socketService,
			hasSocket: !!socketService?.socket,
			socketConnected: socketService?.socket?.connected
		});

		if (!isConnected || !isOwner) {
			console.log('⚠️ 참가 신청 알림 리스너 설정 안함:', { isConnected, isOwner });
			return;
		}

		// 참가 신청 알림 수신
		const handleJoinRequest = (notification) => {
			console.log('📥 [방장] 참가 신청 알림 수신:', notification);
			setJoinRequests(prev => {
				const newRequests = [...prev, {
					...notification,
					id: Date.now() + Math.random(), // 고유 ID
					timestamp: new Date().toISOString()
				}];
				console.log('📋 업데이트된 참가 신청 목록:', newRequests);
				return newRequests;
			});
			
			// 시스템 메시지로도 표시
			addSystemMessage(`${notification.applicantName}님이 스터디 참가를 신청했습니다.`, {});
		};

		// 소켓 이벤트 리스너 등록
		if (socketService?.socket) {
			console.log('✅ 참가 신청 알림 리스너 등록 중...');
			socketService.socket.on('join-request-notification', handleJoinRequest);
			
			// 테스트용 모든 이벤트 로깅
			socketService.socket.onAny((eventName, ...args) => {
				if (eventName.includes('join')) {
					console.log('🔍 소켓 이벤트 수신:', eventName, args);
				}
			});
			
			return () => {
				console.log('🧹 참가 신청 알림 리스너 해제');
				socketService.socket.off('join-request-notification', handleJoinRequest);
			};
		} else {
			console.warn('❌ 소켓 서비스가 없어서 알림 리스너를 등록할 수 없습니다.');
		}
	}, [isConnected, isOwner, addSystemMessage, socketService]);

	// 스크롤 하단
	useEffect(() => {
		if (!messages.length) return;

		const lastMsg = messages[messages.length - 1];
		if (lastMsg.type === 'me' && chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	// 신고하기 버튼 활성화
	useEffect(() => {
		const handleClickOutside = () => {
			setShowReportButtonIndex(null);
		};
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	// 참가 신청 승인/거절 처리
	const handleJoinResponse = async (request, response) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				alert('로그인이 필요합니다.');
				return;
			}

			// 백엔드 API 호출
			const apiResponse = await fetch(`/api/studies/${studyId}/members/${request.applicantId}/status?status=${response.toUpperCase()}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});

			const result = await apiResponse.json();
			
			if (result.status === 'success') {
				// 소켓으로 신청자에게 결과 알림
				if (socketService?.socket) {
					socketService.socket.emit('study-join-response', {
						studyId: studyId,
						applicantId: request.applicantId,
						response: response,
						bossId: currentUserInfo.id
					});
				}

				// 요청 목록에서 제거
				setJoinRequests(prev => prev.filter(req => req.id !== request.id));
				
				// 시스템 메시지 추가
				const actionText = response === 'approved' ? '승인' : '거절';
				addSystemMessage(`${request.applicantName}님의 참가 신청을 ${actionText}했습니다.`, {});
				
				console.log(`✅ 참가 신청 ${actionText} 완료:`, request.applicantName);
			} else {
				alert(result.message || `참가 신청 ${response === 'approved' ? '승인' : '거절'}에 실패했습니다.`);
			}
		} catch (error) {
			console.error('참가 신청 처리 실패:', error);
			alert('참가 신청 처리 중 오류가 발생했습니다.');
		}
	};

	/* 소캣테스트용 */
	const testUsers = ['김사과', '반하나', '오렌지', '이메론', '채애리'];

	return (
		<>
			<Header
				title={studyInfo?.title || '채팅방'}
				showSearch={true}
				onSearch={(e) => {
					e.stopPropagation();
					handleChatSearch()
				}}
				onShowAttachments={handleShowAttachments}
			/>
				<button
			onClick={handleStartVideo}
			style={{
			position: 'fixed',
			bottom: '20px',
			left: '20px',
			zIndex: 9999,
			backgroundColor: '#2196f3',
			color: 'white',
			border: 'none',
			padding: '10px 16px',
			borderRadius: '20px',
			fontSize: '14px',
			cursor: 'pointer'
			}}
		>
			📷 화상 회의 시작
		</button>

			{/* 참가 신청 알림 (방장만 표시) */}
			{/* 디버깅용 로그 */}
			{console.log('🔍 알림 박스 렌더링 조건 확인:', {
				isOwner,
				joinRequestsLength: joinRequests.length,
				joinRequests,
				shouldShow: isOwner && joinRequests.length > 0
			})}
			
			{isOwner && joinRequests.length > 0 && (
				<div style={{
					backgroundColor: '#e3f2fd',
					border: '1px solid #2196f3',
					borderRadius: '8px',
					padding: '12px',
					margin: '10px',
					fontSize: '14px'
				}}>
					{joinRequests.map((request) => (
						<div key={request.id} style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: joinRequests.length > 1 ? '8px' : '0'
						}}>
							<span>
								<strong>{request.applicantName}</strong>님이 참가를 신청했습니다.
							</span>
							<div style={{ display: 'flex', gap: '8px' }}>
								<button 
									onClick={() => handleJoinResponse(request, 'approved')}
									style={{
										backgroundColor: '#4caf50',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										padding: '4px 12px',
										fontSize: '12px',
										cursor: 'pointer'
									}}
								>
									승인
								</button>
								<button 
									onClick={() => handleJoinResponse(request, 'rejected')}
									style={{
										backgroundColor: '#f44336',
										color: 'white',
										border: 'none',
										borderRadius: '4px',
										padding: '4px 12px',
										fontSize: '12px',
										cursor: 'pointer'
									}}
								>
									거절
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<div className={"chatroom-history"}>

				{/* 테스트 목적 용도 */}
				<button type="button" className="testButton" onClick={() => {
					const { ampm, timeStr } = getFormattedTime();
					setMessages(prev => [
						...prev,
						{
							type: 'user',
							text: '테스트 메시지에요',
							time: timeStr,
							ampm: ampm
						}
					]);
				}}>상대 메시지 테스트</button>
				<button type="button" className="testButton" onClick={() => {
					const { ampm, timeStr } = getFormattedTime();
					setMessages(prev => [
						...prev,
						{
							type: 'user',
							time: timeStr,
							ampm,
							files: [
								{ name: '샘플파일.png', fileId: Date.now() }
							]
						}
					]);
				}}>상대 파일 업로드</button>
				{/* <button type="button" className="testButton" onClick={() => {
						setIsTyping(true); // 입력 중 상태 on
						// 3초 후 타이핑 종료
						setTimeout(() => {
							setIsTyping(false);
						}, 3000);
					}}
				>타이핑 테스트</button> */}
				{/* // 테스트 목적 용도 */}

				{/* 메시지 출력 영역 */}
				{messages.map((msg, i) => {
					if (msg.type === 'system') {
						return <div key={i} className="program-msg">{msg.text}</div>;
					}

					if (msg.type === 'me') {
						return (
							<div key={i} className="i-say">
								<div className="i-say__text">
									{msg.files?.length > 0 && msg.files[0] && (
										<a href={`/api/files/download/${msg.files[0].fileId}`} target="_blank" rel="noreferrer">
											<div className={`i-say__file i-say__file--${msg.files[0].name.split('.').pop().toLowerCase()}`}>
												<span>{msg.files[0].name}</span>
											</div>
										</a>
									)}
									{msg.text}
								</div>
								<time dateTime={msg.time} className="i-say__time">
									{msg.ampm} <span>{msg.time}</span>
								</time>
							</div>
						);
					}

					if (msg.type === 'user') {
						return (
							<div key={i} className="user-say" onClick={(e) => { e.stopPropagation(); setShowReportButtonIndex(i);}} >
								<div className="user-say__profile"></div>
								<div className="user-say__text">
									{msg.files?.length > 0 && msg.files[0] && (
										<a href={`/api/files/download/${msg.files[0].fileId}`} target="_blank" rel="noreferrer">
											<div className={`user-say__file user-say__file--${msg.files[0].name.split('.').pop().toLowerCase()}`}>
												{msg.files[0].name}
											</div>
										</a>
									)}
									{msg.text}
								</div>
								<div className="user-say__etc">
									<time dateTime={msg.time} className="user-say__time">
										{msg.ampm} <span>{msg.time}</span>
									</time>
									{showReportButtonIndex === i && (
										<button type="button" aria-label="신고하기" className="user-say__report" onClick={(e) => { e.stopPropagation(); setReportTarget(msg); setShowReportLayer(true); }} ></button>
									)}
								</div>
							</div>
						);
					}

					if (msg.type === 'todo') {
						return <TodoList key={i} todos={msg.todos} />;
					}

					return null;
				})}

				{/* 할 일 공유 토글 영역 - map 바깥에 별도로! */}
				{showTodo && (
					<TodoList todos={todoList} selectedIndex={selectedIndex} onAssignUser={handleAssignUser} />
				)}

				{/* 입력 중 표시 */}
				{isTyping && (
					<div className="user-say" onClick={() => setShowReportLayer(true)}>
						<div className="user-say__profile"></div>
						<div className="user-say__text">
							<div className="user-say__writing">
								<span className="user-say__writing__loading"></span>
								<span className="user-say__writing__loading"></span>
								<span className="user-say__writing__loading"></span>
							</div>
						</div>
					</div>
				)}
					
				<div ref={chatEndRef} />
			</div>

			<div className="msg-writing">
				<div className="msg-writing__box">
					<div className="msg-writing__services">
						<button type="button" className="msg-writing__toggle" title="영상 기능 버튼" onClick={() => setShowVideo(true)}></button>
					</div>
					<ul className="msg-writing__actions">
						<li>
							<button type="button" className="msg-writing__action" onClick={() => fileInputRef.current.click()}>
								파일 업로드
							</button>
						</li>
						<li>
							<button type="button" className="msg-writing__action" onClick={() => setShowRoulette(true)}>
								랜덤게임
							</button>
						</li>
						<li>
							<button type="button" className="msg-writing__action" onClick={() => {
								if (showTodo) {
										handleRemoveTodoList();
									} else {
										setShowTodoSetting(true);
									}
								}}
							>
							{showTodo ? '목표 취소' : '목표 생성'}
							</button>
						</li>
					</ul>
				</div>
				<input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
				<div className="msg-writing__inputs">
					<div className="msg-writing__field">
						<textarea className="msg-writing__input" placeholder="메세지 입력!" value={message} onChange={handleChange} onKeyDown={handleKeyDown} ref={textareaRef} rows={1} />
					</div>
					<button type="button" className="msg-writing__send" aria-label="입력 전송" onClick={handleSend}/>
				</div>
			</div>

			<Layer isOpen={showRoulette} onClose={() => setShowRoulette(false)} header="랜덤 뽑기">
				<Roulette 
					users={testUsers} 
					isOwner={isOwner}
					onSpinStart={() => {
						setSpinning(true); // 모달 띄우고
						setShowResult(true); // "룰렛 돌리는 중..." 보여주기
					}}
					onWinnerSelected={(user) => {
						setSpinning(false); // 돌리기 종료
						setWinner(user); // 결과 저장

						addSystemMessage(`"${user}"님이 당첨되셨습니다!`, { user });
					}}
				/>
			</Layer>

			<Layer isOpen={showTodoSetting} onClose={() => setShowTodoSetting(false)} header="목표 설정" footer={ <button type="button" className="todo-setting__submit" onClick={handleTodoConfirm}>목표 전달</button> }>
				<div className="todo-setting">
					{todoSettingInputs.map((input, idx) => (
						<div key={idx} className="todo-setting__unit">
							<div className="field">
								<input className="text" type="text" value={input} onChange={(e) => handleInputChange(e, idx)} placeholder={`업무 ${idx + 1}`}/>
							</div>
							<button type="button" className="todo-setting__delete" aria-label="삭제하기" onClick={() => handleTodoSettingDelete(idx)}></button>
						</div>
					))}
					{todoSettingInputs.length < 10 && (
						<button type="button" className="todo-setting__add" onClick={handleTodoSettingAddInput} aria-label="목표 추가"></button>
					)}
				</div>
			</Layer>

			{showReportLayer && (
				<Layer isOpen={showReportLayer} onClose={() => setShowReportLayer(false)} header="신고하기" footer={
					<button className="layer__submit" onClick={handleReportSubmit} >신고하기</button>
				}>
					<div className="report-layer">
						<div className="field">
							<select className="select" name="report-type">
								<option value="신고1">신고1</option>
								<option value="신고2">신고2</option>
								<option value="신고3">신고3</option>
								<option value="신고4">신고4</option>
							</select>
						</div>

						<div className="field __textarea">
							<textarea className="textarea" placeholder="신고 내용을 적어주세요." name="description" />
						</div>
					</div>
				</Layer>
			)}

			{showNavigator && (
				<div className="search-navigator">
					<div className="search-navigator__controllers">
						<button type="button" className="search-navigator__arr search-navigator__arr--up" onClick={goToPrevNavigator} aria-label="검색된 이전 단어 찾기"></button>
						<span>{currentIndex + 1} / {searchResults.length}</span>
						<button type="button" className="search-navigator__arr search-navigator__arr--down" onClick={goToNextNavigator} aria-label="검색된 다음 단어 찾기"></button>
					</div>
					<button type="button" className="search-navigator__close" onClick={closeNavigator} aria-label="닫기"></button>
				</div>
			)}
			
			{showResult && (
				<ResultModal
					spinning={spinning}
					winner={winner}
					onClose={() => {
						setShowResult(false);
						setWinner(null);
						setSpinning(false);
					}}
				/>
			)}

			{showAttachments && (
				<AttachmentList
					isOpen={showAttachments}
					attachments={attachments}
					onClose={() => setShowAttachments(false)}
				/>
			)}
		</>
	);
}

export default Chat;