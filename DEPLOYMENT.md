# 🚀 Vercel 배포 가이드

## 📋 사전 준비사항

- [x] GitHub 계정
- [x] Vercel 계정 (GitHub 연동)
- [x] Supabase 프로젝트 설정 완료

---

## 🔧 1단계: GitHub 저장소 푸시

```bash
cd /Users/eugene/Documents/project_site/tax

# Git 원격 저장소 확인
git remote -v

# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: 프로젝트 초기 배포 준비"

# GitHub에 푸시
git push origin main
```

---

## 🌐 2단계: Vercel에 배포

### Option A: Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치 (처음 한번만)
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### Option B: Vercel Dashboard 사용

1. https://vercel.com 접속
2. **New Project** 클릭
3. **Import Git Repository** 선택
4. `koreatommy/tax` 저장소 선택
5. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (루트)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. **Deploy** 클릭

---

## 🔐 3단계: 환경 변수 설정

Vercel Dashboard → 프로젝트 → **Settings** → **Environment Variables**

다음 변수들을 추가하세요:

### 필수 환경 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qbpwxjullgynxpswquzb.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase Service Role Key |
| `ENCRYPTION_SECRET_KEY` | `8qENs/PdGf...` | AES-256 암호화 키 |
| `ADMIN_PASSWORD` | `admin123` | 관리자 비밀번호 |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | 배포된 앱 URL |
| `NODE_ENV` | `production` | 환경 설정 |

### 환경 변수 적용 범위
- ✅ **Production**
- ✅ **Preview**
- ⬜ **Development** (선택사항)

---

## 🗄️ 4단계: Supabase 설정 확인

### RLS 정책 확인
```sql
-- companies, payees, payments, receipts 테이블의 RLS 활성화 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'payees', 'payments', 'receipts');
```

### 마이그레이션 실행 (미실행 시)
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref qbpwxjullgynxpswquzb

# 마이그레이션 실행
supabase db push
```

---

## ✅ 5단계: 배포 확인

### 배포 완료 후 확인사항

1. **✅ 앱 접속 테스트**
   - 메인 페이지: `https://your-app.vercel.app`
   - 로그인: `https://your-app.vercel.app/login`
   - 회원가입: `https://your-app.vercel.app/register`

2. **✅ 인증 테스트**
   - 회원가입 → 로그인
   - 대시보드 접근
   - 로그아웃

3. **✅ 핵심 기능 테스트**
   - 회사 정보 등록
   - 지급 대상자 등록
   - 지급 내역 등록
   - 영수증 발급

4. **✅ 환경 변수 확인**
   - 브라우저 개발자 도구 → Console
   - 에러 메시지 없는지 확인
   - API 응답 정상 확인

---

## 🐛 문제 해결

### 1. "Your project's URL and Key are required" 에러
- Vercel 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
- Redeploy 실행

### 2. "Encryption key is required" 에러
- `ENCRYPTION_SECRET_KEY` 환경 변수 확인
- 32바이트 Base64 문자열인지 확인

### 3. 데이터베이스 연결 실패
- Supabase 프로젝트 상태 확인 (Paused 상태가 아닌지)
- RLS 정책 확인
- Service Role Key 권한 확인

### 4. 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 로그 확인
vercel logs
```

---

## 📊 배포 후 모니터링

### Vercel Analytics
- Dashboard에서 트래픽 확인
- 응답 시간 모니터링
- 에러 로그 추적

### Supabase Dashboard
- Database → Usage
- Auth → Users
- API → Logs

---

## 🔄 재배포 (업데이트 시)

```bash
# 코드 수정 후
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# Vercel이 자동으로 재배포 시작
# 또는 수동 재배포
vercel --prod
```

---

## 🌍 커스텀 도메인 설정 (선택사항)

1. Vercel Dashboard → 프로젝트 → **Settings** → **Domains**
2. 도메인 입력 (예: `tax.yourdomain.com`)
3. DNS 레코드 설정
   - Type: `CNAME`
   - Name: `tax`
   - Value: `cname.vercel-dns.com`
4. SSL 인증서 자동 발급 (Let's Encrypt)

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-into-prod)

---

**배포 준비 완료!** 🚀

