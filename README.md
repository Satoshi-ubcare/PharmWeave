# PharmWeave — Web 기반 약국 PMS

> 기존 WinForms 설치형 약국 PMS를 브라우저 기반으로 전환한 **Workflow UI + Plugin 확장 플랫폼**

[![CI](https://github.com/Satoshi-ubcare/PharmWeave/actions/workflows/ci.yml/badge.svg)](https://github.com/Satoshi-ubcare/PharmWeave/actions)

## 🚀 Live Demo

**Production:** https://pharm-weave-frontend.vercel.app

---

## 📋 프로젝트 소개

PharmWeave는 약사의 실제 업무 흐름을 그대로 반영한 **6단계 Workflow UI**를 제공합니다.

```
접수 → 처방 → 조제 → 검토 → 수납 → 청구
```

각 단계는 `PATCH /api/visits/:id/stage` 단일 API로 전환되며, 서버의 `WorkflowStateMachine`이 순방향 전이만 허용합니다. 단계 건너뛰기, 역방향 전환은 422로 거부됩니다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **Workflow Stepper** | 6단계 업무 흐름 시각화. 현재 단계 강조, 완료/대기 단계 구분 표시 |
| **환자 접수** | 이름/생년월일 검색 → 기존 환자 선택 또는 신규 등록 → 방문 생성 |
| **처방 입력** | 약품 코드/이름 검색 → 수량·투약일수 입력 → 처방 항목 upsert |
| **조제 확인** | 처방 항목 체크리스트. 전체 체크 완료 시 다음 단계 활성화 |
| **수납 처리** | 본인부담금 자동 계산 (약제비 × 30%, 1만원 미만 × 20%). 현금/카드/계좌이체 선택 |
| **청구 생성** | 처방·수납 데이터 기반 건강보험 청구 JSONB 자동 생성 |
| **Plugin 관리** | DUR 검사 · 복약지도 생성 Plugin ON/OFF 토글. 활성화 시 해당 단계 UI에 자동 노출 |

---

## 🏗 아키텍처

```
Frontend (React + Vite)               Backend (Express + TypeScript)
  pages/          URL 진입점    ←→      routes/      HTTP 수신 · Zod 검증
  features/       단계별 UI             services/    유스케이스 조율 · Prisma 호출
  hooks/          API 캡슐화            domain/      순수 비즈니스 규칙 (외부 의존 없음)
  stores/         Zustand 전역 상태     plugins/     확장 기능 실행
  api/            Axios client                        ↓
                                        PostgreSQL (Neon)
```

### Domain Layer (순수 TypeScript, 외부 의존 없음)

| 클래스 | 역할 |
|--------|------|
| `WorkflowStateMachine` | 단계 전환 유효성 검사. `canTransition(target)` — 순방향만 허용 |
| `CopayCalculator` | 본인부담금 계산. `Σ(unit_price × quantity × days) → × 20/30%` |
| `ClaimDataBuilder` | 청구 JSONB 구조 생성. 처방 항목별 `total` 자동 계산 포함 |

### Plugin 구조

플러그인은 `plugins/` 디렉토리에 실행 함수 파일 1개로 구성됩니다. `PluginService`에서 `enabled` 확인 후 실행을 위임합니다.

| Plugin ID | 기능 | 구현 방식 |
|-----------|------|-----------|
| `medication-guide` | 처방 약품별 복약 안내문 생성 | 약품별 경고 문구 맵 기반 |
| `dur` | 약물 상호작용 검사 (DUR) | 3가지 상호작용 규칙 내장 (고위험/중등/저위험) |

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Zustand 4, Axios 1, React Router 6 |
| Backend | Node.js 18, Express 4, TypeScript 5, Prisma 5, Zod 3, jsonwebtoken 9, bcryptjs 2 |
| Database | PostgreSQL (Neon — Serverless) |
| Infra | Vercel (Frontend CDN + Serverless Functions), GitHub Actions |

---

## 📁 프로젝트 구조

```
pharmweave/
├── .github/workflows/ci.yml   # CI/CD 파이프라인 (4단계)
├── docs/
│   ├── PRD.md                 # 제품 요구사항 문서
│   └── DEVLOG.md              # 개발 진행 기록 (ADR, 트레이드오프)
├── frontend/
│   └── src/
│       ├── pages/             # URL 진입점 (6단계 + PluginManage)
│       ├── features/          # 단계별 도메인 컴포넌트 (reception/, prescription/, ...)
│       ├── components/        # WorkflowStepper, PluginSlot, ui/
│       ├── hooks/             # API 훅 (usePatient, useVisit, usePrescription, usePayment, usePlugin)
│       ├── stores/            # Zustand (workflowStore, pluginStore)
│       └── api/               # Axios client + endpoints
├── backend/
│   └── src/
│       ├── routes/            # HTTP 라우터 (8개)
│       ├── middlewares/       # auth (JWT), validate (Zod)
│       ├── services/          # 유스케이스 (PatientService, VisitService, PrescriptionService, ...)
│       ├── domain/            # 순수 비즈니스 로직 (외부 의존 없음)
│       ├── plugins/           # medicationGuide.ts, durPlugin.ts
│       └── schemas/           # Zod 요청 스키마
│   └── prisma/
│       ├── schema.prisma      # User · Patient · Visit · Prescription · Payment · Claim · Drug · PluginConfig
│       └── seed.ts
├── vercel.json
├── CLAUDE.md                  # AI 컨텍스트
└── README.md
```

---

## ⚡ 로컬 실행

### 사전 요구사항
- Node.js 18+
- PostgreSQL (또는 Neon 계정)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/Satoshi-ubcare/PharmWeave.git
cd PharmWeave

# 2. 의존성 설치 (루트에서 모노레포 전체 설치)
npm install

# 3. 환경 변수 설정
cp .env.example backend/.env
# backend/.env 에 DATABASE_URL, JWT_SECRET 실제 값 입력

# 4. Prisma Client 생성 + DB 마이그레이션 + 시드
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
cd ..

# 5. 개발 서버 실행 (Frontend + Backend 동시)
npm run dev
```

**접속:** http://localhost:5173

### 환경 변수

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@host/pharmweave?sslmode=require
JWT_SECRET=your-secret-key-min-32chars   # 32자 이상
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🧪 테스트

```bash
# 단위 테스트 (Domain Layer — 22개)
# WorkflowStateMachine, CopayCalculator, ClaimDataBuilder 순수 로직 검증
npm run test:unit

# 통합 테스트 (API Layer, Prisma 모킹 — 23개)
# auth(6) · patients(8) · visits(9) HTTP 계약 검증
npm run test:integration

# 단위 테스트 + 커버리지 리포트
npm run test:unit -- --coverage
```

### 테스트 전략

| 레이어 | 방식 | 목적 |
|--------|------|------|
| Domain | Jest 단위 테스트 | 외부 의존 없는 순수 함수 검증 |
| API | Jest + Supertest + Prisma 모킹 | routes → services → domain HTTP 계약 검증 (실제 DB 불필요) |
| DB 마이그레이션 | CI PostgreSQL 서비스 컨테이너 | `prisma migrate deploy` 검증 |

---

## 📦 배포

`main` 브랜치 push 시 GitHub Actions 4단계 파이프라인 자동 실행:

```
push
  └─ 1. Lint & Type Check    ESLint + tsc --noEmit
  └─ 2. Unit & Integration   22 + 23 tests (PostgreSQL 서비스 컨테이너)
  └─ 3. Build Validation     Vite build + tsc build
  └─ 4. Deploy to Vercel     main push 시에만 실행 (테스트 실패 시 차단)
```

Frontend(React 정적 빌드)와 Backend(Express Serverless Function)를 Vercel 단일 플랫폼에 배포합니다.

---

## 📚 문서

- [PRD (제품 요구사항 문서)](docs/PRD.md)
- [DEVLOG (개발 진행 기록 · ADR)](docs/DEVLOG.md)
- [CLAUDE.md (AI 컨텍스트)](CLAUDE.md)
