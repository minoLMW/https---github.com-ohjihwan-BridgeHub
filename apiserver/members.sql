-- =============================================
-- TheBridgeHub 데이터베이스 스키마 (완전판)
-- 채팅 로그 시스템 + 스터디 참가 시스템 포함
-- =============================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS thebridgehub 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 사용
USE thebridgehub;

-- =============================================
-- 1. 회원 테이블 (memberInfo 통합)
-- =============================================
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 ID (PK)',
    userid VARCHAR(100) NOT NULL UNIQUE COMMENT '아이디(이메일)',
    phone VARCHAR(20) COMMENT '전화번호',
    nickname VARCHAR(50) COMMENT '닉네임',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    education VARCHAR(100) COMMENT '학력',
    department VARCHAR(100) COMMENT '학과/전공',
    gender ENUM('남자','여자') COMMENT '성별',
    region VARCHAR(100) COMMENT '지역',
    district VARCHAR(100) COMMENT '구/군',
    time VARCHAR(20) COMMENT '선호 시간대 (오전/오후/저녁)',
    profile_image VARCHAR(500) COMMENT '프로필 이미지 경로',
    status ENUM('ACTIVE','BANNED','DELETED') DEFAULT 'ACTIVE' COMMENT '계정 상태',
    role ENUM('USER', 'ADMIN') DEFAULT 'USER' NOT NULL COMMENT '사용자 역할 (USER: 일반사용자, ADMIN: 관리자)',
    email_verified BOOLEAN DEFAULT FALSE COMMENT '이메일 인증 여부',
    description TEXT COMMENT '사용자 자기소개 (스터디 참가 신청시 방장이 참고)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    INDEX idx_members_description (description(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 정보';

-- =============================================
-- 2. 채팅방 테이블
-- =============================================
CREATE TABLE ChatRoom (
    room_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '채팅방 ID (PK)',
    room_name VARCHAR(100) NOT NULL COMMENT '채팅방 이름',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    max_members INT DEFAULT 10 COMMENT '최대 인원 수',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅방';

-- =============================================
-- 3. 채팅방 멤버 관계 테이블 (다대다 관계)
-- =============================================
CREATE TABLE ChatRoomMember (
    room_id INT NOT NULL COMMENT '채팅방 ID',
    member_id INT NOT NULL COMMENT '회원 ID',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '참여 시간',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '방 관리자 여부',
    PRIMARY KEY (room_id, member_id),
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅방 멤버';

-- =============================================
-- 4. 메시지 테이블 (로그 시스템 연동)
-- =============================================
CREATE TABLE Message (
    message_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메시지 ID (PK)',
    room_id INT NOT NULL COMMENT '채팅방 ID (FK)',
    sender_id INT NOT NULL COMMENT '보낸 사람 ID (FK)',
    content TEXT NOT NULL COMMENT '메시지 내용',
    message_type ENUM('TEXT', 'FILE', 'IMAGE') DEFAULT 'TEXT' COMMENT '메시지 타입',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '보낸 시간',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    
    -- 로그 시스템 관련 필드
    is_logged BOOLEAN DEFAULT FALSE COMMENT '로그 파일에 저장 여부',
    log_file_id INT COMMENT '연결된 로그 파일 ID',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='메시지 (임시 저장 + 백업)';

-- =============================================
-- 5. 채팅 로그 파일 관리 테이블
-- =============================================
CREATE TABLE chat_log_files (
    log_file_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '로그 파일 ID',
    room_id INT NOT NULL COMMENT '채팅방 ID',
    log_date DATE NOT NULL COMMENT '로그 날짜 (YYYY-MM-DD)',
    file_path VARCHAR(500) NOT NULL COMMENT '로그 파일 경로',
    file_name VARCHAR(255) NOT NULL COMMENT '로그 파일명',
    message_count INT DEFAULT 0 COMMENT '해당 날짜 메시지 개수',
    file_size BIGINT DEFAULT 0 COMMENT '파일 크기 (bytes)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '마지막 업데이트',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '아카이브 여부',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_date (room_id, log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅 로그 파일 관리';

-- =============================================
-- 6. 스터디룸 테이블 (Java 엔티티명: studyroom)
-- =============================================
CREATE TABLE studyroom (
    study_room_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '스터디룸 ID',
    room_id INT NOT NULL UNIQUE COMMENT '채팅방 ID (FK)',
    boss_id INT NOT NULL COMMENT '방장 ID',
    title VARCHAR(255) NOT NULL COMMENT '스터디 제목',
    description TEXT COMMENT '스터디 설명',
    education VARCHAR(100) COMMENT '학력 요구사항',
    department VARCHAR(100) COMMENT '학과/전공 요구사항',
    region VARCHAR(100) COMMENT '지역',
    district VARCHAR(100) COMMENT '구/군',
    capacity INT DEFAULT 10 COMMENT '최대 참가자 수',
    current_members INT DEFAULT 1 COMMENT '현재 참가자 수',
    time VARCHAR(20) COMMENT '선호 시간대 (오전/오후/저녁)',
    thumbnail VARCHAR(255) COMMENT '썸네일 이미지 경로',
    is_public BOOLEAN DEFAULT TRUE COMMENT '공개 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (boss_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='스터디룸';

-- =============================================
-- 7. 스터디룸 멤버 관리 테이블 ⭐ 새로 추가
-- =============================================
CREATE TABLE study_room_members (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '스터디 멤버 ID',
    study_room_id INT NOT NULL COMMENT '스터디룸 ID (FK)',
    member_id INT NOT NULL COMMENT '회원 ID (FK)',
    role ENUM('BOSS', 'MEMBER') DEFAULT 'MEMBER' COMMENT '역할 (방장/멤버)',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '상태 (대기/승인/거절)',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '참가 신청 시간',
    approved_at DATETIME NULL COMMENT '승인 시간',
    approved_by INT NULL COMMENT '승인자 ID (FK)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES members(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_member_study (study_room_id, member_id),
    INDEX idx_study_room_members_study_id (study_room_id),
    INDEX idx_study_room_members_member_id (member_id),
    INDEX idx_study_room_members_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='스터디룸 멤버 관리';

-- =============================================
-- 8. 신고 테이블 (로그 시스템 연동)
-- =============================================
CREATE TABLE Report (
    report_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '신고 ID (PK)',
    reporter_id INT NOT NULL COMMENT '신고자 ID (FK)',
    reported_user_id INT COMMENT '신고 대상 회원 ID (FK)',
    report_type ENUM('USER', 'MESSAGE', 'STUDYROOM', 'INAPPROPRIATE_CONTENT') NOT NULL COMMENT '신고 유형',
    message_id INT COMMENT '신고한 메시지 ID (FK)',
    room_id INT COMMENT '신고한 채팅방 ID (FK)',
    study_room_id INT COMMENT '스터디룸 ID (FK)',
    reason VARCHAR(255) NOT NULL COMMENT '신고 사유',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '신고 시간',
    status ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '처리 상태',
    admin_comment TEXT COMMENT '관리자 코멘트',
    
    -- 로그 시스템 관련 필드
    log_file_id INT COMMENT '신고 관련 로그 파일 ID',
    log_message_index INT COMMENT '로그 파일 내 메시지 인덱스',
    
    FOREIGN KEY (reporter_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES Message(message_id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE SET NULL,
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE SET NULL,
    FOREIGN KEY (log_file_id) REFERENCES chat_log_files(log_file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='신고';

-- =============================================
-- 9. 게시판 카테고리 테이블
-- =============================================
CREATE TABLE board_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 ID',
    category_name VARCHAR(50) NOT NULL UNIQUE COMMENT '카테고리 이름',
    description TEXT COMMENT '카테고리 설명',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시판 카테고리';

-- =============================================
-- 10. 게시글 테이블
-- =============================================
CREATE TABLE board (
    board_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '게시글 ID',
    category_id INT NULL COMMENT '카테고리 ID (FK)',
    author_id INT NOT NULL COMMENT '작성자 ID (FK)',
    title VARCHAR(255) NOT NULL COMMENT '제목',
    content TEXT NOT NULL COMMENT '내용',
    view_count INT DEFAULT 0 COMMENT '조회수',
    like_count INT DEFAULT 0 COMMENT '좋아요 수',
    comment_count INT DEFAULT 0 COMMENT '댓글 수',
    is_notice BOOLEAN DEFAULT FALSE COMMENT '공지사항 여부',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    ip_address VARCHAR(45) COMMENT '작성자 IP',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    
    FOREIGN KEY (category_id) REFERENCES board_categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글';

-- =============================================
-- 11. 댓글 테이블 
-- =============================================
CREATE TABLE board_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 ID',
    board_id INT NOT NULL COMMENT '게시글 ID (FK)',
    author_id INT NOT NULL COMMENT '작성자 ID (FK)',
    content TEXT NOT NULL COMMENT '댓글 내용',
    like_count INT DEFAULT 0 COMMENT '좋아요 수',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    ip_address VARCHAR(45) COMMENT '작성자 IP',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    
    FOREIGN KEY (board_id) REFERENCES board(board_id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 댓글';

-- =============================================
-- 12. 게시글 좋아요 테이블
-- =============================================
CREATE TABLE board_likes (
    board_id INT NOT NULL COMMENT '게시글 ID (FK)',
    member_id INT NOT NULL COMMENT '회원 ID (FK)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '좋아요 시간',
    
    PRIMARY KEY (board_id, member_id),
    FOREIGN KEY (board_id) REFERENCES board(board_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='게시글 좋아요';

-- =============================================
-- 13. 댓글 좋아요 테이블
-- =============================================
CREATE TABLE comment_likes (
    comment_id INT NOT NULL COMMENT '댓글 ID (FK)',
    member_id INT NOT NULL COMMENT '회원 ID (FK)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '좋아요 시간',
    
    PRIMARY KEY (comment_id, member_id),
    FOREIGN KEY (comment_id) REFERENCES board_comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='댓글 좋아요';

-- =============================================
-- 14. 파일 테이블 (게시판 첨부파일 지원 확장)
-- =============================================
CREATE TABLE file (
    file_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '파일 ID',
    file_type ENUM('MESSAGE', 'PROFILE', 'STUDY_THUMBNAIL', 'STUDY_ATTACHMENT', 'BOARD_ATTACHMENT', 'TEMP') NOT NULL COMMENT '파일 유형',
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (bytes)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME 타입',
    file_hash VARCHAR(64) COMMENT '파일 해시 (중복 방지)',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시간',
    
    -- 파일 유형별 참조 ID들
    message_id INT NULL COMMENT '메시지 ID (FK) - file_type이 MESSAGE일 때',
    member_id INT NULL COMMENT '회원 ID (FK) - file_type이 PROFILE일 때',
    study_room_id INT NULL COMMENT '스터디룸 ID (FK) - file_type이 STUDY_*일 때',
    board_id INT NULL COMMENT '게시글 ID (FK) - file_type이 BOARD_ATTACHMENT일 때',
    
    FOREIGN KEY (message_id) REFERENCES Message(message_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES board(board_id) ON DELETE SET NULL,
    
    -- 인덱스
    INDEX idx_file_type_board (file_type, board_id),
    INDEX idx_file_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='파일';

-- =============================================
-- 15. 트리거 생성 (스터디 멤버 자동 관리 + 게시판 카운트 관리)
-- =============================================

-- 스터디룸 생성 시 방장 자동 추가 트리거
DELIMITER //
CREATE TRIGGER after_studyroom_insert 
AFTER INSERT ON studyroom
FOR EACH ROW
BEGIN
    INSERT INTO study_room_members (study_room_id, member_id, role, status, approved_at)
    VALUES (NEW.study_room_id, NEW.boss_id, 'BOSS', 'APPROVED', NOW());
END//
DELIMITER ;

-- 스터디룸 멤버 수 업데이트 트리거
DELIMITER //
CREATE TRIGGER update_study_room_member_count
AFTER UPDATE ON study_room_members
FOR EACH ROW
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = NEW.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = NEW.study_room_id;
    ELSEIF NEW.status != 'APPROVED' AND OLD.status = 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = NEW.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = NEW.study_room_id;
    END IF;
END//
DELIMITER ;

-- 스터디룸 멤버 삭제 시 멤버 수 업데이트 트리거
DELIMITER //
CREATE TRIGGER after_study_member_delete
AFTER DELETE ON study_room_members
FOR EACH ROW
BEGIN
    IF OLD.status = 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = OLD.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = OLD.study_room_id;
    END IF;
END//
DELIMITER ;

-- 댓글 추가 시 게시글의 댓글 수 증가
DELIMITER //
CREATE TRIGGER after_comment_insert
AFTER INSERT ON board_comments
FOR EACH ROW
BEGIN
    UPDATE board SET comment_count = comment_count + 1 WHERE board_id = NEW.board_id;
END//
DELIMITER ;

-- 댓글 삭제 시 게시글의 댓글 수 감소
DELIMITER //
CREATE TRIGGER after_comment_delete
AFTER DELETE ON board_comments
FOR EACH ROW
BEGIN
    UPDATE board SET comment_count = comment_count - 1 WHERE board_id = OLD.board_id;
END//
DELIMITER ;

-- 게시글 좋아요 추가 시 좋아요 수 증가
DELIMITER //
CREATE TRIGGER after_board_like_insert
AFTER INSERT ON board_likes
FOR EACH ROW
BEGIN
    UPDATE board SET like_count = like_count + 1 WHERE board_id = NEW.board_id;
END//
DELIMITER ;

-- 게시글 좋아요 삭제 시 좋아요 수 감소
DELIMITER //
CREATE TRIGGER after_board_like_delete
AFTER DELETE ON board_likes
FOR EACH ROW
BEGIN
    UPDATE board SET like_count = like_count - 1 WHERE board_id = OLD.board_id;
END//
DELIMITER ;

-- 댓글 좋아요 추가 시 좋아요 수 증가
DELIMITER //
CREATE TRIGGER after_comment_like_insert
AFTER INSERT ON comment_likes
FOR EACH ROW
BEGIN
    UPDATE board_comments SET like_count = like_count + 1 WHERE comment_id = NEW.comment_id;
END//
DELIMITER ;

-- 댓글 좋아요 삭제 시 좋아요 수 감소
DELIMITER //
CREATE TRIGGER after_comment_like_delete
AFTER DELETE ON comment_likes
FOR EACH ROW
BEGIN
    UPDATE board_comments SET like_count = like_count - 1 WHERE comment_id = OLD.comment_id;
END//
DELIMITER ;

-- =============================================
-- 11. 기본 데이터 삽입
-- =============================================

-- 게시판 카테고리 기본 데이터
INSERT INTO board_categories (category_name, description, sort_order) VALUES
('자유게시판', '자유롭게 소통하는 공간입니다', 1),
('질문/답변', '스터디 관련 질문과 답변', 2),
('정보공유', '유용한 정보를 공유하는 공간', 3),
('공지사항', '중요한 공지사항', 0);



-- =============================================
-- 12. 시스템 구조 설명
-- =============================================

/*
🎯 TheBridgeHub 통합 시스템 구조:

기존 시스템:
1. members: 회원 정보 (JWT 인증)
2. ChatRoom: 채팅방 기본 정보
3. ChatRoomMember: 채팅방 멤버 관리
4. Message: 메시지 저장
5. chat_log_files: 채팅 로그 관리
6. studyroom: 스터디룸 정보
7. study_room_members: 스터디 멤버 관리
8. Report: 신고 기능
9. file: 파일 관리 시스템

새로 추가된 게시판 시스템:
10. board_categories: 게시판 카테고리
11. board: 게시글 (자동 카운트 관리)
12. board_comments: 댓글 시스템 (평면 구조)
13. board_likes: 게시글 좋아요
14. comment_likes: 댓글 좋아요

✅ 완성된 기능들:
- JWT 인증과 완전 연동
- 첨부파일 업로드/다운로드
- 심플한 댓글 시스템 (대댓글 기능 제거)
- 좋아요 시스템 (중복 방지)
- 조회수/댓글수/좋아요수 자동 관리
- 트리거로 실시간 데이터 동기화

🚀 바로 사용 가능한 상태입니다!
*/
