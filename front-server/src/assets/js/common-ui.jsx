import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomAlert from '@common/customAlert';
import axios from 'axios';

// ----------- 커스텀 알럿 관련 -----------

let root = null;

export function customAlert(message) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		if (!alertRoot) {
			console.error('#alert-root 요소를 찾을 수 없습니다.');
			return;
		}
		if (!root) {
			root = createRoot(alertRoot);
		}
		const handleClose = () => {
			root.render(null);
			resolve();
		};
		root.render(
			<CustomAlert message={message} onClose={handleClose} />
		);
	});
}

export function customConfirm(message, onConfirm) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		if (!alertRoot) {
			console.error('#alert-root 요소를 찾을 수 없습니다.');
			return;
		}

		if (!root) {
			root = createRoot(alertRoot);
		}

		const handleClose = () => {
			root.render(null);
			resolve(false);
		};

		const handleConfirm = () => {
			root.render(null);
			onConfirm?.();
			resolve(true);
		};

		root.render(
			<CustomAlert message={message} onClose={handleClose} onConfirm={handleConfirm} />
		);
	});
}

export function customPrompt(message, placeholder = '', defaultValue = '', onSubmit = null) {
	return new Promise((resolve) => {
		const alertRoot = document.getElementById('alert-root');
		if (!alertRoot) {
			console.error('#alert-root 요소를 찾을 수 없습니다.');
			return;
		}
		if (!root) {
			root = createRoot(alertRoot);
		}

		const handleClose = () => {
			root.render(null);
			resolve(null);
		};

		const handleConfirm = (value) => {
			if (typeof onSubmit === 'function') {
				onSubmit(value);
			}
			root.render(null);
			resolve(value);
		};

		root.render(
			<CustomAlert
				message={message}
				onClose={handleClose}
				onConfirm={handleConfirm}
				showInput={true}
				inputPlaceholder={placeholder}
				inputDefaultValue={defaultValue}
			/>
		);
	});
}

export default { customAlert, customConfirm, customPrompt };

// ----------- 로딩 관련 -----------

export function showLoading() {
	const loading = document.getElementById('global-loading');
	if (loading) loading.style.display = 'flex';
}

export function hideLoading() {
	const loading = document.getElementById('global-loading');
	if (loading) loading.style.display = 'none';
}

window.showLoading = showLoading;
window.hideLoading = hideLoading;

// ----------- axios 다중 클라이언트 -----------

export const authClient = axios.create({
	baseURL: '/api/auth',
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});
export const userClient = axios.create({
	baseURL: '/',
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});
export const studyClient = axios.create({
	baseURL: '/api/studies',
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});
export const boardClient = axios.create({
    baseURL: '/api/board',  // 상대 경로 - 프록시 사용!
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export const getAccessToken = () => {
	return localStorage.getItem('token');
};
[authClient, userClient, studyClient, boardClient].forEach(client => {
	client.interceptors.request.use(config => {
		window.showLoading?.();
		return config;
	}, error => {
		window.hideLoading?.();
		return Promise.reject(error);
	});

	client.interceptors.response.use(response => {
		window.hideLoading?.();
		return response;
	}, error => {
		window.hideLoading?.();
		return Promise.reject(error);
	});
});

export const getUsernameFromToken = () => {
	const token = localStorage.getItem('token');
	if (!token) return null;

	try {
		const base64Payload = token.split('.')[1];
		if (!base64Payload) return null;

		const payload = JSON.parse(atob(base64Payload));
		return payload.sub || payload.username || payload.email || null;
	} catch (e) {
		return null;
	}
};

// ----------- 기타 : [휴대폰번호 정규식 입력] -----------
export const formatPhone = (value) => {
	const onlyNumber = value.replace(/\D/g, '');
	if (onlyNumber.length < 4) return onlyNumber;
	if (onlyNumber.length < 8) return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3)}`;
	return `${onlyNumber.slice(0, 3)}-${onlyNumber.slice(3, 7)}-${onlyNumber.slice(7, 11)}`;
};

export const cleanPhone = (value) => {
	return value.replace(/-/g, '');
};

// ----------- 게시판 관련 -----------
export const createPost = async (post) => {
	const token = localStorage.getItem("token");
	const res = await boardClient.post('', post, {
		headers: { Authorization: `Bearer ${token}` },
		withCredentials: true,
	});
	return res.data;
};

export const getPosts = async (page = 0, size = 10, categoryId = 1, search = "", sort = "recent") => {
	const token = localStorage.getItem("token")
	const params = new URLSearchParams()
	params.append("categoryId", categoryId)
	if (search) params.append("search", search)
	if (sort) params.append("sort", sort)
	params.append("page", page)
	params.append("size", size)

	const res = await boardClient.get(`?${params.toString()}`, {
		headers: { Authorization: `Bearer ${token}` },
		withCredentials: true,
	})
	return res.data.data.boards
}