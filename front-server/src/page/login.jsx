import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, formatPhone, cleanPhone } from '@js/common-ui';
import Layer from '@common/Layer';

function Login({ onSwitchToSignUp }) {
	const [userId, setUserId] = useState('');
	const [userPw, setUserPw] = useState('');
	const [remember, setRemember] = useState(false);
	const [showFindPw, setShowFindPw] = useState(false);

	const [findName, setFindName] = useState('');
	const [findPhone, setFindPhone] = useState('');
	const [resetCode, setResetCode] = useState('');
	const [findEmail, setFindEmail] = useState('');
	const [emailVerified, setEmailVerified] = useState(false);
	const [newPassword, setNewPassword] = useState('');
	const [newPasswordCheck, setNewPasswordCheck] = useState('');

	const navigate = useNavigate();

	useEffect(() => {
		const savedId = localStorage.getItem('rememberId');
		if (savedId) {
			setUserId(savedId);
			setRemember(true);
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await authClient.post(`/login`, {
				userid: userId,
				password: userPw
			});
			if (res.data.status === 'success') {
				const token = res.data.data.token;
				localStorage.setItem('token', token);

				// 아이디 저장 여부 반영
				if (remember) {
					localStorage.setItem('rememberId', userId);
				} else {
					localStorage.removeItem('rememberId');
				}

				navigate('/home');
			} else {
				await window.customAlert('로그인에 실패했습니다.');
			}
		} catch (err) {
			await window.customAlert('로그인 중 오류가 발생했습니다.');
		}
	};

	const handleEmailVerification = async () => {
		if (!findEmail.trim()) {
			await window.customAlert('이메일을 입력하세요.');
			return;
		}

		try {
			console.log('비밀번호 재설정 코드 요청 이메일:', findEmail);
			// authClient의 baseURL이 이미 '/api/auth'이므로 '/forgot-password'만 사용
			await authClient.post('/forgot-password', { email: findEmail });
			await window.customAlert('비밀번호 재설정 코드가 발송되었습니다.');

			const code = await window.customPrompt('재설정 코드를 입력하세요.', 'XXXXXX');
			if (!code) return;

			// 재설정 코드를 변수에 저장
			setResetCode(code);
			setEmailVerified(true);  // 인증 완료
			await window.customAlert('재설정 코드가 확인되었습니다. 새 비밀번호를 입력하세요.');
		} catch (err) {
			console.log(err.response?.data);
			const errorMessage = err.response?.data?.errorCode === 'USER_NOT_FOUND' ? 
				'등록되지 않은 이메일입니다.' : '재설정 코드 발송에 실패했습니다.';
			await window.customAlert(errorMessage);
		}
	};

	// 사용하지 않는 임시 비밀번호 발송 함수 (주석 처리)
	// const handleFindPwRequest = async () => {
	// 	if (!findName.trim() || !findPhone.trim() || !findEmail.trim()) {
	// 		await window.customAlert('이름, 휴대폰 번호, 이메일을 모두 입력해주세요.');
	// 		return;
	// 	}

	// 	try {
	// 		const res = await authClient.post(`/find-password`, {
	// 			name: findName,
	// 			phone: cleanPhone(findPhone),
	// 			email: findEmail
	// 		});

	// 		if (res.data.status === 'success') {
	// 			await window.customAlert('임시 비밀번호가 이메일로 발송되었습니다.');
	// 			setShowFindPw(false);
	// 		} else {
	// 			await window.customAlert(res.data.message || '비밀번호를 찾을 수 없습니다.');
	// 		}
	// 	} catch (err) {
	// 		await window.customAlert('비밀번호 찾기 중 오류가 발생했습니다.');
	// 	}
	// };

	// 사용하지 않는 requestData 객체 (주석 처리)
	// const requestData = {
	// 	name: findName,
	// 	phone: cleanPhone(findPhone),
	// 	email: findEmail
	// };
	
	const handleChangePassword = async () => {
		if (!newPassword || !newPasswordCheck) {
			await window.customAlert('새 비밀번호를 모두 입력하세요.');
			return;
		}
		if (newPassword !== newPasswordCheck) {
			await window.customAlert('비밀번호가 일치하지 않습니다.');
			return;
		}
		if (!emailVerified || !resetCode) {
			await window.customAlert('이메일 인증을 먼저 완료하세요.');
			return;
		}

		try {
			console.log('비밀번호 재설정 요청:', {
				username: findEmail, // 시스템에서 email이 username 역할
				email: findEmail,
				resetCode: resetCode
			});

			const res = await authClient.post('/reset-password', {
				username: findEmail, // 백엔드에서 요구하는 username 전달
				email: findEmail,
				resetCode: resetCode,
				newPassword: newPassword
			});

			if (res.data.status === 'success') {
				await window.customAlert('비밀번호가 성공적으로 변경되었습니다.');
				// 폼 초기화 및 모달 닫기
				setShowFindPw(false);
				setFindEmail('');
				setNewPassword('');
				setNewPasswordCheck('');
				setResetCode('');
				setEmailVerified(false);
			} else {
				const errorMessage = res.data.errorCode === 'PASSWORD_RESET_FAILED' ? 
					'재설정 코드가 만료되었거나 잘못되었습니다.' : '비밀번호 변경에 실패했습니다.';
				await window.customAlert(errorMessage);
			}
		} catch (err) {
			console.log('비밀번호 변경 에러:', err.response?.data);
			const errorCode = err.response?.data?.errorCode;
			const errorMessage = errorCode === 'USER_NOT_FOUND' ? '사용자를 찾을 수 없습니다.' :
				errorCode === 'RESET_CODE_REQUIRED' ? '재설정 코드를 입력하세요.' :
				errorCode === 'PASSWORD_RESET_FAILED' ? '재설정 코드가 만료되었거나 잘못되었습니다.' :
				'비밀번호 변경 중 오류가 발생했습니다.';
			await window.customAlert(errorMessage);
		}
	};

	const isFormFilled = useMemo(() => {
		// 이메일 인증 전: 이메일만 필요
		if (!emailVerified) {
			return findEmail.trim();
		}
		// 이메일 인증 후: 새 비밀번호 입력 필요
		return (
			findEmail.trim() &&
			emailVerified &&
			resetCode.trim() &&
			newPassword.trim() &&
			newPasswordCheck.trim()
		);
	}, [findEmail, emailVerified, resetCode, newPassword, newPasswordCheck]);


	return (
		<>
			<div className="login">
				<div className="login__container">

					<h1 className='animation-logo' aria-label="Bridge Hub">
						<div className="animation-logo__imgmotion">
							<div className="animation-logo__wave">
								<i className="animation-logo__wave1"></i>
								<i className="animation-logo__wave2"></i>
							</div>
						</div>
					</h1>

					<form className="login__area" onSubmit={handleSubmit}>
						<div className="login__forms">
							<div className="field">
								<input className="text" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="이메일를 입력하세요"/>
							</div>
							<div className="field">
								<input className="text" type="password" value={userPw} onChange={(e) => setUserPw(e.target.value)} placeholder="비밀번호를 입력하세요"/>
							</div>
						</div>
						
						<div className="login__options">
							<div className="find-buttons">
								<button type="button" className='fund-button' onClick={() => setShowFindPw(true)}>비빌번호를 잊으셨나요?</button>
							</div>
							<div className="login__checkbox">
								<input type="checkbox" id="remember" className='hide' checked={remember} onChange={(e) => setRemember(e.target.checked)} />
								<label htmlFor="remember">아이디 기억하기</label>
							</div>
						</div>

						<div className="login__buttons">
							<button type="submit" className="login__button">로그인</button>
							<button type="button" className="login__button login__button--signup" onClick={onSwitchToSignUp}>회원가입</button>
						</div>
					</form>
				</div>
			</div>,
			{showFindPw && (
				<Layer isOpen={showFindPw} onClose={() => setShowFindPw(false)} closeOnOverlayClick={false} header="비밀번호 찾기" footer={
					emailVerified ? (
						<button className="layer__submit" onClick={handleChangePassword} disabled={!isFormFilled}>
							비밀번호 변경
						</button>
					) : (
						<button className="layer__submit" onClick={handleEmailVerification} disabled={!isFormFilled}>
							재설정 코드 발송
						</button>
					)
				}>
					<label htmlFor='findId' className="label hide">이름</label>
					<div className="field">
						<input type="text" name="findId" id="findId" className="text" placeholder="이름을 입력하세요" value={findName} onChange={(e) => setFindName(e.target.value)} />
					</div>
					<label htmlFor='findHp' className="label hide">휴대폰 번호</label>
					<div className="field">
						<input type="tel" className="text" name="hp" value={findPhone || ''} onChange={(e) => setFindPhone(formatPhone(e.target.value))} maxLength={13} placeholder="휴대폰번호를 입력하세요"/>
					</div>
					<div className="field">
						<input type="email" className="text" name="email" value={findEmail} onChange={(e) => setFindEmail(e.target.value)} placeholder="이메일을 입력하세요"/>
						<button type="button" className="middle-button" onClick={handleEmailVerification}>이메일인증</button>
					</div>
					{emailVerified && (
						<>
							<div className="field">
								<input type="password" name="newPw" id="newPw" className="text"
									placeholder="새 비밀번호를 입력하세요" value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)} />
							</div>
							<label htmlFor="newPwCheck" className="label hide">비밀번호 확인</label>
							<div className="field">
								<input type="password" name="newPwCheck" id="newPwCheck" className="text"
									placeholder="비밀번호를 다시 입력하세요" value={newPasswordCheck}
									onChange={(e) => setNewPasswordCheck(e.target.value)} />
							</div>
						</>
					)}
				</Layer>
			)}
		</>
	);
}

export default Login; 

