import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';
import profileDefault from '/uploads/profile/default-profile1.png';
import { userClient, getUsernameFromToken } from '@js/common-ui';

const MyPage = () => {
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		profileImg: '',
		nickname: '',
		hp: '',
		education: '',
		department: '',
		region: '',
		district: '',
		timeZone: '',
		memo: ''
	});
	const [editData, setEditData] = useState({
		profileImg: '',
		nickname: '',
		hp: '',
		education: '',
		department: '',
		region: '',
		district: '',
		timeZone: '',
		memo: '',
		password: '',
		passwordConfirm: ''
	});
	const locationOptions = {
		'지역무관': [],
		'서울': ['강남구', '서초구', '송파구', '강동구', '마포구'],
		'부산': ['해운대구', '수영구', '부산진구', '동래구', '남구'],
		'대구': ['중구', '수성구', '달서구', '동구', '북구']
	};
	
	const handleEditProfile = async () => {
		if (isEditing) {
			if (editData.password && editData.password !== editData.passwordConfirm) {
				await window.customAlert('비밀번호가 일치하지 않습니다.');
				return;
			}

			const username = getUsernameFromToken();
			try {
				const requestBody = {
					nickname: editData.nickname,
					phone: editData.hp,
					education: editData.education,
					department: editData.department,
					region: editData.region,
					district: editData.district,
					time: editData.timeZone
				};

				// 비밀번호 입력이 있으면 함께 전송
				if (editData.password) {
					requestBody.password = editData.password;
				}

				// 프로필 이미지가 변경되었으면 함께 전송
				if (editData.profileImg && editData.profileImg !== profileData.profileImg) {
					requestBody.profileImage = editData.profileImg;
				}

				const res = await userClient.put(`/api/members/${username}`, requestBody, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json'
					}
				});
				

				if (res.data.status === 'success') {
					await window.customAlert('회원 정보가 수정되었습니다.');
					setProfileData({
						...profileData,
						...editData,
						password: '',
						passwordConfirm: ''
					});
					setEditData(prev => ({
						...prev,
						password: '',
						passwordConfirm: ''
					}));
					setIsEditing(false);
				} else {
					await window.customAlert('회원 정보 수정에 실패했습니다.');
				}
			} catch (err) {
				await window.customAlert('회원 정보 수정 중 오류가 발생했습니다.');
			}
		} else {
			setEditData({
				nickname: profileData.nickname || '',
				hp: profileData.hp || '',
				education: profileData.education || '',
				department: profileData.department || '',
				region: profileData.region || '',
				district: profileData.district || '',
				timeZone: profileData.timeZone || '',
				memo: profileData.memo || '',
				profileImg: profileData.profileImg || ''
			});
			setIsEditing(true);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditData(prev => ({
			...prev,
			[name]: value
		}));
	};

	useEffect(() => {
		console.log('로컬스토리지 토큰:', localStorage.getItem('token'));
		const username = getUsernameFromToken();
		console.log('토큰에서 추출한 username:', username);
		if (!username) {
			window.customAlert('로그인이 필요합니다.');
			navigate('/login');
			return;
		}

		const fetchProfile = async () => {
			try {
				const res = await userClient.get(`/api/members/${username}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				
				console.log(res.data);  // 바로 여기!

				if (res.data.status === 'success') {
					const newProfileData = {
						profileImg: res.data.data.profileImage || '',
						nickname: res.data.data.nickname || '',
						hp: res.data.data.phone || '',
						education: res.data.data.education || '',
						department: res.data.data.department || '',
						region: res.data.data.region || '',
						district: res.data.data.district || '',
						timeZone: res.data.data.time || '',
						memo: res.data.data.memo || ''
					};
					setProfileData(newProfileData);
					// editData도 초기값으로 설정
					setEditData({
						...newProfileData,
						password: '',
						passwordConfirm: ''
					});
				} else {
					await window.customAlert('회원 정보를 불러오는데 실패했습니다.');
				}
			} catch (err) {
				await window.customAlert('회원 정보 조회 중 오류가 발생했습니다.');
			}
		};
		fetchProfile();
	}, []);

	return (
		<div className="mypage-container">
			{isEditing ? (
				<Header isEditing={true} showSearch={false} />
			) : (
				<Header showSearch={false} />
			)}

			<div className="profile-img">
				{isEditing ? (
					<>
						<button type="button" className='profile-img__button' onClick={() => document.getElementById('profileImgInput').click()}>
							<span className='hide'>프로필 변경하기</span>
						</button>
						<input type="file" id="profileImgInput" accept="image/*" style={{ display: 'none' }}
							onChange={(e) => {
								const file = e.target.files[0];
								if (file) {
									const reader = new FileReader();
									reader.onloadend = () => {
										setEditData(prev => ({
											...prev,
											profileImg: reader.result
										}));
									};
									reader.readAsDataURL(file);
								}
							}}
						/>
						<img src={editData.profileImg || profileDefault} className='profile-img__img' alt="나의 프로필 이미지"/>
					</>
				) : (
					<img src={profileData.profileImg || profileDefault} className='profile-img__img' alt="나의 프로필 이미지"/>
				)}
			</div>
			
			<div className="info-row-area">
				{isEditing ? (
					<>
						<div className="info-row">
							<label htmlFor='nickname' className="label">닉네임</label>
							<div className="field">
								<input type="text" name="nickname" id="nickname" value={editData.nickname || ''} className="text" placeholder="별명을 입력하세요" onChange={handleInputChange}/>
							</div>
						</div>
						<div className="info-row">
							<label htmlFor='password' className="label">비밀번호</label>
							<div className="field">
								<input type="password" name="password" id="password" value={editData.password || ''} className="text" placeholder="비밀번호를 입력하세요" onChange={handleInputChange}/>
							</div>
							<div className="field">
								<input type="password" name="passwordConfirm" value={editData.passwordConfirm || ''} className="text" placeholder="비밀번호를 다시 입력하세요" onChange={handleInputChange}/>
							</div>
						</div>
						<div className="info-row">
							<label htmlFor='hp' className="label">휴대폰번호</label>
															<div className="field">
									<input type="tel" name="hp" id="hp" value={editData.hp || ''} className="text" placeholder="휴대폰번호를 입력하세요" onChange={handleInputChange}/>
								</div>
						</div>
						<div className="info-row info-row--major">
							<h4 className="label">전공</h4>
							<div className="half-field">
								<div className="field">
									<select className="select" name="education" value={editData.education || ''} onChange={handleInputChange}>
										<option value="">학력</option>
										<option value="고졸">고졸</option>
										<option value="대학교">대학교</option>
										<option value="대학원">대학원</option>
									</select>
								</div>
								<div className="field">
									<select className="select" name="department" value={editData.department || ''} onChange={handleInputChange}>
										<option value="">학과/학부 선택</option>
										<option value="컴퓨터공학과">컴퓨터공학과</option>
										<option value="소프트웨어학과">소프트웨어학과</option>
										<option value="정보통신공학과">정보통신공학과</option>
									</select>
								</div>
							</div>
						</div>
						<div className="info-row info-row--location">
							<h4 className="label">지역</h4>
							<div className="half-field">
								<div className="field">
									<select className="select" name="region" value={editData.region || ''} onChange={handleInputChange}>
										<option value="지역무관">지역무관</option>
										<option value="서울">서울</option>
										<option value="대구">대구</option>
										<option value="부산">부산</option>
									</select>
								</div>
								{editData.region && editData.region !== '지역무관' && (
									<div className="field">
										<select className="select" name="district" value={editData.district || ''} onChange={handleInputChange}>
											<option value="">세부 지역 선택</option>
											{locationOptions[editData.region]?.map(sub => (
												<option key={sub} value={sub}>{sub}</option>
											))}
										</select>
									</div>
								)}
							</div>
						</div>
						<div className="info-row">
							<span className="label">시간대</span>
							<div className="field">
								<select className="select" name="timeZone" value={editData.timeZone || ''} onChange={handleInputChange}>
									<option value="">선호 시간대 선택</option>
									<option value="오전">오전 (06:00-12:00)</option>
									<option value="오후">오후 (12:00-18:00)</option>
									<option value="야간">저녁 (18:00-24:00)</option>
								</select>
							</div>
						</div>
						<div className="info-row">
							<label htmlFor="memo" className="label">메모</label>
							<div className="field __textarea">
								<textarea className="textarea" id="memo" name="memo" value={editData.memo || ''} onChange={handleInputChange} placeholder="경력, 이력, 메모 등 자유롭게 작성하세요" />
							</div>
						</div>
					</>
				) : (
					<>
						<div className="info-row profile-data">
							<span className="label">닉네임</span>
							<span className="value">{profileData.nickname}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">휴대폰번호</span>
							<span className="value">{profileData.hp}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">전공</span>
							<span className="value">{profileData.education && profileData.department ? `${profileData.education} ${profileData.department}` : profileData.education || profileData.department}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">지역</span>
							<span className="value">{profileData.region === '지역무관' ? '지역무관' : `${profileData.region} ${profileData.district}`}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">시간대</span>
							<span className="value">{profileData.timeZone}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">메모</span>
							<span className="value">{profileData.memo}</span>
						</div>
					</>
				)}
			</div>
			<div className="fixed">
				<button type="button" className="button button-primary" onClick={handleEditProfile}>
					{isEditing ? '수정 완료' : '프로필 수정'}
				</button>
			</div>
		</div>
	);
};

export default MyPage;
