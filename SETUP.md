# 🚀 원천징수 관리 시스템 설정 가이드

이 문서는 프로젝트를 처음 시작하는 개발자를 위한 완전한 설정 가이드입니다.

---

## 📋 사전 요구사항

다음 도구들이 설치되어 있어야 합니다:

- ✅ Node.js 20.x 이상
- ✅ npm 또는 yarn
- ✅ Git

---

## 1단계: Supabase 프로젝트 설정 🗄️

### 1.1 Supabase 계정 생성

1. [Supabase](https://supabase.com) 접속
2. 회원가입 또는 로그인
3. **"New Project"** 클릭
4. 프로젝트 정보 입력:
   ```
   Name: tax-withholding
   Database Password: [강력한 비밀번호 설정 - 꼭 저장!]
   Region: Northeast Asia (Seoul)
   Pricing Plan: Free
   ```
5. **"Create new project"** 클릭 (2-3분 소요)

### 1.2 데이터베이스 스키마 생성

1. Supabase 대시보드 좌측 메뉴 → **"SQL Editor"**
2. **"+ New query"** 클릭
3. `tax-app/supabase/migrations/001_initial_schema.sql` 파일 내용 복사
4. SQL Editor에 붙여넣기
5. **"Run"** 클릭 (또는 `Cmd + Enter`)
6. 성공 메시지 확인:
   ```
   ✅ 원천징수 관리 시스템 데이터베이스 스키마 생성 완료
   ```

### 1.3 Storage 버킷 생성

1. 좌측 메뉴 → **"Storage"**
2. **"Create a new bucket"** 클릭
3. 두 개의 버킷 생성:
   - **Name**: `contracts` (계약서 파일용)
   - **Name**: `receipts` (영수증 PDF용)
   - **Public**: 모두 비활성화 (비공개)

---

## 2단계: 로컬 환경 설정 💻

### 2.1 저장소 클론 및 의존성 설치

```bash
# 프로젝트 폴더로 이동
cd tax-app

# 의존성 설치
npm install
```

### 2.2 환경 변수 설정

1. Supabase 대시보드 → **"Settings"** → **"API"**
2. 다음 정보 복사:
   - **Project URL**
   - **anon public key**
   - **service_role key** (주의!)

3. `tax-app/.env.local` 파일 생성:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 암호화 키 (아래 명령어로 생성)
ENCRYPTION_SECRET_KEY=생성된-32자-이상의-랜덤-문자열

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2.3 암호화 키 생성

터미널에서 실행:

```bash
# macOS/Linux
openssl rand -base64 32

# 또는 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

생성된 키를 `.env.local`의 `ENCRYPTION_SECRET_KEY`에 입력하세요.

---

## 3단계: 개발 서버 실행 🎯

```bash
cd tax-app
npm run dev
```

브라우저에서 열기: http://localhost:3000

---

## 4단계: 첫 번째 사용자 등록 👤

### 4.1 회원가입

1. http://localhost:3000/register 접속
2. 이메일과 비밀번호 입력
3. 회원가입 완료

### 4.2 회사 정보 등록

1. 로그인 후 "설정" 페이지 이동
2. 회사 정보 입력:
   - 사업자등록번호
   - 상호(법인명)
   - 대표자명
   - 사업장 주소
3. 저장

---

## 5단계: 기능 테스트 ✅

### 5.1 지급 대상자 등록

1. 좌측 메뉴 → **"지급 대상자"**
2. **"신규 등록"** 클릭
3. 대상자 정보 입력 (테스트 데이터):
   ```
   성명: 김철수
   주민번호: 900101-1234567
   연락처: 010-1234-5678
   이메일: test@example.com
   사업자 유형: 프리랜서
   ```
4. **"등록"** 클릭

### 5.2 지급 처리

1. 좌측 메뉴 → **"지급 관리"**
2. **"신규 지급"** 클릭
3. 지급 정보 입력:
   ```
   지급 대상자: 김철수
   지급일자: 오늘 날짜
   지급액: 1000000 (백만원)
   지급 사유: 테스트 지급
   ```
4. 자동 계산 확인:
   ```
   소득세 (3%): 30,000원
   지방소득세 (0.3%): 3,000원
   총 세액: 33,000원
   실지급액: 967,000원
   ```
5. **"저장"** 클릭

### 5.3 영수증 발급

1. 좌측 메뉴 → **"원천징수영수증"**
2. 지급 내역 선택
3. **"PDF 다운로드"** 클릭
4. 영수증 PDF 확인

---

## 📝 체크리스트

설정이 완료되었다면 다음을 확인하세요:

### Supabase 설정
- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 생성 (4개 테이블)
- [ ] Storage 버킷 생성 (contracts, receipts)
- [ ] API 키 복사 완료

### 로컬 환경
- [ ] Node.js 및 npm 설치 확인
- [ ] 의존성 설치 완료 (`npm install`)
- [ ] `.env.local` 파일 생성 및 설정
- [ ] 개발 서버 정상 실행

### 기능 테스트
- [ ] 회원가입/로그인 성공
- [ ] 회사 정보 등록 완료
- [ ] 지급 대상자 등록 성공
- [ ] 지급 처리 및 세액 계산 확인
- [ ] 영수증 PDF 다운로드 성공

---

## 🔧 문제 해결

### "Cannot connect to database" 오류

**원인**: Supabase URL 또는 API 키가 잘못됨

**해결**:
1. `.env.local` 파일의 URL과 키 확인
2. Supabase 대시보드에서 정확한 키 다시 복사
3. 개발 서버 재시작 (`npm run dev`)

### "Port 3000 is already in use" 오류

**원인**: 3000번 포트가 이미 사용 중

**해결**:
```bash
# 포트 종료
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
npm run dev -- -p 3001
```

### 영수증 PDF 한글 깨짐

**원인**: 한글 폰트 로드 실패

**해결**: 이미 수정 완료 (html2canvas 방식 사용)

---

## 🚀 다음 단계

설정이 완료되었다면:

1. **API Routes 구현**: 실제 CRUD 작업 연결
2. **인증 페이지 완성**: 로그인/회원가입 UI 구현
3. **컴포넌트 실제 데이터 연결**: 임시 데이터를 Supabase 데이터로 교체
4. **엑셀 업로드 기능**: 일괄 지급 처리 구현
5. **이메일 발송**: Resend 연동

---

## 📚 추가 참고 자료

- [프로젝트 PRD](./prd.md)
- [Supabase 설정 가이드](./tax-app/supabase/README.md)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)

---

**문제가 발생하면 이슈를 등록하거나 개발팀에 문의하세요!** 🙋‍♂️

---

**작성일**: 2025-10-03  
**버전**: 1.0.0

