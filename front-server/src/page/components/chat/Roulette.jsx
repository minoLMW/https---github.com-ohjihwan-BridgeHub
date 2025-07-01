import { useState } from 'react';
import { customAlert } from '@/assets/js/common-ui';

const Roulette = ({ users, isOwner, onSpinStart, onWinnerSelected }) => {
	const [checkedUsers, setCheckedUsers] = useState(users.map(user => ({ name: user, checked: true })));
	const [spinning, setSpinning] = useState(false);

	const toggleUser = (index) => {
		setCheckedUsers(prev => {
			const updated = [...prev];
			updated[index].checked = !updated[index].checked;
			return updated;
		});
	};

	const handleSpin = () => {
		const candidates = checkedUsers.filter(user => user.checked).map(user => user.name);
		if (spinning) return;

		if (candidates.length <= 1) {
			customAlert('혼자서는 게임을 실행할 수 없습니다');
			return;
		}

		setSpinning(true);
		onSpinStart();

		const randomIndex = Math.floor(Math.random() * candidates.length);
		const selected = candidates[randomIndex];

		setTimeout(() => {
			setSpinning(false);
			onWinnerSelected(selected);
		}, 3000);
	};

	return (
		<div className="roulette">
			<ul className="roulette__list">
				{checkedUsers.map((user, i) => (
					<li key={i} className="roulette__item">
						<input type="checkbox" id={`user${i}`} checked={user.checked} onChange={() => toggleUser(i)} disabled={!isOwner || spinning} />
						<label htmlFor={`user${i}`} className="roulette__label">
							<span>{user.name}</span>
						</label>
					</li>
				))}
			</ul>
			{isOwner && (
				<div className="roulette__bottom">
					<button className="roulette__spin" onClick={handleSpin} disabled={spinning}>돌리기</button>
				</div>
			)}
		</div>
	);
};

export default Roulette;
