import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 예: 토큰 삭제
    localStorage.removeItem('authToken');
    // 로그아웃 후 로그인 페이지로 이동
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>BridgeHub</h2>
      <div className="menu">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">📊</span>
              <span>대시보드</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">👥</span>
              <span>회원관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">🚨</span>
              <span>신고관리</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/statistics" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">📈</span>
              <span>통계</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;