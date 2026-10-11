# 클론 후 로컬 실행 가이드

Git에서 클론한 뒤 로컬에서 바로 실행하기 위한 최소 단계입니다.

## 1. 의존성 설치

```bash
npm install
```

(이미 실행했다면 생략)

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local`이 생성되어 있습니다.

### Supabase 사용 시 (권장)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. **Settings → API**에서 다음 값을 복사해 `.env.local`에 넣기:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key
3. **SQL Editor**에서 `supabase/migrations/001_initial_schema.sql`, `002_*.sql`, `003_*.sql` 순서대로 실행

자세한 DB/Storage 설정은 [supabase/README.md](../supabase/README.md) 참고.

### 기존 백업이 있을 때

`.env.local.backup` 등에 Supabase 키가 있다면 해당 값으로 `.env.local`의 Supabase 3줄만 교체하면 됩니다.  
`ENCRYPTION_SECRET_KEY`는 이미 로컬용으로 생성되어 있으므로 그대로 두거나, 백업에 있으면 그걸 사용해도 됩니다.

## 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

- 회원가입: `/register`
- 로그인: `/login`
- 관리자: 로그인 후 우측 상단 메뉴 → **관리자 모드** (비밀번호는 `.env.local`의 `ADMIN_PASSWORD`, 기본 `admin123!@#`)

> `#`가 포함된 비밀번호는 `.env.local`에서 반드시 따옴표로 감싸세요.  
> 예: `ADMIN_PASSWORD="admin123!@#"` (`#`를 안 감싸면 주석으로 잘림)

## 4. 문제 해결

| 현상 | 조치 |
|------|------|
| 포트 3000 사용 중 | `npm run dev`에 이미 `kill-port` 포함. 그래도 충돌 시 `lsof -ti:3000 \| xargs kill -9` 후 재실행 |
| 관리자 비밀번호 거부 | `.env.local`의 `ADMIN_PASSWORD`를 따옴표로 감쌌는지 확인 후 `npm run dev` 재시작 |
| DB 연결 오류 | `.env.local`의 Supabase URL/키 확인, Supabase 대시보드에서 프로젝트 상태 확인 |
| ENCRYPTION_SECRET_KEY 오류 | 32바이트 base64여야 함. 생성: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

전체 설정·기능 테스트는 [SETUP.md](../SETUP.md)를 참고하세요.
