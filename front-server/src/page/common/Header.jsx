import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customAlert, customConfirm } from '@/assets/js/common-ui';

const Header = ({ isEditing = false, showSearch = true, title = '', onSearch = () => {}, onShowAttachments = () => {} }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	const isHome = location.pathname === '/home';

	const handleBackClick = () => {
		if (isEditing) {
			customConfirm('작성 중인 내용이 있습니다. 정말 뒤로 가시겠습니까?', () => navigate(-1));
		} else {
			navigate(-1);
		}
	};

	const handleHomeClick = () => {
		navigate('/home');
	};

	const handleLogout = () => {
		customConfirm('로그아웃 하시겠습니까?', () => {
			localStorage.removeItem('token');
			setMenuOpen(false);
			navigate('/login');
		});
	};

	const handleMyPageClick = () => {
		setMenuOpen(false);
		navigate('/mypage');
	};

	const toggleMenu = () => {
		setMenuOpen(prev => !prev);
	};

	const handleExitChat = () => {
		customConfirm('정말 스터디룸을 탈퇴하시겠습니까?', () => {
			setMenuOpen(false);
			customAlert('스터디룸을 탈퇴했습니다.');
			navigate('/home');
		});
	};

	// 바깥 클릭 시 메뉴 닫기 (선택사항)
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	return (
		<header className="header">
			<div className="header__left">
				{isHome ? (
					<h1 className="logo">
						<a href="/home" onClick={(e) => { e.preventDefault(); handleHomeClick(); }}>
							<span className="hide">BridgeHub</span>
						</a>
					</h1>
				) : (
					<button type="button" className="header__left__back" onClick={handleBackClick}>
						<span className="hide">뒤로가기</span>
					</button>
				)}
			</div>

			<h2 className="header__title">
				{( location.pathname === '/chat' && title || location.pathname === '/search' && title || location.pathname === '/board' && title )}
			</h2>
			
			<div className="header__right" ref={menuRef}>
				{showSearch && (
					<button type="button" className="header__right__search" onClick={onSearch}>
						<span className="hide">검색</span>
					</button>
				)}
				<button type="button" className="header__right__menu" onClick={toggleMenu}>
					<span className="hide">메뉴 열기</span>
				</button>
				<div className={`user-menu${menuOpen ? ' --on' : ''}`}>
					<ul>
						{location.pathname !== '/mypage' && (
							<li className='user-menu__item'>
								<a href="/mypage" onClick={(e) => { e.preventDefault(); handleMyPageClick(); }}>마이페이지</a>
							</li>
						)}
						<li className='user-menu__item'>
							<a href="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>로그아웃</a>
						</li>
						{location.pathname === '/chat' && (
							<li className="user-menu__item">
								<a href="/exit" onClick={(e) => { e.preventDefault(); onShowAttachments(); }}>파일 모아보기</a>
								<a href="/exit" onClick={(e) => { e.preventDefault(); handleExitChat(); }}>방신고하기</a>
								<a href="/exit" onClick={(e) => { e.preventDefault(); handleExitChat(); }}>탈퇴하기</a>
							</li>
						)}
					</ul>
				</div>
			</div>
		</header>
	);
};

export default Header; 