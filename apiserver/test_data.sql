-- =============================================
-- TheBridgeHub 테스트용 더미 데이터 (수정판)
-- =============================================

USE thebridgehub;

-- 기존 데이터 정리 (필요시)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM comment_likes;
DELETE FROM board_likes;
DELETE FROM file WHERE file_type = 'BOARD_ATTACHMENT';
DELETE FROM board_comments;
DELETE FROM board;
DELETE FROM study_room_members;
DELETE FROM studyroom;
DELETE FROM ChatRoomMember;
DELETE FROM ChatRoom;
DELETE FROM members WHERE userid LIKE '%@test.com';
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 1. 회원 더미 데이터 (10명) - 실제 암호화된 패스워드 사용
-- =============================================
-- password123을 BCrypt로 암호화한 값: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a
INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, profile_image, status, email_verified, description, created_at) VALUES
('admin@test.com', '01012345678', '관리자', '김관리', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 졸업', '컴퓨터공학과', '남자', '서울특별시', '강남구', '오전', 'default-profile1.png', 'ACTIVE', TRUE, '시스템 관리자입니다.', NOW() - INTERVAL 30 DAY),
('user1@test.com', '01023456789', '스터디킹', '이철수', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 재학', '경영학과', '남자', '서울특별시', '서초구', '저녁', 'default-profile1.png', 'ACTIVE', TRUE, '열심히 공부하는 대학생입니다.', NOW() - INTERVAL 25 DAY),
('user2@test.com', '01034567890', '코딩러버', '박영희', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 졸업', '컴퓨터공학과', '여자', '경기도', '성남시', '오후', 'default-profile1.png', 'ACTIVE', TRUE, '개발자 꿈나무입니다.', NOW() - INTERVAL 20 DAY),
('user3@test.com', '01045678901', '수학천재', '최민수', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학원 재학', '수학과', '남자', '서울특별시', '종로구', '오전', 'default-profile1.png', 'ACTIVE', TRUE, '수학 스터디 만들어요!', NOW() - INTERVAL 15 DAY),
('user4@test.com', '01056789012', '영어마스터', '김영어', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 재학', '영어영문학과', '여자', '부산광역시', '해운대구', '저녁', 'default-profile1.png', 'ACTIVE', TRUE, 'TOEIC 990점 목표!', NOW() - INTERVAL 12 DAY),
('user5@test.com', '01067890123', '디자이너', '정민지', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '전문대 졸업', '시각디자인과', '여자', '인천광역시', '남동구', '오후', 'default-profile1.png', 'ACTIVE', TRUE, 'UI/UX 디자인 공부중', NOW() - INTERVAL 10 DAY),
('user6@test.com', '01078901234', '취준생', '강취업', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 졸업', '경제학과', '남자', '대구광역시', '수성구', '오전', 'default-profile1.png', 'ACTIVE', TRUE, '취업 준비 화이팅!', NOW() - INTERVAL 8 DAY),
('user7@test.com', '01089012345', '의대생', '윤의학', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 재학', '의학과', '여자', '광주광역시', '서구', '저녁', 'default-profile1.png', 'ACTIVE', TRUE, '의대생입니다. 스터디 모집!', NOW() - INTERVAL 5 DAY),
('user8@test.com', '01090123456', '공무원준비', '송공무', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학교 졸업', '행정학과', '남자', '대전광역시', '유성구', '오후', 'default-profile1.png', 'ACTIVE', TRUE, '9급 공무원 준비중', NOW() - INTERVAL 3 DAY),
('user9@test.com', '01001234567', '대학원생', '한연구', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXIrbZbcKkCp1Xr3UpDpyQb5c4a', '대학원 재학', '물리학과', '여자', '울산광역시', '남구', '오전', 'default-profile1.png', 'ACTIVE', TRUE, '물리학 연구하고 있어요', NOW() - INTERVAL 1 DAY);

-- =============================================
-- 2. 채팅방 더미 데이터 (5개)
-- =============================================
INSERT INTO ChatRoom (room_name, created_at, max_members, is_active) VALUES
('컴공과 스터디 채팅방', NOW() - INTERVAL 20 DAY, 10, TRUE),
('토익 스터디 채팅방', NOW() - INTERVAL 15 DAY, 8, TRUE),
('취업 준비 채팅방', NOW() - INTERVAL 12 DAY, 15, TRUE),
('수학 스터디 채팅방', NOW() - INTERVAL 10 DAY, 6, TRUE),
('의대생 모임 채팅방', NOW() - INTERVAL 5 DAY, 12, TRUE);

-- =============================================
-- 3. 스터디룸 더미 데이터 (5개) - 회원 ID 매칭 수정
-- =============================================
INSERT INTO studyroom (room_id, boss_id, title, description, education, department, region, district, capacity, current_members, time, thumbnail, is_public, created_at) VALUES
(1, 4, '컴퓨터공학 알고리즘 스터디', '코딩테스트 대비 알고리즘 문제를 함께 풀어요', '대학교 재학', '컴퓨터공학과', '서울특별시', '강남구', 8, 1, '저녁', 'thumbnail-ilr3.jpg', TRUE, NOW() - INTERVAL 20 DAY),
(2, 5, 'TOEIC 900점 달성 스터디', '토익 고득점을 위한 집중 스터디입니다', '대학교 재학', '영어영문학과', '서울특별시', '서초구', 6, 1, '오후', 'thumbnail-ilr4.jpg', TRUE, NOW() - INTERVAL 15 DAY),
(3, 7, '취업 면접 준비 스터디', '대기업 취업을 위한 면접 스터디', '대학교 졸업', '경제학과', '서울특별시', '종로구', 10, 1, '오전', 'thumbnail-ilr1.jpg', TRUE, NOW() - INTERVAL 12 DAY),
(4, 4, '수학 올림피아드 스터디', '수학 문제 해결 능력 향상을 위한 스터디', '대학원 재학', '수학과', '서울특별시', '강남구', 5, 1, '저녁', 'thumbnail-ilr2.jpg', TRUE, NOW() - INTERVAL 10 DAY),
(5, 8, '의대 MCAT 준비반', '의학전문대학원 입시 준비', '대학교 재학', '의학과', '서울특별시', '서초구', 8, 1, '오전', 'thumbnail-ilr5.jpg', TRUE, NOW() - INTERVAL 5 DAY);

-- =============================================
-- 4. 게시글 더미 데이터 (15개)
-- =============================================
INSERT INTO board (category_id, author_id, title, content, view_count, like_count, comment_count, is_notice, ip_address, created_at) VALUES
-- 공지사항
(4, 1, '게시판 이용 규칙 안내', '게시판을 이용하실 때 지켜주셔야 할 규칙들을 안내드립니다.\n\n1. 욕설, 비방 금지\n2. 광고성 글 금지\n3. 개인정보 노출 금지\n\n위반 시 계정 제재가 있을 수 있습니다.', 245, 12, 5, TRUE, '192.168.1.1', NOW() - INTERVAL 25 DAY),

-- 자유게시판
(1, 2, '스터디 찾는 방법 공유해요!', '안녕하세요! 좋은 스터디를 찾는 나만의 노하우를 공유해보려고 합니다.\n\n1. 목표가 명확한 스터디 찾기\n2. 시간대가 맞는 사람들과 하기\n3. 지역적으로 가까운 곳\n\n여러분들의 노하우도 댓글로 알려주세요!', 156, 8, 12, FALSE, '192.168.1.2', NOW() - INTERVAL 20 DAY),
(1, 3, '오늘 코딩테스트 봤어요', '카카오 인턴 코딩테스트를 봤는데 생각보다 어려웠네요 ㅠㅠ\n특히 그래프 문제가 까다로웠습니다.\n\n다들 코테 준비 어떻게 하시나요?', 89, 15, 8, FALSE, '192.168.1.3', NOW() - INTERVAL 18 DAY),
(1, 5, '토익 공부 진짜 힘들다...', '매일 단어 외우고 문제 풀고 있는데 점수가 안 올라요 😭\n특히 리스닝이 정말 어려워요. 혹시 좋은 공부법 있으신가요?', 134, 6, 15, FALSE, '192.168.1.5', NOW() - INTERVAL 15 DAY),
(1, 7, '면접 후기 남겨요', '어제 대기업 면접을 봤습니다!\n예상 질문들을 많이 준비했는데 전혀 다른 질문들이 나와서 당황했어요.\n\n특히 "10년 후 자신의 모습"에 대한 질문이 기억에 남네요.', 201, 11, 6, FALSE, '192.168.1.7', NOW() - INTERVAL 12 DAY),

-- 질문/답변
(2, 4, 'Java Spring Boot 질문있어요', 'Spring Boot에서 JPA 연관관계 매핑할 때 질문이 있습니다.\n\n@OneToMany와 @ManyToOne을 동시에 사용할 때 순환참조 문제가 발생하는데 어떻게 해결하나요?', 78, 4, 9, FALSE, '192.168.1.4', NOW() - INTERVAL 16 DAY),
(2, 6, 'CSS Flexbox 정렬 문제', 'Flexbox로 아이템들을 정렬하려고 하는데 생각대로 안 되네요.\njustify-content와 align-items 차이점을 정확히 알고 싶어요!', 45, 3, 4, FALSE, '192.168.1.6', NOW() - INTERVAL 14 DAY),
(2, 8, '의대 생화학 공부법 질문', '생화학이 너무 어려워서 스터디를 구하려고 하는데\n혹시 효과적인 생화학 공부법이 있을까요?\n\n특히 대사경로 외우는 방법이 궁금해요.', 92, 7, 11, FALSE, '192.168.1.8', NOW() - INTERVAL 10 DAY),
(2, 9, '공무원 한국사 문제집 추천', '9급 공무원 시험 준비 중인데 한국사 문제집 추천 부탁드려요!\n기본서는 다 봤고 이제 문제풀이 단계입니다.', 67, 5, 7, FALSE, '192.168.1.9', NOW() - INTERVAL 8 DAY),

-- 정보공유
(3, 10, '유용한 온라인 강의 사이트 모음', '공부하면서 도움이 된 온라인 강의 사이트들을 정리해봤어요!\n\n1. 코딩 - 인프런, 유데미\n2. 영어 - 시원스쿨, EBS\n3. 수학 - 칸아카데미\n4. 디자인 - 노마드코더\n\n모두 도움이 되셨으면 좋겠어요!', 187, 22, 13, FALSE, '192.168.1.10', NOW() - INTERVAL 6 DAY),
(3, 2, '스터디 카페 추천 (강남역)', '강남역 근처 스터디 카페를 찾아서 정리해봤습니다.\n\n1. 스터디스 강남점 - 조용함, 24시간\n2. 투썸스터디 - 커피 맛있음\n3. 코카 스터디카페 - 가격 저렴\n\n각각 장단점이 있으니 참고하세요!', 143, 9, 8, FALSE, '192.168.1.2', NOW() - INTERVAL 4 DAY),
(3, 3, '개발자 포트폴리오 작성 팁', '개발자 취업 준비하면서 알게 된 포트폴리오 작성 팁을 공유합니다.\n\n1. GitHub 꾸준히 관리하기\n2. 프로젝트마다 README 상세히 작성\n3. 기술 스택 정확히 명시\n4. 트러블슈팅 경험 포함\n\n도움이 되셨으면 좋겠어요!', 234, 18, 14, FALSE, '192.168.1.3', NOW() - INTERVAL 2 DAY),
(3, 5, '토익 RC 시간관리 꿀팁', '토익 RC에서 시간이 항상 부족했는데 이 방법으로 해결했어요!\n\n1. Part 5,6은 15분 안에 끝내기\n2. Part 7은 55분 투자\n3. 모르는 문제는 과감히 넘어가기\n\n이 방법으로 850점 달성했습니다!', 176, 13, 10, FALSE, '192.168.1.5', NOW() - INTERVAL 1 DAY),
(3, 6, 'Figma 디자인 리소스 공유', '디자인 작업할 때 유용한 Figma 리소스들을 공유해요!\n\n1. UI Kit - Material Design\n2. 아이콘 - Heroicons\n3. 일러스트 - unDraw\n4. 폰트 - Pretendard\n\n모두 무료로 사용 가능합니다!', 98, 11, 6, FALSE, '192.168.1.6', NOW() - INTERVAL 12 HOUR);

-- =============================================
-- 5. 댓글 더미 데이터 (15개)
-- =============================================
INSERT INTO board_comments (board_id, author_id, content, like_count, ip_address, created_at) VALUES
-- 게시판 이용 규칙 안내 댓글
(1, 2, '규칙 잘 읽었습니다! 건전한 게시판 문화 만들어가요 👍', 3, '192.168.1.2', NOW() - INTERVAL 24 DAY),
(1, 3, '좋은 규칙이네요. 모두 지켜서 좋은 커뮤니티 만들어요!', 2, '192.168.1.3', NOW() - INTERVAL 23 DAY),
(1, 4, '맞아요! 서로 존중하며 소통해요', 1, '192.168.1.4', NOW() - INTERVAL 22 DAY),

-- 스터디 찾는 방법 공유 댓글
(2, 3, '정말 유용한 정보네요! 저도 목표가 명확한 스터디를 찾는 게 중요하다고 생각해요', 4, '192.168.1.3', NOW() - INTERVAL 19 DAY),
(2, 5, '지역이 중요한 것 같아요. 온라인도 좋지만 오프라인 만남이 있으면 더 좋죠!', 2, '192.168.1.5', NOW() - INTERVAL 18 DAY),
(2, 7, '시간대 맞추는 것도 진짜 중요해요. 저는 새벽형 인간이라 아침 스터디만 찾아요 ㅋㅋ', 3, '192.168.1.7', NOW() - INTERVAL 17 DAY),

-- 코딩테스트 후기 댓글
(3, 2, '고생하셨어요! 카카오는 원래 어렵기로 유명하죠', 5, '192.168.1.2', NOW() - INTERVAL 17 DAY),
(3, 4, '저도 얼마 전에 봤는데 그래프 문제가 진짜 어려웠어요...', 3, '192.168.1.4', NOW() - INTERVAL 16 DAY),
(3, 6, '저는 백준에서 그래프 문제를 많이 풀어봤는데 도움이 됐어요!', 2, '192.168.1.6', NOW() - INTERVAL 15 DAY),

-- 토익 공부 힘들다 댓글
(4, 2, '토익은 정말 꾸준함이 답인 것 같아요. 포기하지 마세요!', 2, '192.168.1.2', NOW() - INTERVAL 14 DAY),
(4, 6, '리스닝은 쉐도잉이 효과적이에요. 매일 30분씩 해보세요!', 4, '192.168.1.6', NOW() - INTERVAL 13 DAY),
(4, 8, '저도 토익 준비 중인데 같이 스터디 하실래요?', 1, '192.168.1.8', NOW() - INTERVAL 12 DAY),

-- Java Spring Boot 질문 댓글
(6, 2, '@JsonIgnore 어노테이션을 사용하시거나 DTO를 활용해보세요!', 3, '192.168.1.2', NOW() - INTERVAL 15 DAY),
(6, 3, '순환참조는 정말 골치 아픈 문제죠. 단방향 매핑을 고려해보세요', 2, '192.168.1.3', NOW() - INTERVAL 14 DAY),

-- 유용한 온라인 강의 사이트 모음 댓글
(10, 3, '정말 유용한 정보 감사합니다! 북마크 해놨어요', 5, '192.168.1.3', NOW() - INTERVAL 5 DAY);

-- =============================================
-- 6. 좋아요 더미 데이터
-- =============================================
INSERT INTO board_likes (board_id, member_id, created_at) VALUES
(1, 2, NOW() - INTERVAL 24 DAY), (1, 3, NOW() - INTERVAL 23 DAY), (1, 4, NOW() - INTERVAL 22 DAY),
(2, 3, NOW() - INTERVAL 19 DAY), (2, 5, NOW() - INTERVAL 18 DAY), (2, 7, NOW() - INTERVAL 17 DAY),
(3, 2, NOW() - INTERVAL 17 DAY), (3, 4, NOW() - INTERVAL 16 DAY), (3, 6, NOW() - INTERVAL 15 DAY),
(10, 3, NOW() - INTERVAL 5 DAY), (10, 5, NOW() - INTERVAL 4 DAY), (10, 7, NOW() - INTERVAL 3 DAY);

INSERT INTO comment_likes (comment_id, member_id, created_at) VALUES
(1, 3, NOW() - INTERVAL 23 DAY), (1, 4, NOW() - INTERVAL 22 DAY),
(4, 2, NOW() - INTERVAL 18 DAY), (4, 5, NOW() - INTERVAL 17 DAY),
(7, 3, NOW() - INTERVAL 16 DAY), (7, 4, NOW() - INTERVAL 15 DAY);

-- =============================================
-- 7. 파일 더미 데이터 (게시판 첨부파일)
-- =============================================
INSERT INTO file (file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, board_id, uploaded_at) VALUES
('BOARD_ATTACHMENT', 'spring_boot_guide.pdf', 'file_20241201_001.pdf', '/uploads/board/file_20241201_001.pdf', 2048576, 'application/pdf', 'hash123456', 6, NOW() - INTERVAL 15 DAY),
('BOARD_ATTACHMENT', 'algorithm_notes.txt', 'file_20241202_002.txt', '/uploads/board/file_20241202_002.txt', 51200, 'text/plain', 'hash234567', 3, NOW() - INTERVAL 17 DAY),
('BOARD_ATTACHMENT', 'toeic_wordlist.xlsx', 'file_20241203_003.xlsx', '/uploads/board/file_20241203_003.xlsx', 1024000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'hash345678', 4, NOW() - INTERVAL 14 DAY);

-- 완료 메시지
SELECT '✅ 테스트 더미 데이터 삽입 완료!' as message;
SELECT 
    '회원 10명, 게시글 15개, 댓글 15개, 좋아요 다수, 첨부파일 3개가 생성되었습니다.' as info;
SELECT 
    '모든 계정의 패스워드는 "password123" 입니다.' as password_info; 