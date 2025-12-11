# ClubHub - Auth Module Documentation

## 개요

ClubHub는 Nest.js 기반의 백엔드 프로젝트로, JWT 기반의 인증/인가 시스템을 갖추고 있습니다. 데이터베이스 없이 로컬 파일(JSON)로 사용자 정보를 관리합니다.

## 기능

### 1. 회원가입 (Registration)

- **엔드포인트**: `POST /auth/register`
- **요청 본문**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "사용자 이름"
}
```

- **응답**:

```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "사용자 이름",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  }
}
```

- **유효성 검사**:
  - 이메일 중복 체크
  - 비밀번호 최소 6자 이상
  - 모든 필드 필수입력

### 2. 로그인 (Login)

- **엔드포인트**: `POST /auth/login`
- **요청 본문**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **응답**:

```json
{
  "message": "로그인이 완료되었습니다.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "사용자 이름",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. 현재 사용자 정보 조회 (Get Current User)

- **엔드포인트**: `GET /auth/me`
- **인증 필요**: Yes (Bearer Token)
- **요청 헤더**:

```
Authorization: Bearer <access_token>
```

- **응답**: 현재 로그인한 사용자 정보

### 4. 사용자 검증 (Validate User)

- **엔드포인트**: `GET /auth/validate`
- **인증 필요**: Yes (Bearer Token)
- **응답**: 사용자 정보 (비밀번호 제외)

## 권한 관리 (Roles)

### 역할 유형

- **USER** (일반 회원): 기본 역할
- **ADMIN** (관리자): 관리 권한

### 사용 방법

- 요청에 `@UseGuards(JwtGuard)` 추가하여 인증 필수
- 요청에 `@UseGuards(JwtGuard, AdminGuard)` 추가하여 관리자 권한 필요

## 보안 기능

### 비밀번호 암호화

- **라이브러리**: bcrypt
- **라운드**: 10 (bcrypt hash rounds)
- 비밀번호는 항상 암호화되어 저장되며, 응답에는 비밀번호가 포함되지 않습니다.

### JWT 토큰

- **알고리즘**: HS256
- **만료 시간**: 24시간
- **페이로드**:
  - `sub`: 사용자 ID
  - `email`: 사용자 이메일
  - `role`: 사용자 역할

## 데이터 저장소

### 파일 구조

```
src/data/
└── users.json (사용자 정보 저장)
```

### users.json 예제

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "password": "$2b$10$...", // bcrypt 암호화된 비밀번호
    "name": "홍길동",
    "role": "user",
    "createdAt": "2025-12-11T10:00:00.000Z"
  }
]
```

## 프로젝트 구조

```
src/
├── auth/                          # 인증 모듈
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                         # 사용자 모듈
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/                        # 공통 기능
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── admin.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── services/
│       └── file-storage.service.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run start:dev
```

### 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

### 테스트

```bash
npm test
npm run test:e2e
```

## API 테스트 예제 (cURL)

### 회원가입

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "홍길동"
  }'
```

### 로그인

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 현재 사용자 정보 조회

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## 환경 변수 설정

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

**주의**: 프로덕션 환경에서는 `JWT_SECRET`을 안전한 값으로 변경하세요.

## 향후 개선 사항

- [ ] 데이터베이스 연동 (MongoDB, PostgreSQL 등)
- [ ] 이메일 인증
- [ ] 리프레시 토큰
- [ ] OAuth 소셜 로그인
- [ ] 비밀번호 재설정 기능
- [ ] 사용자 프로필 수정
- [ ] 회원 탈퇴

## 라이선스

MIT
