# DSL 문법 레퍼런스

Diagen DSL은 다이어그램을 텍스트로 정의하기 위한 선언적 언어입니다. 이 문서는 DSL의 모든 문법 요소를 상세히 설명합니다.

## 목차

1. [문서 구조](#문서-구조)
2. [노드 정의](#노드-정의)
3. [엣지 정의](#엣지-정의)
4. [그룹 정의](#그룹-정의)
5. [스타일링](#스타일링)
6. [고급 기능](#고급-기능)
7. [문법 요약](#문법-요약)

---

## 문서 구조

모든 Diagen 문서는 다음 구조를 따릅니다:

```
@diagram [서브타입]
---
메타데이터 블록 (선택)
---
본문 (노드, 엣지, 그룹)
```

### 문서 헤더

문서는 반드시 `@diagram`, `@infographic`, 또는 `@page`로 시작해야 합니다.

#### @diagram

가장 일반적인 형태로, 노드와 연결선으로 구성된 다이어그램을 정의합니다.

```
@diagram
A -> B -> C
```

#### @diagram [서브타입]

서브타입을 지정하여 다이어그램의 용도를 명시할 수 있습니다:

```
@diagram flowchart    # 플로우차트
@diagram architecture # 아키텍처 다이어그램
@diagram sequence     # 시퀀스 다이어그램
@diagram pipeline     # 데이터 파이프라인
```

서브타입은 렌더링에 직접적인 영향은 없지만, 문서의 의도를 명확히 합니다.

### 메타데이터 블록

`---`로 감싸서 다이어그램의 메타정보를 정의합니다. 메타데이터 블록은 선택사항입니다.

```
@diagram
---
title: "시스템 아키텍처"
theme: professional
direction: TB
---
```

#### 지원하는 메타데이터 속성

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `title` | 문자열 | - | 다이어그램 제목 |
| `theme` | 문자열 | `professional` | 테마 이름 (`professional`, `modern`, `minimal`) |
| `direction` | 문자열 | `TB` | 레이아웃 방향 |

#### 레이아웃 방향

| 값 | 설명 | 흐름 |
|----|------|------|
| `TB` | Top to Bottom | 위 → 아래 |
| `BT` | Bottom to Top | 아래 → 위 |
| `LR` | Left to Right | 좌 → 우 |
| `RL` | Right to Left | 우 → 좌 |

**예시:**

```
@diagram
---
direction: LR
---
Input -> Process -> Output
```

---

## 노드 정의

노드는 다이어그램의 기본 구성 요소입니다.

### 기본 형식

```
노드ID: "라벨" [속성들]
```

각 부분은 선택적입니다:

| 요소 | 필수 | 설명 |
|------|------|------|
| `노드ID` | O | 노드의 고유 식별자 (영문, 숫자, 언더스코어) |
| `"라벨"` | X | 표시될 텍스트 (생략시 ID가 라벨로 사용됨) |
| `[속성]` | X | 도형, 색상 등의 스타일 속성 |

### 노드 ID 규칙

- 영문자로 시작해야 합니다
- 영문자, 숫자, 언더스코어(`_`) 사용 가능
- 대소문자를 구분합니다
- 예약어는 사용할 수 없습니다 (`group`, `true`, `false`)

**올바른 예시:**
```
Server
api_server
WebServer1
DB_Primary
```

**잘못된 예시:**
```
1server      # 숫자로 시작
my-server    # 하이픈 사용
group        # 예약어
```

### 노드 정의 예시

```
# ID만 (라벨 = ID)
Server

# ID와 라벨
Server: "웹 서버"

# ID, 라벨, 도형
Server: "웹 서버" [roundRect]

# ID, 라벨, 도형, 스타일
Server: "웹 서버" [roundRect, fill: #4A90D9, stroke: #2E5B8A]

# 도형만 지정 (라벨 = ID)
DB [cylinder]
```

### 암묵적 노드 생성

엣지에서 사용된 노드는 명시적으로 정의하지 않아도 자동 생성됩니다:

```
@diagram
A -> B -> C   # A, B, C 노드가 자동 생성됨
```

단, 암묵적 노드는 기본 도형(`rect`)과 ID를 라벨로 사용합니다. 커스텀 라벨이나 도형이 필요하면 명시적으로 정의하세요.

### 지원 도형

| 도형 | 키워드 | 설명 | 권장 용도 |
|------|--------|------|----------|
| 사각형 | `rect` | 기본 직사각형 | 일반 프로세스, 서비스 |
| 둥근 사각형 | `roundRect` | 모서리가 둥근 사각형 | 액션, 단계, 함수 |
| 원 | `circle` | 정원 | 시작/종료, 이벤트 |
| 마름모 | `diamond` | 45도 회전된 사각형 | 조건, 분기점 |
| 육각형 | `hexagon` | 6각형 | 준비, 초기화, 게이트웨이 |
| 원통 | `cylinder` | 3D 원통 | 데이터베이스, 저장소 |
| 구름 | `cloud` | 구름 모양 | 외부 서비스, 클라우드 |
| 문서 | `document` | 물결 모양 하단 | 문서, 리포트, 파일 |
| 큐 | `queue` | 큐 모양 | 메시지 큐, 버퍼 |
| 사람 | `person` | 사람 아이콘 | 사용자, 액터 |

**도형별 시각적 표현:**

```
@diagram
---
title: "지원 도형"
direction: LR
---
Rect: "rect" [rect]
Round: "roundRect" [roundRect]
Circle: "circle" [circle]
Diamond: "diamond" [diamond]
Hex: "hexagon" [hexagon]
Cyl: "cylinder" [cylinder]
Cloud: "cloud" [cloud]
Doc: "document" [document]
Queue: "queue" [queue]
Person: "person" [person]
```

---

## 엣지 정의

엣지는 노드 간의 연결을 정의합니다.

### 기본 형식

```
소스노드 -> 타겟노드: "라벨"
```

### 화살표 타입

총 6가지 화살표 타입을 지원합니다:

| 화살표 | 이름 | 선 스타일 | 방향 |
|--------|------|----------|------|
| `->` | 실선 | 실선 | 단방향 |
| `<->` | 실선 양방향 | 실선 | 양방향 |
| `-->` | 점선 | 점선 | 단방향 |
| `<-->` | 점선 양방향 | 점선 | 양방향 |
| `==>` | 굵은선 | 굵은 실선 | 단방향 |
| `<=>` | 굵은선 양방향 | 굵은 실선 | 양방향 |

**예시:**

```
@diagram
A -> B          # 실선 단방향
B <-> C         # 실선 양방향 (데이터 흐름이 양방향일 때)
C --> D         # 점선 단방향 (의존성, 비동기 등)
D <--> E        # 점선 양방향
E ==> F         # 굵은선 단방향 (주요 흐름 강조)
F <=> G         # 굵은선 양방향
```

### 엣지 라벨

화살표 뒤에 콜론과 따옴표로 라벨을 추가합니다:

```
@diagram
Client -> Server: "HTTPS 요청"
Server -> DB: "SQL 쿼리"
Server --> Client: "응답"
```

라벨은 연결의 성격을 설명하는 데 사용합니다:
- 프로토콜: `"HTTPS"`, `"gRPC"`, `"WebSocket"`
- 데이터: `"JSON"`, `"binary"`
- 액션: `"저장"`, `"조회"`, `"인증"`
- 조건: `"성공"`, `"실패"`, `"타임아웃"`

### 체인 연결

여러 노드를 한 줄로 연결할 수 있습니다:

```
A -> B -> C -> D -> E
```

이 코드는 다음과 같은 4개의 엣지를 생성합니다:
- A → B
- B → C
- C → D
- D → E

**체인 중간에 라벨 추가:**

```
A -> B: "요청" -> C: "처리" -> D: "저장"
```

### 다중 연결

#### 다중 타겟 (Fan-out)

하나의 소스에서 여러 타겟으로 연결:

```
@diagram
LB: "Load Balancer" [hexagon]
S1: "Server 1"
S2: "Server 2"
S3: "Server 3"

LB -> (S1, S2, S3)
```

이 코드는 3개의 엣지를 생성합니다:
- LB → S1
- LB → S2
- LB → S3

#### 다중 소스 (Fan-in)

여러 소스에서 하나의 타겟으로 연결:

```
@diagram
Producer1: "Producer 1"
Producer2: "Producer 2"
Queue: "Message Queue" [queue]

(Producer1, Producer2) -> Queue
```

#### 다중-다중 연결

여러 소스에서 여러 타겟으로 연결:

```
(A, B) -> (X, Y)
```

이 코드는 4개의 엣지를 생성합니다:
- A → X
- A → Y
- B → X
- B → Y

---

## 그룹 정의

그룹은 관련된 노드들을 묶어서 시각적으로 구분합니다.

### 기본 형식

```
group 그룹ID [속성] {
  노드 정의...
}
```

### 그룹 예시

```
@diagram
group Backend [label: "백엔드 서비스"] {
  API: "API 서버"
  Worker: "Background Worker"
  Cache: "Redis" [cylinder]
}
```

### 그룹 스타일 속성

```
group MyGroup [label: "그룹 이름", fill: #f0f0f0, stroke: #333] {
  ...
}
```

| 속성 | 설명 |
|------|------|
| `label` | 그룹 헤더에 표시될 이름 |
| `fill` | 그룹 배경색 |
| `stroke` | 그룹 테두리색 |

### 그룹 내 노드 참조

그룹 외부에서 그룹 내 노드를 참조할 때는 점(`.`) 표기법을 사용합니다:

```
@diagram
Client: "클라이언트" [cloud]

group Backend [label: "백엔드"] {
  API: "API 서버"
  DB: "Database" [cylinder]
}

# 그룹 외부에서 그룹 내 노드 참조
Client -> Backend.API
Backend.API -> Backend.DB
```

### 중첩 그룹

그룹 안에 그룹을 정의할 수 있습니다:

```
@diagram
group Infrastructure [label: "인프라"] {
  group K8s [label: "Kubernetes"] {
    Pod1: "Pod 1"
    Pod2: "Pod 2"
  }

  LB: "Load Balancer" [hexagon]
}

External: "외부 트래픽" [cloud]
External -> Infrastructure.LB
Infrastructure.LB -> Infrastructure.K8s.Pod1
Infrastructure.LB -> Infrastructure.K8s.Pod2
```

### 그룹 간 연결

그룹 레벨에서 연결하면 그룹의 대표 노드(첫 번째 노드)에 연결됩니다:

```
@diagram
group A [label: "서비스 A"] {
  A1: "노드 1"
  A2: "노드 2"
}

group B [label: "서비스 B"] {
  B1: "노드 1"
}

A.A1 -> B.B1
```

---

## 스타일링

노드와 그룹에 다양한 스타일을 적용할 수 있습니다.

### 노드 스타일 속성

대괄호 `[]` 안에 스타일 속성을 지정합니다:

```
Node: "라벨" [도형, 속성1: 값1, 속성2: 값2]
```

| 속성 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `fill` | 색상 | 배경색 | `fill: #4A90D9` |
| `stroke` | 색상 | 테두리색 | `stroke: #333333` |
| `strokeWidth` | 숫자 | 테두리 두께 | `strokeWidth: 2` |
| `opacity` | 숫자 | 투명도 (0-1) | `opacity: 0.8` |
| `dashed` | 불린 | 점선 테두리 | `dashed: true` |
| `shadow` | 불린 | 그림자 효과 | `shadow: true` |

### 색상 표현

#### Hex 색상

```
fill: #4A90D9        # 6자리
fill: #333           # 3자리 (축약형)
fill: #4A90D9CC      # 8자리 (투명도 포함)
```

#### 명명된 색상

```
fill: red
fill: blue
fill: green
fill: orange
```

### 스타일 조합 예시

```
@diagram
# 기본 스타일
Normal: "일반" [rect]

# 성공 상태
Success: "성공" [roundRect, fill: #d4edda, stroke: #28a745]

# 경고 상태
Warning: "경고" [roundRect, fill: #fff3cd, stroke: #ffc107]

# 에러 상태
Error: "에러" [roundRect, fill: #f8d7da, stroke: #dc3545]

# 비활성화
Disabled: "비활성" [rect, fill: #e9ecef, stroke: #6c757d, dashed: true]

# 강조
Highlight: "중요" [roundRect, fill: #4A90D9, stroke: #2E5B8A, shadow: true]
```

### 테마

테마는 전체 다이어그램의 기본 스타일을 정의합니다.

#### 내장 테마

| 테마 | 특징 |
|------|------|
| `professional` | 깔끔하고 비즈니스적인 스타일 (기본값) |
| `modern` | 밝고 현대적인 색상 |
| `minimal` | 최소한의 스타일, 흑백 기반 |

**메타데이터에서 테마 지정:**

```
@diagram
---
theme: modern
---
```

**API에서 테마 지정:**

```typescript
const svg = await dslToSvg(source, { theme: 'minimal' });
```

---

## 고급 기능

### 복잡한 다중 연결

여러 노드 그룹 간의 연결을 효율적으로 정의:

```
@diagram
# 클라이언트 그룹
Web: "웹"
Mobile: "모바일"
Desktop: "데스크톱"

# 서버 그룹
API1: "API 1"
API2: "API 2"

# 모든 클라이언트가 모든 서버에 연결
(Web, Mobile, Desktop) -> (API1, API2)
```

### 조건 분기 패턴

```
@diagram flowchart
Start: "시작" [circle]
Check: "조건 확인" [diamond]
PathA: "경로 A"
PathB: "경로 B"
Merge: "병합" [diamond]
End: "종료" [circle]

Start -> Check
Check -> PathA: "조건 만족"
Check -> PathB: "조건 불만족"
PathA -> Merge
PathB -> Merge
Merge -> End
```

### 양방향 통신 패턴

```
@diagram
Client: "클라이언트"
Server: "서버"

# 요청-응답 패턴
Client -> Server: "요청"
Server --> Client: "응답"

# 또는 양방향 화살표 사용
Client <-> Server: "WebSocket"
```

### 계층형 아키텍처 패턴

```
@diagram architecture
---
title: "계층형 아키텍처"
direction: TB
---

group Presentation [label: "프레젠테이션 계층"] {
  UI: "UI 컴포넌트"
  Controller: "컨트롤러"
}

group Business [label: "비즈니스 계층"] {
  Service: "서비스"
  Domain: "도메인 모델"
}

group Data [label: "데이터 계층"] {
  Repository: "리포지토리"
  DB: "데이터베이스" [cylinder]
}

Presentation.UI -> Presentation.Controller
Presentation.Controller -> Business.Service
Business.Service -> Business.Domain
Business.Service -> Data.Repository
Data.Repository -> Data.DB
```

---

## 문법 요약

### 전체 문법 (EBNF)

```ebnf
document     = header metaBlock? body
header       = ("@diagram" | "@infographic" | "@page") identifier?
metaBlock    = "---" (property)* "---"
property     = identifier ":" value
body         = (statement)*
statement    = groupDef | nodeDef | edgeStmt

groupDef     = "group" identifier attributes? "{" body "}"
nodeDef      = identifier (":" stringLiteral)? attributes?
edgeStmt     = nodeSet (arrow nodeSet (":" stringLiteral)?)*

nodeSet      = identifier | "(" identifier ("," identifier)* ")"
arrow        = "->" | "<->" | "-->" | "<-->" | "==>" | "<=>"
attributes   = "[" (attribute ("," attribute)*)? "]"
attribute    = identifier (":" value)?
value        = stringLiteral | number | boolean | color | identifier
```

### 빠른 참조 카드

```
# 문서 시작
@diagram [subtype]

# 메타데이터
---
title: "제목"
theme: professional    # professional | modern | minimal
direction: TB          # TB | BT | LR | RL
---

# 노드
NodeId                           # ID만
NodeId: "라벨"                   # ID와 라벨
NodeId: "라벨" [도형]            # 도형 추가
NodeId: "라벨" [도형, fill: #색상] # 스타일 추가

# 도형
rect | roundRect | circle | diamond | hexagon
cylinder | cloud | document | queue | person

# 엣지
A -> B                   # 실선
A --> B                  # 점선
A ==> B                  # 굵은선
A <-> B                  # 양방향
A -> B: "라벨"           # 라벨 추가
A -> B -> C              # 체인
A -> (B, C)              # 다중 타겟
(A, B) -> C              # 다중 소스

# 그룹
group GroupId [label: "이름"] {
  Node1: "노드1"
  Node2: "노드2"
}

# 그룹 노드 참조
GroupId.NodeId

# 스타일 속성
fill: #색상              # 배경색
stroke: #색상            # 테두리색
strokeWidth: 숫자        # 테두리 두께
opacity: 0-1             # 투명도
dashed: true/false       # 점선 테두리
shadow: true/false       # 그림자
```

---

## 자주 묻는 질문 (FAQ)

### Q: 노드 ID에 한글을 사용할 수 있나요?

A: 아니요, 노드 ID는 영문자, 숫자, 언더스코어만 사용할 수 있습니다. 한글은 라벨에 사용하세요:

```
Server: "서버"    # O
서버              # X
```

### Q: 화살표에 스타일을 적용할 수 있나요?

A: 현재는 화살표 타입(`->`, `-->`, `==>`)으로만 스타일을 구분합니다. 향후 엣지 스타일 속성이 추가될 예정입니다.

### Q: 노드를 여러 번 정의하면 어떻게 되나요?

A: 첫 번째 정의가 사용되고, 이후 정의는 무시됩니다. 단, 엣지에서 참조할 때는 같은 노드를 사용합니다:

```
A: "첫 번째"      # 이 정의가 사용됨
A: "두 번째"      # 무시됨
A -> B            # A는 "첫 번째" 라벨을 가짐
```

### Q: 주석을 사용할 수 있나요?

A: 현재 버전에서는 주석을 지원하지 않습니다. 향후 `#` 또는 `//` 스타일의 주석이 추가될 예정입니다.
