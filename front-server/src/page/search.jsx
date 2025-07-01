import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import Detail from '@components/Detail';
import axios from 'axios';

const Search = () => {
	const location = useLocation();
	const studyInfo = location.state;
	const [searchKeyword, setSearchKeyword] = useState('');
	const [showRecommended, setShowRecommended] = useState(true);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	// 실제 API에서 스터디룸 데이터 가져오기
	useEffect(() => {
		const fetchRooms = async () => {
			setLoading(true);
			try {
				const response = await axios.get('/api/studies');
				if (response.data.status === 'success' && Array.isArray(response.data.data)) {
					setRooms(response.data.data);
				} else {
					setRooms([]);
				}
			} catch (error) {
				console.error('스터디룸 목록 조회 실패:', error);
				setRooms([]);
			} finally {
				setLoading(false);
			}
		};

		fetchRooms();
	}, []);

	const recommendedKeywords = useMemo(() => {
		const trimmedKeyword = searchKeyword.trim().toLowerCase();
		if (!trimmedKeyword) return [];

		const keywordSet = new Set();

		rooms.forEach(room => {
			room.title.split(' ').forEach(word => {
				if (word.toLowerCase().includes(trimmedKeyword)) {
					keywordSet.add(word);
				}
			});
			room.region.split(' ').forEach(word => {
				if (word.toLowerCase().includes(trimmedKeyword)) {
					keywordSet.add(word);
				}
			});
		});

		return Array.from(keywordSet);
	}, [searchKeyword, rooms]);

	// 실제 검색 결과
	const filteredRooms = useMemo(() => {
		const trimmedKeyword = searchKeyword.trim().toLowerCase();
		if (!trimmedKeyword) return [];

		return rooms.filter((room) =>
			room.title.toLowerCase().includes(trimmedKeyword) ||
			room.region.toLowerCase().includes(trimmedKeyword)
		);
	}, [searchKeyword, rooms]);

	const handleItemClick = (room) => {
		setSelectedRoom({ ...room, id: room.studyRoomId });
		setShowDetail(true);
		setIsClosing(false);
	};

	const handleDetailClose = () => {
		setIsClosing(true);
	};

	useEffect(() => {
		if (isClosing) {
			const timer = setTimeout(() => {
				setShowDetail(false);
				setIsClosing(false);
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [isClosing]);

	return (
		<>
			<Header showSearch={false} title={studyInfo?.title || '통합 검색'} />
			<div className="search-page">

				<div className="field">
					<input type="text" className="text" value={searchKeyword}
						onChange={(e) => {
							setSearchKeyword(e.target.value);
							setShowRecommended(true);
						}} placeholder="검색어를 입력해주세요"
					/>
				</div>

				{recommendedKeywords.length > 0 && showRecommended && (
					<div className="search-page__keywords">
						{recommendedKeywords.map((keyword, idx) => {
							const highlightText = searchKeyword.trim();
							const regex = new RegExp(`(${highlightText})`, 'gi');
							const highlightedKeyword = keyword.replace(regex, '<span class="key-point">$1</span>');

							return (
								<button
									key={idx}
									type="button"
									className="search-page__word"
									onClick={() => {
										setSearchKeyword(keyword);
										setShowRecommended(false);
									}}
									dangerouslySetInnerHTML={{ __html: highlightedKeyword }}
								/>
							);
						})}
					</div>
				)}

				<div className="search-page__content">
					{searchKeyword ? (
						filteredRooms.length > 0 ? (
							<StudyRoomList
								rooms={filteredRooms}
								onItemClick={handleItemClick}
							/>
						) : (
							<p className="search-page__noresult --not-result">검색 결과가 없습니다.</p>
						)
					) : (
						<p className="search-page__noresult --ready">검색어를 입력하세요.</p>
					)}
				</div>
			</div>

			{showDetail && selectedRoom && (
				<Detail 
					room={selectedRoom} 
					isClosing={isClosing} 
					onClose={handleDetailClose} 
				/>
			)}
		</>
	);
};

export default Search; 