import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

export default function CustomAlert({
	message,
	onConfirm,
	onClose,
	showInput = false,
	inputPlaceholder = '',
	inputDefaultValue = ''
}) {

	const [v, setV] = useState(inputDefaultValue ?? '');
  
	useEffect(() => {
		const handler = (e) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	return (
		<div className="alert-wrapper">
			<div className="alert-container">
				<div className="alert-header">
					<h1 className="title">{showInput ? '입력' : '안내'}</h1>
				</div>
				<div className="alert-box">
					<div className="alert-message">
						{message}
					</div>
					{showInput && (
						<div className="field">
							<input type="text" className="text" placeholder={inputPlaceholder} value={v} onChange={(e) => setV(e.target.value)}/>
						</div>
					)}
				</div>
				<div className="alert-buttons">
					{typeof onConfirm === 'function' && (
						<button className="alert-button --cancel" onClick={onClose}>취소</button>
					)}
					<button className="alert-button" 
						onClick={() => {
							if (typeof onConfirm === 'function') {
								onConfirm(v);
							} else {
								onClose();
							}
						}}
					>확인</button>
				</div>
			</div>
		</div>
	);
}
