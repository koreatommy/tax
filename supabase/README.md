# Supabase 설정 가이드

원천징수 관리 시스템의 데이터베이스 설정 가이드입니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 생성](#2-데이터베이스-스키마-생성)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [Storage 설정](#4-storage-설정)
5. [인증 설정](#5-인증-설정)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 가입 및 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 회원가입
2. **"New Project"** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `tax-withholding` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (꼭 저장!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자용)
   - **Pricing Plan**: Free (무료) 선택

4. **"Create new project"** 클릭 후 대기 (약 2-3분 소요)

---

## 2. 데이터베이스 스키마 생성

### 2.1 SQL Editor로 이동

1. Supabase 대시보드에서 좌측 메뉴의 **"SQL Editor"** 클릭
2. **"+ New query"** 버튼 클릭

### 2.2 마이그레이션 SQL 실행

1. `migrations/001_initial_schema.sql` 파일의 내용을 복사
2. SQL Editor에 붙여넣기
3. 우측 하단의 **"Run"** 버튼 클릭 (또는 `Cmd + Enter`)

### 2.3 실행 결과 확인

성공 시 다음과 같은 메시지가 표시됩니다:

```
원천징수 관리 시스템 데이터베이스 스키마 생성 완료
생성된 테이블:
  - companies (회사 정보)
  - payees (지급 대상자)
  - payments (지급 내역)
  - receipts (영수증 발급 이력)

보안 설정:
  - Row Level Security (RLS) 활성화
  - 사용자별 데이터 접근 제어

인덱스: 13개 생성 완료
트리거: 3개 생성 완료
```

### 2.4 테이블 확인

1. 좌측 메뉴의 **"Database"** > **"Tables"** 클릭
2. 다음 4개 테이블이 생성되었는지 확인:
   - ✅ `companies`
   - ✅ `payees`
   - ✅ `payments`
   - ✅ `receipts`

---

## 3. 환경 변수 설정

### 3.1 API 키 확인

1. Supabase 대시보드 좌측 메뉴의 **"Settings"** 클릭
2. **"API"** 탭 선택
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (공개키)
   - **service_role**: `eyJhbGc...` (관리자키, 주의!)

### 3.2 환경 변수 파일 생성

프로젝트 루트(`tax-app/`)에 `.env.local` 파일을 생성하고 다음 내용을 입력:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 암호화 키 (32자 이상의 랜덤 문자열)
ENCRYPTION_SECRET_KEY=your-very-long-and-secure-secret-key-minimum-32-characters

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ **주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 3.3 암호화 키 생성

터미널에서 다음 명령어로 강력한 암호화 키 생성:

```bash
# macOS/Linux
openssl rand -base64 32

# 또는 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

생성된 키를 `ENCRYPTION_SECRET_KEY`에 입력하세요.

---

## 4. Storage 설정

### 4.1 계약서 파일용 버킷 생성

1. 좌측 메뉴의 **"Storage"** 클릭
2. **"Create a new bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `contracts`
   - **Public bucket**: ❌ (비공개)
4. **"Create bucket"** 클릭

### 4.2 영수증 PDF용 버킷 생성

1. **"Create a new bucket"** 클릭
2. 버킷 정보 입력:
   - **Name**: `receipts`
   - **Public bucket**: ❌ (비공개)
3. **"Create bucket"** 클릭

### 4.3 Storage 정책 설정

1. 생성된 `contracts` 버킷 클릭
2. **"Policies"** 탭 선택
3. **"New Policy"** > **"Create policy"** 클릭
4. 다음 SQL 입력:

```sql
-- contracts 버킷: 인증된 사용자만 업로드/조회 가능
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');
```

5. `receipts` 버킷에도 동일한 정책 적용

---

## 5. 인증 설정

### 5.1 이메일 인증 활성화

1. 좌측 메뉴의 **"Authentication"** > **"Providers"** 클릭
2. **"Email"** 활성화 확인 (기본적으로 활성화됨)
3. 설정:
   - ✅ Enable email provider
   - ✅ Confirm email (이메일 확인 필요 시)
   - ✅ Secure email change

### 5.2 URL 설정

1. **"Authentication"** > **"URL Configuration"** 클릭
2. **Site URL** 설정:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://yourdomain.com`
3. **Redirect URLs** 추가:
   - `http://localhost:3000/**`
   - `https://yourdomain.com/**`

### 5.3 이메일 템플릿 커스터마이징 (선택)

1. **"Authentication"** > **"Email Templates"** 클릭
2. 원하는 이메일 템플릿 수정 (회원가입, 비밀번호 재설정 등)

---

## 6. 설정 확인

### 6.1 연결 테스트

개발 서버 실행 후 브라우저 개발자 도구 콘솔에서 확인:

```javascript
// 브라우저 콘솔에서 실행
const { data, error } = await window.supabase.from('companies').select('*')
console.log('Supabase 연결:', error ? '❌ 실패' : '✅ 성공')
```

### 6.2 체크리스트

설정이 완료되었다면 다음을 확인하세요:

- ✅ Supabase 프로젝트 생성 완료
- ✅ 데이터베이스 스키마 생성 완료 (4개 테이블)
- ✅ RLS 정책 활성화 확인
- ✅ `.env.local` 파일 생성 및 API 키 입력
- ✅ Storage 버킷 생성 (`contracts`, `receipts`)
- ✅ 인증 설정 완료

---

## 🔧 문제 해결

### SQL 실행 오류

**증상**: "relation already exists" 에러

**해결**: 테이블이 이미 존재합니다. 테이블을 삭제하고 다시 생성하거나, 새로운 Supabase 프로젝트를 만드세요.

### 환경 변수 인식 안됨

**증상**: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**해결**: 
1. `.env.local` 파일이 `tax-app/` 폴더에 있는지 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 환경 변수명이 정확한지 확인

### RLS 정책 에러

**증상**: "new row violates row-level security policy"

**해결**: 
1. 인증된 사용자로 로그인했는지 확인
2. `companies` 테이블에 사용자의 회사 데이터가 있는지 확인

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 가이드](https://supabase.com/docs/guides/storage)

---

**작성일**: 2025-10-03  
**최종 수정**: 2025-10-03

