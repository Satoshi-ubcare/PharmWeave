# PRD (Product Requirements Document)
## PharmWeave — Web 기반 약국 PMS (Pharmacy Management System)

---

## 1. 프로젝트 개요

**프로젝트명:** PharmWeave — Web 기반 약국 PMS (Workflow UI + Plugin 확장 플랫폼)

**핵심 한 문장:**
PharmWeave는 기존 WinForms 기반 약국 PMS를 Web 기반으로 전환하고, 청구 업무 흐름 중심 UI와 Plugin 구조를 통해 사용성과 확장성을 개선한 차세대 PMS 플랫폼이다.

**목표:**
- OS 종속성을 제거하여 브라우저 기반으로 어디서나 접근 가능한 약국 업무 시스템 구현
- 실제 약국 업무 흐름(접수→처방→조제→검토→수납→청구)을 그대로 반영한 Workflow UI 제공
- 핵심 기능과 확장 기능을 분리한 Plugin 구조로 기능 확장 용이성 확보

---

## 2. 문제 정의

현재 대부분의 약국 PMS는 WinForms 기반 Windows 설치형 애플리케이션으로 운영되고 있으며, 다음과 같은 구조적 한계를 가진다.

### 2.1 OS 및 환경 종속성
- Windows 환경에만 종속된 설치형 프로그램
- 새 PC 설치/업데이트 시 별도 배포 관리 필요
- 원격 접근 불가, 다양한 디바이스 사용 제한
- 클라우드 기반 환경과의 연계 어려움

### 2.2 기능 중심 메뉴 UI (업무 흐름 미반영)
기존 PMS 메뉴 구조:
```
환자관리 / 처방입력 / 약품관리 / 수납관리 / 보험청구 / 재고관리 / 통계 / 환경설정
```
실제 약사 업무 흐름:
```
환자 접수 → 처방 확인 → 약 입력 → 조제 → 검토 → 수납 → 보험 청구
```
UI 구조와 실제 업무 흐름의 불일치로 인해 화면 이동 증가, 업무 컨텍스트 단절, 반복적인 정보 확인, 사용자 실수 증가가 발생한다.

### 2.3 확장성 부족
- 신규 기능 추가 시 프로그램 전체 수정 및 재배포 필요
- 고객 요구사항 대응 속도 저하
- 시스템 복잡도 증가 및 유지보수 비용 상승

### 2.4 문제 정의 근거 자료

#### 2.4.1 Windows 기반 PMS의 OS 종속 문제
Windows 설치형 약국 프로그램은 OS 지원 종료나 PC 교체 시 재설치 및 환경 변경이 필요하다. Windows 7 지원 종료 당시 약국 프로그램의 보안 문제와 업그레이드 필요성이 실제로 보도되었다.

- [팜스투데이] 윈도우7 지원 종료… 약국 프로그램 보안 문제: https://www.pharmstoday.com/news/articleView.html?idxno=164094
- [뉴스엠피] 윈도우7 종료에 따른 약국 프로그램 업그레이드 필요: https://www.newsmp.com/news/articleView.html?idxno=118424

> 약국 프로그램의 Windows 환경 종속 · OS 변경 시 시스템 문제 발생 가능 · PC 업그레이드 필요 사례 존재

#### 2.4.2 PMS 교체 어려움 (데이터 종속 문제)
약국 프로그램 업체 간 데이터 호환성 부족으로 PMS 교체가 어렵고, 특정 업체에 데이터가 종속되는 구조적 문제가 제기되고 있다.

- [한국약사뉴스] 약국 프로그램 교체 어려움: https://www.kpanews.co.kr/news/articleView.html?idxno=154928

> 데이터 이전 어려움 · 특정 PMS에 종속되는 구조 발생

#### 2.4.3 약국 업무는 Workflow 기반
약국 업무는 처방 확인 → 조제 → 검토 → 복약지도 → 수납 → 청구의 연속 Workflow 구조로 이루어진다. 그러나 기존 PMS의 기능 메뉴 중심 UI는 실제 업무 흐름과 불일치한다는 연구 결과가 있다.

- [PMC/NCBI] Pharmacy workflow and medication safety: https://pmc.ncbi.nlm.nih.gov/articles/PMC10567139/

> 약국 업무는 workflow 중심 · 기능 메뉴 UI와 실제 업무 흐름 불일치 문제 존재

#### 2.4.4 PMS 시장의 클라우드 전환
글로벌 PMS 시장은 클라우드 기반 SaaS 시스템으로 빠르게 전환 중이며, 레거시 시스템의 현대화 수요가 증가하고 있다.

- [Intuition Labs] Pharmacy Management Systems Guide: https://intuitionlabs.ai/articles/pharmacy-management-systems-guide

> 클라우드 PMS 시장 확대 · 기존 레거시 온프레미스 시스템 현대화 필요

#### 2.4.5 약국 IT 환경의 소프트웨어 충돌 문제
약국 PC 환경에서 소프트웨어 충돌 및 시스템 관리 문제가 다수 발생하고 있으며, PC 관리 부담이 약국 운영에 영향을 미치고 있다.

- [팜뉴스] 약국 PC 소프트웨어 충돌 및 시스템 안정성 문제: https://www.pharmnews.com/news/articleView.html?idxno=51136

> 프로그램 충돌 · PC 관리 부담 · 시스템 안정성 문제

---

## 3. 대상 사용자

| 역할 | 설명 |
|------|------|
| 약사 | 조제 및 보험 청구 업무를 수행하는 주 사용자 |
| 약국 실무자 | 처방 입력 및 수납을 담당하는 실무 담당자 |
| 약국 관리자 | 전체 업무 현황 조회 및 시스템 설정을 담당하는 관리자 |

---

## 4. 핵심 해결 방향

### 4.1 Web 기반 PMS
- 설치형 → Web 기반 플랫폼으로 전환
- OS 독립성 확보, 브라우저만으로 접근 가능
- 업데이트 관리 단순화, 다양한 환경(PC/태블릿) 지원

### 4.2 Workflow 중심 UI
- 기능 메뉴 중심 → 업무 단계 중심 UI로 전환
- 상단 Stepper: `[접수] → [처방] → [조제] → [검토] → [수납] → [청구]`
- 각 단계에서 필요한 기능만 표시하여 컨텍스트 유지

### 4.3 Plugin 기반 확장 구조
- 핵심 PMS 기능과 확장 기능 분리 설계
- Plugin 형태로 DUR, AI 처방검토, 복약지도 등 추가 가능
- 기능 확장 시 본체 수정 없이 플러그인만 추가

---

## 5. 기능 명세

> **범위:** Plugin 기능은 이 문서에서 제외한다. 핵심 6단계 Workflow(접수→처방→조제→검토→수납→청구)만을 기술한다.

---

### 5.0 공통 정의

#### 5.0.1 Workflow 상태 전이

Visit 레코드의 `workflow_stage` 필드가 현재 단계를 추적한다. 단계는 순방향으로만 진행되며, 완료된 단계로의 역행은 허용하지 않는다.

```
reception → prescription → dispensing → review → payment → claim → completed
```

| 상태값 | 한국어 | 진입 가능 조건 |
|--------|--------|----------------|
| `reception` | 접수 | 방문 생성 시 자동 설정 |
| `prescription` | 처방 | reception 완료 (환자 선택 완료) |
| `dispensing` | 조제 | prescription 완료 (처방 항목 1개 이상) |
| `review` | 검토 | dispensing 완료 (조제 확인 체크 완료) |
| `payment` | 수납 | review 완료 (검토 승인) |
| `claim` | 청구 | payment 완료 (결제 처리 완료) |
| `completed` | 완료 | claim 완료 |

**단계 전환 API:** `PATCH /api/visits/:id/stage` — body: `{ "stage": "prescription" }`

단계 전환 시 서버는 현재 단계에서 다음 단계로의 유효한 전환인지 검증하고, 전환 조건(필수 데이터 존재 여부)을 확인한다.

#### 5.0.2 약품 코드 체계

이 시스템에서 약품은 `drug_code` (건강보험심사평가원 약품 코드 체계 참조, 예: `644900060`) 기준으로 관리한다. 개발/데모 환경에서는 시드 데이터로 최소 20개 이상의 샘플 약품 데이터를 제공한다.

**약품 검색 API:** `GET /api/drugs?q={query}` — 약품명 또는 코드로 검색, 최대 20건 반환

---

### 5.1 단계 1: 접수 (Reception)

#### 목적
방문 환자를 시스템에 등록하고, 이번 방문(Visit)을 생성하여 워크플로우를 시작한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 환자 검색 영역 | 텍스트 입력창 (이름 또는 생년월일 8자리), 검색 버튼 |
| 검색 결과 목록 | 이름, 생년월일, 전화번호, [선택] 버튼 |
| 신규 환자 등록 영역 | 이름(필수), 생년월일(필수), 전화번호(선택) 입력 폼 |
| 액션 영역 | [다음: 처방 입력] 버튼 (환자 선택 후 활성화) |

#### 기능 상세

**F1-1. 환자 검색**
- 입력: 이름(2자 이상) 또는 생년월일(YYYYMMDD 8자리)
- 처리: `GET /api/patients?q={query}` 호출
- 출력: 매칭 환자 목록 (최대 20건). 결과 없으면 "신규 환자 등록" 폼 노출
- 검색어 길이가 2자 미만이면 검색 버튼 비활성화

**F1-2. 신규 환자 등록**
- 입력 필드 및 유효성 검사:
  - `name`: 필수, 2자 이상 50자 이하
  - `birth_date`: 필수, YYYY-MM-DD 형식, 과거 날짜만 허용
  - `phone`: 선택, 숫자 10~11자리
- 처리: `POST /api/patients` 호출
- 성공 시 생성된 환자를 자동으로 선택 상태로 전환

**F1-3. 방문 생성 및 단계 전환**
- 환자 선택 완료 후 [다음: 처방 입력] 클릭 시:
  1. `POST /api/visits` — `{ patient_id }` body로 방문 레코드 생성
  2. 생성된 `visit_id`를 세션/컨텍스트에 저장
  3. 단계를 `prescription`으로 이동

#### 비즈니스 규칙
- 동일 환자가 당일 이미 `completed` 상태가 아닌 방문이 존재하면 경고 메시지 표시 (진행은 허용)
- 방문 생성 시 `workflow_stage`는 `reception`으로 자동 설정

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| 환자 검색 결과 없음 | "검색 결과가 없습니다. 신규 환자로 등록하시겠습니까?" 안내 문구 노출 |
| 신규 등록 중 중복 환자 감지 (이름+생년월일 동일) | "동일한 환자가 존재합니다. 기존 환자를 선택하시겠습니까?" 확인 다이얼로그 |
| API 오류 | 토스트 메시지로 에러 내용 표시, 재시도 버튼 제공 |

---

### 5.2 단계 2: 처방 (Prescription)

#### 목적
병원에서 받은 처방전 정보와 처방 의약품 목록을 입력한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 처방전 기본 정보 | 의료기관명(필수), 처방 의사명(선택), 처방일(필수) |
| 처방 의약품 입력 | 약품 검색창, 수량(정), 투약일수(일), [추가] 버튼 |
| 처방 항목 목록 | 약품명, 코드, 수량, 투약일수, [삭제] 버튼 |
| 액션 영역 | [다음: 조제 확인] 버튼 (처방 항목 1개 이상 시 활성화) |

#### 기능 상세

**F2-1. 처방전 기본 정보 입력**
- 입력 필드 및 유효성 검사:
  - `clinic_name`: 필수, 2자 이상 100자 이하
  - `doctor_name`: 선택, 최대 50자
  - `prescribed_at`: 필수, 오늘 포함 과거 날짜만 허용 (미래 처방 불가), date picker 제공
- 처리: `POST /api/visits/:id/prescriptions` — 처방 헤더 + 항목 배열을 단일 요청으로 저장 (upsert). 수정 시에도 동일 endpoint 재호출

**F2-2. 처방 의약품 추가**
- 약품 검색: 약품명 또는 코드 입력 → `GET /api/drugs?q={query}` 호출 → 드롭다운 선택
- 입력 필드:
  - `quantity`: 필수, 양의 정수, 최대 9999
  - `days`: 필수, 양의 정수, 최대 365
- [추가] 클릭 시 화면 상 항목 목록에 즉시 반영 (아직 서버 저장 안됨)
- [저장] 또는 단계 전환 시 `POST /api/visits/:id/prescriptions`에 전체 항목 배열 포함하여 전송

**F2-3. 처방 항목 삭제**
- [삭제] 클릭 시 화면 상 항목 목록에서 즉시 제거 (클라이언트 상태만 변경)
- 처방 전체 저장 시 제거된 항목은 서버에 반영됨

#### 비즈니스 규칙
- 처방 항목은 최소 1개 이상이어야 다음 단계로 진행 가능
- 동일 약품(동일 `drug_code`)을 중복 추가하면 경고 메시지 표시 (추가는 허용)
- 처방일이 오늘로부터 30일을 초과한 경우 경고 메시지 표시 (진행은 허용)

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| 처방 항목 0개로 다음 단계 시도 | 버튼 비활성화 + "처방 의약품을 1개 이상 입력해 주세요" 툴팁 |
| 약품 검색 결과 없음 | "검색 결과가 없습니다" 메시지, 직접 코드/이름 입력 허용 |

---

### 5.3 단계 3: 조제 (Dispensing)

#### 목적
처방된 의약품 목록을 약사가 직접 확인하고, 조제 완료를 기록한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 처방 요약 정보 | 환자명, 의료기관명, 처방일 (읽기 전용) |
| 조제 확인 목록 | 약품명, 코드, 수량, 투약일수, 체크박스(확인 여부) |
| 진행 표시 | "X / Y 확인 완료" 카운터 |
| 액션 영역 | [전체 확인], [다음: 검토] 버튼 (전체 체크 완료 시 활성화) |

#### 기능 상세

**F3-1. 조제 항목 확인**
- 처방 항목 목록을 읽기 전용으로 표시
- 각 항목에 체크박스 제공 — 약사가 실물 약품 확인 후 체크
- 모든 항목 체크 시 [다음: 검토] 버튼 활성화
- [전체 확인] 버튼: 모든 체크박스 일괄 체크

**F3-2. 조제 완료 처리**
- [다음: 검토] 클릭 시:
  1. `PATCH /api/visits/:id/stage` — body: `{ "stage": "review" }` 호출
  2. 서버에서 모든 처방 항목 체크 완료 여부 검증
  3. 검증 통과 시 단계 이동

#### 비즈니스 규칙
- 조제 단계의 체크 상태는 클라이언트 상태로만 관리 (DB 저장 불필요)
- 모든 처방 항목이 체크되지 않으면 단계 전환 불가
- 이 단계에서는 처방 내용 수정 불가 (수정 필요 시 처방 단계로 돌아가는 안내만 표시)

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| 미체크 항목 있을 때 다음 단계 시도 | 버튼 비활성화 + 미체크 항목 하이라이트 |

---

### 5.4 단계 4: 검토 (Review)

#### 목적
처방 전체 내용을 최종 확인하고 약사가 승인한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 환자 정보 요약 | 환자명, 생년월일, 방문일시 |
| 처방전 정보 요약 | 의료기관명, 처방 의사, 처방일 |
| 처방 항목 전체 목록 | 약품명, 코드, 수량, 투약일수 (읽기 전용) |
| 액션 영역 | [검토 승인 및 수납으로 이동] 버튼 |

#### 기능 상세

**F4-1. 전체 처방 요약 표시**
- `GET /api/visits/:id` 호출하여 환자, 처방, 처방 항목 전체 데이터 로드
- 모든 정보 읽기 전용 표시

**F4-2. 검토 승인 및 단계 전환**
- [검토 승인] 클릭 시 `PATCH /api/visits/:id/stage` — `{ "stage": "payment" }` 호출

#### 비즈니스 규칙
- 검토 단계에서는 처방 내용 수정 불가
- 승인 취소 기능 없음

---

### 5.5 단계 5: 수납 (Payment)

#### 목적
본인부담금을 계산하고 결제를 처리한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 수납 정보 | 처방 항목 수, 총 약제비, 본인부담금 |
| 결제 수단 선택 | 현금 / 카드 라디오 버튼 |
| 결제 금액 확인 | 최종 결제 금액 강조 표시 |
| 액션 영역 | [수납 완료] 버튼 / 수납 완료 후 [다음: 청구] 버튼 노출 |

#### 기능 상세

**F5-1. 본인부담금 계산**
- 수납 화면 진입 시 `GET /api/visits/:id/prescriptions` 호출하여 처방 항목을 로드하고 클라이언트에서 미리 표시
- 최종 계산은 수납 처리(`POST /api/visits/:id/payment`) 시 서버에서 재계산하여 Payment 레코드에 저장
- 계산 기준 (데모용 단순화):
  - 약제비 = 처방 항목별 (수량 × 투약일수 × 단가) 합계
  - 본인부담금 = 약제비 × 30% (단, 1만원 미만은 약제비 × 20%)
  - 단가는 약품 마스터 데이터의 `unit_price` 사용

**F5-2. 결제 처리**
- 결제 수단 선택 후 [수납 완료] 클릭 시:
  1. `POST /api/visits/:id/payment` — `{ "method": "card" }` 호출
  2. 서버에서 본인부담금 재계산 후 Payment 레코드 생성
  3. 성공 시 [다음: 청구] 버튼 활성화

**F5-3. 단계 전환**
- [다음: 청구] 클릭 시 `PATCH /api/visits/:id/stage` — `{ "stage": "claim" }` 호출

#### 비즈니스 규칙
- 결제 수단은 현금/카드 중 반드시 1개 선택 필수
- 수납 완료 후 결제 수단 변경 불가 (재수납 기능 없음)
- 본인부담금은 서버에서 계산한 값을 그대로 사용 (클라이언트 임의 수정 불가)

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| 결제 수단 미선택 시 수납 시도 | "결제 수단을 선택해 주세요" 오류 메시지 |
| 이미 수납 완료된 방문 재수납 시도 | "이미 수납이 완료된 방문입니다" 안내 후 청구 단계로 이동 유도 |

---

### 5.6 단계 6: 청구 (Claim)

#### 목적
건강보험 청구를 위한 데이터를 생성하고 청구 완료 처리한다.

#### 화면 구성

| 영역 | 구성 요소 |
|------|-----------|
| 청구 데이터 요약 | 환자 정보, 처방 항목, 수납 정보 종합 표시 |
| 청구 항목 상세 | 약품코드, 약품명, 수량, 투약일수, 보험 청구 금액 |
| 청구 상태 표시 | 현재 청구 상태 (대기 / 완료) |
| 액션 영역 | [청구 완료] 버튼 |

#### 기능 상세

**F6-1. 청구 데이터 생성**
- 청구 단계 진입 시 자동으로 청구 데이터 생성
- `POST /api/visits/:id/claim` 호출 (단계 진입 시 자동 또는 최초 화면 로드 시)
- 서버에서 처방 항목 + 수납 정보 기반으로 Claim 레코드 생성
- 청구 데이터 구조 (`claim_data` JSONB 저장):
```json
{
  "patient": { "name": "홍길동", "birth_date": "1990-01-01" },
  "clinic_name": "OO의원",
  "prescribed_at": "2026-03-14",
  "items": [
    { "drug_code": "644900060", "drug_name": "타이레놀", "quantity": 3, "days": 3, "claim_amount": 1500 }
  ],
  "total_drug_cost": 5000,
  "copay_amount": 1500,
  "generated_at": "2026-03-14T10:30:00Z"
}
```

**F6-2. 청구 내역 조회**
- `GET /api/visits/:id/claim` 호출하여 청구 데이터 표시
- 청구 항목별 보험 청구 금액 표시

**F6-3. 청구 완료 처리**
- [청구 완료] 클릭 시:
  1. `PATCH /api/visits/:id/stage` — `{ "stage": "completed" }` 호출 (단일 endpoint로 완료 처리)
  2. 완료 확인 화면 표시 후 새 환자 접수 화면으로 이동

#### 비즈니스 규칙
- 청구 완료 처리 후 해당 방문의 모든 데이터는 읽기 전용으로 전환
- Claim 레코드는 생성 시 자동으로 완료 상태로 간주 (`claim_data` JSONB에 전체 청구 구조 저장)
- 청구 완료 후 메인 화면(접수)으로 자동 리다이렉트

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| 수납 미완료 상태에서 청구 시도 | 단계 전환 API에서 400 오류 반환, "수납을 먼저 완료해 주세요" 표시 |
| 이미 청구 완료된 방문 재청구 시도 | "이미 청구가 완료된 방문입니다" 안내 |

---

### 5.7 공통 기능 — 오늘의 방문 목록

> Workflow 밖의 관리 기능으로, 메인 화면 사이드 또는 별도 탭에 제공한다.

#### 화면 구성
- 당일 방문 목록 테이블: 환자명, 방문 시간, 현재 단계, [이어서 진행] 버튼
- `GET /api/visits/today` 호출

#### 기능 상세
- 진행 중인 방문 클릭 시 해당 방문의 현재 단계로 즉시 이동
- 완료된 방문은 읽기 전용 조회만 허용
- 오늘 날짜 고정 조회 (날짜 필터 없음)

---

### 5.8 기능별 API 매핑 요약

| 기능 | Method | Endpoint | 단계 |
|------|--------|----------|------|
| 환자 검색 | GET | `/api/patients?q=` | 접수 |
| 환자 등록 | POST | `/api/patients` | 접수 |
| 방문 생성 | POST | `/api/visits` | 접수 |
| 단계 전환 | PATCH | `/api/visits/:id/stage` | 전체 |
| 처방 등록/수정 | POST | `/api/visits/:id/prescriptions` | 처방 |
| 처방 조회 | GET | `/api/visits/:id/prescriptions` | 처방/검토 |
| 약품 검색 | GET | `/api/drugs?q=` | 처방 |
| 방문 상세 조회 | GET | `/api/visits/:id` | 검토 |
| 수납 처리 | POST | `/api/visits/:id/payment` | 수납 |
| 수납 조회 | GET | `/api/visits/:id/payment` | 수납 |
| 청구 생성 | POST | `/api/visits/:id/claim` | 청구 |
| 청구 조회 | GET | `/api/visits/:id/claim` | 청구 |
| 오늘 방문 목록 | GET | `/api/visits/today` | 관리 |

---

### 5.9 Plugin 관리 화면 (Plugin Management)

#### 목적
설치된 Plugin 목록을 조회하고, 각 Plugin의 활성화 여부를 제어한다. Plugin이 ON 상태일 때만 해당 업무 단계에서 기능이 노출된다.

#### 접근 경로
- 상단 네비게이션 > [Plugin 관리]
- 인증된 사용자 누구나 접근 가능 (별도 role 제한 없음)

#### 화면 구성

```
[Plugin 관리]

┌─────────────────────────────────────────────────────────┐
│  설치된 Plugin (1개)                                      │
├──────────────────┬──────────┬──────────┬────────────────┤
│  Plugin 명       │ 실행 단계 │  상태    │  액션          │
├──────────────────┼──────────┼──────────┼────────────────┤
│  복약지도 생성   │  수납     │  ● ON   │  [OFF로 변경]  │
└──────────────────┴──────────┴──────────┴────────────────┘
```

| 영역 | 구성 요소 |
|------|-----------|
| Plugin 목록 테이블 | Plugin명, 설명, 실행 단계, 현재 상태(ON/OFF), 토글 버튼 |
| 상태 표시 | ON: 초록 배지 / OFF: 회색 배지 |

#### 기능 상세

**FP0-1. Plugin 목록 조회**
- `GET /api/plugins` 호출
- 응답 구조:
```json
[
  {
    "id": "medication-guide",
    "name": "복약지도 생성",
    "description": "처방 완료 후 약품별 복약 방법과 주의사항 안내 자료를 자동 생성합니다.",
    "triggerStage": "payment",
    "enabled": true
  }
]
```

**FP0-2. Plugin ON/OFF 토글**
- 토글 버튼 클릭 시 `PATCH /api/plugins/:pluginId` — `{ "enabled": true/false }` 호출
- 변경 즉시 해당 단계 UI에 반영 (페이지 새로고침 불필요)

#### DB 스키마 — PluginConfig 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | VARCHAR | PK (plugin id, 예: `medication-guide`) |
| name | VARCHAR | Plugin 표시명 |
| enabled | BOOLEAN | 활성화 여부 (default: false) |
| updated_at | TIMESTAMP | 마지막 변경일시 |

#### 비즈니스 규칙
- Plugin ON/OFF 변경은 즉시 반영 (진행 중인 방문에도 즉시 적용)
- Plugin이 OFF 상태인 경우 해당 단계에서 Plugin 영역 자체를 숨김

#### API 요약

| 기능 | Method | Endpoint |
|------|--------|----------|
| Plugin 목록 조회 | GET | `/api/plugins` |
| Plugin ON/OFF 변경 | PATCH | `/api/plugins/:pluginId` |

---

### 5.10 복약지도 생성 Plugin (Medication Guide)

#### 목적
처방 의약품별 복약 방법, 주의사항, 보관법을 자동으로 정리하여 약사가 환자에게 전달할 복약지도 자료를 생성한다.

#### 트리거 단계: `수납 (Step 5)` — 수납 완료 직후

#### Plugin 활성화 조건
- Plugin 관리에서 `enabled: true` 상태일 것
- 수납 완료 처리(`POST /api/visits/:id/payment`) 응답 성공 시 자동 트리거

#### 화면 흐름

```
수납 완료
    ↓
[복약지도 자료 생성 중...] 로딩 표시 (1~2초)
    ↓
복약지도 패널 슬라이드 오픈 (오른쪽에서)
    ↓
약품별 복약 안내 카드 표시
    ↓
[인쇄] [닫기] 버튼
```

#### 화면 구성 — 복약지도 패널

```
┌────────────────────────────────────┐
│  복약지도                     [닫기] │
│  홍길동 님 · 2026-03-14            │
├────────────────────────────────────┤
│  [타이레놀 500mg]                   │
│  ∙ 복용 방법: 1회 1정, 1일 3회       │
│    (식후 30분)                      │
│  ∙ 주의사항: 음주 중 복용 금지        │
│  ∙ 부작용: 소화불량, 오심            │
│  ∙ 보관: 실온 보관, 직사광선 피할 것  │
├────────────────────────────────────┤
│  [아목시실린 250mg]                  │
│  ∙ 복용 방법: 1회 1캡슐, 1일 3회     │
│  ∙ 주의사항: 페니실린 알레르기 주의   │
│  ...                               │
├────────────────────────────────────┤
│        [인쇄]    [닫기]             │
└────────────────────────────────────┘
```

#### 기능 상세

**FP1-1. 복약지도 데이터 생성**
- 수납 완료 직후 `POST /api/plugins/medication-guide/execute` 자동 호출
- Request body:
```json
{ "visitId": "uuid" }
```
- 서버 처리:
  1. Visit → Prescription → PrescriptionItem 조회
  2. 각 `drug_code`로 Drug 마스터에서 복약지도 데이터(`dosage_instruction`, `cautions`, `side_effects`, `storage`) 조회
  3. 복약지도 구조 생성 후 반환

- Response 구조:
```json
{
  "visitId": "uuid",
  "patientName": "홍길동",
  "generatedAt": "2026-03-14T10:30:00Z",
  "guides": [
    {
      "drugCode": "644900060",
      "drugName": "타이레놀 500mg",
      "dosageInstruction": "1회 1정, 1일 3회 (식후 30분)",
      "cautions": "음주 중 복용 금지, 다른 해열진통제와 병용 금지",
      "sideEffects": "소화불량, 오심",
      "storage": "실온(1~30°C) 보관, 직사광선 차단"
    }
  ]
}
```

**FP1-2. 복약지도 인쇄**
- [인쇄] 클릭 시 `window.print()` 호출
- 인쇄 영역: 복약지도 패널 내용 (약국명, 환자명, 날짜, 약품별 안내)
- 인쇄 스타일: 흑백 최적화 CSS (`@media print`)

**FP1-3. 복약지도 수동 재실행**
- 패널 닫은 후 수납 화면에서 [복약지도 보기] 버튼으로 재오픈 가능
- 데이터 재생성 없이 마지막 생성 결과 표시

#### 복약지도 데이터 소스 (데모 구현)

현재 구현에서는 Drug DB 컬럼 대신 **플러그인 내 하드코딩된 약품 경고 맵**을 사용한다. 약품 코드별로 주의사항 텍스트가 `medicationGuide.ts`에 정의되어 있으며, 등록되지 않은 약품은 기본 안내 문구를 반환한다.

> 향후 개선 시 Drug 테이블에 `dosage_instruction`, `cautions`, `side_effects`, `storage` 컬럼을 추가하고 의약품안전나라 API 데이터로 채울 수 있다.

#### 비즈니스 규칙
- 복약지도는 생성 후 DB에 저장하지 않음 (매 호출 시 약품 경고 맵에서 실시간 생성)
- Plugin이 OFF 상태이면 수납 완료 후 복약지도 패널/버튼 노출하지 않음
- 처방 항목이 없는 경우(비정상) 복약지도 생성 스킵

#### 에러 케이스
| 상황 | 처리 |
|------|------|
| Drug 마스터에 복약지도 데이터 없음 | 해당 항목 "약품 정보가 등록되지 않았습니다" 표시 후 나머지 약품은 정상 표시 |
| API 호출 실패 | 토스트 알림 "복약지도 생성에 실패했습니다. [다시 시도]" — 수납 완료 흐름은 차단하지 않음 |

#### API 요약

| 기능 | Method | Endpoint |
|------|--------|----------|
| 복약지도 생성 | POST | `/api/plugins/medication-guide/execute` |

---

## 6. 기술 스택

### 6.1 Frontend

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| 프레임워크 | React 18 + TypeScript | 컴포넌트 기반 UI 구성, Workflow Stepper 구현 용이 |
| UI 스타일링 | Tailwind CSS | 빠른 스타일링, 반응형 지원 |
| UI 컴포넌트 | shadcn/ui | Dialog·Sheet·Toast 컴포넌트를 즉시 사용 — 슬라이드 패널, 확인 다이얼로그, 알림에 필요 |
| 클라이언트 상태 관리 | Zustand | Plugin ON/OFF 상태를 Workflow 전 단계에서 공유. 보일러플레이트 없이 간단 |
| API 클라이언트 | Axios | 간결한 HTTP 클라이언트. 인터셉터로 JWT 헤더·에러 처리 일원화 |
| 라우팅 | React Router v6 | Workflow 단계별 URL 구성, Plugin 관리 화면 라우팅 |
| 폼 유효성 검사 | 인라인 useState + 간단 검증 | 환자 등록·처방 입력 폼은 필드 수가 적어 별도 폼 라이브러리 불필요 |

> **TanStack Query 미채택 이유:** 20개 쿼리 설정에 약 1~2시간이 소요된다. Axios + useState 직접 호출로 동일한 기능을 구현하며, 핵심 완성도에 집중한다.

### 6.2 Backend

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| 런타임 | Node.js + Express | JavaScript 풀스택 일관성, REST API 구현 용이 |
| 입력 검증 | Zod | API 요청 body 검증 (drug_code, amount, date 형식 등) |
| 인증 | JWT (jsonwebtoken) | 단일 토큰으로 로그인 상태 확인. 역할 구분 없이 인증 여부만 검사 |

> **Role 기반 접근 제어 미구현:** admin/약사/실무자 역할 분리는 로그인 UI + 미들웨어 구현에 1시간 이상 소요된다. 인증 여부(로그인/비로그인)만 검사하며, Plugin 관리는 인증된 사용자 전체 허용으로 단순화한다.

### 6.3 Database

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| DB | PostgreSQL | 관계형 데이터 정합성 보장, JSONB 타입으로 claim_data 저장 |
| ORM | Prisma | 타입 안전한 DB 접근, 마이그레이션 관리 |
| DB 호스팅 | Supabase 또는 Neon | 무료 PostgreSQL 호스팅, 빠른 설정 |

### 6.4 배포 / 인프라

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Frontend 배포 | Vercel | GitHub 연동 자동 배포, 정적 빌드 최적 환경 |
| Backend 배포 | Vercel Serverless Function | Frontend와 동일 플랫폼 — CORS 단순화, GitHub push 자동 배포 일원화 |

> **Frontend + Backend 통합 배포 (Vercel):** `vercel.json`의 `rewrites` 규칙으로 `/api/*` 요청을 `backend/api/index.ts` Serverless Function으로 라우팅한다. Railway/Render 분리 배포 대안을 검토했으나, 단일 플랫폼 관리 단순성을 선택했다.

### 6.5 테스트 / CI/CD

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| 백엔드 단위 테스트 | Jest | Domain 순수 로직(WorkflowStateMachine, CopayCalculator, ClaimDataBuilder) 검증 — 22개 |
| 백엔드 통합 테스트 | Jest + Supertest | HTTP 계약 검증 (Prisma 모킹, 실제 DB 불필요) — 23개 |
| CI/CD | GitHub Actions | quality → test → build → deploy 4단계 파이프라인 |

> **통합 테스트 전략:** `jest.mock('../../lib/prisma')`로 Prisma 싱글톤을 모킹하여 실제 DB 없이 routes → services → domain 흐름의 HTTP 응답 계약을 검증한다. CI에서 PostgreSQL 서비스 컨테이너는 `prisma migrate deploy` 검증용으로만 사용한다.

---

## 7. 시스템 아키텍처

### 7.1 전체 시스템 구조 (3-Tier + Plugin 확장)

```
┌──────────────────────────────────────────────────────────────┐
│                    사용자 (Browser)                            │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼───────────────────────────────────┐
│               Frontend Layer (Vercel)                        │
│           React 18 + TypeScript + Vite                       │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Presentation   pages/ · features/ · components/      │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Application    hooks/ · stores/ (Zustand)            │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  Infrastructure api/ (Axios) · router/                │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API / JWT
┌──────────────────────────▼───────────────────────────────────┐
│               Backend API Layer (Vercel Serverless)          │
│           Node.js + Express + TypeScript                     │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  routes/     HTTP 수신, Zod 검증, JWT 인증 미들웨어     │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  services/   유스케이스 조율, Prisma 직접 호출          │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  domain/     순수 비즈니스 규칙 (외부 의존 없음)         │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  plugins/    Plugin 실행 함수 (enabled 확인 후 위임)    │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ Prisma Client
┌──────────────────────────▼───────────────────────────────────┐
│               Database Layer (Neon — Serverless PostgreSQL)  │
│   Patient · Visit · Prescription · Payment · Claim · Drug    │
│   PluginConfig                                               │
└──────────────────────────────────────────────────────────────┘
```

---

### 7.2 Frontend 디렉토리 구조 — 관심사 분리

```
frontend/src/
├── pages/              # [Presentation] URL 진입점 (React Router 1:1 매핑)
│   ├── ReceptionPage.tsx
│   ├── PrescriptionPage.tsx
│   ├── DispensingPage.tsx
│   ├── ReviewPage.tsx
│   ├── PaymentPage.tsx
│   ├── ClaimPage.tsx
│   └── PluginManagePage.tsx
│
├── features/           # [Presentation] 단계별 도메인 컴포넌트 묶음
│   ├── reception/      #   환자 검색·등록·방문 생성
│   ├── prescription/   #   처방전 입력·약품 검색·항목 목록
│   ├── dispensing/     #   조제 체크리스트
│   ├── review/         #   처방 요약·메모
│   ├── payment/        #   수납 계산·결제·영수증
│   └── claim/          #   청구 데이터 표시·완료
│
├── components/         # [Presentation] 재사용 공용 컴포넌트
│   ├── WorkflowStepper.tsx
│   ├── PluginSlot.tsx  #   단계별 Plugin 조건부 렌더링
│   └── ui/             #   shadcn/ui 래퍼
│
├── hooks/              # [Application] API 호출 + 로컬 로직 캡슐화
│   ├── usePatient.ts       #   환자 검색·등록
│   ├── useVisit.ts         #   방문 생성·단계 전환
│   ├── usePrescription.ts  #   처방 조회·저장·약품 검색
│   ├── usePayment.ts       #   수납 처리
│   └── usePlugin.ts        #   Plugin 목록·토글·실행
│
├── stores/             # [Application] 전역 클라이언트 상태 (Zustand)
│   ├── workflowStore.ts    #   현재 visitId
│   └── pluginStore.ts      #   Plugin ON/OFF (전 단계 공유)
│
└── api/                # [Infrastructure] Axios 클라이언트
    ├── client.ts       #   인스턴스, JWT 인터셉터, 공통 에러 처리
    └── endpoints.ts    #   엔드포인트 URL 상수
```

**상태 관리 분리 원칙:**

| 상태 유형 | 도구 | 대상 |
|-----------|------|------|
| 서버 데이터 | Axios + useState | 환자·처방·수납·청구 API 응답 |
| 전역 클라이언트 상태 | Zustand | visitId, Plugin ON/OFF |
| 로컬 UI 상태 | useState | 조제 체크박스, 모달 여부 |

---

### 7.3 Backend 디렉토리 구조 — 관심사 분리

Backend는 **routes → services → domain / plugins** 3계층으로 분리하며, 각 계층은 단방향으로만 의존한다.

```
backend/src/
├── routes/              # [Interface] HTTP 라우터 — 요청 수신·검증만 담당
│   ├── patients.ts
│   ├── visits.ts
│   ├── prescriptions.ts
│   ├── drugs.ts
│   ├── payments.ts
│   ├── claims.ts
│   └── plugins.ts
│
├── middlewares/         # [Interface] 공용 미들웨어
│   ├── auth.ts          #   JWT 검증, req.user 주입
│   └── validate.ts      #   Zod 스키마 기반 요청 검증
│
├── services/            # [Application] 유스케이스 조율 + Prisma 직접 호출
│   ├── VisitService.ts         #   방문 생성·조회·단계 전환: Domain 검증 → Prisma 업데이트
│   ├── PatientService.ts
│   ├── PrescriptionService.ts
│   ├── PaymentService.ts       #   CopayCalculator 호출 후 Prisma 저장
│   ├── ClaimService.ts         #   ClaimDataBuilder 호출 후 Prisma 저장
│   └── PluginService.ts        #   ON/OFF 변경, Plugin 실행 위임
│
├── domain/              # [Domain] 순수 비즈니스 규칙 — 외부 의존 없음
│   ├── WorkflowStateMachine.ts  #   유효 단계 전환 맵 + 전환 조건 검증
│   ├── CopayCalculator.ts       #   약제비 × 30% (1만원 미만 × 20%)
│   └── ClaimDataBuilder.ts      #   claim_data JSONB 구조 생성
│
├── plugins/             # [Plugin] Plugin 실행 함수
│   └── medicationGuide.ts  #   Drug 마스터 조회 → 복약지도 구조 반환
│
└── schemas/             # [Interface] Zod 요청 스키마
    ├── patientSchema.ts
    ├── visitSchema.ts
    └── paymentSchema.ts
```

**계층 간 의존 방향 (단방향 규칙):**

```
routes → services → domain
                 ↘ plugins
                 (둘 다 Prisma Client 직접 사용)
```

- `domain/` 은 Prisma 포함 어떤 외부 모듈도 import하지 않는다 (순수 함수).
- `plugins/` 은 서비스에서 직접 호출되며, 결과만 반환하고 DB 저장은 service가 담당한다.
- `routes/` 는 `services/` 만 호출한다.

> **Repository 패턴 미채택:** 파일 7개 추가 대비 SoC 기여가 낮다. Domain 계층 분리만으로 관심사 분리를 충분히 증명한다.

---

### 7.4 Workflow 단계 전환 흐름

```
Frontend (WorkflowStepper)
    │  PATCH /api/visits/:id/stage  { stage: "review" }
    ▼
routes/visits.ts  →  validate(stageSchema)  →  auth middleware
    ▼
VisitService.transitionStage(visitId, targetStage)
    │
    ├─ WorkflowStateMachine.canTransition(current, target)
    │       { allowed: boolean, reason?: string }
    │
    ├─ [단계별 전환 가드]
    │       dispensing → review : 처방 항목 1개 이상 존재 여부
    │       review → payment   : 검토 단계 진입 여부
    │       payment → claim    : Payment 레코드 존재 여부
    │
    └─ prisma.visit.update({ workflow_stage: targetStage })
```

---

### 7.5 Plugin 실행 흐름

Plugin은 별도 인터페이스 없이 **enabled 확인 → 실행 함수 호출** 방식으로 동작한다.

```
POST /api/plugins/medication-guide/execute
    ▼
PluginService.execute("medication-guide", { visitId })
    │
    ├─ prisma.pluginConfig.findUnique({ id: "medication-guide" })
    │     → enabled: false 이면 { skipped: true } 반환
    │
    └─ medicationGuide(visitId, prisma)
           Drug 마스터 조회 → 복약지도 구조 생성 → 반환
```

새 Plugin 추가 시: `plugins/` 에 실행 함수 파일 1개 추가 + `PluginService` 분기 1개 추가.

---

### 7.6 인증 흐름 (단일 토큰)

```
클라이언트 요청
    │  Authorization: Bearer <JWT>
    ▼
auth middleware
    │  jwt.verify(token, SECRET)  →  { userId }
    │  실패 시 → 401 Unauthorized
    ▼
route handler  →  service  →  Prisma
```

> **Role 기반 접근 제어 미구현:** admin/약사/실무자 역할 분리는 제외하고, 로그인 여부(토큰 유효성)만 검사한다. Plugin 관리 화면은 인증된 사용자 전체 허용.

---

### 7.7 배포 아키텍처

```
GitHub Repository (main branch)
         │  push
         ▼
GitHub Actions
  ├─ ESLint + TypeScript type-check
  ├─ Jest 단위 테스트 (domain/ 순수 로직, 22개)
  ├─ Jest 통합 테스트 (API 계층, Prisma 모킹, 23개)
  └─ Build 검증 (frontend + backend)
         │
         ▼
       Vercel
  ┌────────────────────────────┐
  │  React 정적 빌드 (CDN)      │
  │  pharmweave.vercel.app     │
  ├────────────────────────────┤
  │  Express Serverless Fn     │
  │  pharmweave.vercel.app/api │
  └────────────────────────────┘
         │  Prisma Client
         ▼
       Neon (PostgreSQL)
```

**환경별 설정:**

| 환경 | Frontend | Backend | DB |
|------|----------|---------|-----|
| development | localhost:5173 | localhost:3000 | 로컬 PostgreSQL |
| production | Vercel | Railway | Supabase/Neon |

---

## 8. 데이터 모델

### 8.1 설계 원칙

| 원칙 | 내용 |
|------|------|
| **식별자** | 모든 PK는 UUID v4 (`gen_random_uuid()`) — 순차 ID 노출 방지, 분산 확장 고려 |
| **감사 추적 (Audit Trail)** | 생성 전용 테이블: `created_at`. 변경 가능 테이블: `created_at` + `updated_at` |
| **이력 무결성** | `PrescriptionItem`에 `drug_name`, `unit_price` 스냅샷 보관 — 약품 마스터 변경이 과거 처방·청구에 영향을 주지 않음 |
| **타입 안전성** | `workflow_stage`, `payment_method`, `claim_status`는 PostgreSQL ENUM 타입 — 잘못된 값 DB 레벨 차단 |
| **정규화 수준** | 3NF 준수. `PrescriptionItem.drug_name` / `unit_price`만 이력 보존 목적으로 비정규화 허용 |
| **단방향 참조** | 엔티티 의존 방향 = Workflow 흐름 방향 (`Patient → Visit → Prescription → Item`) |

---

### 8.2 ERD (개체 관계도)

```
┌──────────┐  1:N   ┌──────────────────────────────────────────┐
│   User   │───────→│  Visit                                    │
└──────────┘        │  id / patient_id / created_by(opt)        │
                    │  workflow_stage / visited_at               │
┌──────────┐  1:N   └────┬──────────────┬──────────┬───────────┘
│  Patient │─────────────┘              │          │
└──────────┘                       1:0..1     1:0..1
                                        │          │
                                        ▼          ▼
                                  ┌──────────┐ ┌──────────┐
                                  │ Payment  │ │  Claim   │
                                  └──────────┘ └──────────┘
                    ┌───────────────────┘
                    │ 1:1
                    ▼
              ┌────────────────┐
              │  Prescription  │
              └───────┬────────┘
                      │ 1:N
                      ▼
         ┌────────────────────┐  N:1   ┌──────────┐
         │  PrescriptionItem  │───────→│   Drug   │
         │  (drug_name 스냅샷  │        │ (master) │
         │   unit_price 스냅샷)│        └──────────┘
         └────────────────────┘

┌──────────────┐
│ PluginConfig │  (독립 운영 설정 테이블)
└──────────────┘
```

**관계 요약:**

| 관계 | 카디널리티 | 비고 |
|------|-----------|------|
| Patient → Visit | 1:N | 동일 환자 다수 방문 가능 |
| User → Visit | 1:N (옵션) | 접수 담당자 추적 (nullable) |
| Visit → Prescription | 1:1 | 방문당 처방 1건, `visit_id` UNIQUE |
| Prescription → PrescriptionItem | 1:N | 처방 항목 1개 이상 필수 |
| PrescriptionItem → Drug | N:1 (논리적) | drug_code 참조. 이름·단가는 스냅샷 (FK 미설정) |
| Visit → Payment | 1:0..1 | 수납 완료 전까지 없음, `visit_id` UNIQUE |
| Visit → Claim | 1:0..1 | 청구 생성 전까지 없음, `visit_id` UNIQUE |

---

### 8.3 엔티티 상세 정의

#### 8.3.1 User (사용자)

> JWT 토큰 발급 대상. 현재 Role 미구분 — 인증 여부(토큰 유효성)만 검사.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 로그인 아이디 |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt 해시 (원문 저장 금지) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 계정 생성일시 |

---

#### 8.3.2 Patient (환자)

> 약국 등록 환자 마스터. 동일 이름+생년월일 중복 감지를 위한 복합 UNIQUE 제약.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `name` | VARCHAR(50) | NOT NULL | 환자명 (2자 이상) |
| `birth_date` | DATE | NOT NULL, CHECK(< CURRENT_DATE) | 생년월일 (미래 불가) |
| `phone` | VARCHAR(11) | NULL | 전화번호 (숫자 10~11자리) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 등록일시 |

**복합 UNIQUE 제약:** `UNIQUE (name, birth_date)` — 중복 환자 등록 방지, F1-2 중복 감지 로직의 DB 보장선

---

#### 8.3.3 Visit (방문)

> Workflow의 핵심 엔티티. `workflow_stage`가 현재 단계를 단독으로 추적.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `patient_id` | UUID | FK → Patient, NOT NULL | 방문 환자 |
| `created_by` | UUID | FK → User, NULL | 접수 담당자 (현재 선택적) |
| `workflow_stage` | WorkflowStage | NOT NULL, DEFAULT 'reception' | 현재 Workflow 단계 (ENUM) |
| `visited_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 방문 접수 일시 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 레코드 생성일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, AUTO | 최종 수정일시 (단계 전환 시 자동 갱신) |

**ENUM: WorkflowStage**
```
reception | prescription | dispensing | review | payment | claim | completed
```

> `visited_at`은 접수 시점(업무 의미), `created_at`은 레코드 삽입 시점(기술 의미). 현재 동일하나 의미 분리 유지.

---

#### 8.3.4 Prescription (처방)

> Visit당 1건만 허용 (`visit_id` UNIQUE). 처방전 헤더 정보만 보관, 항목은 PrescriptionItem에 분리.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `visit_id` | UUID | FK → Visit, UNIQUE, NOT NULL | 방문 참조 (1:1 보장) |
| `clinic_name` | VARCHAR(100) | NOT NULL | 의료기관명 |
| `doctor_name` | VARCHAR(50) | NULL | 처방 의사명 |
| `prescribed_at` | DATE | NOT NULL, CHECK(≤ CURRENT_DATE) | 처방일 (미래 불가) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 등록일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, AUTO | 최종 수정일시 |

---

#### 8.3.5 PrescriptionItem (처방 항목)

> 약품명과 단가를 처방 시점 기준으로 스냅샷. Drug 테이블 변경이 과거 이력에 영향을 주지 않도록 설계.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `prescription_id` | UUID | FK → Prescription, NOT NULL | 처방 참조 |
| `drug_code` | VARCHAR(20) | NOT NULL | 건강보험 약품 코드 |
| `drug_name` | VARCHAR(200) | NOT NULL | 약품명 **스냅샷** (Drug 마스터 변경 무영향) |
| `unit_price` | INTEGER | NOT NULL, CHECK(> 0) | 처방 시점 단가 **스냅샷** |
| `quantity` | INTEGER | NOT NULL, CHECK(> 0 AND ≤ 9999) | 수량 |
| `days` | INTEGER | NOT NULL, CHECK(> 0 AND ≤ 365) | 투약일수 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 등록일시 |

> **설계 결정 (ADR-1 참조):** `drug_code`에 FK 제약을 걸지 않는다. 약품 비활성화·코드 수정이 발생해도 과거 처방 이력은 불변 보장.

---

#### 8.3.6 Drug (약품 마스터)

> 건강보험심사평가원 약품 코드 체계 기반 마스터 테이블. `drug_code`를 자연키 PK로 사용.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `drug_code` | VARCHAR(20) | PK, NOT NULL | 건강보험 약품 코드 (예: `644900060`) |
| `drug_name` | VARCHAR(200) | NOT NULL | 약품명 (검색 대상) |
| `unit_price` | INTEGER | NOT NULL, CHECK(≥ 0) | 1회 단위 가격 (원) |
| `dosage_instruction` | TEXT | NULL | 복용 방법 — 복약지도 Plugin 사용 |
| `cautions` | TEXT | NULL | 복약 주의사항 — 복약지도 Plugin 사용 |
| `side_effects` | TEXT | NULL | 주요 부작용 — 복약지도 Plugin 사용 |
| `storage` | TEXT | NULL | 보관 방법 — 복약지도 Plugin 사용 |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | 활성 여부 (검색 노출 제어) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 등록일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, AUTO | 최종 수정일시 |

> 복약지도 컬럼(dosage_instruction ~ storage)이 NULL인 약품은 복약지도 Plugin에서 "약품 정보가 등록되지 않았습니다"로 표시.

---

#### 8.3.7 Payment (수납)

> Visit당 1건만 허용. 서버 계산 결과(약제비·본인부담금)를 영구 보관. 수납 완료 후 변경 불가.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `visit_id` | UUID | FK → Visit, UNIQUE, NOT NULL | 방문 참조 (1:1 보장) |
| `total_drug_cost` | INTEGER | NOT NULL, CHECK(≥ 0) | 총 약제비 (원) |
| `copay_amount` | INTEGER | NOT NULL, CHECK(≥ 0) | 본인부담금 (원) |
| `method` | PaymentMethod | NOT NULL | 결제 수단 (ENUM) |
| `paid_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 결제 완료 일시 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 레코드 생성일시 |

**ENUM: PaymentMethod**
```
cash | card
```

> `total_drug_cost`와 `copay_amount`를 모두 저장: 청구 시 보험 청구 금액(`= total_drug_cost - copay_amount`) 도출에 사용. 수납 이후 재계산 없이 감사 추적 가능.

---

#### 8.3.8 Claim (청구)

> 건강보험 청구 레코드. 청구 데이터 전체를 JSONB로 보관 — 청구 규격 변경에 유연 대응.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | UUID | PK, NOT NULL | 고유 식별자 |
| `visit_id` | UUID | FK → Visit, UNIQUE, NOT NULL | 방문 참조 (1:1 보장) |
| `claim_data` | JSONB | NOT NULL | 청구 데이터 전체 구조 (불변 스냅샷) |
| `status` | ClaimStatus | NOT NULL, DEFAULT 'pending' | 청구 상태 (ENUM) |
| `completed_at` | TIMESTAMPTZ | NULL | 청구 완료 일시 (완료 시 설정) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 레코드 생성일시 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, AUTO | 최종 수정일시 |

**ENUM: ClaimStatus**
```
pending | completed
```

**claim_data JSONB 구조:**
```json
{
  "patient": { "name": "홍길동", "birth_date": "1990-01-01" },
  "clinic_name": "OO의원",
  "prescribed_at": "2026-03-14",
  "items": [
    {
      "drug_code": "644900060",
      "drug_name": "타이레놀 500mg",
      "quantity": 3,
      "days": 3,
      "unit_price": 500,
      "claim_amount": 1500
    }
  ],
  "total_drug_cost": 5000,
  "copay_amount": 1500,
  "insurance_claim_amount": 3500,
  "generated_at": "2026-03-14T10:30:00Z"
}
```

---

#### 8.3.9 PluginConfig (플러그인 설정)

> Plugin ON/OFF 상태 및 메타데이터 보관. `id`는 플러그인 고유 슬러그 (VARCHAR PK).

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | VARCHAR(50) | PK, NOT NULL | Plugin 슬러그 (예: `medication-guide`) |
| `name` | VARCHAR(100) | NOT NULL | Plugin 표시명 |
| `description` | TEXT | NULL | Plugin 설명 |
| `trigger_stage` | VARCHAR(20) | NOT NULL | 실행 단계 (예: `payment`) |
| `enabled` | BOOLEAN | NOT NULL, DEFAULT false | 활성화 여부 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, AUTO | 최종 변경일시 |

---

### 8.4 인덱스 전략

| 테이블 | 인덱스명 | 컬럼 | 종류 | 목적 |
|--------|---------|------|------|------|
| `patients` | `idx_patient_name` | `name` | B-Tree | 이름 전방 일치 검색 (`LIKE 'X%'`) |
| `patients` | `idx_patient_birth_date` | `birth_date` | B-Tree | 생년월일 8자리 검색 |
| `patients` | `uniq_patient_name_birth` | `(name, birth_date)` | **UNIQUE** | 중복 환자 DB 레벨 방지 |
| `visits` | `idx_visit_patient_id` | `patient_id` | B-Tree | 환자별 방문 이력 조회 |
| `visits` | `idx_visit_stage` | `workflow_stage` | B-Tree | 단계별 방문 필터링 |
| `visits` | `idx_visit_visited_date` | `DATE(visited_at)` | B-Tree (함수) | 오늘 방문 목록 (`?date=today`) |
| `prescriptions` | `uniq_prescription_visit` | `visit_id` | **UNIQUE** | Visit:Prescription 1:1 DB 보장 |
| `prescription_items` | `idx_pi_prescription_id` | `prescription_id` | B-Tree | 처방별 항목 조회 |
| `prescription_items` | `idx_pi_drug_code` | `drug_code` | B-Tree | 약품별 처방 이력 집계 |
| `drugs` | `idx_drug_name` | `drug_name` | B-Tree | 약품명 검색 (`GET /api/drugs?q=`) |
| `drugs` | `idx_drug_active` | `is_active` | B-Tree | 활성 약품 필터 (검색 시 `WHERE is_active = true`) |
| `payments` | `uniq_payment_visit` | `visit_id` | **UNIQUE** | Visit:Payment 1:1 DB 보장 |
| `claims` | `uniq_claim_visit` | `visit_id` | **UNIQUE** | Visit:Claim 1:1 DB 보장 |
| `claims` | `idx_claim_status` | `status` | B-Tree | 청구 상태별 조회 |

> **약품 검색 최적화 고려:** 현재 `LIKE 'X%'` 전방 일치 기준 B-Tree 인덱스로 충분. 중간 포함 검색이 요구되면 `pg_trgm` 확장의 GIN 인덱스로 전환 가능.

---

### 8.5 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUM 타입
// ─────────────────────────────────────────────

enum WorkflowStage {
  reception
  prescription
  dispensing
  review
  payment
  claim
  completed
}

enum PaymentMethod {
  cash
  card
}

enum ClaimStatus {
  pending
  completed
}

// ─────────────────────────────────────────────
// User (사용자)
// ─────────────────────────────────────────────

model User {
  id           String   @id @default(uuid())
  username     String   @unique @db.VarChar(50)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()

  visits       Visit[]

  @@map("users")
}

// ─────────────────────────────────────────────
// Patient (환자)
// ─────────────────────────────────────────────

model Patient {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(50)
  birthDate DateTime @map("birth_date") @db.Date
  phone     String?  @db.VarChar(11)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  visits    Visit[]

  @@unique([name, birthDate], name: "uniq_patient_name_birth")
  @@index([name], name: "idx_patient_name")
  @@index([birthDate], name: "idx_patient_birth_date")
  @@map("patients")
}

// ─────────────────────────────────────────────
// Visit (방문)
// ─────────────────────────────────────────────

model Visit {
  id            String        @id @default(uuid())
  patientId     String        @map("patient_id")
  createdBy     String?       @map("created_by")
  workflowStage WorkflowStage @default(reception) @map("workflow_stage")
  visitedAt     DateTime      @default(now()) @map("visited_at") @db.Timestamptz()
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime      @updatedAt @map("updated_at") @db.Timestamptz()

  patient      Patient       @relation(fields: [patientId], references: [id])
  user         User?         @relation(fields: [createdBy], references: [id])
  prescription Prescription?
  payment      Payment?
  claim        Claim?

  @@index([patientId], name: "idx_visit_patient_id")
  @@index([workflowStage], name: "idx_visit_stage")
  @@map("visits")
}

// ─────────────────────────────────────────────
// Prescription (처방)
// ─────────────────────────────────────────────

model Prescription {
  id           String             @id @default(uuid())
  visitId      String             @unique @map("visit_id")
  clinicName   String             @map("clinic_name") @db.VarChar(100)
  doctorName   String?            @map("doctor_name") @db.VarChar(50)
  prescribedAt DateTime           @map("prescribed_at") @db.Date
  createdAt    DateTime           @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime           @updatedAt @map("updated_at") @db.Timestamptz()

  visit        Visit              @relation(fields: [visitId], references: [id])
  items        PrescriptionItem[]

  @@map("prescriptions")
}

// ─────────────────────────────────────────────
// PrescriptionItem (처방 항목)
// ─────────────────────────────────────────────

model PrescriptionItem {
  id             String   @id @default(uuid())
  prescriptionId String   @map("prescription_id")
  drugCode       String   @map("drug_code") @db.VarChar(20)
  drugName       String   @map("drug_name") @db.VarChar(200) // 스냅샷
  unitPrice      Int      @map("unit_price")                  // 스냅샷
  quantity       Int
  days           Int
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz()

  prescription   Prescription @relation(fields: [prescriptionId], references: [id])

  // drug_code에 FK 미설정 (ADR-1: 이력 무결성 우선)
  @@index([prescriptionId], name: "idx_pi_prescription_id")
  @@index([drugCode], name: "idx_pi_drug_code")
  @@map("prescription_items")
}

// ─────────────────────────────────────────────
// Drug (약품 마스터)
// ─────────────────────────────────────────────

model Drug {
  drugCode          String   @id @map("drug_code") @db.VarChar(20)
  drugName          String   @map("drug_name") @db.VarChar(200)
  unitPrice         Int      @map("unit_price")
  dosageInstruction String?  @map("dosage_instruction") // 복약지도 Plugin
  cautions          String?                              // 복약지도 Plugin
  sideEffects       String?  @map("side_effects")        // 복약지도 Plugin
  storage           String?                              // 복약지도 Plugin
  isActive          Boolean  @default(true) @map("is_active")
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@index([drugName], name: "idx_drug_name")
  @@index([isActive], name: "idx_drug_active")
  @@map("drugs")
}

// ─────────────────────────────────────────────
// Payment (수납)
// ─────────────────────────────────────────────

model Payment {
  id            String        @id @default(uuid())
  visitId       String        @unique @map("visit_id")
  totalDrugCost Int           @map("total_drug_cost")
  copayAmount   Int           @map("copay_amount")
  method        PaymentMethod
  paidAt        DateTime      @default(now()) @map("paid_at") @db.Timestamptz()
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  visit         Visit         @relation(fields: [visitId], references: [id])

  @@map("payments")
}

// ─────────────────────────────────────────────
// Claim (청구)
// ─────────────────────────────────────────────

model Claim {
  id          String      @id @default(uuid())
  visitId     String      @unique @map("visit_id")
  claimData   Json        @map("claim_data")
  status      ClaimStatus @default(pending)
  completedAt DateTime?   @map("completed_at") @db.Timestamptz()
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime    @updatedAt @map("updated_at") @db.Timestamptz()

  visit       Visit       @relation(fields: [visitId], references: [id])

  @@index([status], name: "idx_claim_status")
  @@map("claims")
}

// ─────────────────────────────────────────────
// PluginConfig (플러그인 설정)
// ─────────────────────────────────────────────

model PluginConfig {
  id           String   @id @db.VarChar(50)
  name         String   @db.VarChar(100)
  description  String?
  triggerStage String   @map("trigger_stage") @db.VarChar(20)
  enabled      Boolean  @default(false)
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  @@map("plugin_configs")
}
```

---

### 8.6 시드 데이터 구성

`prisma/seed.ts`에서 아래 데이터를 초기화한다.

#### 초기 사용자 (1건)

| username | password (평문) | 비고 |
|----------|----------------|------|
| `pharmacist` | `pharmweave2026!` | bcrypt 해시 후 저장 |

#### 약품 마스터 (20건 이상)

| 범주 | 예시 약품 | 건수 |
|------|-----------|------|
| 해열진통제 | 타이레놀 500mg, 이부프로펜 200mg, 덱시부프로펜 300mg | 3 |
| 항생제 | 아목시실린 250mg, 세파클러 250mg, 아지스로마이신 250mg | 3 |
| 소화기 | 오메프라졸 20mg, 돔페리돈 10mg, 모사프리드 5mg | 3 |
| 고혈압 | 암로디핀 5mg, 로사르탄 50mg, 발사르탄 80mg | 3 |
| 당뇨 | 메트포르민 500mg, 글리메피리드 1mg, 시타글립틴 100mg | 3 |
| 항히스타민 | 세티리진 10mg, 로라타딘 10mg, 펙소페나딘 120mg | 3 |
| 기타 | 비타민C 500mg, 아스피린 100mg | 2 |

각 약품에 `dosage_instruction`, `cautions`, `side_effects`, `storage` 포함 — 복약지도 Plugin 정상 동작 확인용.

#### 플러그인 초기 설정 (1건)

```json
{
  "id": "medication-guide",
  "name": "복약지도 생성",
  "description": "처방 완료 후 약품별 복약 방법과 주의사항 안내 자료를 자동 생성합니다.",
  "trigger_stage": "payment",
  "enabled": true
}
```

---

### 8.7 설계 결정 사항 (ADR)

#### ADR-1: PrescriptionItem에 Drug FK 미설정 (스냅샷 방식)

**결정:** `PrescriptionItem.drug_code`에 `drugs` 테이블 FK 제약을 걸지 않는다.

**이유:** 약품 마스터의 가격 변경, 비활성화, 코드 수정이 발생해도 기존 처방·청구 이력이 영향받지 않아야 한다. 의료 시스템에서 이력 데이터는 생성 시점 기준 불변(immutable)이 원칙.

**트레이드오프:** `drug_name`, `unit_price` 중복 저장 발생. 마스터와의 일관성은 애플리케이션 계층에서 보장.

---

#### ADR-2: claim_data를 JSONB로 저장

**결정:** 청구 데이터 전체를 `Claim.claim_data` JSONB 단일 컬럼으로 저장한다.

**이유:**
- 청구 규격 변경 시 컬럼 추가·마이그레이션 없이 JSONB 구조만 수정
- 청구 완료 후 데이터는 불변 스냅샷이므로 집계 쿼리 요구가 없음
- PostgreSQL JSONB는 인덱싱·부분 조회 지원으로 필요 시 확장 가능

**트레이드오프:** 항목별 집계 쿼리 성능 저하 가능. 현재 청구 데이터는 표시 전용이므로 허용.

---

#### ADR-3: workflow_stage를 VARCHAR 대신 ENUM으로 정의

**결정:** `Visit.workflow_stage`를 PostgreSQL ENUM 타입으로 정의한다.

**이유:**
- DB 레벨에서 유효하지 않은 단계값 삽입 원천 차단
- Prisma ENUM ↔ TypeScript 타입 자동 동기화로 코드-스키마 불일치 방지
- Workflow 단계는 시스템 설계 시 확정되는 값으로 런타임 변경 불필요

**트레이드오프:** 새 단계 추가 시 `ALTER TYPE` 마이그레이션 필요. 현재 7단계는 PRD 확정값이므로 허용.

---

#### ADR-4: User 테이블 최소 구현 + Visit.created_by nullable

**결정:** Role 없는 최소 User 테이블을 포함하며, `Visit.created_by` FK는 nullable로 설계한다.

**이유:**
- JWT 토큰의 `userId` 검증 대상 엔티티 필요 (section 7.6)
- `created_by` nullable 처리로 현재 단순 인증 요구사항 충족
- 향후 Role 컬럼 추가만으로 RBAC 확장 가능, 스키마 재설계 불필요

---

## 9. API 설계

### 9.1 설계 원칙

| 원칙 | 내용 |
|------|------|
| **REST 준수** | 리소스 중심 URL, HTTP 메서드 의미론 준수 (`GET` 조회, `POST` 생성, `PUT` 전체 교체, `PATCH` 부분 수정, `DELETE` 삭제) |
| **명사형 URL** | `/api/visits/:id/stage` — 동사 대신 서브리소스 표현 |
| **부모-자식 중첩** | `visit` 컨텍스트 안에서만 존재하는 리소스는 중첩 URL 사용 (`/api/visits/:id/prescription`) |
| **독립 리소스 직접 접근** | 이미 `id`를 알고 있는 리소스는 최상위 접근 허용 (`/api/prescriptions/:id`, `/api/claims/:id`) |
| **멱등성 보장** | `GET`, `PUT`, `PATCH`, `DELETE`는 멱등성 보장. `POST`만 비멱등 |
| **Stateless** | 모든 요청은 JWT 토큰으로 독립 인증. 서버 세션 미사용 |
| **일관된 응답 구조** | 성공/실패 모두 동일한 envelope 구조 (`data` / `error`) |

---

### 9.2 공통 규격

#### 9.2.1 Base URL

| 환경 | Base URL |
|------|----------|
| development | `http://localhost:3000` |
| production | `https://api.pharmweave.app` |

모든 엔드포인트는 `/api` prefix를 가진다.

#### 9.2.2 인증

모든 API (로그인 제외)는 `Authorization` 헤더에 Bearer JWT 토큰을 포함해야 한다.

```
Authorization: Bearer <JWT_TOKEN>
```

- 토큰 없음 또는 형식 오류 → `401 Unauthorized`
- 토큰 만료 → `401 Unauthorized` (`code: "TOKEN_EXPIRED"`)
- 유효한 토큰 → `req.user.id`에 userId 주입

#### 9.2.3 공통 응답 포맷

**성공 응답**
```json
{
  "data": { /* 응답 페이로드 */ }
}
```

단건 조회, 생성, 수정은 `data` 에 객체를 반환한다.
목록 조회는 `data` 에 배열을 반환한다.

**빈 응답 (삭제 등)**
```json
{
  "data": null
}
```

#### 9.2.4 공통 에러 포맷

```json
{
  "error": {
    "code": "VISIT_NOT_FOUND",
    "message": "해당 방문을 찾을 수 없습니다.",
    "details": [ /* 필드 레벨 오류 시 배열, 아니면 생략 */ ]
  }
}
```

**`details` 배열 구조 (Zod 유효성 실패 시)**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터가 유효하지 않습니다.",
    "details": [
      { "field": "birth_date", "message": "과거 날짜만 허용됩니다." },
      { "field": "name", "message": "2자 이상 입력해 주세요." }
    ]
  }
}
```

#### 9.2.5 HTTP 상태 코드 정책

| 코드 | 사용 상황 |
|------|-----------|
| `200 OK` | 조회, 수정, 계산 성공 |
| `201 Created` | 리소스 생성 성공 (`POST`) |
| `204 No Content` | 삭제 성공 |
| `400 Bad Request` | 유효성 검사 실패, 비즈니스 규칙 위반 |
| `401 Unauthorized` | 토큰 없음, 만료, 형식 오류 |
| `404 Not Found` | 리소스 없음 |
| `409 Conflict` | 중복 리소스 (동일 환자, 이미 생성된 처방 등) |
| `422 Unprocessable Entity` | Workflow 단계 전환 불가 (조건 미충족) |
| `500 Internal Server Error` | 서버 내부 오류 |

---

### 9.3 인증 API

#### `POST /api/auth/login`

로그인하여 JWT 액세스 토큰을 발급한다.

- **인증 불필요**

**Request Body**
```json
{
  "username": "pharmacist",
  "password": "pharmweave2026!"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `username` | string | Y | 로그인 아이디 |
| `password` | string | Y | 평문 비밀번호 (서버에서 bcrypt 비교) |

**Response `200 OK`**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "username": "pharmacist"
    }
  }
}
```

| 필드 | 설명 |
|------|------|
| `accessToken` | JWT 서명 토큰 (payload: `{ userId, iat, exp }`) |
| `expiresIn` | 만료까지 남은 초 (24시간 = 86400) |

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | username 또는 password 누락 |
| 401 | `INVALID_CREDENTIALS` | 아이디 또는 비밀번호 불일치 |

---

### 9.4 환자 API

#### `GET /api/patients`

이름 또는 생년월일로 환자를 검색한다.

- **인증 필요**

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `q` | string | Y | 검색어 (이름 2자 이상 또는 생년월일 YYYYMMDD) |

**처리 로직**
- 검색어가 8자리 숫자면 `birth_date` 기준 검색
- 그 외는 `name LIKE 'q%'` 전방 일치 검색
- `is_active`(환자 비활성화 없음) 제약 없음, 최대 10건 반환

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "홍길동",
      "birthDate": "1990-01-15",
      "phone": "01012345678",
      "createdAt": "2026-03-01T09:00:00Z"
    }
  ]
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `q` 파라미터 누락 또는 1자 이하 |

---

#### `POST /api/patients`

신규 환자를 등록한다.

- **인증 필요**

**Request Body**
```json
{
  "name": "홍길동",
  "birthDate": "1990-01-15",
  "phone": "01012345678"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `name` | string | Y | 2자 이상 50자 이하 |
| `birthDate` | string | Y | ISO 8601 날짜 (`YYYY-MM-DD`), 오늘 미만 |
| `phone` | string | N | 숫자 10~11자리 |

**Response `201 Created`**
```json
{
  "data": {
    "id": "uuid",
    "name": "홍길동",
    "birthDate": "1990-01-15",
    "phone": "01012345678",
    "createdAt": "2026-03-14T09:00:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 필수 필드 누락, 미래 생년월일, 전화번호 형식 오류 |
| 409 | `PATIENT_DUPLICATE` | 동일 이름 + 생년월일 환자 존재 (`UNIQUE (name, birth_date)` 위반) |

---

#### `GET /api/patients/:id`

환자 단건을 조회한다.

- **인증 필요**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 환자 ID |

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "name": "홍길동",
    "birthDate": "1990-01-15",
    "phone": "01012345678",
    "createdAt": "2026-03-01T09:00:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `PATIENT_NOT_FOUND` | 해당 ID 환자 없음 |

---

### 9.5 방문 API

#### `POST /api/visits`

방문을 접수하고 Workflow를 시작한다.

- **인증 필요**

**Request Body**
```json
{
  "patientId": "uuid"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `patientId` | UUID | Y | 접수할 환자 ID |

**처리 로직**
1. `patientId` 존재 여부 확인
2. 당일 동일 환자의 미완료 방문 존재 여부 조회 (경고만, 생성 허용)
3. `workflow_stage = reception`, `created_by = req.user.id`로 Visit 생성

**Response `201 Created`**
```json
{
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "workflowStage": "reception",
    "visitedAt": "2026-03-14T09:30:00Z",
    "createdAt": "2026-03-14T09:30:00Z",
    "warning": "해당 환자의 진행 중인 방문이 이미 존재합니다."
  }
}
```

> `warning` 필드: 당일 미완료 방문 존재 시에만 포함, 없으면 생략

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `patientId` 누락 또는 UUID 형식 오류 |
| 404 | `PATIENT_NOT_FOUND` | 해당 환자 없음 |

---

#### `GET /api/visits`

오늘의 방문 목록을 조회한다.

- **인증 필요**

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date` | string | N | `today` 고정값 (기본값: today). 다른 값 무시 |

**처리 로직**
- `DATE(visited_at) = CURRENT_DATE` 조건으로 필터링
- `visited_at` 오름차순 정렬 (접수 순서)
- 환자 정보 (`name`, `birthDate`) JOIN 포함

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": "uuid",
      "patient": {
        "id": "uuid",
        "name": "홍길동",
        "birthDate": "1990-01-15"
      },
      "workflowStage": "prescription",
      "visitedAt": "2026-03-14T09:30:00Z"
    }
  ]
}
```

---

#### `GET /api/visits/:id`

방문 정보를 전체 연관 데이터와 함께 조회한다.

> 검토(Review) 단계에서 전체 처방 요약 표시에 사용

- **인증 필요**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 방문 ID |

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "workflowStage": "review",
    "visitedAt": "2026-03-14T09:30:00Z",
    "patient": {
      "id": "uuid",
      "name": "홍길동",
      "birthDate": "1990-01-15",
      "phone": "01012345678"
    },
    "prescription": {
      "id": "uuid",
      "clinicName": "서울내과의원",
      "doctorName": "김의사",
      "prescribedAt": "2026-03-14",
      "items": [
        {
          "id": "uuid",
          "drugCode": "644900060",
          "drugName": "타이레놀 500mg",
          "unitPrice": 500,
          "quantity": 3,
          "days": 3
        }
      ]
    },
    "payment": null,
    "claim": null
  }
}
```

> `prescription`, `payment`, `claim`은 해당 단계 미진행 시 `null` 반환

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |

---

#### `PATCH /api/visits/:id/stage`

Workflow 단계를 다음 단계로 전환한다.

- **인증 필요**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 방문 ID |

**Request Body**
```json
{
  "stage": "prescription"
}
```

| 필드 | 타입 | 필수 | 허용값 |
|------|------|------|--------|
| `stage` | string | Y | `prescription` \| `dispensing` \| `review` \| `payment` \| `claim` \| `completed` |

**처리 로직 (WorkflowStateMachine)**

| 전환 | 전환 조건 (서버 검증) |
|------|----------------------|
| `reception → prescription` | 방문 생성 완료 (항상 허용) |
| `prescription → dispensing` | 처방 항목 1개 이상 존재 |
| `dispensing → review` | 처방 항목 존재 여부만 재확인 (체크박스는 클라이언트 전용) |
| `review → payment` | prescription 레코드 존재 |
| `payment → claim` | Payment 레코드 존재 |
| `claim → completed` | Claim 레코드 존재 |

> 역방향 전환 요청은 항상 `422` 반환

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "workflowStage": "prescription",
    "updatedAt": "2026-03-14T09:35:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `stage` 값이 허용된 ENUM 외 값 |
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 422 | `INVALID_STAGE_TRANSITION` | 역방향 전환 시도 또는 비순차 전환 시도 |
| 422 | `TRANSITION_CONDITION_NOT_MET` | 전환 조건 미충족 (예: 처방 항목 없음) |

---

### 9.6 처방 API

#### `POST /api/visits/:id/prescription`

방문에 처방전 기본 정보를 등록한다.

- **인증 필요**
- Visit의 `workflow_stage`가 `prescription` 이어야 함

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 방문 ID |

**Request Body**
```json
{
  "clinicName": "서울내과의원",
  "doctorName": "김의사",
  "prescribedAt": "2026-03-14"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `clinicName` | string | Y | 2자 이상 100자 이하 |
| `doctorName` | string | N | 최대 50자 |
| `prescribedAt` | string | Y | ISO 8601 날짜, 오늘 이하 (미래 불가) |

**Response `201 Created`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "clinicName": "서울내과의원",
    "doctorName": "김의사",
    "prescribedAt": "2026-03-14",
    "items": [],
    "createdAt": "2026-03-14T09:40:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 필수 필드 누락, 미래 처방일 |
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 409 | `PRESCRIPTION_ALREADY_EXISTS` | 해당 방문에 이미 처방 존재 (`visit_id` UNIQUE 위반) |

---

#### `GET /api/visits/:id/prescription`

방문의 처방 정보를 처방 항목 포함하여 조회한다.

- **인증 필요**

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "clinicName": "서울내과의원",
    "doctorName": "김의사",
    "prescribedAt": "2026-03-14",
    "items": [
      {
        "id": "uuid",
        "drugCode": "644900060",
        "drugName": "타이레놀 500mg",
        "unitPrice": 500,
        "quantity": 3,
        "days": 3,
        "createdAt": "2026-03-14T09:42:00Z"
      }
    ],
    "createdAt": "2026-03-14T09:40:00Z",
    "updatedAt": "2026-03-14T09:42:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 404 | `PRESCRIPTION_NOT_FOUND` | 해당 방문에 처방 없음 |

---

#### `PUT /api/prescriptions/:id`

처방전 기본 정보(헤더)를 수정한다. 처방 항목은 이 API에서 수정하지 않는다.

- **인증 필요**
- Visit의 `workflow_stage`가 `prescription` 이어야 함 (서버 검증)

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 처방 ID |

**Request Body**
```json
{
  "clinicName": "강남내과의원",
  "doctorName": "박의사",
  "prescribedAt": "2026-03-13"
}
```

> 모든 필드 필수 (`PUT` 전체 교체 의미론)

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "clinicName": "강남내과의원",
    "doctorName": "박의사",
    "prescribedAt": "2026-03-13",
    "updatedAt": "2026-03-14T09:50:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 필드 제약 위반 |
| 400 | `STAGE_NOT_EDITABLE` | 처방 단계가 아닌 방문의 처방 수정 시도 |
| 404 | `PRESCRIPTION_NOT_FOUND` | 해당 처방 없음 |

---

#### `POST /api/prescriptions/:id/items`

처방에 의약품 항목을 추가한다.

- **인증 필요**
- 처방이 속한 Visit의 `workflow_stage`가 `prescription` 이어야 함

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 처방 ID |

**Request Body**
```json
{
  "drugCode": "644900060",
  "quantity": 3,
  "days": 3
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `drugCode` | string | Y | Drug 마스터에 존재하며 `is_active = true` |
| `quantity` | integer | Y | 1 이상 9999 이하 |
| `days` | integer | Y | 1 이상 365 이하 |

**처리 로직**
1. `drugCode`로 Drug 마스터 조회 → `drug_name`, `unit_price` 스냅샷 추출
2. PrescriptionItem 생성 (스냅샷 포함)

**Response `201 Created`**
```json
{
  "data": {
    "id": "uuid",
    "prescriptionId": "uuid",
    "drugCode": "644900060",
    "drugName": "타이레놀 500mg",
    "unitPrice": 500,
    "quantity": 3,
    "days": 3,
    "createdAt": "2026-03-14T09:42:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 수량·투약일수 범위 초과 |
| 400 | `STAGE_NOT_EDITABLE` | 처방 단계가 아닌 상태에서 항목 추가 시도 |
| 404 | `PRESCRIPTION_NOT_FOUND` | 해당 처방 없음 |
| 404 | `DRUG_NOT_FOUND` | 해당 약품 코드 없음 또는 비활성 |

---

#### `DELETE /api/prescriptions/:id/items/:itemId`

처방에서 의약품 항목을 삭제한다.

- **인증 필요**
- 처방이 속한 Visit의 `workflow_stage`가 `prescription` 이어야 함

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 처방 ID |
| `itemId` | UUID | 처방 항목 ID |

**Response `204 No Content`**

응답 body 없음

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `STAGE_NOT_EDITABLE` | 처방 단계가 아닌 상태에서 삭제 시도 |
| 404 | `PRESCRIPTION_ITEM_NOT_FOUND` | 해당 항목 없음 또는 처방-항목 불일치 |

---

### 9.7 약품 API

#### `GET /api/drugs`

약품명 또는 코드로 약품을 검색한다.

- **인증 필요**

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `q` | string | Y | 약품명 전방 일치 또는 코드 완전 일치, 1자 이상 |

**처리 로직**
- 검색어가 숫자로만 구성된 경우 `drug_code = q` 완전 일치 검색
- 그 외 `drug_name LIKE 'q%'` 전방 일치 검색
- `is_active = true` 필터링
- 최대 20건 반환 (`drug_name` 오름차순 정렬)

**Response `200 OK`**
```json
{
  "data": [
    {
      "drugCode": "644900060",
      "drugName": "타이레놀 500mg",
      "unitPrice": 500
    }
  ]
}
```

> 복약지도 관련 필드(`dosageInstruction`, `cautions` 등)는 이 API에서 반환하지 않음 (용도 분리)

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `q` 파라미터 누락 |

---

### 9.8 수납 API

#### `POST /api/visits/:id/payment/calculate`

본인부담금을 계산하여 반환한다. Payment 레코드를 생성하지 않는다.

- **인증 필요**
- Visit의 `workflow_stage`가 `payment` 이어야 함

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 방문 ID |

**Request Body**

없음 (방문 ID로 처방 항목 조회하여 서버 계산)

**처리 로직 (CopayCalculator)**
```
약제비 = Σ (unit_price × quantity × days) per item
본인부담금 = 약제비 ≥ 10,000 → 약제비 × 30%
            약제비 < 10,000 → 약제비 × 20%
```

**Response `200 OK`**
```json
{
  "data": {
    "items": [
      {
        "drugCode": "644900060",
        "drugName": "타이레놀 500mg",
        "quantity": 3,
        "days": 3,
        "unitPrice": 500,
        "subtotal": 4500
      }
    ],
    "totalDrugCost": 4500,
    "copayRate": 0.20,
    "copayAmount": 900
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 422 | `PRESCRIPTION_ITEMS_EMPTY` | 처방 항목 없음 (비정상 상태) |

---

#### `POST /api/visits/:id/payment`

수납을 처리하고 Payment 레코드를 생성한다.

- **인증 필요**
- Visit의 `workflow_stage`가 `payment` 이어야 함
- 이미 Payment 레코드가 존재하면 `409` 반환

**Request Body**
```json
{
  "method": "card"
}
```

| 필드 | 타입 | 필수 | 허용값 |
|------|------|------|--------|
| `method` | string | Y | `cash` \| `card` |

**처리 로직**
1. 처방 항목 기반 본인부담금 재계산 (CopayCalculator 재호출)
2. Payment 레코드 생성 (`total_drug_cost`, `copay_amount`, `method`, `paid_at`)

**Response `201 Created`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "totalDrugCost": 4500,
    "copayAmount": 900,
    "method": "card",
    "paidAt": "2026-03-14T10:20:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `method` 누락 또는 허용값 외 |
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 409 | `PAYMENT_ALREADY_EXISTS` | 이미 수납 완료된 방문 |
| 422 | `WRONG_WORKFLOW_STAGE` | 수납 단계가 아닌 방문 |

---

#### `GET /api/visits/:id/payment`

방문의 수납 정보를 조회한다.

- **인증 필요**

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "totalDrugCost": 4500,
    "copayAmount": 900,
    "method": "card",
    "paidAt": "2026-03-14T10:20:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 404 | `PAYMENT_NOT_FOUND` | 수납 미완료 방문 |

---

### 9.9 청구 API

#### `POST /api/visits/:id/claim`

청구 데이터를 생성한다. 멱등성을 보장한다 — 이미 Claim 레코드가 있으면 기존 레코드를 반환한다.

- **인증 필요**
- Visit의 `workflow_stage`가 `claim` 이어야 함
- Payment 레코드가 존재해야 함

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 방문 ID |

**처리 로직 (ClaimDataBuilder)**
1. Visit → Patient → Prescription → PrescriptionItems → Payment 조회
2. `claim_data` JSONB 구조 생성:
   - `insurance_claim_amount = total_drug_cost - copay_amount`
   - 각 항목의 `claim_amount = unit_price × quantity × days`
3. Claim 레코드 생성 (`status = pending`)

**Response `201 Created`** (신규 생성) / **`200 OK`** (기존 반환)
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "status": "pending",
    "claimData": {
      "patient": { "name": "홍길동", "birthDate": "1990-01-15" },
      "clinicName": "서울내과의원",
      "prescribedAt": "2026-03-14",
      "items": [
        {
          "drugCode": "644900060",
          "drugName": "타이레놀 500mg",
          "quantity": 3,
          "days": 3,
          "unitPrice": 500,
          "claimAmount": 4500
        }
      ],
      "totalDrugCost": 4500,
      "copayAmount": 900,
      "insuranceClaimAmount": 3600,
      "generatedAt": "2026-03-14T10:30:00Z"
    },
    "createdAt": "2026-03-14T10:30:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 422 | `PAYMENT_REQUIRED` | Payment 레코드 없음 |
| 422 | `WRONG_WORKFLOW_STAGE` | 청구 단계가 아닌 방문 |

---

#### `GET /api/visits/:id/claim`

방문의 청구 정보를 조회한다.

- **인증 필요**

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "status": "pending",
    "claimData": { /* POST /api/visits/:id/claim 응답과 동일 */ },
    "completedAt": null,
    "createdAt": "2026-03-14T10:30:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |
| 404 | `CLAIM_NOT_FOUND` | 청구 미생성 방문 |

---

#### `PATCH /api/claims/:id`

청구 상태를 완료로 변경한다.

- **인증 필요**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | UUID | 청구 ID |

**Request Body**
```json
{
  "status": "completed"
}
```

| 필드 | 타입 | 필수 | 허용값 |
|------|------|------|--------|
| `status` | string | Y | `completed` (현재 `pending → completed` 단방향만 허용) |

**처리 로직**
1. Claim 레코드 `status = completed`, `completed_at = now()` 업데이트
2. 이후 프론트엔드에서 별도로 `PATCH /api/visits/:id/stage { stage: "completed" }` 호출

**Response `200 OK`**
```json
{
  "data": {
    "id": "uuid",
    "visitId": "uuid",
    "status": "completed",
    "completedAt": "2026-03-14T10:35:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `status` 값이 `completed` 외 |
| 404 | `CLAIM_NOT_FOUND` | 해당 청구 없음 |
| 409 | `CLAIM_ALREADY_COMPLETED` | 이미 완료 처리된 청구 |

---

### 9.10 Plugin API

#### `GET /api/plugins`

등록된 Plugin 목록과 ON/OFF 상태를 조회한다.

- **인증 필요**

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": "medication-guide",
      "name": "복약지도 생성",
      "description": "처방 완료 후 약품별 복약 방법과 주의사항 안내 자료를 자동 생성합니다.",
      "triggerStage": "payment",
      "enabled": true,
      "updatedAt": "2026-03-14T09:00:00Z"
    }
  ]
}
```

---

#### `PATCH /api/plugins/:pluginId`

Plugin의 활성화 여부를 변경한다.

- **인증 필요**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `pluginId` | string | Plugin 슬러그 (예: `medication-guide`) |

**Request Body**
```json
{
  "enabled": true
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `enabled` | boolean | Y | 활성화 여부 |

**Response `200 OK`**
```json
{
  "data": {
    "id": "medication-guide",
    "name": "복약지도 생성",
    "enabled": true,
    "updatedAt": "2026-03-14T10:00:00Z"
  }
}
```

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `enabled` 필드 누락 또는 boolean 외 타입 |
| 404 | `PLUGIN_NOT_FOUND` | 해당 pluginId 없음 |

---

#### `POST /api/plugins/medication-guide/execute`

복약지도 Plugin을 실행하여 처방 약품별 복약 안내 데이터를 반환한다.

- **인증 필요**
- Plugin이 `enabled: false` 이면 `{ skipped: true }` 반환 (에러 아님)

**Request Body**
```json
{
  "visitId": "uuid"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `visitId` | UUID | Y | 복약지도를 생성할 방문 ID |

**처리 로직**
1. `PluginConfig.enabled` 확인 → `false`면 `skipped: true` 즉시 반환
2. Visit → Prescription → PrescriptionItems 조회
3. 각 `drug_code`로 Drug 마스터의 복약지도 컬럼 조회
4. 복약지도 구조 생성 후 반환 (DB 저장 없음)

**Response `200 OK`** — Plugin 실행 성공
```json
{
  "data": {
    "skipped": false,
    "visitId": "uuid",
    "patientName": "홍길동",
    "generatedAt": "2026-03-14T10:25:00Z",
    "guides": [
      {
        "drugCode": "644900060",
        "drugName": "타이레놀 500mg",
        "dosageInstruction": "1회 1정, 1일 3회 (식후 30분)",
        "cautions": "음주 중 복용 금지, 다른 해열진통제와 병용 금지",
        "sideEffects": "소화불량, 오심",
        "storage": "실온(1~30°C) 보관, 직사광선 차단"
      }
    ]
  }
}
```

**Response `200 OK`** — Plugin 비활성 상태
```json
{
  "data": {
    "skipped": true
  }
}
```

> `guides` 항목 중 복약지도 데이터 미등록 약품은 해당 필드를 `null`로 반환

**에러 케이스**

| HTTP | code | 상황 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | `visitId` 누락 또는 UUID 형식 오류 |
| 404 | `VISIT_NOT_FOUND` | 해당 방문 없음 |

---

### 9.11 전체 엔드포인트 요약

| # | Method | Endpoint | 인증 | 설명 | Workflow 단계 |
|---|--------|----------|------|------|--------------|
| 1 | POST | `/api/auth/login` | ✗ | 로그인 및 JWT 발급 | — |
| 2 | GET | `/api/patients` | ✓ | 환자 검색 (`?q=`) | 접수 |
| 3 | POST | `/api/patients` | ✓ | 신규 환자 등록 | 접수 |
| 4 | GET | `/api/patients/:id` | ✓ | 환자 단건 조회 | — |
| 5 | POST | `/api/visits` | ✓ | 방문 접수 | 접수 |
| 6 | GET | `/api/visits` | ✓ | 오늘 방문 목록 (`?date=today`) | 관리 |
| 7 | GET | `/api/visits/:id` | ✓ | 방문 전체 정보 조회 | 검토 |
| 8 | PATCH | `/api/visits/:id/stage` | ✓ | Workflow 단계 전환 | 전체 |
| 9 | POST | `/api/visits/:id/prescription` | ✓ | 처방 등록 | 처방 |
| 10 | GET | `/api/visits/:id/prescription` | ✓ | 처방 조회 | 처방 |
| 11 | PUT | `/api/prescriptions/:id` | ✓ | 처방 헤더 수정 | 처방 |
| 12 | POST | `/api/prescriptions/:id/items` | ✓ | 처방 항목 추가 | 처방 |
| 13 | DELETE | `/api/prescriptions/:id/items/:itemId` | ✓ | 처방 항목 삭제 | 처방 |
| 14 | GET | `/api/drugs` | ✓ | 약품 검색 (`?q=`) | 처방 |
| 15 | POST | `/api/visits/:id/payment/calculate` | ✓ | 본인부담금 계산 (미저장) | 수납 |
| 16 | POST | `/api/visits/:id/payment` | ✓ | 수납 처리 | 수납 |
| 17 | GET | `/api/visits/:id/payment` | ✓ | 수납 정보 조회 | 수납 |
| 18 | POST | `/api/visits/:id/claim` | ✓ | 청구 생성 (멱등) | 청구 |
| 19 | GET | `/api/visits/:id/claim` | ✓ | 청구 조회 | 청구 |
| 20 | PATCH | `/api/claims/:id` | ✓ | 청구 완료 처리 | 청구 |
| 21 | GET | `/api/plugins` | ✓ | Plugin 목록 조회 | Plugin 관리 |
| 22 | PATCH | `/api/plugins/:pluginId` | ✓ | Plugin ON/OFF 변경 | Plugin 관리 |
| 23 | POST | `/api/plugins/medication-guide/execute` | ✓ | 복약지도 생성 실행 | 수납 완료 후 |

---

### 9.12 Zod 요청 스키마 정의

Backend `schemas/` 디렉토리에 아래 스키마를 정의한다.

```typescript
// schemas/patientSchema.ts
export const createPatientSchema = z.object({
  name: z.string().min(2).max(50),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    d => new Date(d) < new Date(), { message: '과거 날짜만 허용됩니다.' }
  ),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
});

// schemas/visitSchema.ts
export const createVisitSchema = z.object({
  patientId: z.string().uuid(),
});

export const stageSchema = z.object({
  stage: z.enum(['prescription','dispensing','review','payment','claim','completed']),
});

// schemas/prescriptionSchema.ts
export const createPrescriptionSchema = z.object({
  clinicName: z.string().min(2).max(100),
  doctorName: z.string().max(50).optional(),
  prescribedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    d => new Date(d) <= new Date(), { message: '미래 처방일은 허용되지 않습니다.' }
  ),
});

export const addPrescriptionItemSchema = z.object({
  drugCode: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(9999),
  days: z.number().int().min(1).max(365),
});

// schemas/paymentSchema.ts
export const createPaymentSchema = z.object({
  method: z.enum(['cash', 'card']),
});

// schemas/pluginSchema.ts
export const togglePluginSchema = z.object({
  enabled: z.boolean(),
});

export const executePluginSchema = z.object({
  visitId: z.string().uuid(),
});
```

---

## 10. UI/UX 설계

---

### 10.1 설계 원칙

PharmWeave의 UI/UX는 다음 4가지 핵심 원칙을 기반으로 설계한다.

| 원칙 | 내용 | 적용 방향 |
|------|------|-----------|
| **컨텍스트 연속성** | 업무 흐름이 끊기지 않도록 현재 단계와 다음 단계를 항상 명시 | 상단 Stepper에 현재 단계 고정 표시, 환자 정보 헤더 전 단계 유지 |
| **오류 예방 우선** | 잘못된 입력을 사후 수정이 아닌 사전 차단으로 처리 | 버튼 비활성화, 인라인 유효성 검사, 파괴적 액션 확인 다이얼로그 |
| **인지 부하 최소화** | 각 단계에서 해당 단계에 필요한 정보만 노출 | 기능 메뉴 전체 노출 대신 단계별 컨텍스트 UI만 표시 |
| **상태 가시성** | 사용자가 지금 무엇을 하고 있는지 항상 명확히 인지 | Stepper 상태 색상, 로딩 인디케이터, 완료 확인 피드백 |

---

### 10.2 디자인 시스템

#### 10.2.1 색상 체계 (Color System)

Tailwind CSS 기반 색상 토큰을 사용한다.

| 용도 | 색상 토큰 | Hex | 적용 예시 |
|------|----------|-----|-----------|
| **Primary** | `blue-600` | `#2563EB` | 활성 단계 Stepper, CTA 버튼 |
| **Success** | `green-600` | `#16A34A` | 완료 단계 Stepper, 수납 완료 배지 |
| **Warning** | `amber-500` | `#F59E0B` | 경고 메시지, 중복 약품 알림 |
| **Danger** | `red-600` | `#DC2626` | 에러 상태, 필수 필드 미입력 |
| **Neutral** | `gray-400` | `#9CA3AF` | 미완료 단계, 비활성 요소 |
| **Surface** | `gray-50` | `#F9FAFB` | 카드 배경, 읽기 전용 영역 |
| **Border** | `gray-200` | `#E5E7EB` | 구분선, 입력 필드 테두리 |

> **접근성:** WCAG AA 기준 충족 — Primary/Success/Danger 색상은 흰색 배경 대비 4.5:1 이상.

#### 10.2.2 타이포그래피 (Typography)

| 레벨 | Tailwind 클래스 | 용도 |
|------|----------------|------|
| **Heading 1** | `text-2xl font-bold` | 페이지 제목 (단계명) |
| **Heading 2** | `text-lg font-semibold` | 섹션 제목 (환자 정보, 처방 항목) |
| **Body** | `text-sm` | 일반 본문, 테이블 내용 |
| **Caption** | `text-xs text-gray-500` | 보조 설명, 타임스탬프 |
| **Label** | `text-sm font-medium` | 입력 필드 라벨 |
| **Mono** | `font-mono text-sm` | 약품 코드, ID 표시 |

#### 10.2.3 스페이싱 원칙

- 카드 내부 패딩: `p-6` (24px)
- 섹션 간 간격: `space-y-6` (24px)
- 입력 필드 간격: `space-y-4` (16px)
- 버튼 간격: `gap-3` (12px)

#### 10.2.4 공통 컴포넌트 명세

**버튼 (Button)**

| 타입 | Tailwind 클래스 | 사용 케이스 |
|------|----------------|------------|
| Primary | `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg` | 단계 진행, 저장 |
| Secondary | `border border-gray-300 text-gray-700 px-4 py-2 rounded-lg` | 취소, 이전 |
| Destructive | `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg` | 삭제 |
| Disabled | `bg-gray-200 text-gray-400 cursor-not-allowed` | 조건 미충족 |
| Ghost | `text-blue-600 hover:bg-blue-50 px-3 py-1 rounded` | 인라인 액션 |

**입력 필드 (Input)**
```
기본: border border-gray-300 rounded-lg px-3 py-2 text-sm
포커스: focus:ring-2 focus:ring-blue-500 focus:border-blue-500
에러: border-red-500 + 하단 text-red-600 text-xs 에러 메시지
비활성: bg-gray-50 cursor-not-allowed (읽기 전용 단계)
```

**배지 (Badge)**

| 상태 | 색상 | 텍스트 예시 |
|------|------|------------|
| 완료 | `bg-green-100 text-green-700` | 수납 완료 |
| 진행 중 | `bg-blue-100 text-blue-700` | 조제 중 |
| 대기 | `bg-gray-100 text-gray-600` | 접수 대기 |
| 경고 | `bg-amber-100 text-amber-700` | 확인 필요 |

**토스트 알림 (Toast)**
- 위치: 화면 우측 하단 `fixed bottom-4 right-4`
- 표시 시간: 3초 자동 소멸
- 성공: `bg-green-50 border-l-4 border-green-500`
- 에러: `bg-red-50 border-l-4 border-red-500`
- 경고: `bg-amber-50 border-l-4 border-amber-500`

---

### 10.3 전체 레이아웃 구조

```
┌──────────────────────────────────────────────────────────────┐
│  Header (고정, h-16)                                          │
│  [PharmWeave 로고]              [오늘 날짜] [사용자명] [로그아웃] │
├──────────────────────────────────────────────────────────────┤
│  Workflow Stepper (고정, h-14)                                │
│  [접수 ✓] ─── [처방 ✓] ─── [조제 ●] ─── [검토] ─── [수납] ─── [청구] │
├──────────────────────────────────────────────────────────────┤
│  Patient Context Bar (방문 진행 중일 때만 표시, h-10)           │
│  현재 환자: 홍길동 (1990.01.01) · 방문 #2026-0314-001          │
├───────────────────────────────────┬──────────────────────────┤
│  Main Content Area                │  Today's Visit List      │
│  (단계별 업무 화면)                  │  (사이드바, w-72)          │
│  flex-1                           │  ─────────────────────── │
│                                   │  오늘의 방문 목록            │
│                                   │  홍길동  조제 중  [이어서]  │
│                                   │  김영희  처방    [이어서]  │
│                                   │  이철수  완료   [조회]    │
└───────────────────────────────────┴──────────────────────────┘
```

**레이아웃 원칙:**
- Header + Stepper + Patient Bar는 `sticky top-0 z-50` 고정
- Main Content는 `max-w-3xl mx-auto` 중앙 정렬 (집중 작업 영역)
- Today's Visit List는 `hidden lg:block` — 대형 화면에서만 표시
- 전체 min-height: `100vh`로 빈 화면 방지

---

### 10.4 Workflow Stepper 상세 설계

#### 10.4.1 Stepper 컴포넌트 구조

```
┌─────────────────────────────────────────────────────────────────┐
│  [접수 ✓] ───── [처방 ✓] ───── [조제 ●] ───── [검토] ─── [수납] ─── [청구] │
└─────────────────────────────────────────────────────────────────┘
```

**단계 상태 표현:**

| 상태 | 아이콘 | 배경 | 텍스트 | 연결선 |
|------|--------|------|--------|--------|
| 완료 (completed) | `✓` (체크마크) | `bg-green-600` | `text-green-700 font-medium` | `bg-green-300` |
| 현재 (active) | 숫자 (1~6) | `bg-blue-600` | `text-blue-700 font-bold` | `bg-gray-300` |
| 미진행 (pending) | 숫자 (1~6) | `bg-white border-2 border-gray-300` | `text-gray-400` | `bg-gray-200` |

**Stepper 클릭 동작:**
- 완료된 단계 클릭 → 해당 단계 읽기 전용 조회 모드로 이동 (단계 역행 금지)
- 현재 단계 클릭 → 아무 동작 없음
- 미진행 단계 클릭 → 비활성, 클릭 불가 (`cursor-not-allowed`)

#### 10.4.2 단계명 및 부제목

| 단계 | 표시명 | 부제목 (hover 툴팁) |
|------|--------|---------------------|
| 1 | 접수 | 환자 확인 및 방문 등록 |
| 2 | 처방 | 처방전 내용 입력 |
| 3 | 조제 | 약품 조제 확인 |
| 4 | 검토 | 처방 최종 검토 |
| 5 | 수납 | 본인부담금 결제 |
| 6 | 청구 | 보험 청구 완료 |

---

### 10.5 단계별 화면 상세 설계

#### 10.5.1 단계 1: 접수 (Reception)

**화면 목표:** 약 15초 이내에 환자를 찾거나 등록하고 다음 단계로 진행

```
┌──────────────────────────────────────────────────────┐
│  접수                                                  │
│  환자를 검색하거나 신규 등록하세요.                        │
├──────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┐  ┌─────────────┐ │
│  │  이름 또는 생년월일(8자리) 입력   │  │  검색       │ │
│  └────────────────────────────────┘  └─────────────┘ │
│                                                        │
│  ─── 검색 결과 ────────────────────────────────────── │
│  │ 홍길동    1990.01.01    010-1234-5678    [선택]   │  │
│  │ 홍길순    1992.03.15    010-9876-5432    [선택]   │  │
│  ─────────────────────────────────────────────────── │
│                                                        │
│  검색 결과가 없으신가요?  [+ 신규 환자 등록]             │
│                                                        │
│  ─── 선택된 환자 ──────────────────────────────────── │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ● 홍길동  ·  1990.01.01  ·  010-1234-5678      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│                      [다음: 처방 입력 →]               │
└──────────────────────────────────────────────────────┘
```

**핵심 인터랙션:**
- 검색창 포커스 시 자동 안내 플레이스홀더: `홍길동 또는 19900101`
- 검색 결과 행 hover → `bg-blue-50` 하이라이트
- 환자 [선택] 시 → "선택된 환자" 박스에 `border-2 border-blue-500 bg-blue-50`로 선택 확정 표시
- [다음: 처방 입력] 버튼: 환자 선택 전 `disabled`, 선택 후 `bg-blue-600` 활성화

**신규 환자 등록 폼 (인라인 확장):**
```
┌──── 신규 환자 등록 ──────────────────────────────────────┐
│  이름 *         [홍길동                              ]   │
│  생년월일 *     [1990  - 01  - 01                   ]   │
│  전화번호       [010 - 1234 - 5678                  ]   │
│                              [취소]  [등록 및 선택]      │
└──────────────────────────────────────────────────────────┘
```
- 폼은 "검색 결과가 없습니다" 상태 또는 [+ 신규 환자 등록] 클릭 시 슬라이드 다운 애니메이션으로 펼침
- 중복 환자 감지 시 인라인 경고: `⚠️ 동일한 환자(홍길동, 1990.01.01)가 이미 등록되어 있습니다. [기존 환자 선택하기]`

---

#### 10.5.2 단계 2: 처방 (Prescription)

**화면 목표:** 처방전 사진을 보며 빠르게 입력 — 약품 검색은 2회 키입력 내 결과 표시

```
┌──────────────────────────────────────────────────────┐
│  처방 입력                                             │
│  홍길동 · 1990.01.01                                  │
├──────────────────────────────────────────────────────┤
│  처방전 정보                                           │
│  의료기관명 *   [OO의원                           ]   │
│  처방 의사      [김의사                           ]   │
│  처방일 *       [2026-03-14           📅]            │
├──────────────────────────────────────────────────────┤
│  처방 의약품 추가                                       │
│  ┌──────────────────────────────┐  수량  투약일수      │
│  │  약품명 또는 코드 입력         │  [3 ] [5  ]  [추가] │
│  └──────────────────────────────┘                    │
│  ┌── 검색 결과 드롭다운 ──────────────────────────┐   │
│  │  타이레놀 500mg     644900060     500원/정     │   │
│  │  타이레놀 ER 650mg  644900061     650원/정     │   │
│  └────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│  처방 항목 (2개)                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │ 약품명           코드        수량   투약일수  삭제 │   │
│  │ 타이레놀 500mg   644900060   3정   5일    [✕] │   │
│  │ 아목시실린 250mg 644200030   1캡   7일    [✕] │   │
│  └───────────────────────────────────────────────┘   │
│                                                        │
│                         [다음: 조제 확인 →]            │
└──────────────────────────────────────────────────────┘
```

**핵심 인터랙션:**
- 약품 검색: 2자 이상 입력 시 실시간 드롭다운 (`debounce 300ms`)
- 드롭다운 항목 선택 후 수량/투약일수 필드 자동 포커스
- `Enter` 키로 [추가] 버튼 트리거
- 처방 항목 [✕] 삭제: 확인 다이얼로그 없이 즉시 삭제 + 토스트 "삭제되었습니다"
- 동일 약품 중복 추가 시: `⚠️ 이미 추가된 약품입니다. 계속 추가하시겠습니까?` 인라인 경고

---

#### 10.5.3 단계 3: 조제 (Dispensing)

**화면 목표:** 실물 약품을 확인하며 체크리스트를 빠르게 완료 — 마우스 없이 키보드로도 가능

```
┌──────────────────────────────────────────────────────┐
│  조제 확인                                             │
│  홍길동 · OO의원 · 2026-03-14                         │
├──────────────────────────────────────────────────────┤
│  처방 의약품을 하나씩 확인하고 체크해주세요.               │
│                                                        │
│  진행: ████████░░  2 / 3 확인 완료                    │
│                                         [전체 확인]   │
│                                                        │
│  ┌───────────────────────────────────────────────┐   │
│  │ ✓  타이레놀 500mg    644900060   3정  ×  5일  │   │
│  │ ✓  아목시실린 250mg  644200030   1캡  ×  7일  │   │
│  │ □  비타민C 1000mg   600000010   1정  ×  30일 │   │← 미확인 항목 배경 amber-50
│  └───────────────────────────────────────────────┘   │
│                                                        │
│  ⓘ 처방 내용 수정이 필요하면 처방 단계로 문의하세요.      │
│                                                        │
│              [다음: 검토 →]  (전체 확인 후 활성화)       │
└──────────────────────────────────────────────────────┘
```

**핵심 인터랙션:**
- 체크박스 체크 시 해당 행 배경: `bg-green-50` + 텍스트 `text-gray-400 line-through` (시각적 완료 표시)
- 미체크 항목: 배경 `bg-amber-50` — 시각적으로 주의 유도
- 진행률 바 (shadcn/ui Progress): 체크 수 / 전체 수 비율로 실시간 업데이트
- [전체 확인] 버튼: 모든 체크박스 일괄 체크 + 200ms 애니메이션 순차 체크 효과
- [다음: 검토] 버튼: 미체크 항목 존재 시 `disabled` + hover 툴팁 "모든 항목을 확인해 주세요"

---

#### 10.5.4 단계 4: 검토 (Review)

**화면 목표:** 약사가 처방 전체를 한눈에 파악하고 승인 결정

```
┌──────────────────────────────────────────────────────┐
│  처방 검토                                             │
├──────────────────────────────────────────────────────┤
│  환자 정보                          처방전 정보         │
│  이름: 홍길동                       의료기관: OO의원    │
│  생년월일: 1990.01.01               처방 의사: 김의사   │
│  방문일시: 2026-03-14 10:30         처방일: 2026-03-14 │
├──────────────────────────────────────────────────────┤
│  처방 항목 (3개)                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │  약품명           코드        수량   투약일수    │   │
│  │  타이레놀 500mg   644900060   3정   5일        │   │
│  │  아목시실린 250mg 644200030   1캡   7일        │   │
│  │  비타민C 1000mg   600000010   1정   30일       │   │
│  └───────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  Plugin 영역 (medication-guide가 활성화된 경우)         │
│  ┌───────────────────────────────────────────────┐   │
│  │  ✅ 복약지도 Plugin 활성화됨                    │   │
│  │  수납 완료 후 복약지도가 자동 생성됩니다.         │   │
│  └───────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│                  [검토 승인 및 수납으로 이동 →]          │
└──────────────────────────────────────────────────────┘
```

**핵심 인터랙션:**
- 모든 정보는 읽기 전용 (`bg-gray-50`, 편집 불가 표시)
- [검토 승인] 버튼 클릭 시 확인 다이얼로그:
  ```
  처방 내용을 최종 승인하시겠습니까?
  승인 후에는 처방 내용을 수정할 수 없습니다.
  [취소]  [승인]
  ```
- Plugin이 OFF 상태면 Plugin 영역 완전 숨김

---

#### 10.5.5 단계 5: 수납 (Payment)

**화면 목표:** 금액 확인 → 결제 수단 선택 → 수납 완료를 30초 이내 처리

```
┌──────────────────────────────────────────────────────┐
│  수납                                                  │
│  홍길동 · 처방 3종                                     │
├──────────────────────────────────────────────────────┤
│  수납 내역                                             │
│  ┌───────────────────────────────────────────────┐   │
│  │  총 약제비                       5,000원        │   │
│  │  본인부담금 (30%)               1,500원        │   │
│  │  ─────────────────────────────────────────   │   │
│  │  최종 결제 금액                  1,500원  ← 강조│   │
│  └───────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  결제 수단                                             │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │  💵  현금         │  │  💳  카드         │         │
│  └──────────────────┘  └──────────────────┘         │
│      ↑ 선택 시 border-blue-500 + bg-blue-50          │
├──────────────────────────────────────────────────────┤
│                         [수납 완료]                    │
└──────────────────────────────────────────────────────┘
```

**수납 완료 후 화면 전환:**
```
┌──────────────────────────────────────────────────────┐
│  ✅ 수납 완료                                          │
│  홍길동 · 1,500원 · 카드 결제                          │
│  2026-03-14 10:45                                    │
│                                                        │
│  [복약지도 보기]  (Plugin ON 시)                        │
│                         [다음: 청구 →]                 │
└──────────────────────────────────────────────────────┘
```

**핵심 인터랙션:**
- 결제 수단 선택: 카드형 라디오 버튼 (shadcn/ui RadioGroup)
- 결제 금액: `text-3xl font-bold text-blue-600` 강조 표시
- [수납 완료] 클릭 시 로딩 스피너 (중복 클릭 방지 `disabled`)
- 수납 완료 직후 Plugin(복약지도) ON이면 → 슬라이드 패널 자동 오픈

---

#### 10.5.6 단계 6: 청구 (Claim)

**화면 목표:** 청구 데이터를 최종 확인하고 한 번의 클릭으로 완료

```
┌──────────────────────────────────────────────────────┐
│  보험 청구                                             │
│  청구 상태: ● 대기 중                                  │
├──────────────────────────────────────────────────────┤
│  청구 데이터 요약                                       │
│  환자: 홍길동 (1990.01.01)                             │
│  의료기관: OO의원 · 처방일: 2026-03-14                  │
├──────────────────────────────────────────────────────┤
│  청구 항목                                             │
│  ┌─────────────────────────────────────────────────┐ │
│  │ 약품코드    약품명         수량  투약일수  청구금액 │ │
│  │ 644900060  타이레놀 500mg  3정  5일     750원    │ │
│  │ 644200030  아목시실린 250mg 1캡  7일    1,400원   │ │
│  │ 600000010  비타민C 1000mg  1정  30일   1,350원   │ │
│  │ ──────────────────────────────────────────────  │ │
│  │ 총 약제비: 5,000원  ·  보험 청구금액: 3,500원     │ │
│  └─────────────────────────────────────────────────┘ │
│                                                        │
│                      [청구 완료]                       │
└──────────────────────────────────────────────────────┘
```

**청구 완료 후 완료 화면:**
```
┌──────────────────────────────────────────────────────┐
│                                                        │
│          ✅                                            │
│     청구가 완료되었습니다                               │
│                                                        │
│     홍길동 · 2026-03-14 · 청구금액 3,500원             │
│                                                        │
│          [새 환자 접수하기]                             │
│                                                        │
└──────────────────────────────────────────────────────┘
```
- 완료 화면 3초 표시 후 자동으로 접수 단계 리다이렉트
- 또는 [새 환자 접수하기] 클릭으로 즉시 이동

---

### 10.6 오늘의 방문 목록 (Today's Visit List)

```
┌──────────────────────────────────┐
│  오늘의 방문                       │
│  2026-03-14  ·  3건               │
├──────────────────────────────────┤
│  홍길동                           │
│  10:30  조제 중  ●                │
│                     [이어서 진행]  │
├──────────────────────────────────┤
│  김영희                           │
│  11:15  처방 입력  ●              │
│                     [이어서 진행]  │
├──────────────────────────────────┤
│  이철수                           │
│  09:00  완료  ✓                  │
│                         [조회]    │
└──────────────────────────────────┘
```

**인터랙션:**
- 목록 자동 갱신: 30초마다 `GET /api/visits?date=today` 폴링
- 완료 방문(completed) 행: `opacity-60`, [조회] 버튼만 표시 (읽기 전용)
- 진행 중 방문 행 hover: `bg-blue-50`
- [이어서 진행] 클릭 → 해당 방문의 현재 `workflow_stage`로 즉시 라우팅

---

### 10.7 복약지도 Plugin UI (Medication Guide Panel)

수납 완료 직후 오른쪽에서 슬라이드 인 (shadcn/ui Sheet 컴포넌트):

```
                              ┌────────────────────────────────────┐
                              │  복약지도                    [✕ 닫기] │
                              │  홍길동 님 · 2026-03-14            │
                              ├────────────────────────────────────┤
                              │  ┌──────────────────────────────┐  │
                              │  │  타이레놀 500mg               │  │
                              │  │  복용 방법                    │  │
                              │  │  1회 1정, 1일 3회 (식후 30분) │  │
                              │  │  주의사항                     │  │
                              │  │  음주 중 복용 금지             │  │
                              │  │  부작용                       │  │
                              │  │  소화불량, 오심               │  │
                              │  │  보관                        │  │
                              │  │  실온 보관, 직사광선 피할 것   │  │
                              │  └──────────────────────────────┘  │
                              │  ┌──────────────────────────────┐  │
                              │  │  아목시실린 250mg  ...         │  │
                              │  └──────────────────────────────┘  │
                              ├────────────────────────────────────┤
                              │        [🖨️ 인쇄]    [닫기]         │
                              └────────────────────────────────────┘
```

**인터랙션:**
- 패널 오픈 애니메이션: `translate-x-full → translate-x-0` (300ms ease-out)
- 생성 중 로딩: 패널 내부 스켈레톤 UI (shimmer 효과)
- [인쇄] → `window.print()` + `@media print` 흑백 최적화 스타일
- 패널 닫은 후 수납 화면에 [복약지도 보기] 버튼 잔류

---

### 10.8 Plugin 관리 화면

```
┌──────────────────────────────────────────────────────┐
│  Plugin 관리                                          │
│  설치된 Plugin의 활성화 여부를 설정합니다.               │
├──────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐ │
│  │ Plugin 명     실행 단계  상태        액션          │ │
│  │ ─────────────────────────────────────────────── │ │
│  │ 복약지도 생성  수납      ● ON    [OFF로 변경]      │ │
│  │ 처방 완료 후 약품별 복약 방법과 주의사항을 자동 생성 │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**인터랙션:**
- ON 상태 배지: `bg-green-100 text-green-700 ● ON`
- OFF 상태 배지: `bg-gray-100 text-gray-500 ○ OFF`
- 토글 클릭 → 즉시 반영 (optimistic update) + 서버 동기화 실패 시 롤백 + 에러 토스트

---

### 10.9 에러 상태 및 빈 화면 처리

#### 빈 상태 (Empty State)

| 상황 | 표시 내용 |
|------|-----------|
| 환자 검색 결과 없음 | `🔍 검색 결과가 없습니다. 신규 환자로 등록하시겠습니까?` + [등록하기] 버튼 |
| 오늘 방문 목록 없음 | `📋 오늘 접수된 방문이 없습니다.` |
| 처방 항목 없음 | `💊 처방 의약품을 추가해 주세요.` |
| Plugin 없음 | `🔌 설치된 Plugin이 없습니다.` |

#### 에러 상태 (Error State)

| 에러 유형 | 처리 방식 |
|-----------|-----------|
| API 호출 실패 | 우측 하단 에러 토스트 + [재시도] 버튼 |
| 네트워크 오류 | 페이지 중앙 `⚠️ 서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.` |
| 401 Unauthorized | 로그인 페이지 자동 리다이렉트 |
| 단계 전환 실패 | 인라인 에러 메시지 + 현재 단계 유지 |

#### 로딩 상태 (Loading State)

| 상황 | 표시 방식 |
|------|-----------|
| 환자 검색 중 | 검색창 우측 스피너 아이콘 |
| 단계 전환 중 | 버튼 내 로딩 스피너 + `disabled` |
| 본인부담금 계산 중 | 금액 영역 스켈레톤 UI |
| 복약지도 생성 중 | 패널 내 카드 스켈레톤 (shimmer) |

---

### 10.10 반응형 및 접근성

#### 반응형 브레이크포인트

| 화면 크기 | 적용 레이아웃 |
|-----------|--------------|
| `lg` (1024px+) | 메인 콘텐츠 + 오늘의 방문 사이드바 표시 |
| `md` (768px~1023px) | 메인 콘텐츠만, 사이드바 숨김. 상단 탭으로 방문 목록 접근 |
| 태블릿 세로 (768px) | 단일 컬럼, 처방 항목 목록 스크롤 테이블 |

> **최소 지원 너비:** 768px (약국 업무 특성상 태블릿 이상 환경 기준)

#### 접근성 (Accessibility)

| 항목 | 구현 방식 |
|------|-----------|
| 키보드 네비게이션 | `Tab` 순서 논리적 배치, `Enter`로 주요 액션 실행 |
| 포커스 표시 | `focus:ring-2 focus:ring-blue-500` 모든 인터랙티브 요소 |
| 색상 대비 | WCAG AA (4.5:1) 이상 준수 |
| 에러 메시지 | `role="alert"` + 스크린 리더 읽기 가능 |
| 로딩 표시 | `aria-busy="true"` + `aria-label` |
| 버튼 비활성 | `disabled` 속성 + `aria-disabled="true"` + 툴팁 |

---

## 11. 배포 계획

### 11.1 배포 아키텍처 개요

PharmWeave는 **Vercel + Neon(PostgreSQL)** 기반의 서버리스 클라우드 아키텍처를 채택한다. 단일 플랫폼에서 Frontend(정적 자산)와 Backend API(Serverless Functions)를 통합 운영하여 인프라 복잡도를 최소화한다.

```
┌─────────────────────────────────────────────────────────────┐
│                        개발자 로컬                           │
│   git push origin main                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Repository                         │
│   main branch push / PR open                                │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐       ┌──────────────────────────────┐
│  GitHub Actions  │       │         Vercel               │
│  CI Pipeline     │       │  (자동 Preview 배포)          │
│  ─────────────── │       │  PR → preview URL 생성        │
│  lint            │       └──────────────────────────────┘
│  type-check      │
│  test            │
│  build           │
└──────────┬───────┘
           │ 통과 시
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Production)                    │
│                                                             │
│   ┌──────────────────────┐  ┌──────────────────────────┐   │
│   │  Static Assets CDN   │  │  Serverless Functions     │   │
│   │  React SPA           │  │  Express API (api/*)      │   │
│   │  (Edge Network)      │  │  Node.js 18 Runtime       │   │
│   └──────────────────────┘  └───────────┬──────────────┘   │
└─────────────────────────────────────────┼───────────────────┘
                                          │ SQL
                                          ▼
                             ┌────────────────────────┐
                             │    Neon (PostgreSQL)    │
                             │  Serverless Postgres    │
                             │  Auto-suspend / Resume  │
                             └────────────────────────┘
```

### 11.2 환경 구성 (Environments)

| 환경 | 브랜치 | URL | 용도 |
|------|--------|-----|------|
| **Production** | `main` | `https://pharmweave.vercel.app` | 실서비스, 해커톤 평가 제출 URL |
| **Preview** | `feature/*`, PR | `https://pharmweave-{hash}.vercel.app` | PR 단위 기능 검증, 팀 리뷰 |
| **Local Dev** | 로컬 | `http://localhost:5173` (FE) / `:3000` (BE) | 개발 및 디버깅 |

#### 환경 변수 관리

```
# .env.example (커밋 포함 — 실제 값 제외)
# ─── Backend ───────────────────────────────
DATABASE_URL=postgresql://user:pass@host/pharmweave
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://pharmweave.vercel.app

# ─── Frontend ──────────────────────────────
VITE_API_BASE_URL=https://pharmweave.vercel.app/api
```

- **Vercel Dashboard → Environment Variables** 에서 Production / Preview / Development 별로 분리 설정
- `.env` 파일은 `.gitignore`에 포함, 실제 시크릿은 절대 커밋하지 않음
- Neon connection string에는 `?sslmode=require` 필수 포함

### 11.3 인프라 서비스 선정

| 서비스 | 역할 | 선정 이유 |
|--------|------|-----------|
| **Vercel** | Frontend CDN + API Serverless | GitHub 연동 자동 배포, Edge Network(전 세계 CDN), 무료 플랜 충분 |
| **Neon** | PostgreSQL 호스팅 | Serverless Postgres (auto-suspend로 비용 절감), Prisma 공식 지원, 브랜칭 기능으로 Preview DB 분리 가능 |
| **GitHub Actions** | CI 파이프라인 | lint → type-check → test → build 품질 게이트 |

> **Supabase vs Neon 선택 근거:** Neon은 Prisma와 네이티브 통합이 최적화되어 있고, DB 브랜칭 기능으로 Preview 환경별 독립 DB 운영이 가능하다. 해커톤 규모에서는 무료 플랜으로 충분히 운영 가능하다.

### 11.4 Vercel 프로젝트 설정

#### vercel.json 설정

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 빌드 명령 (Vercel Dashboard 설정)

| 항목 | 값 |
|------|----|
| Framework Preset | Other |
| Build Command | `npm run build` (루트 package.json) |
| Output Directory | `frontend/dist` |
| Install Command | `npm ci` |
| Node.js Version | 18.x |

### 11.5 데이터베이스 마이그레이션 전략

```
로컬 개발
  └─ prisma migrate dev          # 개발 DB 마이그레이션 + 히스토리 생성

PR / Preview 배포
  └─ prisma migrate deploy       # Preview DB에 마이그레이션 적용 (CI에서 실행)

Production 배포 (main push)
  └─ prisma migrate deploy       # Production DB에 마이그레이션 적용
  └─ prisma db seed              # 초기 시드 데이터 (최초 1회)
```

**마이그레이션 원칙:**
- `prisma/migrations/` 디렉토리는 반드시 git에 포함하여 이력 관리
- 컬럼 삭제/타입 변경 등 파괴적 마이그레이션은 별도 브랜치에서 검증 후 적용
- Production 마이그레이션 실패 시 Neon 스냅샷으로 롤백 가능

### 11.6 CI/CD 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI / CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # ─── 1단계: 코드 품질 검사 ────────────────────
  quality:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: ESLint (Frontend)
        run: npm run lint --workspace=frontend

      - name: ESLint (Backend)
        run: npm run lint --workspace=backend

      - name: TypeScript type check
        run: npm run type-check --workspaces

  # ─── 2단계: 테스트 ────────────────────────────
  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    needs: quality

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: pharmweave_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/pharmweave_test
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run DB migration (test)
        run: npx prisma migrate deploy
        working-directory: backend

      - name: Unit tests (Domain Layer)
        run: npm run test:unit --workspace=backend -- --coverage

      - name: Integration tests (API)
        run: npm run test:integration --workspace=backend

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: backend/coverage/

  # ─── 3단계: 빌드 검증 ─────────────────────────
  build:
    name: Build Validation
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build Frontend
        run: npm run build --workspace=frontend
        env:
          VITE_API_BASE_URL: https://pharmweave.vercel.app/api

      - name: Build Backend
        run: npm run build --workspace=backend

  # ─── 4단계: Production 배포 (main 브랜치만) ───
  deploy:
    name: Deploy to Vercel (Production)
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod

      - name: Run DB migration (production)
        run: npx prisma migrate deploy
        working-directory: backend
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

#### GitHub Secrets 등록 목록

| Secret 키 | 값 출처 |
|-----------|---------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `DATABASE_URL` | Neon Dashboard → Connection String |

### 11.7 배포 URL 구조

```
Production
  https://pharmweave.vercel.app              # React SPA 진입점
  https://pharmweave.vercel.app/api          # API 루트
  https://pharmweave.vercel.app/api/patients # 환자 API 예시
  https://pharmweave.vercel.app/api/visits   # 방문 API 예시

Preview (PR별 독립 환경)
  https://pharmweave-git-feature-{name}-{team}.vercel.app
```

### 11.8 배포 체크리스트

#### 초기 배포 (최초 1회)

- [ ] Neon 프로젝트 생성 → Production / Preview DB 브랜치 분리
- [ ] Vercel 프로젝트 생성 → GitHub 저장소 연결
- [ ] Vercel Environment Variables 설정 (Production / Preview 분리)
- [ ] GitHub Secrets 등록 (VERCEL_TOKEN, DATABASE_URL 등)
- [ ] `prisma migrate deploy` + `prisma db seed` 실행
- [ ] 배포 URL 접속 및 Workflow 전체 흐름 동작 확인

#### 정기 배포 (매 Push)

- [ ] GitHub Actions CI 전 단계 녹색 확인
- [ ] Vercel 자동 배포 완료 (대시보드 확인)
- [ ] Production DB 마이그레이션 성공 여부 확인
- [ ] 주요 API 엔드포인트 응답 확인 (`/api/patients`, `/api/visits`)

---

## 12. 테스트 전략

### 12.1 테스트 피라미드

```
          ┌─────────────┐
          │   E2E Test  │  (선택, 시간 여유 시)
          │  Playwright │
         ─┴─────────────┴─
        ┌─────────────────┐
        │ Integration Test│
        │ Jest + Supertest│  API 엔드포인트 × DB
       ─┴─────────────────┴─
      ┌─────────────────────┐
      │     Unit Test       │
      │       Jest          │  Domain 순수 로직 (상태 전환, 계산)
     ─┴─────────────────────┴─
```

**원칙:** 외부 의존성이 없는 Domain Layer를 Unit Test로 철저히 검증하고, API 레이어는 Integration Test로 실 DB와 함께 검증한다. Mock은 최소화한다.

### 12.2 단위 테스트 (Unit Test)

**도구:** Jest + ts-jest
**대상:** 외부 의존성(DB, HTTP) 없는 순수 비즈니스 로직

| 테스트 대상 | 테스트 시나리오 | 파일 위치 |
|------------|----------------|-----------|
| `WorkflowStateMachine` | 유효 단계 전환 성공 / 잘못된 단계 전환 예외 / 현재 단계 조회 | `domain/__tests__/WorkflowStateMachine.test.ts` |
| `CopayCalculator` | 일반 환자 본인부담금 계산 / 노인 경감율 적용 / 장애인 경감율 / 복합 처방 계산 | `domain/__tests__/CopayCalculator.test.ts` |
| `ClaimDataBuilder` | 정상 청구 데이터 생성 / 필수 필드 누락 시 예외 / 처방 항목 누락 시 예외 | `domain/__tests__/ClaimDataBuilder.test.ts` |
| `PluginManager` | Plugin 등록/실행/결과 수집 / 미등록 Plugin 호출 예외 | `domain/__tests__/PluginManager.test.ts` |

**커버리지 목표:** Domain Layer 파일 기준 **80% 이상**

```typescript
// 예시: WorkflowStateMachine 테스트
describe('WorkflowStateMachine', () => {
  it('접수 → 처방 전환이 정상 동작해야 한다', () => {
    const sm = new WorkflowStateMachine('RECEPTION');
    sm.transition('PRESCRIPTION');
    expect(sm.currentStage).toBe('PRESCRIPTION');
  });

  it('순서를 건너뛴 전환은 예외를 던져야 한다', () => {
    const sm = new WorkflowStateMachine('RECEPTION');
    expect(() => sm.transition('DISPENSING')).toThrow(InvalidTransitionError);
  });
});
```

### 12.3 통합 테스트 (Integration Test)

**도구:** Jest + Supertest
**환경:** 실 PostgreSQL (테스트 전용 인스턴스, GitHub Actions 서비스 컨테이너)

| 테스트 대상 | 핵심 검증 항목 |
|------------|----------------|
| `POST /api/patients` | 환자 생성 → DB 저장 확인 → 중복 환자 400 응답 |
| `POST /api/visits` | 방문 생성 → 초기 단계 `RECEPTION` 확인 |
| `PATCH /api/visits/:id/stage` | 단계 전환 성공 / 잘못된 전환 422 응답 |
| `POST /api/visits/:id/prescriptions` | 처방 저장 → 방문 연계 확인 |
| `POST /api/visits/:id/payment` | 수납 처리 → 본인부담금 계산 검증 |
| `POST /api/visits/:id/claim` | 청구 생성 → 처방 데이터 포함 여부 확인 |
| **Workflow 시나리오** | 접수→처방→조제→검토→수납→청구 전체 흐름 1회 완주 |

**테스트 격리 전략:**
- 각 테스트 파일 실행 전 `beforeAll`에서 DB 시드 → `afterAll`에서 롤백
- 테스트 간 데이터 오염 방지를 위해 트랜잭션 래핑 또는 테이블 truncate 활용

### 12.4 정적 분석 및 코드 품질

| 도구 | 설정 | 역할 |
|------|------|------|
| **TypeScript** (`strict: true`) | `tsconfig.json` | 타입 안전성, null 체크 강제 |
| **ESLint** | `.eslintrc` (recommended + typescript) | 코드 스타일 일관성, 잠재 버그 탐지 |
| **Prettier** | `.prettierrc` | 코드 포맷 자동화 |
| **Zod** | `schemas/` | API 요청 런타임 유효성 검사 |

### 12.5 CI/CD 품질 게이트

```
Pull Request 머지 조건:
  ✅ ESLint 경고 0개
  ✅ TypeScript 컴파일 오류 0개
  ✅ 단위 테스트 전체 통과
  ✅ 통합 테스트 전체 통과
  ✅ 빌드 성공
```

---

## 13. 성공 지표

### 13.1 핵심 기능 동작 기준 (데모 체크리스트)

| # | 검증 항목 | 기준 | 확인 방법 |
|---|-----------|------|-----------|
| 1 | Workflow 전체 흐름 완주 | 접수→처방→조제→검토→수납→청구 6단계 오류 없이 완료 | 브라우저 실연 |
| 2 | DUR Plugin 실행 | 처방 단계에서 DUR 검사 결과 표시 (경고/정상 구분) | 브라우저 실연 |
| 3 | 복약지도 Plugin 실행 | 조제 단계에서 복약지도 텍스트 자동 생성 | 브라우저 실연 |
| 4 | 데이터 일관성 | 방문별 처방/수납/청구 데이터 저장 후 재조회 시 동일 값 | API 응답 확인 |
| 5 | API 응답 정상 | 모든 CRUD 엔드포인트 2xx 응답 | Postman / 브라우저 Network |
| 6 | 오늘의 방문 목록 | 당일 방문 환자 목록 조회 및 단계 현황 표시 | 브라우저 실연 |
| 7 | 반응형 UI | 1280px, 768px(태블릿) 화면에서 레이아웃 정상 | 브라우저 DevTools |
| 8 | 배포 URL 접속 | `https://pharmweave.vercel.app` 에서 동일 동작 | 외부 브라우저 접속 |

### 13.2 성능 목표

| 지표 | 목표값 | 측정 도구 |
|------|--------|-----------|
| API 평균 응답시간 | ≤ 500ms (p95) | Vercel Analytics |
| 초기 페이지 로딩 (FCP) | ≤ 2.5초 | Lighthouse |
| 단계 전환 응답 | ≤ 300ms | 브라우저 Network |
| DB 쿼리 (단순 조회) | ≤ 100ms | Prisma query log |

> **Cold Start 고려:** Neon Serverless는 일정 시간 미사용 시 auto-suspend 후 첫 요청에 Cold Start(~500ms)가 발생할 수 있다. 해커톤 데모 전 warm-up 요청 1회 권장.

### 13.3 평가 기준 매핑 (총 100점 + 보너스 10점)

| 평가 항목 | 배점 | 대응 산출물 | 달성 전략 |
|-----------|------|-------------|-----------|
| PRD / README 프로젝트 정의 | 12점 | 본 PRD 문서, README.md | 문제 정의·해결 방향·기능 명세 완전 기술 |
| AI 컨텍스트 (CLAUDE.md) | 9점 | CLAUDE.md | 아키텍처·코딩 규칙·도메인 용어 상세 기술 |
| 개발 진행 기록 | 9점 | Git 커밋 이력 | 기능 단위 의미 있는 커밋 메시지 유지 |
| 아키텍처 | 12점 | 3-tier + Plugin 구조 | Presentation / Application / Domain / Infrastructure 레이어 분리 |
| 코드 품질 | 10점 | TypeScript strict + ESLint | Domain Layer 추상화, Zod 유효성 검사 |
| 기술 스택 | 8점 | React + Express + PostgreSQL | 요구 스택 완전 준수 |
| 완성도 | 8점 | 6단계 Workflow 완전 동작 | 모든 단계 실제 DB 연동 동작 |
| 사용자 경험 | 5점 | Workflow Stepper UI | 단계별 컨텍스트 유지, 직관적 흐름 |
| 반응형 / 호환성 | 2점 | Tailwind 반응형 | md/lg 브레이크포인트 적용 |
| 문제 정의 | 4점 | 기존 PMS 3가지 한계 | 문서화된 근거 기반 |
| 차별화 | 6점 | Web + Workflow + Plugin | Plugin 실제 동작 데모 |
| 테스트 전략 | 8점 | Jest 단위 + 통합 테스트 | Domain Layer 80% 커버리지 |
| CI/CD | 7점 | GitHub Actions | lint + type-check + test + build + deploy 자동화 |
| **배포 URL (보너스)** | **+10점** | **Vercel Production 배포** | **데모 시 외부 URL 접속 가능 상태 유지** |
| **합계** | **110점** | | |

---

## 14. 개발 일정 (1인 / 8시간 기준)

> **전략:** 점수 비중이 높은 항목(아키텍처 12점, PRD 12점, 코드 품질 10점)을 우선 달성하고, 보너스 배포(+10점)를 마지막 세션에 확보한다.

### 14.1 시간대별 작업 계획

| 시간 | 단계 | 세부 작업 | 기여 점수 |
|------|------|-----------|-----------|
| 0h ~ 0.5h | **환경 설정** | CLAUDE.md 작성, monorepo 초기화 (`/frontend`, `/backend`, 루트 `package.json`), `.env.example`, `.gitignore`, GitHub 저장소 연결, 초기 커밋 | AI 컨텍스트 9점 |
| 0.5h ~ 1.5h | **데이터 계층** | Prisma 스키마 설계 (Patient, Visit, Prescription, Payment, Claim), `migrate dev`, 시드 데이터 20개 (환자 5명 × 방문 4회) | 아키텍처 기반 |
| 1.5h ~ 3h | **Backend API** | Express 라우터 전체 구현 (patients, visits, prescriptions, payments, claims), Zod 요청 검증, 에러 핸들러 미들웨어, CORS 설정 | 아키텍처 12점, 기술 스택 8점 |
| 3h ~ 3.5h | **Domain 계층** | `WorkflowStateMachine`, `CopayCalculator`, `ClaimDataBuilder` 구현 (순수 함수, 외부 의존성 없음) | 코드 품질 10점 |
| 3.5h ~ 5h | **Frontend UI** | Vite + React + Tailwind 설정, `WorkflowStepper` 컴포넌트, 6단계 화면 (접수/처방/조제/검토/수납/청구), Zustand 상태 관리, Axios API 클라이언트 | 완성도 8점, UX 5점 |
| 5h ~ 6h | **Plugin 구현** | `PluginManager` 구현, DUR Plugin (약물 상호작용 경고), 복약지도 Plugin (처방 기반 텍스트 생성), Plugin 관리 화면 | 차별화 6점 |
| 6h ~ 6.5h | **테스트 + CI/CD** | Jest 단위 테스트 4개 (Domain Layer), GitHub Actions 워크플로우 작성 (lint → test → build → deploy), GitHub Secrets 등록 | 테스트 8점, CI/CD 7점 |
| 6.5h ~ 8h | **배포 + 마무리** | Neon DB 프로비저닝 + 마이그레이션, Vercel 배포 설정, Production URL 동작 확인, README 최종화 (배포 URL 포함), PRD 최종 검토 | 보너스 +10점, PRD 12점 |

### 14.2 리스크 및 대응

| 리스크 | 가능성 | 대응 방안 |
|--------|--------|-----------|
| Vercel Serverless + Prisma 연결 이슈 | 중 | `@prisma/adapter-neon` 공식 가이드 사전 숙지, `connection_limit=1` 설정 |
| Neon Cold Start로 인한 데모 지연 | 중 | 데모 5분 전 warm-up 요청 실행 |
| GitHub Actions 빌드 시간 초과 | 저 | 의존성 캐시(`cache: npm`) 활성화, 병렬 job 구성 |
| 시간 내 전체 기능 미완성 | 중 | Plugin은 마지막 구현 — 핵심 6단계 Workflow 우선 완성 보장 |

---

## 부록: 프로젝트 디렉토리 구조

```
pharmweave/
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI/CD 파이프라인
├── docs/
│   └── PRD.md                       # 본 문서
├── frontend/
│   ├── src/
│   │   ├── pages/                   # 단계별 URL 진입점 (React Router)
│   │   ├── features/
│   │   │   ├── reception/           # 접수 단계 컴포넌트
│   │   │   ├── prescription/        # 처방 단계 컴포넌트
│   │   │   ├── dispensing/          # 조제 단계 컴포넌트
│   │   │   ├── review/              # 검토 단계 컴포넌트
│   │   │   ├── payment/             # 수납 단계 컴포넌트
│   │   │   └── claim/               # 청구 단계 컴포넌트
│   │   ├── components/
│   │   │   ├── WorkflowStepper.tsx  # 상단 6단계 Stepper
│   │   │   ├── PluginSlot.tsx       # Plugin 렌더링 슬롯
│   │   │   └── ui/                  # 공통 UI (Button, Badge, Card 등)
│   │   ├── hooks/
│   │   │   ├── useWorkflowStage.ts  # 단계 전환 훅
│   │   │   └── usePatientSearch.ts  # 환자 검색 훅
│   │   ├── stores/
│   │   │   ├── workflowStore.ts     # Zustand — 현재 방문/단계 상태
│   │   │   └── pluginStore.ts       # Zustand — Plugin 등록/상태
│   │   └── api/
│   │       ├── client.ts            # Axios 인스턴스 설정
│   │       └── endpoints.ts         # API 함수 모음
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/                  # HTTP 라우터 (patients, visits, ...)
│   │   ├── middlewares/
│   │   │   ├── validate.ts          # Zod 요청 검증 미들웨어
│   │   │   └── errorHandler.ts      # 전역 에러 핸들러
│   │   ├── services/                # 유스케이스 + Prisma 호출
│   │   ├── domain/
│   │   │   ├── WorkflowStateMachine.ts
│   │   │   ├── CopayCalculator.ts
│   │   │   ├── ClaimDataBuilder.ts
│   │   │   └── __tests__/           # Domain 단위 테스트
│   │   ├── plugins/
│   │   │   ├── PluginManager.ts
│   │   │   ├── durPlugin.ts         # DUR 약물 상호작용 검사
│   │   │   └── medicationGuide.ts   # 복약지도 텍스트 생성
│   │   └── schemas/                 # Zod 요청 스키마
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/              # 마이그레이션 이력 (git 포함)
│   │   └── seed.ts                  # 시드 데이터 (환자 5명, 방문 20건)
│   ├── tsconfig.json
│   └── package.json
├── vercel.json                      # Vercel 빌드/라우팅 설정
├── .env.example                     # 환경 변수 템플릿 (실제 값 제외)
├── CLAUDE.md                        # AI 컨텍스트 문서
└── README.md                        # 프로젝트 소개 + 배포 URL
```
