# DEVLOG — PharmWeave 개발 진행 기록

> 이 문서는 PharmWeave 개발 과정에서의 주요 의사결정, 기술적 도전, 트레이드오프를 기록합니다.

---

## Day 1 (2026-03-14) — 설계 및 초기 구조 생성

### 목표
해커톤 첫 날. PRD 확정 → 기술 스택 결정 → 프로젝트 골격 생성

---

### 의사결정 1: 모노레포 구조 채택

**선택:** 단일 Git 리포지토리에서 `frontend/`와 `backend/`를 npm workspaces로 관리

**고려한 대안:**
- 별도 리포지토리 (frontend-repo / backend-repo)
- Turborepo, Nx 같은 모노레포 툴 사용

**결정 이유:**
- 해커톤 규모에서 별도 리포 관리 오버헤드가 불필요
- npm workspaces만으로 의존성 공유와 루트 스크립트 관리가 충분
- Turborepo 학습 비용 대비 효과 낮음 → **단순함 우선**

---

### 의사결정 2: Neon (Serverless PostgreSQL) 선택

**선택:** Neon + Prisma ORM

**고려한 대안:**
- Railway PostgreSQL
- Supabase
- SQLite (로컬 개발 전용)

**결정 이유:**
- Vercel Serverless Function과의 연결 지연 최소화 (Neon은 connection pooling 내장)
- 무료 플랜으로 해커톤 기간 충분
- Prisma 공식 문서에서 Neon 연동 예제가 풍부
- **트레이드오프:** cold start 시 Neon 연결 초기화 비용이 있음 → `prisma.$connect()` 패턴보다 싱글톤 PrismaClient로 완화

---

### 의사결정 3: 아키텍처 레이어 설계

**선택:** routes → services → domain 3계층 구조

```
routes/     : HTTP 수신, Zod 검증, 응답 반환
services/   : 유스케이스 조율, Prisma 호출
domain/     : 순수 비즈니스 규칙 (외부 의존 없음)
plugins/    : 확장 기능 (서비스에서 실행)
```

**결정 이유:**
- domain 레이어를 외부 의존 없이 유지하면 단위 테스트가 DB 없이 가능
- Plugin은 서비스에서만 실행 → 플러그인 추가 시 routes 수정 불필요
- **FAQ에 명시:** Repository 패턴은 도입하지 않음. services에서 Prisma 직접 호출이 7개 Repository 파일 추가 대비 SoC 기여가 낮음

---

### 의사결정 4: 인증 범위 제한

**선택:** JWT 발급/검증만 구현. Role 기반 접근제어(RBAC) 미구현

**이유:**
- 해커톤 제한 시간 내 약사/실무자/관리자 Role 분리는 핵심 Workflow 구현 대비 우선순위 낮음
- JWT 미들웨어 1개로 모든 보호 라우트를 일관 처리 가능

---

### 의사결정 5: Vercel 배포 전략

**선택:** Frontend → Vercel CDN, Backend → Vercel Serverless Function (`/api/index.ts`)

**고려한 대안:**
- Render.com에 Express 서버 배포
- Railway에 백엔드 배포

**결정 이유:**
- 프론트엔드와 동일 플랫폼에서 관리 → 도메인 CORS 설정 단순화
- GitHub push → 자동 배포 파이프라인 일원화

**실제 발생한 문제 (→ Day 2에서 해결):**
- Vercel이 Express 앱을 Edge Runtime으로 인식해 Node.js API 호환성 오류 발생
- Prisma Client 생성 타이밍 문제 (빌드 시점에 generate 미실행)

---

## Day 2 (2026-03-15) — 배포 안정화 및 기능 구현

### 목표
Vercel 배포 파이프라인 안정화 → 핵심 비즈니스 로직 구현 → CI/CD 완성

---

### 문제 해결 1: Vercel Edge Runtime 호환성

**증상:** `ReferenceError: process is not defined` — Vercel이 Express 앱을 Edge Runtime으로 처리

**원인 분석:**
- Vercel은 기본적으로 Node.js 런타임과 Edge Runtime을 파일 위치/설정으로 구분
- `vercel.json`에 `runtime` 필드를 명시하지 않으면 Edge로 fallback되는 경우 발생
- `next.js` 전용 config 필드(`exports.config`)가 섞여 있어 런타임 감지 오류

**해결 과정:**
1. `vercel.json`에 `"functions"` 블록으로 `nodejs18.x` 명시 → 여전히 오류
2. Next.js 전용 `config` export 제거 → 부분 해결
3. `functions` 블록 자체 제거 후 Vercel 자동 감지에 위임 → **최종 해결**

**교훈:** Vercel의 런타임 자동 감지가 명시적 설정보다 안정적인 경우가 있음. 설정 최소화 원칙 적용.

---

### 문제 해결 2: Prisma Client 빌드 타이밍

**증상:** `PrismaClientInitializationError: Prisma Client is not generated`

**원인 분석:**
- Vercel 빌드 시 `node_modules`가 새로 설치되면서 `prisma generate` 결과물이 사라짐
- `PRISMA_GENERATE_DATAPROXY` 환경변수가 의도치 않게 설정되어 Data Proxy 모드로 강제 생성됨

**해결 과정:**
1. `buildCommand`에 `prisma generate` 추가 → DATAPROXY 모드 문제 지속
2. `postinstall` 스크립트로 이동 → 환경변수 충돌
3. `PRISMA_GENERATE_DATAPROXY` 변수 완전 제거 + `output` 경로 명시 → **최종 해결**

```json
// backend/package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

### 의사결정 6: Vercel GitHub 자동배포 비활성화 후 GitHub Actions로 일원화

**배경:** Vercel의 Git 연동 자동배포와 GitHub Actions 수동 배포가 동시에 실행되어 배포가 2회 트리거되는 문제 발생

**선택:** Vercel GitHub 자동배포 비활성화 → GitHub Actions `deploy` job에서만 Vercel CLI로 배포

**이유:**
- lint → test → build → deploy 순서 보장 필요
- 테스트 실패 시 배포 차단이 핵심 요구사항

---

### 의사결정 7: Domain 레이어 테스트 우선 작성

**선택:** `backend/src/domain/__tests__/`에 단위 테스트 3개 세트 작성

**이유:**
- Domain은 외부 의존 없음 → 테스트가 가장 빠르고 안정적
- `WorkflowStateMachine`, `CopayCalculator`, `ClaimDataBuilder` 는 비즈니스 규칙의 핵심
- CI 커버리지 임계값 80% 달성을 위한 기반

**커버리지 목표:**
```
lines: 80%
functions: 80%
branches: 70%
```

---

### 의사결정 8: Plugin 구조 설계

**선택:** Plugin 실행 함수 파일 1개 + PluginService 분기 1개. 인터페이스 클래스 불필요.

**고려한 대안:**
- `IPlugin` 인터페이스 + 클래스 기반 플러그인 등록 시스템
- Event Bus 방식의 플러그인 훅

**결정 이유:**
- 현재 플러그인 수: 2개 (DUR, 복약지도)
- 3개 미만에서 추상화 레이어 도입은 오버엔지니어링
- 함수 1개 추가 + 분기 1개 추가로 신규 플러그인 확장 가능

**구현된 플러그인:**

| 플러그인 | 기능 | 실제 구현 수준 |
|----------|------|----------------|
| `medication-guide` | 처방 약품별 복용 안내문 자동 생성 | 약품별 경고 문구 맵 기반 |
| `dur` | 약물 상호작용 검사 (Drug Utilization Review) | 3가지 상호작용 규칙 내장 |

---

## Day 3 (2026-03-15 오후) — 아키텍처 정비 및 테스트 완성

### 목표
코드 품질 강화 → services 레이어 분리 → hooks 레이어 추가 → 통합 테스트 작성

---

### 기능 구현 완료 현황

| 단계 | 페이지 | Feature 컴포넌트 | 상태 |
|------|--------|-----------------|------|
| 접수 | ReceptionPage | ReceptionFeature | ✅ 완료 |
| 처방 | PrescriptionPage | PrescriptionFeature | ✅ 완료 |
| 조제 | DispensingPage | DispensingFeature | ✅ 완료 |
| 검토 | ReviewPage | ReviewFeature | ✅ 완료 |
| 수납 | PaymentPage | PaymentFeature | ✅ 완료 |
| 청구 | ClaimPage | ClaimFeature | ✅ 완료 |
| Plugin | PluginManagePage | PluginManageFeature | ✅ 완료 |

| 백엔드 | 상태 |
|--------|------|
| routes (8개) | ✅ HTTP 수신·검증·응답만 담당 |
| services (6개) | ✅ 유스케이스 조율, Prisma 호출 분리 완료 |
| domain (3개) | ✅ 순수 함수, 외부 의존 없음 |
| plugins (2개) | ✅ medication-guide, DUR 실행 가능 |

---

### 의사결정 9: services 레이어 분리

**배경:** routes에서 Prisma를 직접 호출하는 구조 → 아키텍처 규칙 위반

**선택:** `PatientService`, `VisitService`, `PrescriptionService`, `PaymentService`, `ClaimService`, `PluginService` 6개 생성

**결과:**
- routes는 HTTP 수신·Zod 검증·응답만 담당 (평균 15줄 이하)
- 비즈니스 로직이 services로 집중 → 단위 테스트 가능 구조
- `VisitService.validateStageGuards()` 로 단계 전환 가드 캡슐화

---

### 의사결정 10: frontend hooks 레이어 추가

**선택:** `usePatient`, `useVisit`, `usePrescription`, `usePayment`, `usePlugin` 5개 훅 생성

**이유:**
- CLAUDE.md 아키텍처 규칙: "API 호출은 hooks/에서만, features/에서 Axios 직접 호출 금지"
- features 컴포넌트에서 로딩/에러 상태 관리 중복 제거
- 각 훅이 loading, error, 실행 함수를 캡슐화

---

### 의사결정 11: 통합 테스트 전략 (Prisma 모킹)

**선택:** `jest.mock('../../lib/prisma')` 로 Prisma 싱글톤 모킹 → 실제 DB 없이 HTTP 레이어 테스트

**고려한 대안:**
- 실제 PostgreSQL 테스트 DB 사용 (CI에서는 services로 제공)
- in-memory DB (SQLite) 사용

**결정 이유:**
- 통합 테스트의 목적: routes → services → domain 흐름의 HTTP 계약 검증
- Prisma 모킹으로 DB 응답을 예측 가능하게 제어 → 단위 테스트와 상호 보완
- CI에서 실제 PostgreSQL은 unit 테스트(domain 레이어)와 migrate 검증에 활용

**테스트 커버리지:**

| 파일 | 테스트 수 | 검증 대상 |
|------|-----------|-----------|
| `auth.test.ts` | 6개 | 회원가입(201/409/400), 로그인(200/401×2) |
| `patients.test.ts` | 8개 | GET 목록/검색, POST 등록/중복/검증, GET 단건/404 |
| `visits.test.ts` | 9개 | POST 생성/404/Zod오류, PATCH 전환×5 |
| **합계** | **23개** | |

---

## 기술 부채 및 향후 개선 사항

| 항목 | 현재 상태 | 개선 방향 |
|------|-----------|-----------|
| Plugin 데이터 | 하드코딩된 약물 규칙 (데모 수준) | 의약품 안전나라 API 연동 |
| Role 기반 접근제어 | 미구현 | 약사/실무자/관리자 Role 분리 |
| 에러 복구 UX | 기본 에러 메시지 수준 | 토스트 알림, 재시도 버튼 추가 |
| 모바일 최적화 | Tailwind 반응형 기본 적용 | 태블릿/모바일 실제 사용 시나리오 테스트 |

---

## 아키텍처 결정 요약 (ADR)

| # | 결정 | 이유 | 결과 |
|---|------|------|------|
| ADR-01 | 모노레포 (npm workspaces) | 단순성, 오버헤드 최소화 | CI 스크립트 단순화 |
| ADR-02 | Neon + Prisma | Vercel 친화적, 무료 플랜 | cold start 지연 허용 |
| ADR-03 | 3계층 아키텍처 | 테스트 용이성, 관심사 분리 | Domain 100% 순수 함수 달성 |
| ADR-04 | JWT only (RBAC 없음) | 시간 제약, 우선순위 낮음 | 인증은 동작하나 Role 미분리 |
| ADR-05 | Vercel Serverless Function | 프론트엔드와 플랫폼 일원화 | 배포 안정화에 시간 소요 |
| ADR-06 | Plugin = 함수 파일 1개 | 오버엔지니어링 방지 | 확장성 충분, 구조 단순 |
| ADR-07 | Repository 패턴 미사용 | 7파일 추가 대비 SoC 기여 낮음 | services에서 Prisma 직접 호출 |
| ADR-08 | services 레이어 분리 | routes가 Prisma 직접 호출 — 아키텍처 위반 수정 | routes 평균 15줄, 관심사 명확 분리 |
| ADR-09 | 통합 테스트에 Prisma 모킹 | DB 없이 HTTP 계약 검증 목적에 충분 | 23개 테스트, CI에서 실제 DB는 migrate 검증용 |
| ADR-10 | frontend hooks 레이어 분리 | features 내 API 직접 호출 — 아키텍처 규칙 위반 수정 | 5개 훅으로 로딩/에러 상태 캡슐화 |
