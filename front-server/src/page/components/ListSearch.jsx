import React from 'react';

const SearchInput = ({ value, onChange, onClose }) => {
	return (
		<div className="search-room">
			<div className="field">
				<input
					type="text"
					className="text"
					name="name"
					value={value}
					onChange={onChange}
					placeholder="검색어 입력"
				/>
			</div>
			<button
				className="search-room__button"
				onClick={onClose}
				aria-label="검색 닫기"
			></button>
		</div>
	);
};

export default SearchInput;
