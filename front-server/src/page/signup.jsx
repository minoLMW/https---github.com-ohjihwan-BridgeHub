import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import subjects from '@json/subject';
import regionData from '@json/region';
import { authClient, formatPhone, cleanPhone } from '@js/common-ui';

function SignUp({ onSwitchToLogin, isActive }) {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [visibleIndexes, setVisibleIndexes] = useState([]);
	const [gender, setGender] = useState('man');
	const [emailVerified, setEmailVerified] = useState(false);
	
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		passwordConfirm: '',
		nickname: '',
		education: '',
		department: '',
		region: '지역무관',
		district: '지역무관',
		timeZone: '',
		gender: '남자',
		hp: ''
	});

	const handleEmailVerification = async () => {
		if (!formData.email) {
			await window.customAlert('이메일을 입력하세요.');
			return;
		}

		try {
			await authClient.post('/send-verification', { email: formData.email });
			await window.customAlert('인증 코드가 발송되었습니다.');

			const code = await window.customPrompt('인증코드를 입력하세요.', 'XXXXXX');
			if (!code) return;

			const res = await authClient.post(`/verify-email`, { email: formData.email, code });
			if (res.data.status === 'success') {
				await window.customAlert('이메일 인증이 완료되었습니다.');
				setEmailVerified(true);
			} else {
				await window.customAlert('인증 실패');
			}
		} catch (err) {
			await window.customAlert('인증 요청 실패');
		}
	};

	useEffect(() => {
		if (!isActive) return;

		triggerStepAnimation(step);

		const area = document.querySelector('.signup__area');
		const handleFocus = (e) => {
			if (e.target.matches('input.text, select.select')) {
				const field = e.target.closest('.field');
				if (field) field.classList.remove('--field__error');
			}
		};

		area.addEventListener('focusin', handleFocus);
		return () => area.removeEventListener('focusin', handleFocus);
	}, [isActive, step]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === 'region') {
			setFormData(prev => ({
				...prev,
				region: value,
				district: '지역무관'
			}));
		} else if (name === 'hp') {
			setFormData(prev => ({
				...prev,
				hp: formatPhone(value)
			}));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const markFieldError = (fieldName) => {
		const field = document.querySelector(`.signup__area [name="${fieldName}"]`)?.closest('.field');
		if (field) field.classList.add('--field__error');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (step === 1) {
			document.querySelectorAll('.signup__area .field').forEach(f => f.classList.remove('--field__error'));

			const requiredFields = [
				{ key: 'name', label: '이름' },
				{ key: 'nickname', label: '별명' },
				{ key: 'email', label: '이메일' },
				{ key: 'password', label: '비밀번호' },
				{ key: 'passwordConfirm', label: '비밀번호 확인' },
				{ key: 'hp', label: '휴대폰번호' },
				{ key: 'gender', label: '성별' }
			];


			if (formData.password !== formData.passwordConfirm) {
				await window.customAlert('비밀번호가 일치하지 않습니다.');
				markFieldError('password');
				markFieldError('passwordConfirm');
				return;
			}

			if (!emailVerified) {
				await window.customAlert('이메일 인증을 완료하세요.');
				return;
			}

			setStep(2);
			return;
		}

		// 회원가입 최종 요청
		try {
			const requestData = {
				userid: formData.email,
				password: formData.password,
				name: formData.name,
				phone: cleanPhone(formData.hp),
				nickname: formData.nickname,
				education: formData.education || '',
				department: formData.department || '',
				gender: gender === 'man' ? '남자' : '여자',
				region: formData.region,
				district: formData.district === '지역무관' ? '' : formData.district,
				time: formData.timeZone || '',
				emailVerified: true
			};
			
			console.log('전송할 데이터:', requestData);
			
			const res = await authClient.post(`/register`, requestData);
			if (res.data.status === 'success') {
				await window.customAlert('회원가입이 완료되었습니다.');
				onSwitchToLogin();
			} else {
				await window.customAlert('회원가입에 실패했습니다.');
			}
		} catch (err) {
			console.error('회원가입 에러:', err.response?.data);
			await window.customAlert('회원가입 중 오류가 발생했습니다.');
		}
	};

	const triggerStepAnimation = (step) => {
		const fieldCounts = { 1: 6, 2: 5 };
		const count = fieldCounts[step];
		const delayBase = 75;
		const delayOffset = 300;
		const timers = [];

		setVisibleIndexes([]);
		for (let i = 0; i < count; i++) {
			const timer = setTimeout(() => {
				setVisibleIndexes(prev => [...prev, i]);
			}, delayOffset + i * delayBase);
			timers.push(timer);
		}
	};

	const getClassName = (base, index) => {
		return `${base} ${visibleIndexes.includes(index) ? 'showAni' : ''}`;
	};

	return (
		<div className="signup">
			<div className="signup__container">
				<h1 className='animation-logo' aria-label="Bridge Hub">
					<div className="animation-logo__imgmotion">
						<div className="animation-logo__wave">
							<i className="animation-logo__wave1"></i>
							<i className="animation-logo__wave2"></i>
						</div>
					</div>
				</h1>
				<form className="signup__area" onSubmit={handleSubmit}>
					{step === 1 ? (
						<div className="signup__forms">
							<div className={getClassName('half-field', 0)}>
								<div className="field">
									<input type="text" className="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="이름을 입력하세요"/>
								</div>
								<div className="field">
									<input type="text" className="text" name="nickname" value={formData.nickname || ''} onChange={handleChange} placeholder="별명을 입력하세요"/>
								</div>
							</div>
							<div className={getClassName('field', 1)}>
								<input type="email" className="text" name="email" value={formData.email || ''} onChange={handleChange} readOnly={emailVerified} placeholder="이메일을 입력하세요"/>
								{emailVerified ? (
									<button type="button" className="middle-button" onClick={() => {setEmailVerified(false); setFormData({ ...formData, email: '' });}}>다시 입력</button>
								) : ( 
									<button type="button" className="middle-button" onClick={handleEmailVerification}>이메일인증</button>
								)}
							</div>
							<div className={getClassName('field', 2)}>
								<input type="password" className="text" name="password" value={formData.password || ''} onChange={handleChange} placeholder="비밀번호를 입력하세요"/>
							</div>
							<div className={getClassName('field', 3)}>
								<input type="password" className="text" name="passwordConfirm" value={formData.passwordConfirm || ''} onChange={handleChange} placeholder="비밀번호를 다시 입력하세요"/>
							</div>
							<div className={getClassName('radios', 4)}>
								<div className="radio">
								<label htmlFor="man">남자</label>
								<input type="radio" name="gender" id="man" checked={gender === 'man'} onChange={() => setGender('man')}/>
								</div>
								<div className="radio">
								<label htmlFor="woman">여자</label>
								<input type="radio" name="gender" id="woman" checked={gender === 'woman'} onChange={() => setGender('woman')}/>
								</div>
								<span className={`switcher ${gender}`}></span>
							</div>
							<div className={getClassName('field', 5)}>
								<input type="tel" className="text" name="hp" value={formData.hp || ''} onChange={(e) => setFormData({ ...formData, hp: formatPhone(e.target.value) })} maxLength={13} placeholder="휴대폰번호를 입력하세요"/>
							</div>
						</div>
					) : (
						<div className="signup__forms">
							<div className={getClassName('half-field', 0)}>
								<div className="field">
								<select className="select" name="education" value={formData.education} onChange={handleChange}>
									<option value="">학력</option>
									{subjects["학력"].map((v) => (
										<option key={v} value={v}>{v}</option>
									))}
								</select>
								</div>
								<div className="field">
								<select className="select" name="department" value={formData.department} onChange={handleChange}>
									<option value="">계열 선택</option>
									{subjects["계열"].map((v) => (
										<option key={v} value={v}>{v}</option>
									))}
								</select>
								</div>
							</div>
							<div className={getClassName('half-field', 1)}>
								<div className="field">
								<select className="select" name="region" value={formData.region} onChange={handleChange}>
									<option value="지역무관">지역무관</option>
									{Object.keys(regionData).map((region) => (
										<option key={region} value={region}>
											{region}
										</option>
									))}
								</select>
								</div>
								<div className="field" style={{ display: formData.region === '지역무관' ? 'none' : 'block' }}>
								<select className="select" name="district" value={formData.district} onChange={handleChange}>
								{regionData[formData.region]?.map((district) => (
									<option key={district} value={district}>
										{district}
									</option>
								))}
								</select>
								</div>
							</div>
							<div className={getClassName('field', 2)}>
								<select className="select" name="timeZone" value={formData.timeZone} onChange={handleChange}>
								<option value="">선호 시간대</option>
								{subjects["선호 시간대"].map((v) => (
									<option key={v} value={v}>{v}</option>
								))}
								</select>
							</div>
						</div>
					)}
					<div className="signup__buttons">
						{step === 1 ? (
							<>
								<button type="submit" className="signup__button">다음 단계</button>
								<button type="button" className="signup__button signup__button--text" onClick={onSwitchToLogin}>로그인으로 돌아가기</button>
							</>
						) : (
							<>
								<button type="submit" className="signup__button">가입완료</button>
								<button type="button" className="signup__button signup__button--text" onClick={() => setStep(1)}>이전으로</button>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

export default SignUp;
