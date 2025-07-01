# 게시판 API 명세서

## 1. 게시글 관련 API

### 📌 GET /api/board - 게시글 목록 조회
```
Query Parameters:
- page: 페이지 번호 (기본값: 1)
- size: 페이지 크기 (기본값: 20)
- category: 카테고리 ID (전체: null)
- search: 검색어 (제목+내용)
- sort: 정렬 방식 (latest, popular, views)

Response:
{
  "status": "success",
  "data": {
    "boards": [
      {
        "boardId": 1,
        "categoryId": 1,
        "categoryName": "자유게시판",
        "title": "게시글 제목",
        "authorNickname": "작성자닉네임",
        "viewCount": 123,
        "likeCount": 5,
        "commentCount": 8,
        "attachmentCount": 2,
        "isNotice": false,
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T11:00:00"
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 1
  }
}
```

### 📌 GET /api/board/{boardId} - 게시글 상세 조회
```
Path Parameters:
- boardId: 게시글 ID

Response:
{
  "status": "success",
  "data": {
    "boardId": 1,
    "categoryId": 1,
    "categoryName": "자유게시판",
    "title": "게시글 제목",
    "content": "게시글 내용...",
    "authorId": 123,
    "authorNickname": "작성자닉네임",
    "viewCount": 124,
    "likeCount": 5,
    "commentCount": 8,
    "isNotice": false,
    "isLiked": true,
    "attachments": [
      {
        "fileId": 1,
        "originalFilename": "document.pdf",
        "fileSize": 1024000,
        "downloadUrl": "/api/files/download/1"
      }
    ],
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T11:00:00"
  }
}
```

### 📌 POST /api/board - 게시글 작성
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Request Body:
{
  "categoryId": 1,
  "title": "게시글 제목",
  "content": "게시글 내용...",
  "isNotice": false,
  "attachmentIds": [1, 2, 3]  // 업로드된 파일 ID 목록
}

Response:
{
  "status": "success",
  "data": {
    "boardId": 10,
    "message": "게시글이 작성되었습니다."
  }
}
```

### 📌 PUT /api/board/{boardId} - 게시글 수정
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- boardId: 게시글 ID

Request Body:
{
  "categoryId": 1,
  "title": "수정된 제목",
  "content": "수정된 내용...",
  "attachmentIds": [1, 2]
}

Response:
{
  "status": "success",
  "data": {
    "message": "게시글이 수정되었습니다."
  }
}
```

### 📌 DELETE /api/board/{boardId} - 게시글 삭제
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- boardId: 게시글 ID

Response:
{
  "status": "success",
  "data": {
    "message": "게시글이 삭제되었습니다."
  }
}
```

### 📌 POST /api/board/{boardId}/like - 게시글 좋아요/취소
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- boardId: 게시글 ID

Response:
{
  "status": "success",
  "data": {
    "isLiked": true,
    "likeCount": 6,
    "message": "좋아요가 추가되었습니다."
  }
}
```

## 2. 댓글 관련 API

### 📌 GET /api/board/{boardId}/comments - 댓글 목록 조회
```
Path Parameters:
- boardId: 게시글 ID

Query Parameters:
- page: 페이지 번호 (기본값: 1)
- size: 페이지 크기 (기본값: 20)

Response:
{
  "status": "success",
  "data": {
    "comments": [
      {
        "commentId": 1,
        "boardId": 1,
        "authorNickname": "댓글작성자",
        "content": "댓글 내용입니다.",
        "depth": 0,
        "likeCount": 2,
        "isLiked": false,
        "parentCommentId": null,
        "createdAt": "2024-01-15T11:00:00",
        "updatedAt": "2024-01-15T11:00:00",
        "replies": [
          {
            "commentId": 2,
            "boardId": 1,
            "authorNickname": "대댓글작성자",
            "content": "대댓글 내용입니다.",
            "depth": 1,
            "likeCount": 0,
            "isLiked": false,
            "parentCommentId": 1,
            "createdAt": "2024-01-15T11:30:00",
            "updatedAt": "2024-01-15T11:30:00"
          }
        ]
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 1
  }
}
```

### 📌 POST /api/board/{boardId}/comments - 댓글 작성
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- boardId: 게시글 ID

Request Body:
{
  "content": "댓글 내용입니다.",
  "parentCommentId": null  // 대댓글인 경우 부모 댓글 ID
}

Response:
{
  "status": "success",
  "data": {
    "commentId": 5,
    "message": "댓글이 작성되었습니다."
  }
}
```

### 📌 PUT /api/comments/{commentId} - 댓글 수정
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- commentId: 댓글 ID

Request Body:
{
  "content": "수정된 댓글 내용입니다."
}

Response:
{
  "status": "success",
  "data": {
    "message": "댓글이 수정되었습니다."
  }
}
```

### 📌 DELETE /api/comments/{commentId} - 댓글 삭제
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- commentId: 댓글 ID

Response:
{
  "status": "success",
  "data": {
    "message": "댓글이 삭제되었습니다."
  }
}
```

### 📌 POST /api/comments/{commentId}/like - 댓글 좋아요/취소
```
Headers:
- Authorization: Bearer {JWT_TOKEN}

Path Parameters:
- commentId: 댓글 ID

Response:
{
  "status": "success",
  "data": {
    "isLiked": true,
    "likeCount": 3,
    "message": "댓글 좋아요가 추가되었습니다."
  }
}
```

## 3. 파일 업로드 관련 API

### 📌 POST /api/board/upload - 게시판 파일 업로드
```
Headers:
- Authorization: Bearer {JWT_TOKEN}
- Content-Type: multipart/form-data

Request Body:
- files: 업로드할 파일들 (최대 5개, 10MB 제한)

Response:
{
  "status": "success",
  "data": {
    "uploadedFiles": [
      {
        "fileId": 1,
        "originalFilename": "document.pdf",
        "storedFilename": "20240115_123456_document.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf"
      }
    ],
    "message": "파일이 업로드되었습니다."
  }
}
```

### 📌 GET /api/files/download/{fileId} - 파일 다운로드
```
Path Parameters:
- fileId: 파일 ID

Response: 파일 스트림
```

## 4. 카테고리 관련 API

### 📌 GET /api/board/categories - 카테고리 목록 조회
```
Response:
{
  "status": "success",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "자유게시판",
      "description": "자유롭게 소통하는 공간입니다",
      "sortOrder": 1,
      "isActive": true
    },
    {
      "categoryId": 2,
      "categoryName": "질문/답변",
      "description": "스터디 관련 질문과 답변",
      "sortOrder": 2,
      "isActive": true
    }
  ]
}
```

## 5. 에러 응답 형식

```json
{
  "status": "error",
  "errorCode": "BOARD_NOT_FOUND",
  "message": "게시글을 찾을 수 없습니다."
}
```

### 주요 에러 코드
- `BOARD_NOT_FOUND`: 게시글 없음
- `COMMENT_NOT_FOUND`: 댓글 없음
- `UNAUTHORIZED`: 인증 필요
- `FORBIDDEN`: 권한 없음 (수정/삭제)
- `INVALID_CATEGORY`: 잘못된 카테고리
- `FILE_UPLOAD_ERROR`: 파일 업로드 실패
- `FILE_SIZE_EXCEEDED`: 파일 크기 초과 