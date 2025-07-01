import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import hotRooms from '@json/HotRoom.json';
import { useNavigate, Link } from 'react-router-dom';

function PreviewBoard({ onItemClick }) {
	const [rooms, setRooms] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		setRooms(hotRooms);
	}, []);

	return (
		<div className="hot-room-box">
			<div className="more-box">
				<h2 className="more-box__title">BOARD</h2>
				<Link to={'/board'}  className="more-box__link">게시판</Link>
			</div>
			<Swiper spaceBetween={12} slidesPerView={1} centeredSlides={true} className="hot-room-swiper">
				{rooms.map((room) => (
					<SwiperSlide key={room.id}>
						<button type="button" className="room-in-button" onClick={() => onItemClick(room)} aria-haspopup="dialog">
							<figure className="img-box">
								<img src={`/uploads/thumbnail/${room.thumbnail}`} alt={`${room.title} 썸네일`} />
							</figure>
							<div className="txts">
								<strong className="main-txt">{room.title}</strong>
								<p className="sub-txt">{room.description}</p>
								<ul className="room-info">
									<li>{room.region}</li>
									<li>{room.time}</li>
									<li>{room.currentMembers}/{room.capacity}명</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}

export default PreviewBoard;