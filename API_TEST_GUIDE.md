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

## 다음 단계

- 사용자 프로필 수정 기능 추가
- 비밀번호 재설정 기능 추가
- OAuth 소셜 로그인 통합
- 데이터베이스 연동
