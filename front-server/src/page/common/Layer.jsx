import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';

const Layer = ({ isOpen, onClose, children, header = null, footer = null,  closeOnOverlayClick = true }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<>
			<div className="overlay" onClick={closeOnOverlayClick ? onClose : undefined}></div>
			<div className={`layer ${isVisible ? 'slide-up' : ''}`}>
				{header && (
					<div className="layer__header">
						<h2 className="layer__title">{header}</h2>
						<button className="layer__close" onClick={onClose} aria-label="닫기"></button>
					</div>
				)}
				<div className="layer__content">
					{children}
				</div>
				
				{footer && (
					<div className="layer__buttons">
						{typeof footer === 'string' ? (
							<button className="layer__submit" onClick={onClose}>{footer}</button>
						) : (
							footer
						)}
					</div>
				)}
			</div>
		</>,
		document.body
	);
};

export default Layer;