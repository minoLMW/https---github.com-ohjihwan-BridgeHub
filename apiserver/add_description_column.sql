-- =============================================
-- members 테이블에 description 컬럼 추가
-- 스터디 참가 신청시 방장이 참고할 수 있는 사용자 자기소개 컬럼
-- =============================================

-- 1. description 컬럼 추가
ALTER TABLE members 
ADD COLUMN description TEXT COMMENT '사용자 자기소개 (스터디 참가 신청시 방장이 참고)';

-- 2. description 컬럼에 대한 인덱스 추가 (검색 최적화)
-- TEXT 컬럼의 경우 처음 100자만 인덱싱하여 성능 최적화
CREATE INDEX idx_members_description ON members(description(100));

-- 3. 확인 쿼리
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'thebridgehub' AND TABLE_NAME = 'members' 
-- AND COLUMN_NAME = 'description';

-- 4. 기존 데이터에 대한 설명 (선택사항)
-- UPDATE members SET description = CONCAT('안녕하세요! ', name, '입니다. 스터디에 참여하고 싶습니다.') 
-- WHERE description IS NULL; 