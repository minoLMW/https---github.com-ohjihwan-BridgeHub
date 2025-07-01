import { useState, useEffect, useMemo } from 'react';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import ListSearch from '@components/ListSearch';
import Detail from '@components/Detail';
import axios from 'axios';

const StudyRoomPage = () => {
	const [searchKeyword, setSearchKeyword] = useState('');
	const [visibleCount, setVisibleCount] = useState(10);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [showDetail, setShowDetail] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [showSearch, setShowSearch] = useState(false);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(false);

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

	const filteredRooms = useMemo(() => 
		rooms.filter((room) => 
			room.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
			room.region?.toLowerCase().includes(searchKeyword.toLowerCase())
		), [rooms, searchKeyword]
	);
	const handleItemClick = async (room) => {
		if (!room?.id) {
			console.warn('잘못된 방 정보');
			return;
		}
		try {
			const res = await axios.get(`/api/studies/${room.id}`);
			setSelectedRoom(res.data);
			setShowDetail(true);
		} catch (err) {
			console.error(err);
		}
	};
	const handleDetailClose = () => {
		setIsClosing(true);
	};

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
				setVisibleCount(prev => prev + 10);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [filteredRooms.length]);

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
		<div className="studyroom-list">
			<Header showSearch={true} onSearch={() => setShowSearch(true)} />

			{showSearch && (
				<ListSearch
					value={searchKeyword}
					onChange={(e) => setSearchKeyword(e.target.value)}
					onClose={() => setShowSearch(false)}
				/>
			)}

			<div className="studyroom-list__content">
				<StudyRoomList
					/* StudyRoomList rooms={rooms || []} */
					rooms={filteredRooms.slice(0, visibleCount)}
					onItemClick={handleItemClick}
				/>
			</div>

			{showDetail && selectedRoom && (
				<Detail 
					room={selectedRoom} 
					isClosing={isClosing} 
					onClose={handleDetailClose} 
				/>
			)}
		</div>
	);
};

export default StudyRoomPage;