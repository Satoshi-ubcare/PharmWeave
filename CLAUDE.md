# CLAUDE.md — PharmWeave AI Context

## 프로젝트 한 문장 요약

PharmWeave는 **Web 기반 약국 PMS**로, 기존 WinForms 설치형 소프트웨어를 브라우저 기반으로 전환하고 **6단계 Workflow UI**(접수→처방→조제→검토→수납→청구)와 **Plugin 확장 구조**를 제공한다.

---

## 아키텍처 개요

```
Frontend (React + Vite)          Backend (Express + TypeScript)
    Zustand (전역 상태)    ←→       routes → services → domain
    Axios (API 클라이언트)          plugins (독립 확장)
                                    Prisma Client
                                         ↓
                                  PostgreSQL (Neon)
```

### 레이어 책임

| 레이어 | 위치 | 책임 | 외부 의존 |
|--------|------|------|-----------|
| Presentation | `frontend/src/pages/`, `features/`, `components/` | UI 렌더링, 사용자 입력 | React, Tailwind |
| Application (FE) | `frontend/src/hooks/`, `stores/` | API 호출, 전역 상태 | Axios, Zustand |
| Interface (BE) | `backend/src/routes/`, `middlewares/` | HTTP 수신, 요청 검증 | Express, Zod |
| Application (BE) | `backend/src/services/` | 유스케이스 조율, Repository 호출 | IRepository 인터페이스 |
| Repository | `backend/src/repositories/` | DB 접근 추상화, Prisma 쿼리 캡슐화 | Prisma |
| Domain | `backend/src/domain/` | 순수 비즈니스 규칙 | **없음** (외부 의존 금지) |
| Plugin | `backend/src/plugins/` | 확장 기능 실행, 결과 반환 | Prisma (읽기 전용) |

**핵심 규칙:**
- `domain/` 은 Prisma, Express, 외부 npm 패키지를 **절대 import하지 않는다**. 순수 TypeScript 함수/클래스만 허용.
- `routes/` 는 `services/` 만 호출한다. domain을 직접 호출하지 않는다.
- `services/` 는 `IRepository` 인터페이스를 통해 데이터에 접근한다. Prisma를 직접 import하지 않는다.
- Plugin은 서비스에서만 실행되며, DB 저장은 service가 담당한다.

---

## 도메인 용어 사전

| 용어 | 설명 |
|------|------|
| **Visit (방문)** | Workflow의 핵심 엔티티. 환자 1회 약국 방문을 나타내며, `workflow_stage`로 현재 단계를 추적 |
| **WorkflowStage** | `reception → prescription → dispensing → review → payment → claim → completed` 순방향 전이만 허용 |
| **Prescription (처방)** | 의료기관 처방전 헤더. Visit당 1건 (UNIQUE). 항목은 PrescriptionItem에 분리 |
| **PrescriptionItem (처방 항목)** | 개별 약품 1줄. `drug_name`과 `unit_price`는 처방 시점 스냅샷 (Drug 마스터 변경에 영향받지 않음) |
| **Drug (약품 마스터)** | 약품 코드(drug_code), 약품명, 단가 마스터 테이블. 검색 전용 |
| **Payment (수납)** | 본인부담금 계산 및 결제 처리 레코드. Visit당 1건 (UNIQUE) |
| **Claim (청구)** | 건강보험 청구 데이터. `claim_data` JSONB에 청구 구조 저장. Visit당 1건 (UNIQUE) |
| **PluginConfig** | Plugin 활성화 설정 테이블. `id`(플러그인 식별자), `enabled`(ON/OFF) |
| **DUR** | Drug Utilization Review — 약물 상호작용, 금기 여부 검사 Plugin |
| **복약지도** | 처방된 약품에 대한 복용 안내문 자동 생성 Plugin |
| **CopayCalculator** | 본인부담금 계산 로직. 약제비 × 30% (1만원 미만이면 × 20%) |
| **ClaimDataBuilder** | 청구 JSONB 구조 생성기. 처방 항목, 금액, 기관 정보 포함 |
| **WorkflowStateMachine** | 단계 전환 유효성 검사. `new WorkflowStateMachine(currentStage).canTransition(target)` |

---

## 기술 스택

### Frontend
| 항목 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Vite | 5.x | 빌드 도구 |
| Tailwind CSS | 3.x | 스타일링 |
| Zustand | 4.x | 전역 상태 (visitId, Plugin ON/OFF) |
| Axios | 1.x | HTTP 클라이언트 |
| React Router | 6.x | 클라이언트 라우팅 |

### Backend
| 항목 | 버전 | 용도 |
|------|------|------|
| Node.js | 18.x | 런타임 |
| Express | 4.x | HTTP 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Prisma | 5.x | ORM + 마이그레이션 |
| Zod | 3.x | 런타임 요청 유효성 검사 |
| jsonwebtoken | 9.x | JWT 인증 |
| bcryptjs | 2.x | 비밀번호 해시 |

### Infra
| 항목 | 용도 |
|------|------|
| Neon | PostgreSQL 호스팅 (Serverless) |
| Vercel | Frontend CDN + Serverless Functions |
| GitHub Actions | CI/CD (lint → test → build → deploy) |

---

## Workflow 단계 전환 규칙

```
reception → prescription  : 조건 없음 (환자 선택만으로 진입)
prescription → dispensing : 조건 없음 (서버 검증 없음)
dispensing → review       : 처방 항목(PrescriptionItem) 1개 이상 존재 (서버 검증)
                            조제 체크박스 전체 완료는 프론트에서만 강제
review → payment          : 조건 없음 (서버 검증 없음)
payment → claim           : Payment 레코드 존재 (서버 검증)
claim → completed         : 조건 없음 (서버 검증 없음)
```

단계 전환 API: `PATCH /api/visits/:id/stage` — `{ "stage": "prescription" }`
서버에서 `WorkflowStateMachine.canTransition()` 으로 유효성 검사 후 Prisma 업데이트.

---

## API 엔드포인트 목록

### 인증
```
POST /api/auth/login    { username, password } → { token }
POST /api/auth/register { username, password } → { token }
```

### 환자
```
GET    /api/patients?q={query}    환자 검색 (이름 또는 생년월일)
POST   /api/patients              환자 등록
GET    /api/patients/:id          환자 상세
```

### 방문
```
POST   /api/visits                방문 생성 (patient_id 필수)
GET    /api/visits/today          오늘의 방문 목록
GET    /api/visits/:id            방문 상세
PATCH  /api/visits/:id/stage      단계 전환 { stage }
```

### 처방
```
POST   /api/visits/:id/prescriptions   처방 생성/수정
GET    /api/visits/:id/prescriptions   처방 조회
```

### 약품
```
GET    /api/drugs?q={query}       약품 검색 (최대 20건)
```

### 수납
```
POST   /api/visits/:id/payment    수납 처리
GET    /api/visits/:id/payment    수납 조회
```

### 청구
```
POST   /api/visits/:id/claim      청구 생성
GET    /api/visits/:id/claim      청구 조회
```

### Plugin
```
GET    /api/plugins               Plugin 목록 + 활성화 상태
PATCH  /api/plugins/:id           Plugin ON/OFF 변경 { enabled }
POST   /api/plugins/:id/execute   Plugin 실행 { visitId }
```

---

## 본인부담금 계산 규칙 (CopayCalculator)

```
약제비 합계 = Σ (unit_price × quantity × days) for all PrescriptionItem

본인부담금:
  - 약제비 합계 < 10,000원  → 본인부담금 = 약제비 × 20%
  - 약제비 합계 >= 10,000원 → 본인부담금 = 약제비 × 30%

결과: { totalDrugCost, copayAmount, insuranceCoverage }
```

---

## 코딩 규칙

### 공통
- 모든 파일 TypeScript strict mode (`"strict": true`)
- `any` 타입 사용 금지. 불가피한 경우 `unknown` 사용 후 타입 가드 적용
- 함수 반환 타입 명시 (추론 가능해도 공개 함수는 명시)
- ESLint 경고 0개 유지

### Backend
- 라우터 핸들러는 `try-catch` 없이 `express-async-errors` 또는 `next(err)` 패턴 사용
- Zod 스키마는 `schemas/` 에 분리, `validate` 미들웨어로 자동 검증
- Prisma 쿼리는 `services/` 에서만 작성 (routes에서 직접 호출 금지)
- 에러 응답 형식: `{ error: string, details?: unknown }`

### Frontend
- 컴포넌트 파일명: PascalCase (`WorkflowStepper.tsx`)
- 훅 파일명: camelCase + `use` 접두사 (`useWorkflowStage.ts`)
- API 호출은 `hooks/` 에서만 (`features/` 컴포넌트에서 Axios 직접 호출 금지)
- Tailwind 클래스: 인라인 선호, 조건부 조합은 `cn()` 유틸리티 (`src/lib/cn.ts`) 사용
- 에러 catch: `extractApiError(err, fallback)` (`src/lib/apiError.ts`)로 서버 메시지 우선 표시

### 상태 관리 경계 (Zustand vs 로컬 훅)

| 종류 | 위치 | 경계 기준 |
|------|------|-----------|
| **전역 — Zustand** | `stores/` | 여러 페이지/컴포넌트가 공유하거나 페이지 이동 후에도 유지 필요 |
| **로컬 — 훅** | `hooks/` | 단일 API 요청의 loading/error/data — 컴포넌트 언마운트 시 자동 폐기 |

**전역 상태로 관리하는 이유:**
- `workflowStore` (visitId·stage·patient): 6단계 전체에서 동일 방문 상태 공유
- `pluginStore` (plugins): 헤더·각 단계 UI에서 Plugin 활성화 여부 동시 참조
- `toastStore` (toasts): 어느 컴포넌트에서든 알림 발생, 최상단 레이아웃에서 렌더링
- `themeStore` (theme): html 클래스 조작 + localStorage 영속 필요

**로컬 상태로 유지하는 이유:**
- API loading/error는 해당 요청이 활성화된 컴포넌트에만 의미 있음
- 전역화 시 스토어가 비대해지고 불필요한 리렌더 발생
- 훅 단위로 독립 테스트 가능 (Zustand mock 불필요)

### Git 커밋 메시지 규칙
```
feat: 새 기능
fix: 버그 수정
refactor: 기능 변경 없는 코드 개선
test: 테스트 추가/수정
chore: 빌드, 설정, 의존성
docs: 문서
```

---

## 환경 변수

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@host/pharmweave?sslmode=require
JWT_SECRET=your-secret-key-min-32chars
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 디렉토리 구조 요약

```
pharmweave/
├── .github/workflows/ci.yml
├── docs/PRD.md
├── docs/DEVLOG.md
├── frontend/
│   ├── src/
│   │   ├── pages/          # URL 진입점 (6단계 + PluginManage)
│   │   ├── features/       # 단계별 컴포넌트 (reception/, prescription/, ...)
│   │   ├── components/     # WorkflowStepper, PluginSlot, ui/
│   │   ├── hooks/          # API 훅 (usePatient, useVisit, usePrescription, usePayment, usePlugin)
│   │   ├── stores/         # Zustand (workflowStore, pluginStore)
│   │   └── api/            # Axios client + endpoints
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # HTTP 라우터
│   │   ├── middlewares/    # auth, validate
│   │   ├── services/       # 유스케이스 (PatientService, VisitService, PrescriptionService, PaymentService, ClaimService, PluginService)
│   │   ├── domain/         # 순수 비즈니스 로직 (외부 의존 없음)
│   │   ├── plugins/        # Plugin 실행 함수
│   │   └── schemas/        # Zod 요청 스키마
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── vercel.json
├── .env.example
├── CLAUDE.md               # 이 파일
└── README.md
```

---

## 자주 묻는 것 (FAQ for AI)

**Q: Repository 패턴은 어떻게 구성되어 있나?**
A: `repositories/` 디렉토리에 IXxxRepository 인터페이스 + PrismaXxxRepository 구현이 쌍으로 존재한다. 서비스 constructor에 기본값(= new PrismaXxxRepository())으로 주입한다. 테스트 시 mock 구현체를 주입할 수 있다.

**Q: Plugin은 어떻게 추가하나?**
A: `plugins/` 에 실행 함수 파일 1개 추가 + `PluginService` 분기 1개 추가. 인터페이스 클래스 불필요.

**Q: 인증은 어느 수준까지?**
A: JWT 유효성 검사만. Role(약사/실무자/관리자) 분리는 구현하지 않는다.

**Q: 테스트는 어디에 작성하나?**
A: `backend/src/domain/__tests__/` (단위), `backend/src/__tests__/integration/` (통합). Frontend 테스트는 시간 여유 시.
