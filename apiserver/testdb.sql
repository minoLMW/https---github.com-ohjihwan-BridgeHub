-- 1. 회원정보 임시 데이터 (15명) *password1234

INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, profile_image, status,role,email_verified, description, created_at) VALUES
('admin@test.com', '010-1234-5678', '관리자', '이관리', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS',, '대학교', '컴퓨터공학과', '남자', '서울특별시', '송파구', '오전', '/images/profile.jpg', 'ACTIVE', TRUE, '관리자입니다.', NOW() - INTERVAL 30 DAY)
('user1@test.com', '010-6659-6264', '열정소녀', '김사과', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '경영학과', '여자', '서울특별시', '강서구', '야간', '/images/profile/1.jpg', 'ACTIVE', TRUE, '기업 경영에 대한 이해를 바탕으로 창업을 목표로 하고 있어요.',NOW() - INTERVAL 26 DAY),
('user2@test.com', '010-2064-8974', '프론트여신', '반하나', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '컴퓨터공학과', '여자', '부산광역시', '남구', '오후', '/images/profile/2.jpg', 'ACTIVE', TRUE, '풀스택 개발자가 되기 위해 프론트와 백엔드 모두 학습 중입니다.',NOW() - INTERVAL 29 DAY),
('user3@test.com', '010-4163-9056', '교수꿈나무', '이메론', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '교육학과', '여자', '경상북도', '포항시 남구', '오후', '/images/profile/3.jpg', 'ACTIVE', TRUE, '현장 중심의 교육방법론을 연구 중이며, 협업 학습에 관심이 많아요.',NOW() - INTERVAL 28 DAY),
('user4@test.com', '010-3715-3181', '문학소녀', '박망고', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '국어국문학과', '여자', '경기도', '고양시 일산서구', '오전', '/images/profile/4.jpg', 'ACTIVE', TRUE, '고전 문학과 현대 문학을 분석하며 작문 실력을 키우고 있습니다.',NOW() - INTERVAL 10 DAY),
('user5@test.com', '010-1317-6974', '금융전문가', '지수빈', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '경제학과', '남자', '서울특별시', '노원구', '오후', '/images/profile/5.jpg', 'ACTIVE', TRUE, '금융시장 분석과 통계모델링에 집중하고 있어요.',NOW() - INTERVAL 20 DAY),
('user6@test.com', '010-7752-6120', '행정도전', '안유진', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '행정학과', '여자', '서울특별시', '강동구', '오후', '/images/profile/6.jpg', 'ACTIVE', TRUE, '공공정책 기획과 정책 평가에 흥미가 있습니다.',NOW() - INTERVAL 15 DAY),
('user7@test.com', '010-0600-5753', '코딩남', '박취업', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '컴퓨터공학과', '남자', '대구광역시', '달서구', '오후', '/images/profile/7.jpg', 'ACTIVE', TRUE, 'AI와 시스템 아키텍처에 집중하며 프로젝트 경험을 쌓고 있어요.',NOW() - INTERVAL 18 DAY),
('user8@test.com', '010-6081-1242', '법조인꿈나무', '권지용', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '법학과', '남자', '광주광역시', '북구', '오전', '/images/profile/8.jpg', 'ACTIVE', TRUE, '사회 정의를 실현하는 법조인을 목표로 공부하고 있어요.',NOW() - INTERVAL 11 DAY),
('user9@test.com', '010-4928-1856', '물리소녀', '오렌지', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '융합물리학과', '여자', '충청북도', '청주시 상당구', '오전', '/images/profile/9.jpg', 'ACTIVE', TRUE, '양자역학과 나노소자에 관심이 많습니다.',NOW() - INTERVAL 9 DAY),
('user10@test.com', '010-5782-5910', '문학연구생', '최에리', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '영어영문학과', '여자', '대구광역시', '중구', '오후', '/images/profile/10.jpg', 'ACTIVE', TRUE, '영문학과 문화 연구를 통해 글로벌 인사이트를 넓히고 있어요.',NOW() - INTERVAL 23 DAY),
('user11@test.com', '010-1028-0712', '중문전문가', '한지민', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '중어중문학과', '여자', '부산광역시', '해운대구', '야간', '/images/profile/11.jpg', 'ACTIVE', TRUE, '중국 문화와 언어에 관심이 많아 전문 통번역을 준비 중입니다.',NOW() - INTERVAL 12 DAY),
('user12@test.com', '010-0359-4987', '호텔리어', '최유리', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '호텔경영학과', '여자', '경기도', '고양시 덕양구', '오후', '/images/profile/12.jpg', 'ACTIVE', TRUE, '서비스 품질 개선과 리더십 개발에 관심이 있어요.',NOW() - INTERVAL 19 DAY),
('user13@test.com', '010-2986-5110', '경제연구생', '이석민', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '경제학과', '남자', '충청북도', '청주시 상당구', '야간', '/images/profile/13.jpg', 'ACTIVE', TRUE, '거시경제 이론과 정책 분석에 관심이 많습니다.',NOW() - INTERVAL 7 DAY),
('user14@test.com', '010-7688-3860', '문학청년', '홍지수', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학교', '국어국문학과', '남자', '대구광역시', '달서구', '오전', '/images/profile/14.jpg', 'ACTIVE', TRUE, '한국 현대시 분석과 창작 활동을 꾸준히 하고 있어요.',NOW() - INTERVAL 4 DAY),
('user15@test.com', '010-2790-0010', '법학소녀', '배수지', '$2b$12$LVEp.rWiI6grR2aDPyNIe.A4WB1lJ8vbH.nuDwSPLegcoCQL4SfSS', '대학원', '법학과', '여자', '부산광역시', '수영구', '오후', '/images/profile/15.jpg', 'ACTIVE', TRUE, '헌법과 형법 분야의 전문성을 쌓고 싶습니다.',NOW() - INTERVAL 15DAY);


-- 2. 스터디룸 임시 데이터 (15개) -
INSERT INTO studyroom (room_id, boss_id, title, description, education, department, region, district, capacity, current_members, time, thumbnail, is_public, created_at) VALUES
(1, 3, '컴퓨터공학 알고리즘 스터디', '코딩테스트 대비 알고리즘 문제를 함께 풀어요', '대학교', '컴퓨터공학과', '서울특별시', '강서구', 8, 1, '저녁', 'thumbnail1.jpg', TRUE, NOW() - INTERVAL 20 DAY),
(2, 10, 'TOEIC 900점 달성 스터디', '토익 고득점을 위한 집중 스터디입니다', '대학교', '영어영문학과', '대구광역시', '중구', 6, 1, '오후', 'thumbnail2.jpg', TRUE, NOW() - INTERVAL 15 DAY),
(3, 5, '취업 면접 준비 스터디', '대기업 취업을 위한 면접 스터디', '대학원', '경제학과', '서울특별시', '노원구', 10, 1, '오전', 'thumbnail3.jpg', TRUE, NOW() - INTERVAL 12 DAY),
(4, 4, '국문학 독서토론', '고전문학부터 현대소설까지 함께 읽고 토론해요', '대학교', '국어국문학과', '경기도', '고양시 일산서구', 5, 1, '오전', 'thumbnail4.jpg', TRUE, NOW() - INTERVAL 18 DAY),
(5, 6, '행정학 기출 풀이반', '기출문제 기반으로 행정학 공부해요', '대학교', '행정학과', '서울특별시', '강동구', 7, 1, '오후', 'thumbnail5.jpg', TRUE, NOW() - INTERVAL 9 DAY),
(6, 2, '경영학 발표 스터디', '경영이론과 사례 발표 중심 스터디', '대학교', '경영학과', '부산광역시', '남구', 6, 1, '오후', 'thumbnail6.jpg', TRUE, NOW() - INTERVAL 14 DAY),
(7, 17, '시각디자인 포트폴리오', '포트폴리오 완성을 위한 실습 중심 스터디', '대학교', '시각디자인과', '서울특별시', '강동구', 4, 1, '야간', 'thumbnail7.jpg', TRUE, NOW() - INTERVAL 13 DAY),
(8, 18, '화학공학 실험스터디', '실험 노트 작성 및 발표 연습 중심', '대학원', '화학공학과', '대구광역시', '북구', 6, 1, '오후', 'thumbnail8.jpg', TRUE, NOW() - INTERVAL 8 DAY),
(9, 12, '호텔경영 글로벌 트렌드', '관광 산업 최신 트렌드 분석', '대학교', '호텔경영학과', '고양시', '덕양구', 5, 1, '오후', 'thumbnail9.jpg', TRUE, NOW() - INTERVAL 11 DAY),
(10, 13, '거시경제 정책분석', '한국과 세계 경제 이슈 분석', '대학원', '경제학과', '청주시', '상당구', 7, 1, '야간', 'thumbnail10.jpg', TRUE, NOW() - INTERVAL 10 DAY),
(11, 16, '해부학 집중과정', '의학 기초과목 복습 중심', '대학교', '의학과', '서울특별시', '은평구', 6, 1, '오전', 'thumbnail11.jpg', TRUE, NOW() - INTERVAL 17 DAY),
(12, 14, '현대시 작품 해석', '문학작품 분석과 감상 발표', '대학교', '국어국문학과', '대구광역시', '달서구', 5, 1, '오전', 'thumbnail12.jpg', TRUE, NOW() - INTERVAL 16 DAY),
(13, 15, '로스쿨 준비 스터디', '헌법, 민법 집중 스터디', '대학원', '법학과', '부산광역시', '수영구', 8, 1, '오후', 'thumbnail13.jpg', TRUE, NOW() - INTERVAL 15 DAY),
(14, 7, 'AI 개발 프로젝트', 'TensorFlow 기반 딥러닝 구현', '대학원', '컴퓨터공학과', '대구광역시', '달서구', 6, 1, '오후', 'thumbnail14.jpg', TRUE, NOW() - INTERVAL 14 DAY),
(15, 11, '중국어 회화 실전반', '일상 회화에서 비즈니스까지 연습', '대학교', '중어중문학과', '부산광역시', '해운대구', 6, 1, '야간', 'thumbnail15.jpg', TRUE, NOW() - INTERVAL 13 DAY);


-- 3. 멤버관리 테이블 임시 데이터 (15) 
INSERT INTO study_room_members (study_room_id, member_id, role, status, joined_at, approved_at, approved_by, created_at, updated_at) VALUES
(1, 1, 'BOSS', 'APPROVED', NOW(), NOW(), 1, NOW(), NOW()),
(1, 20, 'MEMBER', 'APPROVED', NOW(), NOW(), 1, NOW(), NOW()),
(2, 2, 'BOSS', 'APPROVED', NOW(), NOW(), 2, NOW(), NOW()),
(2, 19, 'MEMBER', 'APPROVED', NOW(), NOW(), 2, NOW(), NOW()),
(2, 8, 'MEMBER', 'REJECTED', NOW(), NULL, NULL, NOW(), NOW()),
(2, 5, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(3, 3, 'BOSS', 'APPROVED', NOW(), NOW(), 3, NOW(), NOW()),
(3, 4, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(3, 20, 'MEMBER', 'APPROVED', NOW(), NOW(), 3, NOW(), NOW()),
(3, 19, 'MEMBER', 'REJECTED', NOW(), NULL, NULL, NOW(), NOW()),
(4, 4, 'BOSS', 'APPROVED', NOW(), NOW(), 4, NOW(), NOW()),
(4, 7, 'MEMBER', 'APPROVED', NOW(), NOW(), 4, NOW(), NOW()),
(5, 5, 'BOSS', 'APPROVED', NOW(), NOW(), 5, NOW(), NOW()),
(5, 11, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(5, 18, 'MEMBER', 'APPROVED', NOW(), NOW(), 5, NOW(), NOW()),
(6, 6, 'BOSS', 'APPROVED', NOW(), NOW(), 6, NOW(), NOW()),
(6, 4, 'MEMBER', 'REJECTED', NOW(), NULL, NULL, NOW(), NOW()),
(7, 7, 'BOSS', 'APPROVED', NOW(), NOW(), 7, NOW(), NOW()),
(7, 6, 'MEMBER', 'APPROVED', NOW(), NOW(), 7, NOW(), NOW()),
(7, 15, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(8, 8, 'BOSS', 'APPROVED', NOW(), NOW(), 8, NOW(), NOW()),
(8, 19, 'MEMBER', 'APPROVED', NOW(), NOW(), 8, NOW(), NOW()),
(9, 9, 'BOSS', 'APPROVED', NOW(), NOW(), 9, NOW(), NOW()),
(9, 3, 'MEMBER', 'APPROVED', NOW(), NOW(), 9, NOW(), NOW()),
(9, 16, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(10, 10, 'BOSS', 'APPROVED', NOW(), NOW(), 10, NOW(), NOW()),
(10, 18, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(10, 1, 'MEMBER', 'APPROVED', NOW(), NOW(), 10, NOW(), NOW()),
(11, 11, 'BOSS', 'APPROVED', NOW(), NOW(), 11, NOW(), NOW()),
(11, 20, 'MEMBER', 'APPROVED', NOW(), NOW(), 11, NOW(), NOW()),
(12, 12, 'BOSS', 'APPROVED', NOW(), NOW(), 12, NOW(), NOW()),
(12, 8, 'MEMBER', 'PENDING', NOW(), NULL, NULL, NOW(), NOW()),
(13, 13, 'BOSS', 'APPROVED', NOW(), NOW(), 13, NOW(), NOW()),
(13, 5, 'MEMBER', 'APPROVED', NOW(), NOW(), 13, NOW(), NOW()),
(14, 14, 'BOSS', 'APPROVED', NOW(), NOW(), 14, NOW(), NOW()),
(14, 18, 'MEMBER', 'APPROVED', NOW(), NOW(), 14, NOW(), NOW()),
(15, 15, 'BOSS', 'APPROVED', NOW(), NOW(), 15, NOW(), NOW()),
(15, 1, 'MEMBER', 'APPROVED', NOW(), NOW(), 15, NOW(), NOW()),
(15, 6, 'MEMBER', 'APPROVED', NOW(), NOW(), 15, NOW(), NOW());


