# 원천징수 관리 시스템 (Tax Withholding System)

개인 사업소득(3.3%) 원천징수를 관리하는 웹 애플리케이션입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkoreatommy%2Ftax)
[![GitHub](https://img.shields.io/badge/GitHub-koreatommy%2Ftax-blue?logo=github)](https://github.com/koreatommy/tax)

## 🎉 프로젝트 현황

### ✅ 완료된 기능

**인증 시스템**
- ✅ 회원가입/로그인
- ✅ 로그아웃
- ✅ 인증 미들웨어 (경로 보호)
- ✅ Supabase Auth 연동
- ✅ 관리자 인증 시스템

**회사 정보 관리**
- ✅ 회사 정보 등록/수정
- ✅ 사업자등록번호 검증
- ✅ 원천징수영수증에 자동 표시

**지급 대상자 관리**
- ✅ 대상자 등록/수정/삭제
- ✅ 주민번호 AES-256 암호화
- ✅ 계좌번호 암호화
- ✅ 검색 및 필터링
- ✅ 중복 등록 방지

**지급 관리**
- ✅ 지급 내역 등록/수정/삭제
- ✅ 세액 자동 계산 (3.3%)
  - 소득세 3%
  - 지방소득세 0.3%
- ✅ 실지급액 자동 산출
- ✅ 지급 내역 조회

**원천징수영수증**
- ✅ 영수증 자동 생성
- ✅ 영수증 번호 자동 생성 (RCP-YYYY-0001)
- ✅ PDF 다운로드 (한글 지원)
- ✅ 영수증 목록 조회

**대시보드**
- ✅ 통계 요약 (대상자, 지급건수, 영수증, 총액)
- ✅ 세액 요약
- ✅ 실시간 데이터 연동
- ✅ 메모 기능 (간단한 메시지 관리)

**관리자 시스템**
- ✅ 관리자 대시보드
- ✅ 전체 시스템 통계 모니터링
- ✅ 사용자 관리
- ✅ 회사 관리
- ✅ Git 커밋 추적 시스템
- ✅ 관리자 전용 인증

**UI/UX 개선**
- ✅ 다크모드 지원 (라이트/다크/시스템)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)
- ✅ 테마 토글 기능
- ✅ 향상된 사용자 인터페이스
- ✅ 토스트 알림 시스템 (Sonner)

---

## 🛠 기술 스택

### Frontend & Backend
- **Framework**: Next.js 15.5.4 (App Router + Turbopack)
- **Language**: TypeScript 5
- **Runtime**: Node.js 20+

### Database & Auth
- **Database**: Supabase (PostgreSQL 17)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

### UI & Styling
- **CSS**: Tailwind CSS 4
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: next-themes (다크모드 지원)

### Libraries
- **Forms**: React Hook Form + Zod
- **Date**: date-fns (한국 로케일)
- **PDF**: jsPDF + html2canvas
- **Encryption**: Node.js crypto (AES-256-CBC)

---

## 📁 프로젝트 구조

```
tax-app/
├── app/
│   ├── (auth)/              # 인증 페이지
│   │   ├── login/          # 로그인
│   │   └── register/       # 회원가입
│   ├── (dashboard)/        # 대시보드 레이아웃
│   │   └── dashboard/
│   │       ├── page.tsx           # 대시보드 홈
│   │       ├── payees/            # 지급 대상자
│   │       ├── payments/          # 지급 관리
│   │       ├── receipts/          # 영수증
│   │       └── settings/          # 설정
│   ├── api/                # API Routes
│   │   ├── companies/     # 회사 정보 API
│   │   ├── payees/        # 지급 대상자 API
│   │   ├── payments/      # 지급 관리 API
│   │   └── receipts/      # 영수증 API
│   └── middleware.ts       # 인증 미들웨어
├── components/
│   ├── layout/             # Header, Sidebar
│   ├── payees/             # 지급 대상자 컴포넌트
│   ├── payments/           # 지급 관리 컴포넌트
│   ├── receipts/           # 영수증 컴포넌트
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase/          # Supabase 클라이언트
│   ├── utils/             # 유틸리티
│   │   ├── encryption.ts  # 암호화/복호화
│   │   ├── validators.ts  # 검증 함수
│   │   └── tax-calculator.ts # 세액 계산
│   └── pdf/               # PDF 생성기
└── types/                 # TypeScript 타입
```

---

## 🚀 시작하기

### 1. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://qbpwxjullgynxpswquzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ENCRYPTION_SECRET_KEY=your-encryption-key
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 📝 주요 기능 사용법

### 1. 회원가입 및 로그인

1. http://localhost:3000/register 접속
2. 이메일과 비밀번호 입력
3. 회원가입 후 로그인

### 2. 회사 정보 등록

1. 우측 상단 메뉴 → **설정** 클릭
2. 회사 정보 입력:
   - 사업자등록번호: 123-45-67890
   - 상호: (주)테스트컴퍼니
   - 대표자: 홍길동
3. **등록** 버튼 클릭

### 3. 지급 대상자 등록

1. 좌측 메뉴 → **지급 대상자** 클릭
2. **신규 등록** 버튼 클릭
3. 정보 입력:
   - 성명: 김철수
   - 주민번호: 900101-1234567 (암호화 저장)
   - 사업자 유형: 프리랜서
   - 연락처, 이메일, 계좌 정보 등
4. **등록** 버튼 클릭

### 4. 지급 처리 (세액 자동 계산)

1. 좌측 메뉴 → **지급 관리** 클릭
2. **신규 지급** 버튼 클릭
3. 정보 입력:
   - 지급 대상자: 김철수 선택
   - 지급일자: 2025-10-03
   - 지급액: 1,000,000
4. 자동 계산 확인:
   - 소득세 (3%): 30,000원
   - 지방소득세 (0.3%): 3,000원
   - 총 세액 (3.3%): 33,000원
   - **실지급액: 967,000원**
5. **등록** 버튼 클릭

### 5. 영수증 발급

1. **지급 관리** 페이지에서 발급하지 않은 지급 건 확인
2. **생성** 버튼 클릭
3. 영수증 자동 생성 (RCP-2025-0001)
4. **원천징수영수증** 메뉴에서 확인
5. PDF 다운로드 (한글 지원)

### 6. 메모 기능 사용

1. **대시보드** 페이지 하단의 **메모** 섹션
2. 메모 내용 입력 (최대 500자)
3. **추가** 버튼 클릭
4. 메모 수정/삭제 가능
5. 페이지네이션으로 메모 관리

### 7. 관리자 모드 접근

1. 우측 상단 사용자 메뉴 → **관리자 모드** 클릭
2. 관리자 비밀번호 입력
3. 관리자 대시보드에서 전체 시스템 모니터링
4. 사용자/회사 관리, Git 커밋 추적 등

### 8. 다크모드 사용

1. 우측 상단 **테마 토글** 버튼 클릭
2. **라이트/다크/시스템** 모드 선택
3. 시스템 모드: OS 설정에 따라 자동 변경

---

## 🔒 보안 기능

### 암호화
- **주민등록번호**: AES-256-CBC 암호화
- **계좌번호**: AES-256-CBC 암호화
- **암호화 키**: 환경 변수로 관리

### 데이터 보호
- **Row Level Security**: 사용자별 데이터 격리
- **마스킹 처리**: 주민번호 뒷자리 ******* 표시
- **인증 미들웨어**: 비인증 접근 차단

---

## 📊 API 엔드포인트

### 회사 정보
- `GET /api/companies` - 조회
- `POST /api/companies` - 등록
- `PUT /api/companies` - 수정

### 지급 대상자
- `GET /api/payees` - 목록
- `POST /api/payees` - 등록
- `GET /api/payees/[id]` - 상세
- `PUT /api/payees/[id]` - 수정
- `DELETE /api/payees/[id]` - 삭제

### 지급 관리
- `GET /api/payments` - 목록
- `POST /api/payments` - 등록 (세액 자동 계산)
- `GET /api/payments/[id]` - 상세
- `PUT /api/payments/[id]` - 수정
- `DELETE /api/payments/[id]` - 삭제

### 영수증
- `GET /api/receipts` - 목록
- `POST /api/receipts` - 생성
- `GET /api/receipts/[id]` - 상세

### 메모
- `GET /api/memos` - 목록 (페이지네이션)
- `POST /api/memos` - 생성
- `PUT /api/memos/[id]` - 수정
- `DELETE /api/memos/[id]` - 삭제

### 관리자
- `GET /api/admin/stats` - 전체 통계
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/companies` - 회사 목록
- `GET /api/admin/git-commits` - Git 커밋 추적

---

## 🧪 테스트

### API 테스트 (브라우저 콘솔)

```javascript
// 회사 정보 조회
fetch('/api/companies').then(r => r.json()).then(console.log)

// 지급 대상자 등록
fetch('/api/payees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '김철수',
    resident_number: '900101-1234567',
    business_type: '프리랜서'
  })
}).then(r => r.json()).then(console.log)

// 지급 등록
fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payee_id: 'payee-id-here',
    payment_date: '2025-10-03',
    payment_amount: 1000000
  })
}).then(r => r.json()).then(console.log)
```

---

## 📦 빌드 및 배포

### 로컬 빌드

```bash
npm run build
npm run start
```

### Vercel 배포

#### 원클릭 배포
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkoreatommy%2Ftax)

#### 수동 배포
1. GitHub 저장소: https://github.com/koreatommy/tax
2. Vercel Dashboard에서 Import
3. 환경 변수 설정 (아래 참조)
4. Deploy 클릭!

**필수 환경 변수:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_SECRET_KEY`
- `ADMIN_PASSWORD`

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

---

## 🎯 향후 계획

### Phase 2 기능
- [ ] 엑셀 일괄 업로드
- [ ] 이메일 자동 발송 (Resend)
- [ ] 영수증 ZIP 다운로드
- [ ] 대시보드 차트 (Chart.js)
- [ ] **알림 시스템**
  - [ ] 관리자 공지사항 생성/관리
  - [ ] 사용자 알림 수신 (업데이트 공지, 시스템 점검 등)
  - [ ] 실시간 알림 전달 (Supabase Realtime)
  - [ ] 알림 읽음/안읽음 상태 관리
  - [ ] 알림 타입별 분류 (공지, 점검, 업데이트)

### Phase 3 기능
- [ ] 원천징수이행상황신고서 자동 생성
- [ ] 국세청 홈택스 연동
- [ ] 고급 알림 기능
  - [ ] 알림 설정 (알림 끄기/켜기)
  - [ ] 알림 검색/필터링
  - [ ] 알림 통계 및 분석
  - [ ] 브라우저 푸시 알림
- [ ] 고급 관리자 기능
  - [ ] 시스템 로그 모니터링
  - [ ] 백업/복원 기능
  - [ ] 성능 모니터링 대시보드

---

## 📚 참고 문서

- [프로젝트 PRD](../prd.md)
- [설정 가이드](../SETUP.md)
- [Supabase 설정](./supabase/README.md)
- [Next.js 문서](https://nextjs.org/docs)

---

## 🤝 기여

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.

---

**개발 상태**: ✅ MVP 완료 (95%)  
**버전**: 1.1.0  
**배포 URL**: https://tax-kpmplhvnu-eugene-lees-projects-87cd559d.vercel.app  
**최종 업데이트**: 2025-10-31

