const StudyRoomList = ({ rooms = [], searchKeyword = '', limit, onItemClick }) => {
	const keyword = (searchKeyword || '').toLowerCase();
	const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter(room =>
		room.title?.toLowerCase().includes(keyword) ||
		room.region?.toLowerCase().includes(keyword)
	);
	
	return (
		<ul className="studyroom">
			{filteredRooms.slice(0, limit).map((room) => (
				<li className="studyroom__item" onClick={() => onItemClick({ ...room, id: room.studyRoomId })} key={room.studyRoomId}>
					<button type="button" className="studyroom__info">
						<img src={`/uploads/thumbnail/${room.thumbnail}`} className="studyroom__img" />
						<h3 className="studyroom__title">{room.title}</h3>
						<div className="studyroom__details">
							<span className="studyroom__detail">{room.region}</span>
							<span className="studyroom__detail">{room.time}</span>
							<span className="studyroom__detail">{room.currentMembers}/{room.capacity}명</span>
						</div>
					</button>
				</li>
			))}
		</ul>
	);
};

export default StudyRoomList;
