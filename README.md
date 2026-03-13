# PharmWeave — Web 기반 약국 PMS

> 기존 WinForms 설치형 약국 PMS를 브라우저 기반으로 전환한 **Workflow UI + Plugin 확장 플랫폼**

[![CI](https://github.com/Satoshi-ubcare/PharmWeave/actions/workflows/ci.yml/badge.svg)](https://github.com/Satoshi-ubcare/PharmWeave/actions)

## 🚀 Live Demo

**Production:** https://pharmweave.vercel.app

## 📋 프로젝트 소개

PharmWeave는 약사의 실제 업무 흐름을 그대로 반영한 6단계 Workflow UI를 제공합니다.

```
접수 → 처방 → 조제 → 검토 → 수납 → 청구
```

### 핵심 차별화

| 기능 | 설명 |
|------|------|
| **Workflow Stepper** | 6단계 업무 흐름을 단계별 UI로 시각화 |
| **Plugin 구조** | DUR 검사, 복약지도 생성 등 확장 기능 독립 관리 |
| **Web 기반** | OS 독립, 브라우저만으로 접근 가능 |

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Node.js 18, Express, TypeScript, Prisma |
| Database | PostgreSQL (Neon) |
| Infra | Vercel, GitHub Actions |

## 📁 프로젝트 구조

```
pharmweave/
├── frontend/          # React SPA
├── backend/           # Express API + Prisma
│   ├── src/domain/    # 순수 비즈니스 로직 (외부 의존 없음)
│   └── prisma/        # DB 스키마 + 시드
├── docs/PRD.md        # 제품 요구사항 문서
└── CLAUDE.md          # AI 컨텍스트
```

## ⚡ 로컬 실행

### 사전 요구사항
- Node.js 18+
- PostgreSQL (또는 Neon 계정)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/Satoshi-ubcare/PharmWeave.git
cd PharmWeave

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example backend/.env
cp .env.example frontend/.env
# .env 파일에 DATABASE_URL, JWT_SECRET 등 실제 값 입력

# 4. DB 마이그레이션 + 시드
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..

# 5. 개발 서버 실행 (Frontend + Backend 동시)
npm run dev
```

**접속:** http://localhost:5173

## 🧪 테스트

```bash
# 단위 테스트 (Domain Layer)
npm run test:unit

# 전체 테스트 + 커버리지
npm test -- --coverage
```

## 📦 배포

main 브랜치 push 시 GitHub Actions → Vercel 자동 배포

```
GitHub push → Lint → TypeCheck → Test → Build → Vercel Deploy
```

## 📚 문서

- [PRD (제품 요구사항 문서)](docs/PRD.md)
- [CLAUDE.md (AI 컨텍스트)](CLAUDE.md)
