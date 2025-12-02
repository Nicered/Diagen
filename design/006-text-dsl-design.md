# Diagen 텍스트 DSL 설계

## 1. 개요

### 1.1 설계 원칙

- **언어 독립적**: 어떤 프로그래밍 언어에서든 문자열로 생성 가능
- **LLM 친화적**: AI가 쉽게 생성하고 이해할 수 있는 문법
- **가독성**: 코드만 봐도 결과물 예측 가능
- **간결성**: 최소한의 문자로 표현
- **확장성**: 단순한 것은 간단하게, 복잡한 것도 가능하게
- **명확성**: 문법의 모호함 최소화
- **일관성**: 동일한 개념은 동일한 문법 사용

### 1.2 시스템 구조

```
┌─────────────────────┐
│   텍스트 DSL        │  ← 언어 독립적
│   (.diagen 파일)    │
└──────────┬──────────┘
           │ Parser
           ▼
┌─────────────────────┐
│   JSON IR           │  ← 중간 표현
│   (Abstract Model)  │
└──────────┬──────────┘
           │ Renderer
           ▼
┌─────────────────────┐
│   출력              │
│   SVG / PNG / PDF   │
└─────────────────────┘
```

### 1.3 파일 확장자

- `.diagen` - 다이어그램/인포그래픽 통합
- `.dg` - 축약형

---

## 2. 기본 문법

### 2.1 문서 구조

```
@문서타입 [서브타입]
---
메타데이터 (key: value 형식)
---
본문
```

**규칙:**
- `@문서타입`은 필수
- 메타데이터 블록 (`---` ... `---`)은 선택적
- 메타데이터가 없으면 `---` 블록 생략 가능
- 본문이 바로 `@문서타입` 다음에 올 수 있음

**예시:**
```
// 메타데이터 있음
@diagram
---
title: 시스템 구조
---
A -> B

// 메타데이터 없음
@diagram
A -> B
```

### 2.2 주석

```
// 한 줄 주석
/* 여러 줄
   주석 */
```

### 2.3 메타데이터 블록

```
---
title: 시스템 아키텍처
theme: professional
direction: TB
---
```

**공통 메타데이터 키:**
| 키 | 설명 | 값 예시 |
|----|------|--------|
| `title` | 제목 | `"시스템 구조"` |
| `theme` | 테마 | `professional`, `modern`, `minimal` |
| `direction` | 방향 | `TB`, `BT`, `LR`, `RL` |
| `size` | 크기 | `1920x1080` |
| `grid` | 그리드 | `12x8` |

### 2.4 값 타입

| 타입 | 문법 | 예시 |
|------|------|------|
| 문자열 | `"..."` | `"Hello World"` |
| 숫자 | `123`, `3.14`, `-5` | `100`, `0.5`, `-10` |
| 불리언 | `true`, `false` | `true` |
| 색상 | `#RRGGBB` | `#4A90D9` |
| 식별자 | `[a-zA-Z_][a-zA-Z0-9_-]*` | `my_node`, `api-server` |
| 배열 | `(item1, item2)` | `(1, 2, 3)`, `()` |
| 퍼센트 | `+N%`, `-N%`, `N%` | `+15%`, `-5%`, `30%` |

**구분자 용도:**
- **배열**: 소괄호 `()` 사용 → `(1, 2, 3)`, `("a", "b")`, `()` (빈 배열)
- **속성**: 대괄호 `[]` 사용 → `[fill: #fff]`
- **위치**: 대괄호 `[]` 사용 (place 전용) → `place [0, 0, 3, 2]`
- **블록**: 중괄호 `{}` 사용 → `{ key: value }`

### 2.5 문자열

```
// 큰따옴표 문자열
"Hello World"

// 줄바꿈 포함 (여러 줄)
"API
Gateway"

// 이스케이프 문자
"He said \"Hello\""    // 큰따옴표
"Line1\nLine2"         // 줄바꿈
```

**규칙:**
- 문자열 안의 `->`, `-->` 등은 연산자로 해석되지 않음
- 따옴표 안에서는 모든 문자가 리터럴로 처리

---

## 3. 다이어그램 DSL

### 3.1 기본 노드

```
// ID만 (ID가 라벨이 됨)
Client

// ID와 라벨 분리
client: "Client Application"

// 라벨에 줄바꿈
api: "API
Gateway"
```

**노드 ID 규칙:**
- 영문 소문자로 시작 권장
- 영문, 숫자, 언더스코어, 하이픈 허용
- 숫자로 시작 불가
- 예약어 사용 불가

### 3.2 노드 속성

속성은 대괄호 `[]` 안에 정의합니다.

```
// 셰이프만 (간략형)
db: "Database" [cylinder]

// 복수 속성
api: "API Server" [fill: #4A90D9, stroke: #333]

// 여러 줄 (쉼표 필수, 마지막 쉼표 선택)
gateway: "API Gateway" [
  shape: hexagon,
  fill: #4A90D9,
  shadow: true,
  icon: shield
]
```

**속성 목록:**
| 속성 | 설명 | 값 |
|------|------|-----|
| `shape` | 도형 | `rect`, `circle`, `diamond`, `hexagon`, `cylinder`, `cloud`, `person` 등 |
| `fill` | 배경색 | `#RRGGBB`, `gradient(#from, #to)` |
| `stroke` | 테두리색 | `#RRGGBB` |
| `strokeWidth` | 테두리 두께 | 숫자 |
| `shadow` | 그림자 | `true`, `false` |
| `dashed` | 점선 테두리 | `true`, `false` |
| `opacity` | 투명도 | `0`~`1` |
| `icon` | 아이콘 | 아이콘 이름 |

### 3.3 연결 (엣지)

```
// 기본 화살표
A -> B

// 양방향
A <-> B

// 라벨
A -> B: "HTTPS"

// 점선
A --> B

// 굵은 선
A ==> B
```

**연결 연산자:**
| 연산자 | 의미 | 선 스타일 |
|--------|------|----------|
| `->` | 단방향 | 실선 |
| `<->` | 양방향 | 실선 |
| `-->` | 단방향 | 점선 |
| `<-->` | 양방향 | 점선 |
| `==>` | 단방향 | 굵은 실선 |
| `<==>` | 양방향 | 굵은 실선 |

### 3.4 다중 연결

```
// 연속 연결
A -> B -> C -> D

// 다중 타겟 (소괄호 사용)
A -> (B, C, D)

// 다중 소스
(A, B, C) -> D

// 다중 소스 + 다중 타겟 (카테시안 곱)
(A, B) -> (C, D)    // A->C, A->D, B->C, B->D
```

**규칙:**
- 다중 연결에는 소괄호 `()` 사용
- 중괄호 `{}`는 그룹/블록 전용

### 3.5 그룹 / 컨테이너

```
// 기본 그룹
group Backend {
  api: "API Server"
  worker: "Worker"
}

// 그룹 속성
group Database [fill: #f0f0f0, stroke: #ccc] {
  primary: "Primary" [cylinder]
  replica: "Replica" [cylinder]
}

// 중첩 그룹
group Cloud {
  group VPC {
    group Public {
      alb: "Load Balancer"
    }
    group Private {
      ecs: "ECS Cluster"
    }
  }
}
```

**그룹 참조:**
```
// 그룹 내부 노드 참조 (점 표기법)
client -> Backend.api
Backend.api -> Database.primary

// 그룹 자체를 노드로 연결
Frontend -> Backend
```

### 3.6 포트 (다중 연결점)

```
// 포트 정의 (배열로 나열, 위치는 속성으로)
server: "Server" [
  ports: (
    "http" [position: top],
    "db" [position: bottom],
    "cache" [position: right]
  )
]

// 간단한 포트 (위치 자동)
api: "API" [ports: ("in", "out")]

// 포트로 연결 (콜론 사용)
client -> server:http
server:db -> database
```

**참조 구분:**
- 그룹 참조: `그룹.노드` (점)
- 포트 참조: `노드:포트` (콜론)

### 3.7 전체 예시

```
@diagram
---
title: E-Commerce Architecture
theme: professional
direction: TB
---

// 클라이언트
web: "Web App" [icon: globe]
mobile: "Mobile App" [icon: smartphone]

// API 레이어
gateway: "API Gateway" [hexagon, fill: #4A90D9]

// 서비스 그룹
group Services [fill: #f8f9fa] {
  user: "User Service"
  product: "Product Service"
  order: "Order Service"
  payment: "Payment Service"
}

// 데이터 그룹
group Data [fill: #fff3e0] {
  userdb: "User DB" [cylinder]
  productdb: "Product DB" [cylinder]
  cache: "Redis" [cylinder, fill: #dc382d]
}

// 연결
(web, mobile) -> gateway: "HTTPS"
gateway -> (Services.user, Services.product, Services.order)
Services.order -> Services.payment
Services.user -> Data.userdb
Services.product -> (Data.productdb, Data.cache)
```

---

## 4. 인포그래픽 DSL

### 4.1 서브타입 목록

| 서브타입 | 설명 | 요소 키워드 |
|---------|------|------------|
| `kpi` | KPI 카드 | `item` |
| `chart` | 차트 | `data`, `series` |
| `timeline` | 타임라인 | `point` |
| `process` | 프로세스 | `step` |
| `funnel` | 퍼널 | `stage` |
| `pyramid` | 피라미드 | `level` |
| `matrix` | 2x2 매트릭스 | `cell` |
| `concentric` | 동심원 | `ring` |
| `stack` | 레이어 스택 | `layer` |
| `cycle` | 사이클 | `phase` |
| `org` | 조직도 | `member` |

### 4.2 공통 요소 문법

모든 인포그래픽 요소는 동일한 패턴을 따릅니다:

```
키워드 "ID" [속성] {
  속성: 값
}
```

**규칙:**
- ID는 항상 문자열 `"..."` 사용 (일관성)
- 속성 블록 `[...]`은 선택적
- 본문 블록 `{...}`은 선택적 (속성이 없으면 생략 가능)

### 4.3 KPI 카드

```
@infographic kpi
---
title: 핵심 지표
layout: horizontal
---

item "revenue" {
  value: "$2.5M"
  label: "월 매출"
  icon: dollar-sign
  trend: +15%
  color: success
}

item "users" {
  value: "12,450"
  label: "활성 사용자"
  icon: users
  trend: +8%
}

item "conversion" {
  value: "3.2%"
  label: "전환율"
  icon: percent
  trend: -0.5%
  color: warning
}
```

**속성:**
| 속성 | 설명 | 필수 |
|------|------|------|
| `value` | 표시 값 | ✓ |
| `label` | 라벨 | ✓ |
| `icon` | 아이콘 | |
| `trend` | 변화율 (`+N%`, `-N%`) | |
| `color` | 색상 테마 | |

### 4.4 차트

**단일 데이터:**
```
@infographic chart
---
title: 분기별 매출
type: bar
---

data "main" {
  "Q1": 120
  "Q2": 150
  "Q3": 180
  "Q4": 210
}
```

**단일 데이터 축약형:**
```
@infographic chart
---
title: 분기별 매출
type: bar
data: ("Q1": 120, "Q2": 150, "Q3": 180, "Q4": 210)
---
```

**다중 시리즈:**
```
@infographic chart
---
title: 월별 트래픽
type: line
---

series "방문자" [color: #4A90D9] {
  "Jan": 1000
  "Feb": 1200
  "Mar": 1500
}

series "가입자" [color: #50C878] {
  "Jan": 100
  "Feb": 150
  "Mar": 200
}
```

**도넛 차트:**
```
@infographic chart
---
title: 시장 점유율
type: donut
center: "35%"
---

data {
  "우리 회사": 35 [color: #4A90D9]
  "경쟁사 A": 25 [color: #50C878]
  "경쟁사 B": 20 [color: #FFB347]
  "기타": 20 [color: #CCCCCC]
}
```

**차트 타입:**
- `bar` - 막대 차트
- `line` - 라인 차트
- `pie` - 파이 차트
- `donut` - 도넛 차트
- `area` - 영역 차트

### 4.5 타임라인

```
@infographic timeline
---
title: 프로젝트 로드맵
orientation: horizontal
---

point "2024-Q1" [status: completed] {
  title: "킥오프"
  items: ("요구사항 분석", "팀 구성")
}

point "2024-Q2" [status: completed] {
  title: "MVP 개발"
  items: ("핵심 기능 구현", "내부 테스트")
}

point "2024-Q3" [status: current] {
  title: "베타 출시"
  items: ("베타 테스트", "피드백 수집")
}

point "2024-Q4" [status: upcoming] {
  title: "정식 출시"
}
```

**status 값:** `completed`, `current`, `upcoming`

### 4.6 프로세스

```
@infographic process
---
title: 개발 프로세스
style: numbered
---

step "1" {
  title: "요구사항 분석"
  icon: search
  owner: "PM"
  duration: "2주"
}

step "2" {
  title: "설계"
  icon: pen-tool
  owner: "Architect"
  duration: "3주"
}

step "3" [status: current] {
  title: "개발"
  icon: code
  owner: "Dev Team"
  duration: "8주"
}

step "4" {
  title: "테스트"
  icon: check-circle
  owner: "QA Team"
}

step "5" {
  title: "배포"
  icon: rocket
  owner: "DevOps"
}
```

### 4.7 퍼널

```
@infographic funnel
---
title: 세일즈 퍼널
show-percentage: true
---

stage "방문" {
  value: 10000
}

stage "가입" {
  value: 3000
  rate: 30%
}

stage "활성화" {
  value: 1500
  rate: 50%
}

stage "결제" {
  value: 500
  rate: 33%
}

stage "재구매" {
  value: 200
  rate: 40%
}
```

### 4.8 피라미드

```
@infographic pyramid
---
title: 전략 계층
direction: up
---

level "1" [color: #1a365d] {
  title: "비전"
  description: "장기적 목표와 방향성"
}

level "2" [color: #2c5282] {
  title: "전략"
  description: "목표 달성을 위한 큰 그림"
}

level "3" [color: #3182ce] {
  title: "전술"
  description: "전략 실행을 위한 구체적 방법"
}

level "4" [color: #63b3ed] {
  title: "실행"
  description: "일상적인 업무와 활동"
}
```

### 4.9 매트릭스 (2x2)

```
@infographic matrix
---
title: 우선순위 매트릭스
x-axis: "노력"
x-labels: ("낮음", "높음")
y-axis: "영향"
y-labels: ("낮음", "높음")
---

cell "top-left" [color: success] {
  title: "Quick Wins"
  items: ("자동화 스크립트", "문서 정리")
}

cell "top-right" [color: primary] {
  title: "Major Projects"
  items: ("시스템 리팩토링", "신규 기능 개발")
}

cell "bottom-left" [color: muted] {
  title: "Fill-ins"
}

cell "bottom-right" [color: warning] {
  title: "Thankless Tasks"
}
```

### 4.10 동심원

```
@infographic concentric
---
title: 영향 범위
---

ring "1" [color: #1a365d] {
  title: "Core"
  description: "핵심 팀"
}

ring "2" [color: #3182ce] {
  title: "Internal"
  description: "내부 이해관계자"
}

ring "3" [color: #63b3ed] {
  title: "External"
  description: "고객 및 파트너"
}

ring "4" [color: #bee3f8] {
  title: "Ecosystem"
  description: "시장 및 커뮤니티"
}
```

### 4.11 레이어 스택

```
@infographic stack
---
title: 기술 스택
style: 3d
---

layer "1" [color: #61dafb] {
  title: "Frontend"
  description: "React, TypeScript, Tailwind"
}

layer "2" [color: #68d391] {
  title: "API Layer"
  description: "Node.js, GraphQL, REST"
}

layer "3" [color: #9f7aea] {
  title: "Services"
  description: "Microservices, Docker"
}

layer "4" [color: #f6ad55] {
  title: "Data"
  description: "PostgreSQL, Redis, S3"
}

layer "5" [color: #a0aec0] {
  title: "Infrastructure"
  description: "Kubernetes, AWS"
}
```

### 4.12 사이클

```
@infographic cycle
---
title: PDCA 사이클
center: "지속적\n개선"
---

phase "1" {
  title: "Plan"
  icon: clipboard
  items: ("목표 설정", "계획 수립")
}

phase "2" {
  title: "Do"
  icon: play
  items: ("계획 실행", "데이터 수집")
}

phase "3" {
  title: "Check"
  icon: search
  items: ("결과 분석", "문제 파악")
}

phase "4" {
  title: "Act"
  icon: refresh
  items: ("개선 조치", "표준화")
}
```

### 4.13 조직도

```
@infographic org
---
title: 팀 구조
root: "ceo"
---

member "ceo" {
  title: "CEO"
  name: "Kim"
  children: ("cto", "cfo", "coo")
}

member "cto" {
  title: "CTO"
  name: "Lee"
  children: ("dev-lead", "qa-lead")
}

member "dev-lead" {
  title: "Dev Lead"
  name: "Choi"
  children: ("frontend", "backend")
}

member "frontend" {
  title: "Frontend Team"
}

member "backend" {
  title: "Backend Team"
}

member "qa-lead" {
  title: "QA Lead"
  children: ("qa")
}

member "qa" {
  title: "QA Team"
}

member "cfo" {
  title: "CFO"
  children: ("finance")
}

member "finance" {
  title: "Finance Team"
}

member "coo" {
  title: "COO"
  children: ("operations")
}

member "operations" {
  title: "Operations Team"
}
```

---

## 5. 기술 특화 DSL

### 5.1 C4 다이어그램

**Context:**
```
@diagram c4-context
---
title: Internet Banking System - Context
---

actor "customer" [external] {
  label: "Personal Banking Customer"
  description: "은행 고객"
}

system "banking" {
  label: "Internet Banking System"
  description: "고객이 계좌 정보 확인 및 결제를 할 수 있게 해주는 시스템"
}

system "email" [external] {
  label: "E-mail System"
  description: "내부 Microsoft Exchange 이메일 시스템"
}

system "mainframe" [external] {
  label: "Mainframe Banking System"
  description: "핵심 뱅킹 기능을 담당하는 메인프레임"
}

// 관계
customer -> banking: "조회, 이체"
banking -> email: "이메일 전송"
banking -> mainframe: "API 호출"
email -> customer: "이메일 발송"
```

**Container:**
```
@diagram c4-container
---
title: Internet Banking System - Containers
---

// 외부
actor "customer" [external]
system "mainframe" [external]
system "email" [external]

// 컨테이너
container "spa" [type: web] {
  label: "Single-Page App"
  tech: "React, TypeScript"
  description: "사용자 인터페이스 제공"
}

container "mobile" [type: mobile] {
  label: "Mobile App"
  tech: "React Native"
}

container "api" [type: api] {
  label: "API Application"
  tech: "Node.js, Express"
}

container "database" [type: database] {
  label: "Database"
  tech: "PostgreSQL"
}

// 관계
customer -> spa: "HTTPS"
customer -> mobile: "HTTPS"
spa -> api: "JSON/HTTPS"
mobile -> api: "JSON/HTTPS"
api -> database: "SQL/TCP"
api -> mainframe: "XML/HTTPS"
api -> email: "SMTP"
```

**C4 전용 키워드:**
- `actor` - 사람/역할
- `system` - 시스템
- `container` - 컨테이너
- `component` - 컴포넌트

### 5.2 데이터 파이프라인

```
@infographic pipeline
---
title: ETL 파이프라인
---

source "mysql" [type: database] {
  label: "MySQL"
}

source "api" [type: api] {
  label: "REST API"
}

source "s3-raw" [type: storage] {
  label: "S3 Raw"
}

transform "clean" {
  label: "데이터 정제"
}

transform "enrich" {
  label: "데이터 보강"
}

transform "aggregate" {
  label: "집계"
}

sink "warehouse" [type: warehouse] {
  label: "Snowflake"
}

sink "bi" [type: bi] {
  label: "Tableau"
}

// 플로우
mysql -> clean
api -> clean
s3-raw -> enrich
clean -> enrich -> aggregate -> warehouse -> bi
```

**파이프라인 키워드:**
- `source` - 데이터 소스
- `transform` - 변환 단계
- `sink` - 목적지

### 5.3 신경망 아키텍처

```
@infographic neural
---
title: CNN Architecture
direction: horizontal
autoconnect: true
---

nlayer "input" [type: input] {
  shape: (224, 224, 3)
}

nlayer "conv1" [type: conv2d] {
  filters: 64
  kernel: 3
  activation: relu
}

nlayer "pool1" [type: maxpool] {
  size: 2
}

nlayer "conv2" [type: conv2d] {
  filters: 128
  kernel: 3
  activation: relu
}

nlayer "flatten" [type: flatten]

nlayer "dense1" [type: dense] {
  units: 256
  activation: relu
}

nlayer "dropout" [type: dropout] {
  rate: 0.5
}

nlayer "output" [type: dense] {
  units: 10
  activation: softmax
}
```

**규칙:**
- `autoconnect: true` 메타데이터로 순서대로 자동 연결
- `nlayer` 키워드 사용 (스택의 `layer`와 구분)

### 5.4 클라우드 아키텍처

```
@infographic cloud
---
title: AWS 아키텍처
provider: aws
---

region "ap-northeast-2" {
  vpc "main" {
    subnet "public-1" [type: public] {
      resource "alb" [type: alb] {
        label: "Application LB"
      }
      resource "nat" [type: nat] {
        label: "NAT Gateway"
      }
    }

    subnet "private-1" [type: private] {
      resource "ecs" [type: ecs] {
        label: "ECS Cluster"
      }
    }

    subnet "private-2" [type: private] {
      resource "rds" [type: aurora] {
        label: "Aurora"
      }
      resource "cache" [type: elasticache] {
        label: "ElastiCache"
      }
    }
  }
}

// 외부 서비스
external "s3" [type: s3] {
  label: "S3 Bucket"
}

external "cloudfront" [type: cloudfront] {
  label: "CloudFront"
}

// 연결
cloudfront -> alb -> ecs
ecs -> (rds, cache, s3)
```

**클라우드 키워드:**
- `region` - 리전
- `vpc` - VPC
- `subnet` - 서브넷
- `resource` - 리소스
- `external` - 외부 서비스

---

## 6. 복합 페이지

```
@page
---
title: Executive Dashboard
size: 1920x1080
theme: professional
grid: 12x8
---

// place [x, y, width, height]
place [0, 0, 3, 2] {
  @infographic kpi

  item "revenue" {
    value: "$2.5M"
    label: "매출"
    trend: +15%
  }
}

place [3, 0, 3, 2] {
  @infographic kpi

  item "users" {
    value: "12.4K"
    label: "사용자"
    trend: +8%
  }
}

place [0, 2, 6, 3] {
  @infographic chart
  ---
  type: line
  title: 월별 추이
  ---

  series "매출" [color: #4A90D9] {
    "Jan": 100
    "Feb": 120
    "Mar": 150
  }
}

place [6, 2, 6, 3] {
  @infographic chart
  ---
  type: donut
  title: 구성 비율
  ---

  data {
    "A": 40
    "B": 35
    "C": 25
  }
}

place [0, 5, 12, 3] {
  @diagram
  ---
  direction: LR
  ---

  client: "Client"
  server: "Server"
  db: "Database" [cylinder]

  client -> server -> db
}
```

**규칙:**
- `place [x, y, w, h]`로 그리드 위치 지정
- 내부에 완전한 `@diagram` 또는 `@infographic` 문서 포함
- 내부 문서의 메타데이터 블록은 생략 가능

---

## 7. 문법 요약

### 7.1 구분자 용도

| 기호 | 용도 | 예시 |
|------|------|------|
| `[]` | 속성 블록 | `[fill: #fff, shape: rect]` |
| `[]` | 위치 (place 전용) | `place [0, 0, 3, 2]` |
| `()` | 배열/다중값 | `(A, B, C)`, `(1, 2, 3)` |
| `{}` | 블록/본문 | `group X { }`, `item "a" { }` |
| `""` | 문자열 | `"Hello World"` |
| `.` | 그룹 참조 | `Backend.api` |
| `:` | 포트 참조, 키-값 | `server:http`, `fill: #fff` |

### 7.2 다이어그램 문법

| 요소 | 문법 |
|------|------|
| 노드 | `id: "label" [attrs]` |
| 연결 | `A -> B: "label"` |
| 다중연결 | `A -> (B, C)` |
| 그룹 | `group Name [attrs] { }` |
| 그룹참조 | `Group.node` |
| 포트참조 | `node:port` |

### 7.3 인포그래픽 문법

모든 인포그래픽 요소는 통일된 패턴:

```
키워드 "id" [속성] {
  속성: 값
}
```

| 타입 | 키워드 |
|------|--------|
| kpi | `item` |
| chart | `data`, `series` |
| timeline | `point` |
| process | `step` |
| funnel | `stage` |
| pyramid | `level` |
| matrix | `cell` |
| concentric | `ring` |
| stack | `layer` |
| cycle | `phase` |
| org | `member` |

### 7.4 셰이프 목록

```
rect        roundRect   circle      ellipse
diamond     hexagon     octagon     parallelogram
cylinder    cloud       person      document
queue       storage     database    folder
```

### 7.5 예약어

노드 ID로 사용 불가:
```
// 공통
group, place, data, true, false

// 인포그래픽 요소
item, series, point, step, stage, level, cell
ring, layer, phase, member

// 기술 특화
actor, system, container, component
source, transform, sink, external
region, vpc, subnet, resource
```

---

## 8. JSON IR (중간 표현)

### 8.1 공통 구조

```json
{
  "type": "diagram | infographic | page",
  "subtype": "string | null",
  "meta": { },
  "content": { }
}
```

### 8.2 다이어그램 IR

```json
{
  "type": "diagram",
  "subtype": null,
  "meta": {
    "title": "시스템 아키텍처",
    "theme": "professional",
    "direction": "TB"
  },
  "content": {
    "nodes": [
      {
        "id": "api",
        "label": "API Gateway",
        "shape": "hexagon",
        "style": { "fill": "#4A90D9" },
        "ports": []
      }
    ],
    "edges": [
      {
        "id": "e1",
        "source": "client",
        "target": "api",
        "label": "HTTPS",
        "style": { "line": "solid", "width": 1 }
      }
    ],
    "groups": [
      {
        "id": "backend",
        "label": "Backend",
        "children": ["api", "worker"],
        "style": {}
      }
    ]
  }
}
```

### 8.3 인포그래픽 IR

```json
{
  "type": "infographic",
  "subtype": "kpi",
  "meta": {
    "title": "핵심 지표",
    "layout": "horizontal"
  },
  "content": {
    "items": [
      {
        "id": "revenue",
        "value": "$2.5M",
        "label": "월 매출",
        "icon": "dollar-sign",
        "trend": { "direction": "up", "value": 15 },
        "color": "success"
      }
    ]
  }
}
```

### 8.4 페이지 IR

```json
{
  "type": "page",
  "meta": {
    "title": "Dashboard",
    "size": { "width": 1920, "height": 1080 },
    "grid": { "columns": 12, "rows": 8 }
  },
  "content": {
    "placements": [
      {
        "position": { "x": 0, "y": 0, "width": 3, "height": 2 },
        "document": { /* 중첩 IR */ }
      }
    ]
  }
}
```

---

## 9. 파서 구현 가이드

### 9.1 토큰

```
// 키워드
DOCUMENT_TYPE   @diagram, @infographic, @page
KEYWORD         group, place, data, series, item, step, ...
BOOLEAN         true, false

// 리터럴
IDENTIFIER      [a-zA-Z_][a-zA-Z0-9_-]*
STRING          "..." (이스케이프: \", \\, \n)
NUMBER          -?[0-9]+(\.[0-9]+)?
COLOR           #[0-9a-fA-F]{6}
PERCENT         [+-]?[0-9]+%

// 연산자
ARROW           ->, <->, -->, <-->, ==>, <==>
COLON           :
DOT             .
COMMA           ,

// 구분자
LBRACKET        [
RBRACKET        ]
LBRACE          {
RBRACE          }
LPAREN          (
RPAREN          )
META_DELIM      ---

// 공백
NEWLINE         \n
WHITESPACE      공백, 탭
```

### 9.2 EBNF 문법

```ebnf
(* 최상위 *)
document        = doc_header meta_block? body ;
doc_header      = "@" doc_type subtype? NEWLINE ;
doc_type        = "diagram" | "infographic" | "page" ;
subtype         = IDENTIFIER ;

(* 메타데이터 *)
meta_block      = META_DELIM NEWLINE meta_property* META_DELIM NEWLINE ;
meta_property   = IDENTIFIER ":" value NEWLINE ;

(* 본문 *)
body            = statement* ;
statement       = node_def | edge_stmt | group_def | element_def
                | place_def | comment ;

(* 노드 정의 *)
node_def        = IDENTIFIER (":" STRING)? attributes? NEWLINE ;
attributes      = "[" attr_list "]" ;
attr_list       = attribute ("," attribute)* ","? ;
attribute       = IDENTIFIER (":" value)? ;

(* 엣지 정의 - 체이닝 지원 *)
edge_stmt       = node_set (arrow node_set)+ (":" STRING)? NEWLINE ;
node_set        = node_ref | "(" node_ref ("," node_ref)* ")" ;
node_ref        = IDENTIFIER ("." IDENTIFIER)* (":" IDENTIFIER)? ;
arrow           = "->" | "<->" | "-->" | "<-->" | "==>" | "<==>" ;

(* 그룹 정의 *)
group_def       = "group" IDENTIFIER attributes? "{" body "}" ;

(* 요소 정의 - 인포그래픽용 *)
element_def     = element_kw STRING attributes? block? ;
element_kw      = "item" | "series" | "data" | "point" | "step"
                | "stage" | "level" | "cell" | "ring" | "layer"
                | "phase" | "member" | "actor" | "system"
                | "container" | "source" | "transform" | "sink"
                | "region" | "vpc" | "subnet" | "resource" | "external" ;
block           = "{" block_content "}" ;
block_content   = (block_property | element_def | edge_stmt)* ;

(* 블록 내 속성 - 문자열 키 허용 *)
block_property  = (IDENTIFIER | STRING) ":" value attr_annotation? NEWLINE ;
attr_annotation = "[" attr_list "]" ;

(* 복합 페이지 *)
place_def       = "place" position "{" document "}" ;
position        = "[" NUMBER "," NUMBER "," NUMBER "," NUMBER "]" ;

(* 값 *)
value           = STRING | NUMBER | BOOLEAN | IDENTIFIER
                | color | gradient | array | percent ;
color           = COLOR ;
gradient        = "gradient" "(" color "," color ")" ;
array           = "(" (array_item ("," array_item)*)? ")" ;  (* 빈 배열 허용 *)
array_item      = value attributes? ;  (* 배열 요소에 속성 허용 *)
percent         = PERCENT ;

(* 주석 *)
comment         = "//" [^\n]* | "/*" .* "*/" ;
```

### 9.3 파싱 전략

1. **토크나이저**: 줄 단위, 문자열 이스케이프 처리
2. **파서**: 재귀 하강 파서, 문서 타입별 분기
3. **의미 분석**: ID 중복, 참조 유효성, 필수 속성 검사
4. **IR 변환**: AST → JSON IR, 기본값 적용

---

## 10. 예시

### 10.1 간단한 플로우차트

```
@diagram
---
title: 로그인 프로세스
direction: TB
---

start: "시작" [circle]
input: "아이디/비밀번호 입력"
validate: "유효성 검사" [diamond]
success: "로그인 성공"
fail: "로그인 실패"
end: "종료" [circle]

start -> input -> validate
validate -> success: "성공"
validate -> fail: "실패"
success -> end
fail -> input
```

### 10.2 마이크로서비스

```
@diagram
---
title: E-Commerce Microservices
theme: professional
direction: LR
---

group Clients {
  web: "Web" [icon: globe]
  mobile: "Mobile" [icon: smartphone]
}

gateway: "Kong API Gateway" [hexagon, fill: #003459]

group Services [fill: #f0f4f8] {
  user: "User Service"
  product: "Product Service"
  order: "Order Service"
  payment: "Payment Service"
  notification: "Notification" [dashed]
}

group Data [fill: #fff8e7] {
  userdb: "Users" [cylinder]
  productdb: "Products" [cylinder]
  orderdb: "Orders" [cylinder]
  cache: "Redis" [cylinder, fill: #dc382d]
  queue: "RabbitMQ" [queue]
}

(Clients.web, Clients.mobile) -> gateway
gateway -> (Services.user, Services.product, Services.order)
Services.user -> Data.userdb
Services.product -> (Data.productdb, Data.cache)
Services.order -> (Data.orderdb, Services.payment)
Services.payment --> Services.notification: "async"
Services.notification -> Data.queue
```

### 10.3 제안서 대시보드

```
@page
---
title: 프로젝트 제안서
size: 1920x1080
grid: 12x8
---

place [0, 0, 3, 2] {
  @infographic kpi

  item "cost" {
    value: "$2.5M"
    label: "예상 비용 절감"
    icon: dollar-sign
    color: success
  }
}

place [3, 0, 3, 2] {
  @infographic kpi

  item "duration" {
    value: "6개월"
    label: "구현 기간"
    icon: calendar
  }
}

place [6, 0, 3, 2] {
  @infographic kpi

  item "efficiency" {
    value: "40%"
    label: "효율성 향상"
    trend: +15%
  }
}

place [9, 0, 3, 2] {
  @infographic kpi

  item "uptime" {
    value: "99.9%"
    label: "목표 가동률"
    icon: check-circle
  }
}

place [0, 2, 12, 2] {
  @infographic timeline
  ---
  title: 구현 로드맵
  orientation: horizontal
  ---

  point "Q1" [status: completed] {
    title: "분석"
  }
  point "Q2" [status: completed] {
    title: "설계"
  }
  point "Q3" [status: current] {
    title: "개발"
  }
  point "Q4" [status: upcoming] {
    title: "테스트/배포"
  }
}

place [0, 4, 6, 4] {
  @infographic stack
  ---
  title: 기술 스택
  ---

  layer "1" [color: #61dafb] {
    title: "Frontend"
    description: "React, TypeScript"
  }
  layer "2" [color: #68d391] {
    title: "Backend"
    description: "Node.js, GraphQL"
  }
  layer "3" [color: #f6ad55] {
    title: "Data"
    description: "PostgreSQL, Redis"
  }
  layer "4" [color: #a0aec0] {
    title: "Infra"
    description: "Kubernetes, AWS"
  }
}

place [6, 4, 6, 4] {
  @diagram
  ---
  direction: TB
  ---

  client: "Client"
  lb: "Load Balancer" [hexagon]

  group Services {
    api: "API"
    worker: "Worker"
  }

  db: "Database" [cylinder]

  client -> lb -> Services.api
  Services.api -> (Services.worker, db)
}
```

---

## 11. 참고 자료

### 유사 DSL

- [Mermaid](https://mermaid.js.org/)
- [D2](https://d2lang.com/)
- [PlantUML](https://plantuml.com/)
- [Graphviz DOT](https://graphviz.org/doc/info/lang.html)

### 파서 도구

- [Chevrotain](https://chevrotain.io/) - 권장
- [PEG.js / Peggy](https://peggyjs.org/)
- [Nearley](https://nearley.js.org/)
