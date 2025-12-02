# Diagen 프레임워크 설계서

**버전**: 0.1.0
**최종 수정**: 2025-12-01

---

## 목차

1. [개요](#1-개요)
2. [아키텍처](#2-아키텍처)
3. [DSL 명세](#3-dsl-명세)
4. [타입 시스템](#4-타입-시스템)
5. [컴파일러 파이프라인](#5-컴파일러-파이프라인)
6. [레이아웃 엔진](#6-레이아웃-엔진)
7. [렌더링 시스템](#7-렌더링-시스템)
8. [테마 시스템](#8-테마-시스템)
9. [출력 형식](#9-출력-형식)
10. [공개 API](#10-공개-api)
11. [확장성](#11-확장성)
12. [도구 생태계](#12-도구-생태계)

---

## 1. 개요

### 1.1 프로젝트 정의

**Diagen**은 코드 기반의 다이어그램 및 인포그래픽 생성 프레임워크입니다.

```
┌─────────────────────────────────────────────────────────────┐
│                         Diagen                              │
│                                                             │
│   "Code-driven diagrams with professional quality"          │
│                                                             │
│   DSL 텍스트  ──────►  아키텍처 다이어그램                    │
│                        플로우차트                            │
│                        인포그래픽                            │
│                        기술 문서 시각화                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 가치

| 가치 | 설명 |
|------|------|
| **코드 중심** | 버전 관리, 협업, 자동화가 가능한 텍스트 기반 정의 |
| **프로페셔널 품질** | 제안서, 발표자료 수준의 디자인 품질 |
| **자동 레이아웃** | 수동 배치 없이 깔끔한 레이아웃 자동 생성 |
| **확장 가능** | 커스텀 노드, 테마, 출력 형식 지원 |

### 1.3 지원 다이어그램 유형

#### 범용 다이어그램
- 플로우차트 (Flowchart)
- 시퀀스 다이어그램 (Sequence)
- 상태 다이어그램 (State)
- 클래스 다이어그램 (Class)
- ER 다이어그램 (ER)
- 마인드맵 (Mindmap)

#### 기술 특화 다이어그램
- C4 모델 (Context, Container, Component)
- 클라우드 아키텍처 (AWS, GCP, Azure)
- 데이터 파이프라인
- 신경망 아키텍처

#### 인포그래픽
- KPI 카드
- 차트 (막대, 라인, 파이, 도넛)
- 타임라인
- 프로세스 플로우
- 퍼널, 피라미드
- 매트릭스 (2x2)
- 조직도

---

## 2. 아키텍처

### 2.1 시스템 구조

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              사용자 인터페이스                                │
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│   │    CLI      │   │  VS Code    │   │    Web      │   │  Library    │    │
│   │   도구      │   │   확장      │   │ Playground  │   │    API      │    │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              공개 API 레이어                                 │
│                                                                             │
│   compile()     render()     exportSvg()     exportPng()     validate()    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            컴파일러 파이프라인                                │
│                                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│   │  Lexer  │──►│ Parser  │──►│ Visitor │──►│Compiler │──►│ Layout  │     │
│   │         │   │         │   │         │   │         │   │         │     │
│   │ 어휘분석 │   │ 구문분석 │   │ IR 변환  │   │  컴파일  │   │ 레이아웃 │     │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
│                                                                             │
│   DSL Text ──► Tokens ──► CST ──► IR ──► Model ──► Positioned Model        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              렌더링 레이어                                   │
│                                                                             │
│   ┌───────────────────────┐   ┌───────────────────────┐                    │
│   │      다이어그램        │   │      인포그래픽        │                    │
│   │                       │   │                       │                    │
│   │   React Flow 기반      │   │     Visx 기반         │                    │
│   │   - 커스텀 노드        │   │   - 차트 컴포넌트      │                    │
│   │   - 커스텀 엣지        │   │   - 레이아웃 컴포넌트   │                    │
│   │   - 그룹 렌더링        │   │   - 애니메이션         │                    │
│   └───────────────────────┘   └───────────────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               출력 레이어                                    │
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│   │    React    │   │     SVG     │   │     PNG     │   │     PDF     │    │
│   │  Component  │   │             │   │             │   │             │    │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 모듈 구조

```
diagen/
├── src/
│   ├── parser/              # DSL 파서
│   │   ├── lexer.ts         # 어휘 분석기 (Chevrotain)
│   │   ├── parser.ts        # 구문 분석기 (Chevrotain)
│   │   ├── visitor.ts       # CST → IR 변환
│   │   └── index.ts
│   │
│   ├── compiler/            # 컴파일러
│   │   ├── compiler.ts      # IR → Model 변환
│   │   ├── validator.ts     # 유효성 검사
│   │   ├── themeApplier.ts  # 테마 적용
│   │   └── index.ts
│   │
│   ├── core/                # 코어 모델
│   │   ├── DiagramModel.ts  # 다이어그램 모델
│   │   └── index.ts
│   │
│   ├── layout/              # 레이아웃 엔진
│   │   ├── elkAdapter.ts    # ELK.js 어댑터
│   │   └── index.ts
│   │
│   ├── renderer/            # 렌더러
│   │   ├── DiagramRenderer.tsx
│   │   ├── nodes/           # 노드 컴포넌트
│   │   ├── edges/           # 엣지 컴포넌트
│   │   └── index.ts
│   │
│   ├── export/              # 출력 모듈
│   │   ├── svgExporter.ts
│   │   ├── pngExporter.ts
│   │   └── index.ts
│   │
│   ├── themes/              # 테마
│   │   ├── professional.ts
│   │   ├── modern.ts
│   │   ├── minimal.ts
│   │   └── index.ts
│   │
│   ├── types/               # 타입 정의
│   │   ├── node.ts
│   │   ├── edge.ts
│   │   ├── style.ts
│   │   ├── theme.ts
│   │   ├── ir.ts
│   │   └── index.ts
│   │
│   ├── pipeline/            # 통합 파이프라인
│   │   └── index.ts
│   │
│   └── index.ts             # 공개 API
│
├── packages/
│   ├── cli/                 # CLI 도구
│   └── vscode/              # VS Code 확장
│
└── docs/                    # 문서
```

### 2.3 의존성 그래프

```
                    ┌──────────────┐
                    │    types     │
                    │  (타입 정의)  │
                    └──────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │    parser    │ │    themes    │ │     core     │
    │   (파서)     │ │   (테마)     │ │   (모델)     │
    └──────────────┘ └──────────────┘ └──────────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   compiler   │
                    │  (컴파일러)   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    layout    │
                    │ (레이아웃)    │
                    └──────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌──────────────┐               ┌──────────────┐
    │   renderer   │               │    export    │
    │   (렌더러)   │               │   (출력)     │
    └──────────────┘               └──────────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   pipeline   │
                    │  (파이프라인) │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Public API  │
                    │  (공개 API)   │
                    └──────────────┘
```

### 2.4 기술 스택

| 영역 | 기술 | 역할 |
|------|------|------|
| 언어 | TypeScript | 타입 안전성 |
| 빌드 | Vite | 번들링, 개발 서버 |
| 패키지 관리 | pnpm | 의존성 관리 |
| 파서 | Chevrotain | 렉서/파서 생성 |
| 다이어그램 렌더링 | React Flow | 노드-엣지 렌더링 |
| 인포그래픽 렌더링 | Visx | SVG 시각화 |
| 레이아웃 | ELK.js | 자동 그래프 레이아웃 |
| 애니메이션 | Framer Motion | UI 애니메이션 |
| 테스트 | Vitest | 단위/통합 테스트 |

---

## 3. DSL 명세

### 3.1 파일 형식

- **확장자**: `.diagen`
- **인코딩**: UTF-8
- **줄바꿈**: LF (Unix) 또는 CRLF (Windows)

### 3.2 문서 구조

```
┌─────────────────────────────────────────┐
│           문서 헤더 (필수)               │
│   @diagram | @infographic | @page       │
├─────────────────────────────────────────┤
│           메타데이터 블록 (선택)          │
│   ---                                   │
│   key: value                            │
│   ---                                   │
├─────────────────────────────────────────┤
│           본문 (필수)                    │
│   노드, 엣지, 그룹 정의                  │
└─────────────────────────────────────────┘
```

### 3.3 문법 개요

#### 3.3.1 문서 헤더

```diagen
@diagram                    # 기본 다이어그램
@diagram flowchart          # 플로우차트 서브타입
@diagram sequence           # 시퀀스 다이어그램
@diagram c4 context         # C4 컨텍스트 다이어그램

@infographic               # 기본 인포그래픽
@infographic timeline      # 타임라인
@infographic funnel        # 퍼널

@page                      # 복합 페이지
```

#### 3.3.2 메타데이터

```diagen
---
title: "시스템 아키텍처"
theme: professional
direction: TB
nodeSpacing: 50
---
```

#### 3.3.3 노드 정의

```diagen
# 기본 노드
A                           # ID만 (라벨 = ID)
A: "API 서버"               # ID: 라벨
A: "API 서버" [rect]        # ID: 라벨 [모양]

# 스타일 속성
A: "서버" [
  rect,
  fill: #4A90D9,
  stroke: #2E5A8B,
  icon: server
]

# 노드 모양
[rect]                      # 사각형 (기본)
[roundRect]                 # 둥근 사각형
[circle]                    # 원
[ellipse]                   # 타원
[diamond]                   # 다이아몬드
[hexagon]                   # 육각형
[cylinder]                  # 실린더 (DB)
[cloud]                     # 클라우드
[person]                    # 사람
[document]                  # 문서
[queue]                     # 큐
```

#### 3.3.4 엣지 정의

```diagen
# 화살표 유형
A -> B                      # 단방향 실선
A <-> B                     # 양방향 실선
A --> B                     # 단방향 점선
A <--> B                    # 양방향 점선
A ==> B                     # 단방향 굵은선
A <==> B                    # 양방향 굵은선

# 엣지 라벨
A -> B: "요청"              # 라벨 추가
A -> B: "HTTP" [dashed]     # 라벨 + 스타일

# 체인 연결
A -> B -> C -> D            # 순차 연결
A -> (B, C, D)              # 분기 (1:N)
(A, B, C) -> D              # 병합 (N:1)
```

#### 3.3.5 그룹 정의

```diagen
group Backend [label: "백엔드", fill: #f0f0f0] {
  API: "API 서버"
  DB: "데이터베이스" [cylinder]
  API -> DB
}

group Frontend {
  Web: "웹 클라이언트"
  Mobile: "모바일 앱"
}

Frontend.Web -> Backend.API
```

#### 3.3.6 포트

```diagen
# 포트 정의
Server: "서버" [
  ports: (
    in [top],
    out [bottom],
    api [right]
  )
]

# 포트 참조
Client -> Server:in
Server:out -> DB
Server:api -> External
```

### 3.4 인포그래픽 문법

#### 3.4.1 KPI 카드

```diagen
@infographic kpi

item "매출" {
  value: "$1.2M"
  change: +15%
  trend: up
  icon: dollar
}

item "사용자" {
  value: "50,000"
  change: +8%
  period: "이번 달"
}
```

#### 3.4.2 차트

```diagen
@infographic chart

data "월별 매출" [bar] {
  "1월": 100
  "2월": 150
  "3월": 200
  "4월": 180
}

data "성장률" [line, color: #4A90D9] {
  series "2023" { ... }
  series "2024" { ... }
}
```

#### 3.4.3 타임라인

```diagen
@infographic timeline

point "2020" [completed] {
  title: "프로젝트 시작"
  description: "초기 팀 구성"
}

point "2022" [current] {
  title: "v1.0 출시"
}

point "2024" [upcoming] {
  title: "글로벌 확장"
}
```

#### 3.4.4 프로세스

```diagen
@infographic process

step "수집" [icon: database] {
  description: "데이터 수집 단계"
}

step "분석" [icon: chart] {
  description: "데이터 분석"
}

step "시각화" [icon: eye] {
  description: "결과 시각화"
}
```

### 3.5 복합 페이지

```diagen
@page

place [0, 0, 400, 300] {
  @diagram flowchart
  A -> B -> C
}

place [420, 0, 300, 300] {
  @infographic kpi
  item "지표" { value: "100" }
}

place [0, 320, 720, 200] {
  @infographic chart
  data "추이" [line] { ... }
}
```

---

## 4. 타입 시스템

### 4.1 노드 타입

```typescript
// 노드 모양
type NodeShape =
  | 'rect'        // 사각형
  | 'roundRect'   // 둥근 사각형
  | 'circle'      // 원
  | 'ellipse'     // 타원
  | 'diamond'     // 다이아몬드
  | 'hexagon'     // 육각형
  | 'cylinder'    // 실린더
  | 'database'    // 데이터베이스 (cylinder 별칭)
  | 'cloud'       // 클라우드
  | 'person'      // 사람
  | 'document'    // 문서
  | 'queue'       // 큐
  | 'storage';    // 저장소

// 다이어그램 노드
interface DiagramNode {
  id: string;
  label: string;
  shape?: NodeShape;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: NodeStyle;
  icon?: string;
  ports?: Port[];
  parentId?: string;  // 그룹 ID
}

// 포트
interface Port {
  id: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
}
```

### 4.2 엣지 타입

```typescript
// 엣지 라인 타입
type EdgeLineType = 'solid' | 'dashed' | 'bold';

// 다이어그램 엣지
interface DiagramEdge {
  id: string;
  source: string;       // 소스 노드 ID
  target: string;       // 타겟 노드 ID
  sourcePort?: string;  // 소스 포트 ID
  targetPort?: string;  // 타겟 포트 ID
  label?: string;
  style?: EdgeStyle;
  bidirectional?: boolean;
}
```

### 4.3 그룹 타입

```typescript
interface DiagramGroup {
  id: string;
  label?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: NodeStyle;
  parentId?: string;    // 부모 그룹 ID
  children: string[];   // 자식 노드/그룹 ID
}
```

### 4.4 스타일 타입

```typescript
// 노드 스타일
interface NodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  opacity?: number;
  dashed?: boolean;
  shadow?: Shadow;
  gradient?: Gradient;
}

// 엣지 스타일
interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  lineType?: EdgeLineType;
  opacity?: number;
  animated?: boolean;
}

// 그림자
interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

// 그라디언트
interface Gradient {
  from: string;
  to: string;
  direction?: 'vertical' | 'horizontal';
}
```

### 4.5 중간 표현 (IR)

```typescript
// 다이어그램 IR
interface DiagramIR {
  type: 'diagram';
  subtype?: string;
  meta: Record<string, unknown>;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
}

// 인포그래픽 IR
interface InfographicIR {
  type: 'infographic';
  subtype?: string;
  meta: Record<string, unknown>;
  elements: InfographicElement[];
}

// 페이지 IR
interface PageIR {
  type: 'page';
  meta: Record<string, unknown>;
  placements: Placement[];
}
```

---

## 5. 컴파일러 파이프라인

### 5.1 파이프라인 단계

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   DSL    │──►│  Tokens  │──►│   CST    │──►│    IR    │──►│  Model   │
│  텍스트   │   │  토큰들   │   │ 구문트리  │   │ 중간표현  │   │  모델    │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   │               │               │               │
               ┌───┴───┐       ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
               │ Lexer │       │Parser │       │Visitor│       │Compiler│
               │어휘분석│       │구문분석│       │IR변환 │       │ 컴파일 │
               └───────┘       └───────┘       └───────┘       └───────┘
```

### 5.2 어휘 분석 (Lexer)

```typescript
// 토큰 카테고리
const TokenCategories = {
  // 문서 헤더
  AtDiagram: /@diagram/,
  AtInfographic: /@infographic/,
  AtPage: /@page/,

  // 화살표 연산자 (길이 순으로 정렬)
  BoldBiArrow: /<==>/,
  BoldArrow: /==>/,
  DashedBiArrow: /<-->/,
  DashedArrow: /-->/,
  BiArrow: /<->/,
  Arrow: /->/,

  // 리터럴
  StringLiteral: /"[^"]*"/,
  NumberLiteral: /-?\d+(\.\d+)?/,
  Color: /#[0-9a-fA-F]{3,8}/,
  Percent: /-?\d+(\.\d+)?%/,

  // 키워드
  Group: /group/,
  Place: /place/,
  True: /true/,
  False: /false/,

  // 구분자
  LBrace: /\{/,
  RBrace: /\}/,
  LBracket: /\[/,
  RBracket: /\]/,
  // ...
};
```

### 5.3 구문 분석 (Parser)

```typescript
// 주요 문법 규칙
class DiagenParser extends CstParser {
  document = this.RULE('document', () => {
    this.SUBRULE(this.documentHeader);
    this.OPTION(() => this.SUBRULE(this.metaBlock));
    this.SUBRULE(this.body);
  });

  nodeOrEdgeStatement = this.RULE('nodeOrEdgeStatement', () => {
    this.SUBRULE(this.nodeSet);
    this.OPTION(() => this.SUBRULE(this.edgeChain));
  });

  edgeChain = this.RULE('edgeChain', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.arrowOp);
      this.SUBRULE(this.nodeSet);
      this.OPTION(() => {
        this.CONSUME(Colon);
        this.CONSUME(StringLiteral);  // 엣지 라벨
      });
    });
  });
}
```

### 5.4 IR 변환 (Visitor)

```typescript
class DiagenVisitor extends BaseCstVisitor {
  document(ctx: CstContext): DiagramIR {
    const header = this.visit(ctx.documentHeader);
    const meta = ctx.metaBlock ? this.visit(ctx.metaBlock) : {};
    const body = this.visit(ctx.body);

    return {
      type: header.type,
      subtype: header.subtype,
      meta,
      ...body
    };
  }
}
```

### 5.5 컴파일 (Compiler)

```typescript
class Compiler {
  compile(ir: DiagramIR, options?: CompilerOptions): CompileResult {
    // 1. 유효성 검사
    const validation = this.validate(ir);
    if (validation.errors.length > 0) {
      return { model: null, errors: validation.errors };
    }

    // 2. 테마 적용
    const themed = this.applyTheme(ir, options?.theme);

    // 3. 노드 정규화 (암시적 노드 생성)
    const normalized = this.normalizeNodes(themed);

    // 4. 그룹 계층 구축
    const hierarchical = this.buildHierarchy(normalized);

    // 5. DiagramModel 생성
    const model = new DiagramModel();
    // ... 모델 구성

    return { model, errors: [], warnings: validation.warnings };
  }
}
```

---

## 6. 레이아웃 엔진

### 6.1 ELK.js 통합

```typescript
class ElkLayoutAdapter {
  private elk: ELK;

  async layout(model: DiagramModel, options?: LayoutOptions): Promise<void> {
    // 1. DiagramModel → ELK 그래프 변환
    const elkGraph = this.toElkGraph(model, options);

    // 2. ELK 레이아웃 실행
    const result = await this.elk.layout(elkGraph);

    // 3. 결과 적용
    this.applyLayout(model, result);
  }

  private toElkGraph(model: DiagramModel, options?: LayoutOptions): ElkNode {
    return {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': options?.algorithm ?? 'layered',
        'elk.direction': options?.direction ?? 'DOWN',
        'elk.spacing.nodeNode': String(options?.nodeSpacing ?? 50),
        'elk.edgeRouting': 'ORTHOGONAL',
        // ...
      },
      children: model.nodes.map(this.nodeToElk),
      edges: model.edges.map(this.edgeToElk),
    };
  }
}
```

### 6.2 레이아웃 알고리즘

| 알고리즘 | 용도 | 특징 |
|---------|------|------|
| `layered` | 플로우차트, 아키텍처 | 계층적, 방향성 있는 그래프 |
| `force` | 네트워크, 관계도 | 물리 시뮬레이션 기반 |
| `stress` | 일반 그래프 | 거리 기반 최적화 |
| `mrtree` | 트리 구조 | 계층적 트리 레이아웃 |
| `radial` | 방사형 | 중심에서 방사형 확산 |

### 6.3 레이아웃 옵션

```typescript
interface LayoutOptions {
  algorithm?: 'layered' | 'force' | 'stress' | 'mrtree' | 'radial';
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  nodeSpacing?: number;
  layerSpacing?: number;
  edgeRouting?: 'orthogonal' | 'polyline' | 'spline';
  alignNodes?: 'center' | 'left' | 'right';
}
```

---

## 7. 렌더링 시스템

### 7.1 다이어그램 렌더러 (React Flow)

```typescript
// 노드 타입 매핑
const nodeTypes: NodeTypes = {
  rect: BaseNode,
  roundRect: BaseNode,
  circle: CircleNode,
  diamond: DiamondNode,
  hexagon: HexagonNode,
  cylinder: CylinderNode,
  cloud: CloudNode,
  person: PersonNode,
  document: DocumentNode,
  queue: QueueNode,
  group: GroupNode,
};

// 엣지 타입 매핑
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// 렌더러 컴포넌트
function DiagramRenderer({ model, ...options }: DiagramRendererProps) {
  const nodes = useMemo(() => convertNodes(model), [model]);
  const edges = useMemo(() => convertEdges(model), [model]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={options.fitView}
      >
        {options.showBackground && <Background />}
        {options.showControls && <Controls />}
        {options.showMiniMap && <MiniMap />}
      </ReactFlow>
    </ReactFlowProvider>
  );
}
```

### 7.2 커스텀 노드 구조

```typescript
// 베이스 노드
interface BaseNodeData {
  label: string;
  style?: NodeStyle;
  icon?: string;
  ports?: Port[];
}

const BaseNode = memo(({ data }: { data: BaseNodeData }) => {
  return (
    <div style={getNodeStyle(data.style)}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      {data.icon && <Icon name={data.icon} />}
      <span>{data.label}</span>
    </div>
  );
});

// 특수 모양 노드 (SVG 기반)
const DiamondNode = memo(({ data }: { data: BaseNodeData }) => {
  return (
    <div style={{ transform: 'rotate(45deg)' }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <span style={{ transform: 'rotate(-45deg)' }}>{data.label}</span>
    </div>
  );
});
```

### 7.3 커스텀 엣지 구조

```typescript
interface CustomEdgeData {
  label?: string;
  style?: EdgeStyle;
}

function CustomEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data, markerEnd
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{ transform: `translate(${labelX}px, ${labelY}px)` }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
```

### 7.4 인포그래픽 렌더러 (Visx) - 계획

```typescript
// KPI 카드 컴포넌트
function KpiCard({ item }: { item: KpiItem }) {
  return (
    <Group>
      <RoundedRect />
      <Text>{item.value}</Text>
      <TrendArrow direction={item.trend} />
      <Text>{item.change}</Text>
    </Group>
  );
}

// 차트 컴포넌트
function BarChart({ data }: { data: ChartData }) {
  const xScale = scaleBand({ domain: data.labels });
  const yScale = scaleLinear({ domain: [0, max(data.values)] });

  return (
    <svg>
      <AxisBottom scale={xScale} />
      <AxisLeft scale={yScale} />
      {data.values.map((value, i) => (
        <Bar key={i} x={xScale(data.labels[i])} height={yScale(value)} />
      ))}
    </svg>
  );
}
```

---

## 8. 테마 시스템

### 8.1 테마 구조

```typescript
interface Theme {
  name: string;

  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };

  node: {
    default: NodeStyle;
    variants: Record<string, NodeStyle>;
  };

  edge: {
    default: EdgeStyle;
    variants: Record<string, EdgeStyle>;
  };

  group: {
    default: NodeStyle;
  };

  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };

  spacing: {
    node: number;
    layer: number;
    padding: number;
  };
}
```

### 8.2 기본 테마

#### Professional 테마
```typescript
const professionalTheme: Theme = {
  name: 'professional',
  colors: {
    primary: '#2563EB',
    secondary: '#64748B',
    accent: '#0EA5E9',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  node: {
    default: {
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 1,
      borderRadius: 8,
      shadow: { color: 'rgba(0,0,0,0.1)', blur: 4, offsetX: 0, offsetY: 2 },
    },
    variants: {
      primary: { fill: '#2563EB', stroke: '#1D4ED8' },
      // ...
    },
  },
  // ...
};
```

#### Modern 테마
```typescript
const modernTheme: Theme = {
  name: 'modern',
  colors: {
    primary: '#8B5CF6',
    secondary: '#6366F1',
    accent: '#EC4899',
    // ...
  },
  node: {
    default: {
      fill: '#FFFFFF',
      stroke: '#E5E7EB',
      strokeWidth: 1,
      borderRadius: 12,
      gradient: { from: '#FFFFFF', to: '#F9FAFB' },
    },
    // ...
  },
  // ...
};
```

#### Minimal 테마
```typescript
const minimalTheme: Theme = {
  name: 'minimal',
  colors: {
    primary: '#18181B',
    secondary: '#71717A',
    // ...
  },
  node: {
    default: {
      fill: '#FFFFFF',
      stroke: '#18181B',
      strokeWidth: 1,
      borderRadius: 0,
    },
    // ...
  },
  // ...
};
```

### 8.3 테마 적용

```typescript
// 테마 적용 우선순위 (낮음 → 높음)
// 1. 테마 기본값 (theme.node.default)
// 2. 노드 타입별 변형 (theme.node.variants[shape])
// 3. 인라인 스타일 (node.style)

function applyTheme(node: DiagramNode, theme: Theme): DiagramNode {
  const baseStyle = theme.node.default;
  const variantStyle = theme.node.variants[node.shape] ?? {};
  const inlineStyle = node.style ?? {};

  return {
    ...node,
    style: {
      ...baseStyle,
      ...variantStyle,
      ...inlineStyle,
    },
  };
}
```

---

## 9. 출력 형식

### 9.1 지원 형식

| 형식 | 용도 | 구현 방식 |
|------|------|----------|
| React Component | 앱 통합 | React Flow |
| SVG | 웹, 편집 가능 | 독립 렌더링 |
| PNG | 이미지 삽입 | html-to-image |
| PDF | 문서 첨부 | jsPDF |

### 9.2 SVG 출력

```typescript
// 독립 실행형 SVG 생성 (React 없이)
function generateSvg(model: DiagramModel, options?: SvgOptions): string {
  const svg = createSvgElement(options?.width, options?.height);

  // 노드 렌더링
  for (const node of model.nodes) {
    svg.appendChild(renderNodeToSvg(node));
  }

  // 엣지 렌더링
  for (const edge of model.edges) {
    svg.appendChild(renderEdgeToSvg(edge));
  }

  return svg.outerHTML;
}
```

### 9.3 PNG 출력 (계획)

```typescript
async function generatePng(
  model: DiagramModel,
  options?: PngOptions
): Promise<Blob> {
  // 1. 임시 DOM에 React Flow 렌더링
  // 2. html-to-image로 캡처
  // 3. Blob 반환

  const scale = options?.scale ?? 2;  // @2x 기본
  return await toPng(element, { pixelRatio: scale });
}
```

### 9.4 해상도 옵션

```typescript
interface ExportOptions {
  scale?: 1 | 2 | 3;       // @1x, @2x, @3x
  background?: string;      // 배경색
  padding?: number;         // 여백
  width?: number;           // 고정 너비
  height?: number;          // 고정 높이
}
```

---

## 10. 공개 API

### 10.1 고수준 API

```typescript
import { compile, render, exportSvg, exportPng } from 'diagen';

// DSL 컴파일
const result = await compile(`
  @diagram flowchart
  ---
  theme: professional
  direction: LR
  ---
  A: "시작" -> B: "처리" -> C: "완료"
`);

// React 컴포넌트로 렌더링
const element = render(result);

// SVG로 내보내기
const svg = await exportSvg(result);

// PNG로 내보내기
const png = await exportPng(result, { scale: 2 });
```

### 10.2 빌더 패턴 API

```typescript
import { Diagen } from 'diagen';

const diagram = await Diagen
  .from(dslText)
  .theme('professional')
  .layout({ algorithm: 'layered', direction: 'LR' })
  .compile();

// React에서 사용
<Diagen.View diagram={diagram} />

// 내보내기
const svg = await diagram.toSvg();
const png = await diagram.toPng({ scale: 2 });
```

### 10.3 프로그래매틱 API

```typescript
import { DiagramModel, ElkLayoutAdapter, DiagramRenderer } from 'diagen';

// 모델 직접 생성
const model = new DiagramModel();
model.addNode({ id: 'A', label: '시작', shape: 'circle' });
model.addNode({ id: 'B', label: '처리', shape: 'rect' });
model.addEdge({ id: 'e1', source: 'A', target: 'B' });

// 레이아웃 적용
const layout = new ElkLayoutAdapter();
await layout.layout(model, { direction: 'LR' });

// 렌더링
<DiagramRenderer model={model} showControls />
```

### 10.4 유틸리티 함수

```typescript
// 파싱만
import { parse } from 'diagen/parser';
const ir = parse(dslText);

// 유효성 검사만
import { validate } from 'diagen/compiler';
const errors = validate(ir);

// 레이아웃만
import { layout } from 'diagen/layout';
await layout(model, options);
```

---

## 11. 확장성

### 11.1 커스텀 노드 타입

```typescript
import { registerNodeType } from 'diagen';

registerNodeType('myNode', {
  // 기본 스타일
  defaultStyle: {
    fill: '#E0F2FE',
    stroke: '#0284C7',
    borderRadius: 16,
  },

  // React 컴포넌트
  component: ({ data }) => (
    <div className="my-custom-node">
      <MyIcon />
      <span>{data.label}</span>
    </div>
  ),

  // SVG 렌더링 (독립 SVG용)
  renderSvg: (node) => `
    <g transform="translate(${node.position.x}, ${node.position.y})">
      <rect width="${node.size.width}" height="${node.size.height}" />
      <text>${node.label}</text>
    </g>
  `,
});
```

### 11.2 커스텀 테마

```typescript
import { registerTheme, createTheme } from 'diagen';

const myTheme = createTheme({
  name: 'myTheme',
  extends: 'professional',  // 기존 테마 확장
  colors: {
    primary: '#7C3AED',
    accent: '#F472B6',
  },
  node: {
    default: {
      borderRadius: 16,
      shadow: { color: 'rgba(124, 58, 237, 0.2)', blur: 8, offsetY: 4 },
    },
  },
});

registerTheme(myTheme);
```

### 11.3 커스텀 레이아웃

```typescript
import { registerLayout } from 'diagen';

registerLayout('circular', {
  layout: async (model, options) => {
    const nodes = model.nodes;
    const radius = options.radius ?? 200;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, i) => {
      node.position = {
        x: Math.cos(i * angleStep) * radius,
        y: Math.sin(i * angleStep) * radius,
      };
    });
  },
});
```

### 11.4 커스텀 출력 형식

```typescript
import { registerExporter } from 'diagen';

registerExporter('pptx', {
  mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  export: async (model, options) => {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    // 노드를 PowerPoint 도형으로 변환
    for (const node of model.nodes) {
      slide.addShape('rect', {
        x: node.position.x / 100,
        y: node.position.y / 100,
        w: node.size.width / 100,
        h: node.size.height / 100,
        fill: node.style.fill,
      });
    }

    return await pptx.write('blob');
  },
});
```

---

## 12. 도구 생태계

### 12.1 CLI 도구

```bash
# 설치
npm install -g @diagen/cli

# 빌드
diagen build diagram.diagen -o output.svg
diagen build diagram.diagen -o output.png --scale 2
diagen build diagram.diagen -o output.pdf

# 옵션
diagen build input.diagen \
  --theme professional \
  --layout layered \
  --direction LR \
  --output output.svg

# 감시 모드
diagen watch diagram.diagen --preview

# 유효성 검사
diagen validate diagram.diagen

# 프로젝트 초기화
diagen init
```

### 12.2 VS Code 확장

**기능:**
- 문법 하이라이팅
- 자동완성 (키워드, 속성, 노드 ID)
- 실시간 문법 검사
- 실시간 미리보기 (사이드 패널)
- 코드 조각 (템플릿)
- 포매터

**설정:**
```json
{
  "diagen.preview.autoRefresh": true,
  "diagen.preview.theme": "professional",
  "diagen.format.indentSize": 2
}
```

### 12.3 웹 플레이그라운드

**기능:**
- 온라인 에디터 (Monaco Editor)
- 실시간 렌더링
- 예제 갤러리
- URL 공유
- 내보내기 (SVG, PNG, PDF)

**URL:** `https://diagen.dev/playground`

### 12.4 패키지 구조

```
@diagen/core        # 코어 라이브러리 (파서, 컴파일러, 모델)
@diagen/react       # React 컴포넌트 (렌더러)
@diagen/cli         # CLI 도구
@diagen/vscode      # VS Code 확장
```

---

## 부록

### A. 문법 EBNF

```ebnf
document        = documentHeader [metaBlock] body ;
documentHeader  = ("@diagram" | "@infographic" | "@page") [identifier] NEWLINE ;
metaBlock       = "---" NEWLINE {metaProperty} "---" NEWLINE ;
metaProperty    = identifier ":" value NEWLINE ;

body            = {statement} ;
statement       = emptyLine | groupDef | placeDef | elementDef | nodeOrEdgeStatement ;

nodeOrEdgeStatement = nodeSet [edgeChain] [NEWLINE] ;
edgeChain       = {arrowOp nodeSet [":" STRING_LITERAL]} ;
arrowOp         = "->" | "<->" | "-->" | "<-->" | "==>" | "<==>" ;

nodeSet         = nodeDef | "(" nodeRef {"," nodeRef} ")" ;
nodeDef         = identifier ["." identifier] [":" (STRING_LITERAL | identifier)] [attributes] ;
nodeRef         = identifier ["." identifier] [":" identifier] ;

attributes      = "[" [attribute {"," attribute} [","]] "]" ;
attribute       = identifier [":" value] ;

groupDef        = "group" identifier [attributes] "{" [NEWLINE] body "}" [NEWLINE] ;

value           = STRING_LITERAL | NUMBER | "true" | "false" | COLOR | PERCENT | array | identifier ;
array           = "(" [value {"," value}] ")" ;
```

### B. 에러 코드

| 코드 | 설명 |
|------|------|
| DIAGEN-001 | 문법 오류 |
| DIAGEN-002 | 중복 ID |
| DIAGEN-003 | 미정의 노드 참조 |
| DIAGEN-004 | 순환 그룹 참조 |
| DIAGEN-005 | 잘못된 속성 값 |
| DIAGEN-006 | 레이아웃 오류 |
| DIAGEN-007 | 렌더링 오류 |
| DIAGEN-008 | 내보내기 오류 |

### C. 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 0.1.0 | 2025-12-01 | 초기 설계서 작성 |

---

## 참고 자료

- [React Flow 문서](https://reactflow.dev/)
- [ELK.js 문서](https://github.com/kieler/elkjs)
- [Visx 문서](https://airbnb.io/visx/)
- [Chevrotain 문서](https://chevrotain.io/)
- [ELK 알고리즘 레퍼런스](https://eclipse.dev/elk/reference/algorithms.html)
