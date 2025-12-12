# API 테스트 가이드

이 문서는 ClubHub의 Auth API를 테스트하는 방법을 설명합니다.

## 전제 조건

- 서버가 `http://localhost:3000`에서 실행 중이어야 합니다.
- `curl` 또는 Postman 같은 API 테스트 도구가 필요합니다.

## 테스트 순서

### 1. 회원가입 테스트

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

**예상 응답 (201 Created)**:

```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user1@example.com",
    "name": "홍길동",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  }
}
```

---

### 2. 로그인 테스트

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**예상 응답 (200 OK)**:

```json
{
  "message": "로그인이 완료되었습니다.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user1@example.com",
    "name": "홍길동",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzZXIxQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjAxMDAwMDAsImV4cCI6MTc2MDE4NjQwMH0.XXXXX"
}
```

**`access_token`을 저장해두세요. 다음 테스트에서 사용합니다.**

---

### 3. 잘못된 비밀번호로 로그인 시도

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "wrongpassword"
  }'
```

**예상 응답 (401 Unauthorized)**:

```json
{
  "message": "비밀번호가 일치하지 않습니다.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### 4. 현재 사용자 정보 조회

위의 로그인 응답에서 받은 `access_token`을 사용합니다.

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**예상 응답 (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user1@example.com",
  "name": "홍길동",
  "role": "user",
  "createdAt": "2025-12-11T10:00:00.000Z"
}
```

---

### 5. 토큰 없이 인증 필요 엔드포인트 접근

```bash
curl -X GET http://localhost:3000/auth/me
```

**예상 응답 (401 Unauthorized)**:

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 6. 중복 이메일 회원가입 시도

같은 이메일로 다시 회원가입을 시도합니다:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password456",
    "name": "김철수"
  }'
```

**예상 응답 (409 Conflict)**:

```json
{
  "message": "이미 존재하는 이메일입니다.",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### 7. 비밀번호 길이 검증

6자 미만의 비밀번호로 회원가입을 시도합니다:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "pass",
    "name": "이순신"
  }'
```

**예상 응답 (400 Bad Request)**:

```json
{
  "message": "비밀번호는 최소 6자 이상이어야 합니다.",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Postman 사용 방법

### 1. Postman 환경 변수 설정

**Environment** 탭에서 다음을 추가하세요:

```json
{
  "base_url": "http://localhost:3000",
  "access_token": ""
}
```

### 2. 각 요청에서 사용

- **URL**: `{{base_url}}/auth/register`
- **Header**: `Authorization: Bearer {{access_token}}`

### 3. 로그인 후 토큰 자동 저장

로그인 요청의 **Tests** 탭에 다음을 추가하세요:

```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set('access_token', jsonData.access_token);
}
```

---

## 데이터 파일 확인

회원가입/로그인 후 생성된 사용자 데이터는 다음 위치에 저장됩니다:

```
src/data/users.json
```

파일을 직접 열어서 저장된 사용자 정보를 확인할 수 있습니다.

**예제**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user1@example.com",
    "password": "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "name": "홍길동",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  }
]
```

---

## 문제 해결

### 토큰 만료 오류

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

→ 새로 로그인하여 새로운 토큰을 받으세요.

### CORS 오류

Postman이나 다른 도메인에서 요청할 경우 CORS 설정이 필요할 수 있습니다. `main.ts`에서 다음을 추가하세요:

```typescript
app.enableCors();
```

---

## 동아리 관리 테스트

### 전제

- 관리자 계정의 `access_token`이 필요합니다. (`/auth/login`에서 `role`이 `admin`인 계정 토큰 사용)

### 1. 동아리 생성 (관리자만)

```bash
curl -X POST http://localhost:3000/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "소프트웨어 연구회",
    "description": "웹/모바일 프로젝트를 함께 만드는 동아리"
  }'
```

**예상 응답 (201 Created)**

```json
{
  "id": "c6c34c7c-0c3b-4f57-9d44-9c3c8c0f1c9b",
  "name": "소프트웨어 연구회",
  "description": "웹/모바일 프로젝트를 함께 만드는 동아리",
  "ownerId": "<admin-user-id>",
  "createdAt": "2025-12-11T10:00:00.000Z"
}
```

### 2. 동아리 목록 조회 (전체 공개)

```bash
curl -X GET http://localhost:3000/clubs
```

### 3. 동아리 상세 조회 (전체 공개)

```bash
curl -X GET http://localhost:3000/clubs/<clubId>
```

### 4. 동아리 수정 (회장만)

동아리를 만든 사용자의 토큰을 사용해야 합니다.

```bash
curl -X PATCH http://localhost:3000/clubs/<clubId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "description": "프로젝트 + 스터디 진행"
  }'
```

### 5. 동아리 삭제 (회장만)

```bash
curl -X DELETE http://localhost:3000/clubs/<clubId> \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

---

## 회원 관리 테스트

### 1. 동아리 가입 신청

사용자가 동아리에 가입을 신청합니다:

```bash
curl -X POST http://localhost:3000/members/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "clubId": "<club-id>"
  }'
```

**예상 응답 (201 Created)**:

```json
{
  "id": "m1a2b3c4-d5e6-4f7g-h8i9-j0k1l2m3n4o5",
  "clubId": "<club-id>",
  "userId": "<user-id>",
  "role": "member",
  "status": "pending",
  "requestedAt": "2025-12-11T10:00:00.000Z"
}
```

---

### 2. 가입 신청 목록 조회 (회장만)

회장이 동아리의 가입 신청 목록을 조회합니다:

```bash
curl -X GET http://localhost:3000/members/club/<clubId>/pending \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**예상 응답**:

```json
[
  {
    "id": "m1a2b3c4-d5e6-4f7g-h8i9-j0k1l2m3n4o5",
    "clubId": "<club-id>",
    "userId": "<user-id>",
    "role": "member",
    "status": "pending",
    "requestedAt": "2025-12-11T10:00:00.000Z"
  }
]
```

---

### 3. 가입 신청 승인 (회장만)

```bash
curl -X POST http://localhost:3000/members/club/<clubId>/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "memberId": "<member-id>"
  }'
```

**예상 응답**:

```json
{
  "id": "m1a2b3c4-d5e6-4f7g-h8i9-j0k1l2m3n4o5",
  "clubId": "<club-id>",
  "userId": "<user-id>",
  "role": "member",
  "status": "approved",
  "requestedAt": "2025-12-11T10:00:00.000Z",
  "approvedAt": "2025-12-11T10:05:00.000Z"
}
```

---

### 4. 가입 신청 거절 (회장만)

```bash
curl -X POST http://localhost:3000/members/club/<clubId>/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "memberId": "<member-id>"
  }'
```

---

### 5. 회원 목록 조회 (전체 공개)

```bash
curl -X GET http://localhost:3000/members/club/<clubId>
```

**예상 응답**:

```json
[
  {
    "id": "m1a2b3c4-d5e6-4f7g-h8i9-j0k1l2m3n4o5",
    "clubId": "<club-id>",
    "userId": "<user-id>",
    "role": "member",
    "status": "approved",
    "requestedAt": "2025-12-11T10:00:00.000Z",
    "approvedAt": "2025-12-11T10:05:00.000Z"
  }
]
```

---

### 6. 동아리 탈퇴 (본인)

```bash
curl -X DELETE http://localhost:3000/members/club/<clubId>/leave \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

### 7. 회원 강제 탈퇴 (회장만)

```bash
curl -X DELETE http://localhost:3000/members/club/<clubId>/remove/<memberId> \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

---

### 8. 회원 권한 변경 (회장만)

회원을 부회장(vice_president) 또는 관리자(manager)로 승격할 수 있습니다:

```bash
curl -X PATCH http://localhost:3000/members/club/<clubId>/role/<memberId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "memberId": "<member-id>",
    "role": "vice_president"
  }'
```

**역할 종류**:

- `member` - 일반 회원
- `vice_president` - 부회장
- `manager` - 관리자

**예상 응답**:

```json
{
  "id": "m1a2b3c4-d5e6-4f7g-h8i9-j0k1l2m3n4o5",
  "clubId": "<club-id>",
  "userId": "<user-id>",
  "role": "vice_president",
  "status": "approved",
  "requestedAt": "2025-12-11T10:00:00.000Z",
  "approvedAt": "2025-12-11T10:05:00.000Z"
}
```

---

## 활동 일정 관리 테스트

### 1. 행사 등록 (회장만)

```bash
curl -X POST http://localhost:3000/events/club/<clubId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "title": "웹 개발 워크숍",
    "description": "React와 Node.js를 활용한 웹 개발 기초",
    "startDate": "2025-12-20T14:00:00Z",
    "endDate": "2025-12-20T17:00:00Z",
    "location": "학생회관 3층 세미나실",
    "maxAttendees": 30
  }'
```

**예상 응답 (201 Created)**:

```json
{
  "id": "e1f2g3h4-i5j6-4k7l-m8n9-o0p1q2r3s4t5",
  "clubId": "<club-id>",
  "title": "웹 개발 워크숍",
  "description": "React와 Node.js를 활용한 웹 개발 기초",
  "startDate": "2025-12-20T14:00:00.000Z",
  "endDate": "2025-12-20T17:00:00.000Z",
  "location": "학생회관 3층 세미나실",
  "maxAttendees": 30,
  "createdBy": "<owner-id>",
  "createdAt": "2025-12-11T10:00:00.000Z",
  "updatedAt": "2025-12-11T10:00:00.000Z"
}
```

---

### 2. 행사 목록 조회 (전체 공개)

```bash
curl -X GET http://localhost:3000/events/club/<clubId>
```

---

### 3. 행사 상세 조회 (전체 공개)

```bash
curl -X GET http://localhost:3000/events/club/<clubId>/<eventId>
```

---

### 4. 행사 수정 (회장만)

```bash
curl -X PATCH http://localhost:3000/events/club/<clubId>/<eventId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "description": "React, Vue, Node.js 등 다양한 웹 프레임워크 소개",
    "maxAttendees": 40
  }'
```

---

### 5. 행사 삭제 (회장만)

```bash
curl -X DELETE http://localhost:3000/events/club/<clubId>/<eventId> \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

---

### 6. 행사 알림 전송 (회장만)

행사 시작 24시간 전에 회원들에게 알림을 전송합니다:

```bash
curl -X POST http://localhost:3000/events/club/<clubId>/<eventId>/remind \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

**예상 응답**:

```json
{
  "message": "행사 알림이 전송되었습니다."
}
```

### 알림 채널

- **이메일**: 사용자 이메일로 행사 정보 전송
  현재는 console 로그로 시뮬레이션되며, 실제 운영 환경에서는 외부 서비스 연동이 필요합니다.

---

## 공지사항 및 실시간 알림 테스트

### 전제

- 회장 토큰(`$OWNER_TOKEN`)과 일반 사용자 토큰(`$USER_TOKEN`)을 준비합니다.
- WebSocket은 인증 없이 접속 가능합니다. 기본 URL: `http://localhost:3000`.

### WebSocket 연결 예제 (Node 클라이언트)

```bash
npm install socket.io-client
```

```javascript
// ws-test.js
const { io } = require('socket.io-client');

const clubId = '<club-id>'; // 수신하려는 동아리 ID
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('connected', socket.id);
});

socket.on(`club:${clubId}:new-announcement`, (data) => {
  console.log('새 공지', data);
});

socket.on(`club:${clubId}:new-event`, (data) => {
  console.log('새 행사', data);
});

socket.on(`club:${clubId}:event-reminder`, (data) => {
  console.log('행사 리마인더', data);
});
```

실행:

```bash
node ws-test.js
```

### 공지사항 생성 (회장만)

```bash
curl -X POST http://localhost:3000/notifications/club/<clubId>/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "title": "정기 총회 안내",
    "content": "12/20(금) 19:00 학생회관 3층 세미나실",
    "type": "general",
    "isPinned": true
  }'
```

WebSocket으로 `club:<clubId>:new-announcement` 이벤트가 전송됩니다.

### 공지사항 목록 조회 (회원)

```bash
curl -X GET http://localhost:3000/notifications/club/<clubId>/announcements \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 공지사항 상세 조회 (회원)

```bash
curl -X GET http://localhost:3000/notifications/club/<clubId>/announcements/<announcementId> \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 공지사항 수정 (회장만)

```bash
curl -X PATCH http://localhost:3000/notifications/club/<clubId>/announcements/<announcementId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "content": "장소가 학생회관 2층 세미나실로 변경되었습니다.",
    "isPinned": true
  }'
```

### 공지사항 삭제 (회장만)

```bash
curl -X DELETE http://localhost:3000/notifications/club/<clubId>/announcements/<announcementId> \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

### 행사 알림 실시간 수신 확인

1. 회장 토큰으로 행사 생성 → WebSocket `club:<clubId>:new-event` 수신

```bash
curl -X POST http://localhost:3000/events/club/<clubId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "title": "해커톤 OT",
    "description": "룰 설명 및 팀 빌딩",
    "startDate": "2025-12-22T10:00:00Z",
    "endDate": "2025-12-22T12:00:00Z",
    "location": "학생회관 1층 라운지",
    "maxAttendees": 50
  }'
```

2. 행사 알림 수동 전송 → WebSocket `club:<clubId>:event-reminder` 수신

```bash
curl -X POST http://localhost:3000/events/club/<clubId>/<eventId>/remind \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

### 알림 페이로드 참고

- `club:<clubId>:new-announcement`

```json
{
  "type": "announcement",
  "clubId": "<club-id>",
  "announcement": {
    /* 공지 본문 */
  },
  "timestamp": "2025-12-12T12:00:00.000Z"
}
```

- `club:<clubId>:new-event`

```json
{
  "type": "event",
  "clubId": "<club-id>",
  "event": {
    /* 행사 본문 */
  },
  "timestamp": "2025-12-12T12:00:00.000Z"
}
```

- `club:<clubId>:event-reminder`

```json
{
  "type": "reminder",
  "clubId": "<club-id>",
  "event": {
    /* 행사 본문 */
  },
  "timestamp": "2025-12-12T12:00:00.000Z"
}
```

### 데이터 파일 확인

- 공지: `src/data/announcements.json`
- 실시간 알림 시뮬레이션 로그: 서버 콘솔 출력 확인

---

## 검색/필터링 테스트

### 동아리 검색 (이름/키워드)

```bash
curl -X GET "http://localhost:3000/search/clubs?q=스터디"
```

- `q`를 비우면 모든 동아리를 반환합니다.

### 동아리 회원 검색 (동아리 내)

```bash
curl -X GET "http://localhost:3000/search/clubs/<clubId>/members?q=길동" \
  -H "Authorization: Bearer $OWNER_TOKEN"
```

- `q`는 회원 이름 또는 이메일을 부분 일치로 검색합니다.
- 응답은 `{ member, user }` 형태로 회원 상태/역할과 사용자 정보가 함께 반환됩니다.

### 일정 날짜 필터링

```bash
curl -X GET "http://localhost:3000/search/events?clubId=<clubId>&startDate=2025-12-20&endDate=2025-12-25"
```

- `clubId` 없이 호출하면 모든 동아리의 일정을 대상으로 합니다.
- `startDate`, `endDate`는 ISO8601 형식 추천(예: `2025-12-20T00:00:00Z`).
- 기간이 겹치는 일정이 반환되며, 시작 시간 오름차순으로 정렬됩니다.
