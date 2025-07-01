import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { customConfirm } from '@/assets/js/common-ui';

const AttachmentList = ({ isOpen, attachments, onClose }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 100);
			return () => clearTimeout(timer);
		} else {
			setIsVisible(false);
		}
	}, [isOpen]);

	useEffect(() => {
		console.log('attachments:', attachments);
	}, [attachments]);

	const handleDownload = (att) => {
		customConfirm(`'${att.name}'을 내려 받으시겠습니까?`, () => {
			console.log(`파일 다운로드 시도: ${att.name}, fileId: ${att.fileId}`);
			
			// 실제 다운로드 실행
			if (att.fileId && att.fileId !== 'undefined' && att.fileId !== null) {
				const downloadUrl = `/api/files/download/${att.fileId}`;
				console.log(`다운로드 URL: ${downloadUrl}`);
				
				// 방법 1: 토큰 포함한 URL로 새 탭에서 다운로드
				const token = localStorage.getItem('token');
				if (token) {
					const urlWithToken = `${downloadUrl}?Authorization=Bearer%20${encodeURIComponent(token)}`;
					
					// a 태그를 이용한 다운로드
					const link = document.createElement('a');
					link.href = downloadUrl;
					link.download = att.name;
					link.target = '_blank';
					link.style.display = 'none';
					
					// 헤더에 토큰을 포함할 수 없으므로 간단한 방식 사용
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					
					console.log(`✅ '${att.name}' 다운로드 링크 클릭 완료`);
					
					// 추가로 새 탭에서도 열기 (backup)
					setTimeout(() => {
						window.open(downloadUrl, '_blank');
					}, 100);
				} else {
					// 토큰이 없는 경우 간단한 다운로드
					window.open(downloadUrl, '_blank');
				}
			} else {
				console.error('❌ 유효하지 않은 fileId:', att.fileId);
				alert('파일 다운로드에 실패했습니다. (유효하지 않은 파일 ID)');
			}
		});
	};

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className={`attachment-list ${isVisible ? 'slide-right' : ''}`}>
			<h3 className="attachment-list__title">첨부파일 모아보기</h3>
			<ul>
				{attachments.map((att, idx) => {
					const ext = att.name.split('.').pop().toLowerCase() || '';
					return (
						<li key={idx} className={`attachment-list__item`}>
							<button type="button" className="attachment-list__down" onClick={() => handleDownload(att)}>
								<div className={`attachment-list__img attachment-list__img--${ext}`}></div>
								{att.name}
							</button>
						</li>
					)
				})}
			</ul>
			<button type="button" onClick={onClose} className="attachment-list__close" aria-label="닫기"></button>
		</div>,
		document.body
	);
};

export default AttachmentList;