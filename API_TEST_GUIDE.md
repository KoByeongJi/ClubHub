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
