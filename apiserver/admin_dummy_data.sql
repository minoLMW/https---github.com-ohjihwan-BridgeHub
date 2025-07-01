-- =============================================
-- TheBridgeHub 관리자 페이지 가데이터
-- 관리자 통계, 회원 관리, 신고 관리 기능 테스트용
-- =============================================

USE thebridgehub;

-- =============================================
-- 1. 회원 가데이터 (20명)
-- =============================================
INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, profile_image, status, email_verified, description, created_at) VALUES
-- 남성 회원들 (10명)
('kim.minwoo@email.com', '010-1234-5678', '민우', '김민우', '$2a$10$encrypted_password', '대학교', '컴퓨터공학과', '남자', '서울특별시', '강남구', '오후', '/uploads/profile/profile1.jpg', 'ACTIVE', TRUE, '프로그래밍에 관심이 많은 대학생입니다.', '2024-01-15 10:30:00'),
('lee.jihwan@email.com', '010-2345-6789', '지환', '이지환', '$2a$10$encrypted_password', '대학교', '전자공학과', '남자', '서울특별시', '서초구', '오전', '/uploads/profile/profile2.jpg', 'ACTIVE', TRUE, '전자공학을 전공하고 있는 학생입니다.', '2024-01-20 14:20:00'),
('park.sungmin@email.com', '010-3456-7890', '성민', '박성민', '$2a$10$encrypted_password', '대학원', '기계공학과', '남자', '부산광역시', '해운대구', '저녁', '/uploads/profile/profile3.jpg', 'ACTIVE', TRUE, '기계공학 석사 과정입니다.', '2024-02-05 09:15:00'),
('choi.donghyun@email.com', '010-4567-8901', '동현', '최동현', '$2a$10$encrypted_password', '고졸', '고등학교', '남자', '대구광역시', '수성구', '오후', '/uploads/profile/profile4.jpg', 'ACTIVE', TRUE, '고등학생입니다. 스터디에 참여하고 싶어요.', '2024-02-10 16:45:00'),
('jung.woojin@email.com', '010-5678-9012', '우진', '정우진', '$2a$10$encrypted_password', '대학교', '경영학과', '남자', '인천광역시', '연수구', '오전', '/uploads/profile/profile5.jpg', 'ACTIVE', TRUE, '경영학을 공부하고 있습니다.', '2024-02-15 11:30:00'),
('kang.minsu@email.com', '010-6789-0123', '민수', '강민수', '$2a$10$encrypted_password', '대학교', '통계학과', '남자', '광주광역시', '서구', '저녁', '/uploads/profile/profile6.jpg', 'ACTIVE', TRUE, '통계학을 전공하고 있습니다.', '2024-02-20 13:20:00'),
('yoon.seungwoo@email.com', '010-7890-1234', '승우', '윤승우', '$2a$10$encrypted_password', '대학원', '심리학과', '남자', '대전광역시', '유성구', '오후', '/uploads/profile/profile7.jpg', 'ACTIVE', TRUE, '심리학 석사 과정입니다.', '2024-02-25 15:10:00'),
('han.jongseok@email.com', '010-8901-2345', '종석', '한종석', '$2a$10$encrypted_password', '고졸', '고등학교', '남자', '울산광역시', '남구', '오전', '/uploads/profile/profile8.jpg', 'ACTIVE', TRUE, '고등학생입니다.', '2024-03-01 10:45:00'),
('shin.taewon@email.com', '010-9012-3456', '태원', '신태원', '$2a$10$encrypted_password', '대학교', '건축학과', '남자', '세종특별자치시', '세종시', '저녁', '/uploads/profile/profile9.jpg', 'ACTIVE', TRUE, '건축학을 공부하고 있습니다.', '2024-03-05 14:30:00'),
('oh.kyungmin@email.com', '010-0123-4567', '경민', '오경민', '$2a$10$encrypted_password', '대학교', '의학과', '남자', '경기도', '수원시', '오후', '/uploads/profile/profile10.jpg', 'ACTIVE', TRUE, '의학을 전공하고 있습니다.', '2024-03-10 12:15:00'),

-- 여성 회원들 (10명)
('kim.yuna@email.com', '010-1111-2222', '유나', '김유나', '$2a$10$encrypted_password', '대학교', '영어영문학과', '여자', '서울특별시', '마포구', '오전', '/uploads/profile/profile11.jpg', 'ACTIVE', TRUE, '영어를 좋아하는 대학생입니다.', '2024-01-18 09:20:00'),
('lee.soyeon@email.com', '010-2222-3333', '소연', '이소연', '$2a$10$encrypted_password', '대학교', '디자인학과', '여자', '서울특별시', '종로구', '오후', '/uploads/profile/profile12.jpg', 'ACTIVE', TRUE, '디자인을 전공하고 있습니다.', '2024-01-25 16:40:00'),
('park.jiwon@email.com', '010-3333-4444', '지원', '박지원', '$2a$10$encrypted_password', '대학원', '생물학과', '여자', '부산광역시', '동래구', '저녁', '/uploads/profile/profile13.jpg', 'ACTIVE', TRUE, '생물학 석사 과정입니다.', '2024-02-08 11:25:00'),
('choi.eunji@email.com', '010-4444-5555', '은지', '최은지', '$2a$10$encrypted_password', '고졸', '고등학교', '여자', '대구광역시', '중구', '오전', '/uploads/profile/profile14.jpg', 'ACTIVE', TRUE, '고등학생입니다.', '2024-02-12 13:50:00'),
('jung.hyerin@email.com', '010-5555-6666', '혜린', '정혜린', '$2a$10$encrypted_password', '대학교', '국문학과', '여자', '인천광역시', '남동구', '오후', '/uploads/profile/profile15.jpg', 'ACTIVE', TRUE, '국문학을 공부하고 있습니다.', '2024-02-18 10:35:00'),
('kang.seoyeon@email.com', '010-6666-7777', '서연', '강서연', '$2a$10$encrypted_password', '대학교', '수학과', '여자', '광주광역시', '북구', '저녁', '/uploads/profile/profile16.jpg', 'ACTIVE', TRUE, '수학을 전공하고 있습니다.', '2024-02-22 15:45:00'),
('yoon.minji@email.com', '010-7777-8888', '민지', '윤민지', '$2a$10$encrypted_password', '대학원', '화학과', '여자', '대전광역시', '중구', '오전', '/uploads/profile/profile17.jpg', 'ACTIVE', TRUE, '화학 석사 과정입니다.', '2024-02-28 12:30:00'),
('han.yerin@email.com', '010-8888-9999', '예린', '한예린', '$2a$10$encrypted_password', '고졸', '고등학교', '여자', '울산광역시', '북구', '오후', '/uploads/profile/profile18.jpg', 'ACTIVE', TRUE, '고등학생입니다.', '2024-03-03 14:20:00'),
('shin.chaewon@email.com', '010-9999-0000', '채원', '신채원', '$2a$10$encrypted_password', '대학교', '음악학과', '여자', '세종특별자치시', '세종시', '저녁', '/uploads/profile/profile19.jpg', 'ACTIVE', TRUE, '음악을 전공하고 있습니다.', '2024-03-08 16:10:00'),
('oh.sujin@email.com', '010-0000-1111', '수진', '오수진', '$2a$10$encrypted_password', '대학교', '간호학과', '여자', '경기도', '성남시', '오전', '/uploads/profile/profile20.jpg', 'ACTIVE', TRUE, '간호학을 공부하고 있습니다.', '2024-03-12 09:40:00');

-- 정지된 회원 2명 추가
INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, profile_image, status, email_verified, description, created_at) VALUES
('banned.user1@email.com', '010-9999-8888', '정지회원1', '정지회원1', '$2a$10$encrypted_password', '대학교', '컴퓨터공학과', '남자', '서울특별시', '강남구', '오후', '/uploads/profile/banned1.jpg', 'BANNED', TRUE, '정지된 회원입니다.', '2024-01-10 10:00:00'),
('banned.user2@email.com', '010-8888-7777', '정지회원2', '정지회원2', '$2a$10$encrypted_password', '대학교', '경영학과', '여자', '부산광역시', '해운대구', '오전', '/uploads/profile/banned2.jpg', 'BANNED', TRUE, '정지된 회원입니다.', '2024-01-12 14:00:00');

-- =============================================
-- 2. 채팅방 가데이터 (10개)
-- =============================================
INSERT INTO ChatRoom (room_name, created_at, max_members, is_active) VALUES
('프로그래밍 스터디 A', '2024-01-20 10:00:00', 15, TRUE),
('영어 스터디 B', '2024-01-22 14:00:00', 12, TRUE),
('취미 공유방', '2024-01-25 16:00:00', 20, TRUE),
('자유게시판', '2024-01-28 09:00:00', 50, TRUE),
('정보공유방', '2024-02-01 11:00:00', 30, TRUE),
('취업 준비방', '2024-02-05 13:00:00', 25, TRUE),
('토익 스터디', '2024-02-08 15:00:00', 18, TRUE),
('운동 동호회', '2024-02-10 17:00:00', 15, TRUE),
('독서 모임', '2024-02-12 19:00:00', 12, TRUE),
('요리 레시피방', '2024-02-15 20:00:00', 20, TRUE);

-- =============================================
-- 3. 채팅방 멤버 관계 가데이터
-- =============================================
-- 프로그래밍 스터디 A (15명)
INSERT INTO ChatRoomMember (room_id, member_id, joined_at, is_admin) VALUES
(1, 1, '2024-01-20 10:00:00', TRUE),  -- 김민우 (방장)
(1, 2, '2024-01-20 10:30:00', FALSE),
(1, 3, '2024-01-20 11:00:00', FALSE),
(1, 4, '2024-01-20 11:30:00', FALSE),
(1, 5, '2024-01-20 12:00:00', FALSE),
(1, 6, '2024-01-20 12:30:00', FALSE),
(1, 7, '2024-01-20 13:00:00', FALSE),
(1, 8, '2024-01-20 13:30:00', FALSE),
(1, 9, '2024-01-20 14:00:00', FALSE),
(1, 10, '2024-01-20 14:30:00', FALSE),
(1, 11, '2024-01-20 15:00:00', FALSE),
(1, 12, '2024-01-20 15:30:00', FALSE),
(1, 13, '2024-01-20 16:00:00', FALSE),
(1, 14, '2024-01-20 16:30:00', FALSE),
(1, 15, '2024-01-20 17:00:00', FALSE);

-- 영어 스터디 B (12명)
INSERT INTO ChatRoomMember (room_id, member_id, joined_at, is_admin) VALUES
(2, 11, '2024-01-22 14:00:00', TRUE),  -- 김유나 (방장)
(2, 12, '2024-01-22 14:30:00', FALSE),
(2, 13, '2024-01-22 15:00:00', FALSE),
(2, 14, '2024-01-22 15:30:00', FALSE),
(2, 15, '2024-01-22 16:00:00', FALSE),
(2, 16, '2024-01-22 16:30:00', FALSE),
(2, 17, '2024-01-22 17:00:00', FALSE),
(2, 18, '2024-01-22 17:30:00', FALSE),
(2, 19, '2024-01-22 18:00:00', FALSE),
(2, 20, '2024-01-22 18:30:00', FALSE),
(2, 1, '2024-01-22 19:00:00', FALSE),
(2, 2, '2024-01-22 19:30:00', FALSE);

-- 취미 공유방 (20명)
INSERT INTO ChatRoomMember (room_id, member_id, joined_at, is_admin) VALUES
(3, 12, '2024-01-25 16:00:00', TRUE),  -- 이소연 (방장)
(3, 13, '2024-01-25 16:30:00', FALSE),
(3, 14, '2024-01-25 17:00:00', FALSE),
(3, 15, '2024-01-25 17:30:00', FALSE),
(3, 16, '2024-01-25 18:00:00', FALSE),
(3, 17, '2024-01-25 18:30:00', FALSE),
(3, 18, '2024-01-25 19:00:00', FALSE),
(3, 19, '2024-01-25 19:30:00', FALSE),
(3, 20, '2024-01-25 20:00:00', FALSE),
(3, 1, '2024-01-25 20:30:00', FALSE),
(3, 2, '2024-01-25 21:00:00', FALSE),
(3, 3, '2024-01-25 21:30:00', FALSE),
(3, 4, '2024-01-25 22:00:00', FALSE),
(3, 5, '2024-01-25 22:30:00', FALSE),
(3, 6, '2024-01-25 23:00:00', FALSE),
(3, 7, '2024-01-25 23:30:00', FALSE),
(3, 8, '2024-01-26 00:00:00', FALSE),
(3, 9, '2024-01-26 00:30:00', FALSE),
(3, 10, '2024-01-26 01:00:00', FALSE);

-- 나머지 채팅방들도 비슷하게 구성
INSERT INTO ChatRoomMember (room_id, member_id, joined_at, is_admin) VALUES
(4, 13, '2024-01-28 09:00:00', TRUE),   -- 자유게시판
(4, 14, '2024-01-28 09:30:00', FALSE),
(4, 15, '2024-01-28 10:00:00', FALSE),
(4, 16, '2024-01-28 10:30:00', FALSE),
(4, 17, '2024-01-28 11:00:00', FALSE),
(4, 18, '2024-01-28 11:30:00', FALSE),
(4, 19, '2024-01-28 12:00:00', FALSE),
(4, 20, '2024-01-28 12:30:00', FALSE),
(4, 1, '2024-01-28 13:00:00', FALSE),
(4, 2, '2024-01-28 13:30:00', FALSE),
(4, 3, '2024-01-28 14:00:00', FALSE),
(4, 4, '2024-01-28 14:30:00', FALSE),
(4, 5, '2024-01-28 15:00:00', FALSE),
(4, 6, '2024-01-28 15:30:00', FALSE),
(4, 7, '2024-01-28 16:00:00', FALSE),
(4, 8, '2024-01-28 16:30:00', FALSE),
(4, 9, '2024-01-28 17:00:00', FALSE),
(4, 10, '2024-01-28 17:30:00', FALSE),
(4, 11, '2024-01-28 18:00:00', FALSE),
(4, 12, '2024-01-28 18:30:00', FALSE),
(4, 13, '2024-01-28 19:00:00', FALSE),
(4, 14, '2024-01-28 19:30:00', FALSE),
(4, 15, '2024-01-28 20:00:00', FALSE),
(4, 16, '2024-01-28 20:30:00', FALSE),
(4, 17, '2024-01-28 21:00:00', FALSE),
(4, 18, '2024-01-28 21:30:00', FALSE),
(4, 19, '2024-01-28 22:00:00', FALSE),
(4, 20, '2024-01-28 22:30:00', FALSE);

-- =============================================
-- 4. 메시지 가데이터 (활동량 측정용)
-- =============================================
-- 김민우 (활동량 120회)
INSERT INTO Message (room_id, sender_id, content, message_type, sent_at) VALUES
(1, 1, '안녕하세요! 프로그래밍 스터디 시작합니다.', 'TEXT', '2024-01-20 10:00:00'),
(1, 1, '오늘은 Java 기초를 공부해보겠습니다.', 'TEXT', '2024-01-20 10:05:00'),
(1, 1, '변수와 데이터 타입에 대해 설명드릴게요.', 'TEXT', '2024-01-20 10:10:00'),
(2, 1, '영어 스터디에도 참여하고 있습니다.', 'TEXT', '2024-01-22 19:00:00'),
(2, 1, '영어 공부도 열심히 해야겠어요.', 'TEXT', '2024-01-22 19:05:00'),
(3, 1, '취미도 다양하게 가지고 있어요.', 'TEXT', '2024-01-25 20:30:00'),
(4, 1, '자유게시판에도 글을 올려요.', 'TEXT', '2024-01-28 13:00:00'),
(4, 1, '정보 공유도 많이 하고 있어요.', 'TEXT', '2024-01-28 13:05:00');

-- 이지환 (활동량 110회)
INSERT INTO Message (room_id, sender_id, content, message_type, sent_at) VALUES
(1, 2, '안녕하세요! 전자공학 전공입니다.', 'TEXT', '2024-01-20 10:30:00'),
(1, 2, 'Java 공부도 도움이 될 것 같아요.', 'TEXT', '2024-01-20 10:35:00'),
(2, 2, '영어도 잘하고 싶어요.', 'TEXT', '2024-01-22 19:30:00'),
(2, 2, '토익 점수도 올리고 싶어요.', 'TEXT', '2024-01-22 19:35:00'),
(3, 2, '취미로 운동도 하고 있어요.', 'TEXT', '2024-01-25 21:00:00'),
(4, 2, '자유게시판에서 정보 얻고 있어요.', 'TEXT', '2024-01-28 13:30:00'),
(4, 2, '다양한 정보가 많네요.', 'TEXT', '2024-01-28 13:35:00');

-- 나머지 회원들도 비슷한 패턴으로 메시지 추가
-- (실제로는 더 많은 메시지를 추가해야 하지만, 예시로 일부만 표시)

-- =============================================
-- 5. 신고 가데이터 (10개)
-- =============================================
INSERT INTO Report (reporter_id, reported_user_id, report_type, reason, created_at, status, admin_comment) VALUES
-- 대기중인 신고들
(1, 2, 'USER', '욕설', '2024-01-15 14:30:25', 'PENDING', NULL),
(11, 1, 'USER', '스팸', '2024-01-14 09:15:42', 'PENDING', NULL),
(3, 5, 'USER', '부적절한 콘텐츠', '2024-01-13 16:45:18', 'PENDING', NULL),
(6, 7, 'USER', '괴롭힘', '2024-01-12 11:20:33', 'PENDING', NULL),
(8, 9, 'USER', '저작권 침해', '2024-01-11 13:55:07', 'PENDING', NULL),
(12, 13, 'USER', '음란물', '2024-01-10 10:20:15', 'PENDING', NULL),
(14, 15, 'USER', '사기', '2024-01-09 15:30:45', 'PENDING', NULL),
(16, 17, 'USER', '도배', '2024-01-08 12:45:30', 'PENDING', NULL),
(18, 19, 'USER', '개인정보 유출', '2024-01-07 17:10:20', 'PENDING', NULL),
(20, 1, 'USER', '폭력적 발언', '2024-01-06 14:25:10', 'PENDING', NULL);

-- 처리완료된 신고들 (추가)
INSERT INTO Report (reporter_id, reported_user_id, report_type, reason, created_at, status, admin_comment) VALUES
(2, 3, 'USER', '광고성 게시물', '2024-01-05 11:00:00', 'RESOLVED', '광고성 게시물 반복 등록으로 인한 경고 조치'),
(4, 6, 'USER', '부적절한 행동', '2024-01-04 16:30:00', 'RESOLVED', '다른 사용자에게 불쾌감을 주는 행동으로 인한 정지 조치'),
(7, 8, 'USER', '스팸 메시지', '2024-01-03 09:45:00', 'RESOLVED', '과도한 스팸 메시지 발송으로 인한 채팅 제한'),
(9, 10, 'USER', '허위 정보', '2024-01-02 13:20:00', 'RESOLVED', '허위 정보 유포로 인한 경고 조치'),
(11, 12, 'USER', '불법 콘텐츠', '2024-01-01 18:15:00', 'RESOLVED', '불법 콘텐츠 공유로 인한 계정 정지');

-- =============================================
-- 6. 스터디룸 가데이터 (5개)
-- =============================================
INSERT INTO studyroom (room_id, boss_id, title, description, education, department, region, district, capacity, current_members, time, thumbnail, is_public, created_at) VALUES
(1, 1, 'Java 프로그래밍 스터디', 'Java 기초부터 고급까지 함께 공부하는 스터디입니다.', '대학교', '컴퓨터공학과', '서울특별시', '강남구', 15, 15, '오후', '/uploads/thumbnail/java-study.jpg', TRUE, '2024-01-20 10:00:00'),
(2, 11, '영어 회화 스터디', '영어 회화 실력을 향상시키는 스터디입니다.', '대학교', '영어영문학과', '서울특별시', '마포구', 12, 12, '오전', '/uploads/thumbnail/english-study.jpg', TRUE, '2024-01-22 14:00:00'),
(3, 12, '취미 공유 스터디', '다양한 취미를 공유하고 소통하는 스터디입니다.', '대학교', '디자인학과', '서울특별시', '종로구', 20, 20, '오후', '/uploads/thumbnail/hobby-study.jpg', TRUE, '2024-01-25 16:00:00'),
(4, 13, '정보 공유 스터디', '유용한 정보를 공유하고 토론하는 스터디입니다.', '대학원', '생물학과', '부산광역시', '동래구', 30, 28, '저녁', '/uploads/thumbnail/info-study.jpg', TRUE, '2024-01-28 09:00:00'),
(5, 14, '취업 준비 스터디', '취업 준비를 함께하는 스터디입니다.', '고졸', '고등학교', '대구광역시', '중구', 25, 22, '오전', '/uploads/thumbnail/job-study.jpg', TRUE, '2024-02-01 11:00:00');

-- =============================================
-- 7. 스터디룸 멤버 가데이터
-- =============================================
-- Java 프로그래밍 스터디 멤버들
INSERT INTO study_room_members (study_room_id, member_id, role, status, joined_at, approved_at, approved_by) VALUES
(1, 1, 'BOSS', 'APPROVED', '2024-01-20 10:00:00', '2024-01-20 10:00:00', 1),
(1, 2, 'MEMBER', 'APPROVED', '2024-01-20 10:30:00', '2024-01-20 10:30:00', 1),
(1, 3, 'MEMBER', 'APPROVED', '2024-01-20 11:00:00', '2024-01-20 11:00:00', 1),
(1, 4, 'MEMBER', 'APPROVED', '2024-01-20 11:30:00', '2024-01-20 11:30:00', 1),
(1, 5, 'MEMBER', 'APPROVED', '2024-01-20 12:00:00', '2024-01-20 12:00:00', 1),
(1, 6, 'MEMBER', 'APPROVED', '2024-01-20 12:30:00', '2024-01-20 12:30:00', 1),
(1, 7, 'MEMBER', 'APPROVED', '2024-01-20 13:00:00', '2024-01-20 13:00:00', 1),
(1, 8, 'MEMBER', 'APPROVED', '2024-01-20 13:30:00', '2024-01-20 13:30:00', 1),
(1, 9, 'MEMBER', 'APPROVED', '2024-01-20 14:00:00', '2024-01-20 14:00:00', 1),
(1, 10, 'MEMBER', 'APPROVED', '2024-01-20 14:30:00', '2024-01-20 14:30:00', 1),
(1, 11, 'MEMBER', 'APPROVED', '2024-01-20 15:00:00', '2024-01-20 15:00:00', 1),
(1, 12, 'MEMBER', 'APPROVED', '2024-01-20 15:30:00', '2024-01-20 15:30:00', 1),
(1, 13, 'MEMBER', 'APPROVED', '2024-01-20 16:00:00', '2024-01-20 16:00:00', 1),
(1, 14, 'MEMBER', 'APPROVED', '2024-01-20 16:30:00', '2024-01-20 16:30:00', 1),
(1, 15, 'MEMBER', 'APPROVED', '2024-01-20 17:00:00', '2024-01-20 17:00:00', 1);

-- 영어 회화 스터디 멤버들
INSERT INTO study_room_members (study_room_id, member_id, role, status, joined_at, approved_at, approved_by) VALUES
(2, 11, 'BOSS', 'APPROVED', '2024-01-22 14:00:00', '2024-01-22 14:00:00', 11),
(2, 12, 'MEMBER', 'APPROVED', '2024-01-22 14:30:00', '2024-01-22 14:30:00', 11),
(2, 13, 'MEMBER', 'APPROVED', '2024-01-22 15:00:00', '2024-01-22 15:00:00', 11),
(2, 14, 'MEMBER', 'APPROVED', '2024-01-22 15:30:00', '2024-01-22 15:30:00', 11),
(2, 15, 'MEMBER', 'APPROVED', '2024-01-22 16:00:00', '2024-01-22 16:00:00', 11),
(2, 16, 'MEMBER', 'APPROVED', '2024-01-22 16:30:00', '2024-01-22 16:30:00', 11),
(2, 17, 'MEMBER', 'APPROVED', '2024-01-22 17:00:00', '2024-01-22 17:00:00', 11),
(2, 18, 'MEMBER', 'APPROVED', '2024-01-22 17:30:00', '2024-01-22 17:30:00', 11),
(2, 19, 'MEMBER', 'APPROVED', '2024-01-22 18:00:00', '2024-01-22 18:00:00', 11),
(2, 20, 'MEMBER', 'APPROVED', '2024-01-22 18:30:00', '2024-01-22 18:30:00', 11),
(2, 1, 'MEMBER', 'APPROVED', '2024-01-22 19:00:00', '2024-01-22 19:00:00', 11),
(2, 2, 'MEMBER', 'APPROVED', '2024-01-22 19:30:00', '2024-01-22 19:30:00', 11);

-- =============================================
-- 8. 파일 가데이터 (프로필 이미지, 썸네일 등)
-- =============================================
INSERT INTO file (file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, member_id, study_room_id, uploaded_at) VALUES
-- 프로필 이미지들
('PROFILE', 'profile1.jpg', 'profile1_20240120.jpg', '/uploads/profile/profile1.jpg', 1024000, 'image/jpeg', 'hash1', 1, NULL, '2024-01-20 10:00:00'),
('PROFILE', 'profile2.jpg', 'profile2_20240120.jpg', '/uploads/profile/profile2.jpg', 980000, 'image/jpeg', 'hash2', 2, NULL, '2024-01-20 10:30:00'),
('PROFILE', 'profile3.jpg', 'profile3_20240120.jpg', '/uploads/profile/profile3.jpg', 1150000, 'image/jpeg', 'hash3', 3, NULL, '2024-01-20 11:00:00'),
('PROFILE', 'profile4.jpg', 'profile4_20240120.jpg', '/uploads/profile/profile4.jpg', 890000, 'image/jpeg', 'hash4', 4, NULL, '2024-01-20 11:30:00'),
('PROFILE', 'profile5.jpg', 'profile5_20240120.jpg', '/uploads/profile/profile5.jpg', 1050000, 'image/jpeg', 'hash5', 5, NULL, '2024-01-20 12:00:00'),

-- 스터디 썸네일들
('STUDY_THUMBNAIL', 'java-study.jpg', 'java-study_20240120.jpg', '/uploads/thumbnail/java-study.jpg', 2048000, 'image/jpeg', 'hash6', NULL, 1, '2024-01-20 10:00:00'),
('STUDY_THUMBNAIL', 'english-study.jpg', 'english-study_20240122.jpg', '/uploads/thumbnail/english-study.jpg', 1980000, 'image/jpeg', 'hash7', NULL, 2, '2024-01-22 14:00:00'),
('STUDY_THUMBNAIL', 'hobby-study.jpg', 'hobby-study_20240125.jpg', '/uploads/thumbnail/hobby-study.jpg', 1850000, 'image/jpeg', 'hash8', NULL, 3, '2024-01-25 16:00:00'),
('STUDY_THUMBNAIL', 'info-study.jpg', 'info-study_20240128.jpg', '/uploads/thumbnail/info-study.jpg', 2100000, 'image/jpeg', 'hash9', NULL, 4, '2024-01-28 09:00:00'),
('STUDY_THUMBNAIL', 'job-study.jpg', 'job-study_20240201.jpg', '/uploads/thumbnail/job-study.jpg', 1950000, 'image/jpeg', 'hash10', NULL, 5, '2024-02-01 11:00:00');

-- =============================================
-- 9. 채팅 로그 파일 가데이터
-- =============================================
INSERT INTO chat_log_files (room_id, log_date, file_path, file_name, message_count, file_size, created_at) VALUES
(1, '2024-01-20', '/logs/chat/room1_20240120.log', 'room1_20240120.log', 150, 512000, '2024-01-21 00:00:00'),
(1, '2024-01-21', '/logs/chat/room1_20240121.log', 'room1_20240121.log', 180, 614400, '2024-01-22 00:00:00'),
(2, '2024-01-22', '/logs/chat/room2_20240122.log', 'room2_20240122.log', 120, 409600, '2024-01-23 00:00:00'),
(2, '2024-01-23', '/logs/chat/room2_20240123.log', 'room2_20240123.log', 140, 478720, '2024-01-24 00:00:00'),
(3, '2024-01-25', '/logs/chat/room3_20240125.log', 'room3_20240125.log', 200, 683520, '2024-01-26 00:00:00'),
(3, '2024-01-26', '/logs/chat/room3_20240126.log', 'room3_20240126.log', 220, 751616, '2024-01-27 00:00:00'),
(4, '2024-01-28', '/logs/chat/room4_20240128.log', 'room4_20240128.log', 300, 1024000, '2024-01-29 00:00:00'),
(4, '2024-01-29', '/logs/chat/room4_20240129.log', 'room4_20240129.log', 280, 958464, '2024-01-30 00:00:00');

-- =============================================
-- 완료 메시지
-- =============================================
SELECT 'TheBridgeHub 관리자 페이지 가데이터 입력 완료!' as message;
SELECT '총 입력된 데이터:' as info;
SELECT COUNT(*) as '회원 수' FROM members;
SELECT COUNT(*) as '채팅방 수' FROM ChatRoom;
SELECT COUNT(*) as '신고 수' FROM Report;
SELECT COUNT(*) as '스터디룸 수' FROM studyroom;
SELECT COUNT(*) as '메시지 수' FROM Message; 