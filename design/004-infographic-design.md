# 인포그래픽 설계 문서

## 1. 개요

제안서/발표자료 수준의 인포그래픽을 코드로 생성하기 위한 설계 문서입니다.

### 1.1 기술 스택

| 구성요소 | 기술 | 역할 |
|---------|------|------|
| 렌더링 | **Visx** (Airbnb) | 저수준 시각화 프리미티브 |
| 애니메이션 | Framer Motion | 부드러운 전환 효과 |
| 스타일링 | SVG + CSS/Tailwind | 그라디언트, 섀도우 등 |

### 1.2 Visx 선택 이유

- D3의 파워 + React의 편의성
- "차트 라이브러리가 아님" → 완전한 자유도
- 30+ 모듈 패키지, 필요한 것만 사용
- 번들 사이즈 최적화

---

## 2. Visx 패키지 구조

### 2.1 핵심 패키지

| 카테고리 | 패키지 | 용도 |
|---------|--------|------|
| **셰이프** | `@visx/shape` | Bar, Line, Pie, Arc, Area 등 |
| **스케일** | `@visx/scale` | 데이터 → 픽셀 변환 |
| **축** | `@visx/axis` | X/Y 축 렌더링 |
| **그리드** | `@visx/grid` | 배경 그리드 |
| **텍스트** | `@visx/text` | SVG 텍스트 (자동 줄바꿈) |
| **주석** | `@visx/annotation` | 라벨, 화살표 주석 |
| **레전드** | `@visx/legend` | 범례 |
| **툴팁** | `@visx/tooltip` | 호버 툴팁 |
| **그룹** | `@visx/group` | SVG `<g>` 래퍼 |
| **그라디언트** | `@visx/gradient` | 색상 그라디언트 |
| **패턴** | `@visx/pattern` | 패턴 채우기 |
| **계층** | `@visx/hierarchy` | 트리, 트리맵 |
| **네트워크** | `@visx/network` | 네트워크 그래프 |
| **지도** | `@visx/geo` | 지리 시각화 |
| **히트맵** | `@visx/heatmap` | 히트맵 |
| **통계** | `@visx/stats` | 박스플롯 등 |
| **글리프** | `@visx/glyph` | 점, 마커 |
| **반응형** | `@visx/responsive` | 반응형 SVG |
| **인터랙션** | `@visx/brush`, `@visx/drag`, `@visx/zoom` | 브러시, 드래그, 줌 |
| **애니메이션** | `@visx/react-spring` | react-spring 통합 |
| **고수준** | `@visx/xychart` | 조합형 차트 컴포넌트 |

---

## 3. 인포그래픽 유형 분류

### 3.1 전체 구조

```
인포그래픽
├── 데이터형 (수치 중심)
│   ├── KPI 카드
│   ├── 바 차트 (수평/수직)
│   ├── 라인 차트
│   ├── 파이/도넛 차트
│   ├── 비교표
│   └── 진행률 (프로그레스)
│
├── 흐름형 (순서/프로세스)
│   ├── 타임라인
│   ├── 프로세스 스텝
│   ├── 퍼널
│   ├── 사이클
│   ├── ETL/ELT 파이프라인
│   └── MLOps 파이프라인
│
├── 구조형 (관계/계층)
│   ├── 피라미드
│   ├── 2x2 / 3x3 매트릭스
│   ├── 조직도
│   ├── 동심원
│   ├── 벤 다이어그램
│   ├── 허브 앤 스포크
│   ├── 레이어/스택
│   └── 그룹핑
│
└── 기술 특화형
    ├── C4 다이어그램
    ├── 마이크로서비스
    ├── API 다이어그램
    ├── 클라우드 아키텍처
    ├── 데이터 플로우
    ├── DAG 워크플로우
    ├── 신경망 아키텍처
    └── 에이전트 플로우
```

---

## 4. 데이터형 인포그래픽

### 4.1 KPI 카드

큰 숫자와 아이콘으로 핵심 지표를 강조합니다.

```
┌─────────────────────────────────────────┐
│   ┌───┐      ┌───┐      ┌───┐          │
│   │ 📈│      │ 💰│      │ 👥│          │
│   └───┘      └───┘      └───┘          │
│   +35%       $2.5M      1,200+         │
│   매출 증가   비용 절감    신규 고객      │
└─────────────────────────────────────────┘
```

```typescript
interface KPICardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { direction: 'up' | 'down'; value: string };
  color?: string;
}
```

**Visx 패키지**: `@visx/text`, `@visx/group`

---

### 4.2 바 차트

수평/수직 막대로 값을 비교합니다.

```typescript
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showAxis?: boolean;
}
```

**Visx 패키지**: `@visx/shape` (Bar), `@visx/axis`, `@visx/scale`, `@visx/grid`

---

### 4.3 파이/도넛 차트

비율과 구성을 표현합니다.

```typescript
interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  innerRadius?: number;  // 0이면 파이, > 0이면 도넛
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
}
```

**Visx 패키지**: `@visx/shape` (Pie, Arc), `@visx/group`, `@visx/legend`

---

### 4.4 라인 차트

시간에 따른 추세를 표현합니다.

```typescript
interface LineChartProps {
  data: Array<{ x: string | number; y: number }>;
  series?: Array<{ name: string; data: Array<{ x: string | number; y: number }>; color?: string }>;
  showArea?: boolean;
  showPoints?: boolean;
  curve?: 'linear' | 'smooth' | 'step';
}
```

**Visx 패키지**: `@visx/shape` (LinePath, AreaClosed), `@visx/curve`, `@visx/axis`

---

### 4.5 비교표

항목 간 비교를 표 형태로 표현합니다.

```typescript
interface ComparisonTableProps {
  headers: string[];
  rows: Array<{
    label: string;
    values: Array<string | number | boolean>;
  }>;
  highlightColumn?: number;
  showIcons?: boolean;  // boolean 값을 ✓/✗ 아이콘으로
}
```

**Visx 패키지**: `@visx/group`, `@visx/text` + 커스텀 SVG

---

### 4.6 진행률 (프로그레스)

완료 비율이나 달성도를 표현합니다.

```typescript
interface ProgressProps {
  value: number;  // 0-100
  label?: string;
  type?: 'bar' | 'circle' | 'semicircle';
  showValue?: boolean;
  color?: string;
}
```

**Visx 패키지**: `@visx/shape` (Arc), `@visx/group`

---

## 5. 흐름형 인포그래픽

### 5.1 타임라인

시간 순서대로 이벤트를 표현합니다.

```
    Q1         Q2         Q3         Q4
────●──────────●──────────●──────────●────
    │          │          │          │
  킥오프     MVP 완료   베타 출시   정식 런칭
```

```typescript
interface TimelineProps {
  events: Array<{
    date: string;
    title: string;
    description?: string;
    status?: 'completed' | 'current' | 'upcoming';
  }>;
  orientation?: 'horizontal' | 'vertical';
}
```

**Visx 패키지**: `@visx/shape`, `@visx/group`, `@visx/text`

---

### 5.2 프로세스 스텝

단계별 진행 과정을 표현합니다.

```
┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
│  1  │ →  │  2  │ →  │  3  │ →  │  4  │
│분석 │    │설계 │    │구현 │    │검증 │
└─────┘    └─────┘    └─────┘    └─────┘
```

```typescript
interface ProcessStepsProps {
  steps: Array<{
    number?: number;
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
  connectorStyle?: 'arrow' | 'line' | 'dashed';
}
```

**Visx 패키지**: `@visx/group`, `@visx/shape` + 커스텀 화살표

---

### 5.3 퍼널

단계별 감소/전환을 표현합니다.

```typescript
interface FunnelProps {
  stages: Array<{
    label: string;
    value: number;
    percentage?: number;
    color?: string;
  }>;
  showValues?: boolean;
  showPercentage?: boolean;
}
```

**Visx 패키지**: `@visx/shape` (커스텀 폴리곤), `@visx/text`

---

### 5.4 사이클

순환 프로세스를 표현합니다.

```typescript
interface CycleProps {
  steps: Array<{
    label: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
  centerLabel?: string;
  direction?: 'clockwise' | 'counterclockwise';
}
```

**Visx 패키지**: `@visx/shape` (Arc), `@visx/group`

---

## 6. 구조형 인포그래픽

### 6.1 피라미드

계층적 구조나 우선순위를 표현합니다.

```
        ┌───────┐
        │ 전략  │
      ┌─┴───────┴─┐
      │   전술    │
    ┌─┴───────────┴─┐
    │     실행      │
```

```typescript
interface PyramidProps {
  levels: Array<{
    label: string;
    description?: string;
    color?: string;
  }>;
  direction?: 'up' | 'down';  // 위로 좁아짐 vs 아래로 좁아짐
}
```

**Visx 패키지**: `@visx/shape` (커스텀 폴리곤), `@visx/text`

---

### 6.2 2x2 / 3x3 매트릭스

두 축으로 분류하여 포지셔닝합니다.

```
         높음
          │
    Q2    │    Q1
          │
  ────────┼──────── 높음
          │
    Q3    │    Q4
          │
         낮음
```

```typescript
interface Matrix2x2Props {
  axisX: { low: string; high: string; label?: string };
  axisY: { low: string; high: string; label?: string };
  quadrants: [
    { label: string; items?: string[]; color?: string },  // 좌상
    { label: string; items?: string[]; color?: string },  // 우상
    { label: string; items?: string[]; color?: string },  // 좌하
    { label: string; items?: string[]; color?: string },  // 우하
  ];
}

interface Matrix3x3Props {
  axisX: { labels: [string, string, string]; title?: string };
  axisY: { labels: [string, string, string]; title?: string };
  cells: Array<Array<{ label?: string; color?: string; items?: string[] }>>;  // 3x3
}
```

**Visx 패키지**: `@visx/group`, `@visx/shape`, `@visx/text`

---

### 6.3 동심원

중심에서 바깥으로 확장되는 구조를 표현합니다.

```typescript
interface ConcentricCirclesProps {
  layers: Array<{
    label: string;
    description?: string;
    color?: string;
  }>;  // 중심부터 바깥 순서
}
```

**Visx 패키지**: `@visx/shape` (Circle), `@visx/group`

---

### 6.4 벤 다이어그램

집합 간 관계와 교집합을 표현합니다.

```typescript
interface VennDiagramProps {
  sets: Array<{
    id: string;
    label: string;
    color?: string;
  }>;
  intersections?: Array<{
    sets: string[];  // set ids
    label?: string;
  }>;
}
```

**Visx 패키지**: `@visx/shape` (Circle), `@visx/group` + 블렌드 모드

---

### 6.5 허브 앤 스포크

중심 요소와 주변 요소의 관계를 표현합니다.

```typescript
interface HubSpokeProps {
  hub: {
    label: string;
    icon?: React.ReactNode;
  };
  spokes: Array<{
    label: string;
    description?: string;
    icon?: React.ReactNode;
  }>;
}
```

**Visx 패키지**: `@visx/network` 또는 커스텀 구현

---

### 6.6 레이어/스택

수직으로 쌓인 계층 구조를 표현합니다.

```typescript
interface LayerStackProps {
  layers: Array<{
    label: string;
    description?: string;
    color?: string;
    height?: number;  // 상대적 높이
  }>;
  orientation?: 'horizontal' | 'vertical';
  style?: 'flat' | '3d';
}
```

**Visx 패키지**: `@visx/shape`, `@visx/group`

---

### 6.7 조직도

계층적 조직 구조를 표현합니다.

```typescript
interface OrgChartProps {
  root: OrgNode;
  orientation?: 'vertical' | 'horizontal';
}

interface OrgNode {
  id: string;
  label: string;
  title?: string;
  avatar?: string;
  children?: OrgNode[];
}
```

**Visx 패키지**: `@visx/hierarchy` (Tree)

---

## 7. 기술 특화형 인포그래픽

### 7.1 소프트웨어 엔지니어링

#### C4 Context Diagram

시스템과 외부 요소 간 관계를 표현합니다.

```typescript
interface C4ContextProps {
  system: { name: string; description: string };
  actors: Array<{
    id: string;
    name: string;
    type: 'person' | 'system';
    description?: string;
    external?: boolean;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    label: string;
  }>;
}
```

---

#### C4 Container Diagram

시스템 내부 컨테이너 구성을 표현합니다.

```typescript
interface C4ContainerProps {
  system: string;
  containers: Array<{
    id: string;
    name: string;
    type: 'web' | 'api' | 'db' | 'queue' | 'storage' | 'service' | 'mobile';
    technology?: string;
    description?: string;
  }>;
  relationships: Array<{
    from: string;
    to: string;
    label: string;
    protocol?: string;
  }>;
}
```

---

#### 마이크로서비스 아키텍처

서비스 간 통신 구조를 표현합니다.

```typescript
interface MicroservicesProps {
  services: Array<{
    id: string;
    name: string;
    type?: 'api' | 'worker' | 'gateway' | 'registry' | 'config';
    technology?: string;
  }>;
  databases?: Array<{
    id: string;
    name: string;
    type: 'sql' | 'nosql' | 'cache' | 'search';
  }>;
  messaging?: Array<{
    id: string;
    name: string;
    type: 'queue' | 'pubsub' | 'stream';
  }>;
  connections: Array<{
    from: string;
    to: string;
    protocol?: 'http' | 'grpc' | 'amqp' | 'ws';
    async?: boolean;
  }>;
}
```

---

#### 클라우드 아키텍처

클라우드 인프라 구성을 표현합니다.

```typescript
interface CloudArchitectureProps {
  provider: 'aws' | 'azure' | 'gcp' | 'multi';
  regions?: Array<{
    name: string;
    services: string[];  // service ids
  }>;
  vpcs?: Array<{
    name: string;
    subnets?: Array<{ name: string; type: 'public' | 'private' }>;
  }>;
  services: Array<{
    id: string;
    type: string;  // 'ec2', 'lambda', 's3', 'rds', 'ecs', etc.
    name?: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}
```

---

### 7.2 데이터 엔지니어링

#### ETL/ELT 파이프라인

데이터 흐름을 표현합니다.

```typescript
interface DataPipelineProps {
  sources: Array<{
    id: string;
    name: string;
    type: 'db' | 'api' | 'file' | 'stream' | 'saas';
  }>;
  transforms: Array<{
    id: string;
    name: string;
    description?: string;
    type?: 'clean' | 'enrich' | 'aggregate' | 'join' | 'validate';
  }>;
  destinations: Array<{
    id: string;
    name: string;
    type: 'warehouse' | 'lake' | 'db' | 'bi' | 'api';
  }>;
  flows: Array<{
    from: string;
    to: string;
  }>;
  orchestrator?: 'airflow' | 'dagster' | 'prefect' | 'mage';
}
```

---

#### DAG 워크플로우

작업 의존성 그래프를 표현합니다.

```typescript
interface DAGWorkflowProps {
  tasks: Array<{
    id: string;
    name: string;
    type?: 'extract' | 'transform' | 'load' | 'validate' | 'notify' | 'branch';
    status?: 'pending' | 'running' | 'success' | 'failed';
  }>;
  dependencies: Array<{
    from: string;
    to: string;
  }>;
  schedule?: string;
  metadata?: {
    name: string;
    owner?: string;
  };
}
```

---

#### 데이터 플로우 (Lambda/Kappa)

배치 + 스트림 아키텍처를 표현합니다.

```typescript
interface LambdaArchitectureProps {
  sources: Array<{ id: string; name: string }>;
  batchLayer: {
    storage: string;
    processing: string;
    serving: string;
  };
  speedLayer: {
    processing: string;
    serving: string;
  };
  servingLayer: {
    name: string;
  };
}
```

---

### 7.3 AI/ML

#### 신경망 아키텍처

레이어 구조를 표현합니다.

```typescript
interface NeuralNetworkProps {
  layers: Array<{
    id: string;
    type: 'input' | 'dense' | 'conv2d' | 'pool' | 'dropout' | 'batchnorm' |
          'lstm' | 'gru' | 'attention' | 'embedding' | 'flatten' | 'output';
    units?: number;
    filters?: number;
    kernelSize?: number | [number, number];
    activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax' | 'none';
    params?: Record<string, any>;
  }>;
  connections?: Array<{
    from: string;
    to: string;
    type?: 'forward' | 'skip' | 'residual';
  }>;
  style?: 'horizontal' | 'vertical' | 'compact';
}
```

---

#### MLOps 파이프라인

ML 라이프사이클을 표현합니다.

```typescript
interface MLOpsPipelineProps {
  stages: Array<{
    id: string;
    name: string;
    type: 'data' | 'feature' | 'train' | 'evaluate' | 'register' | 'deploy' | 'monitor';
    tools?: string[];
    description?: string;
  }>;
  artifacts?: Array<{
    id: string;
    name: string;
    type: 'dataset' | 'feature' | 'model' | 'metrics' | 'config';
  }>;
  flows: Array<{
    from: string;
    to: string;
    artifact?: string;
  }>;
  triggers?: Array<{
    type: 'schedule' | 'data' | 'drift' | 'manual';
    target: string;
  }>;
}
```

---

#### AI 에이전트 플로우

LLM 에이전트 동작을 표현합니다.

```typescript
interface AgentFlowProps {
  agent: {
    name: string;
    model?: string;
    systemPrompt?: string;
  };
  tools: Array<{
    id: string;
    name: string;
    description?: string;
    type?: 'retrieval' | 'code' | 'api' | 'browser' | 'custom';
  }>;
  memory?: {
    type: 'buffer' | 'summary' | 'vector' | 'none';
    capacity?: number;
  };
  flow: Array<{
    id: string;
    step: string;
    type: 'input' | 'think' | 'tool' | 'observe' | 'respond';
    details?: string;
    toolId?: string;
  }>;
}
```

---

## 8. Visx 패키지 매핑

### 8.1 인포그래픽 유형별 패키지

| 유형 | 주요 패키지 |
|------|------------|
| KPI 카드 | `text`, `group` |
| 바 차트 | `shape`, `axis`, `scale`, `grid` |
| 파이/도넛 | `shape` (Pie, Arc), `group`, `legend` |
| 라인 차트 | `shape` (LinePath), `curve`, `axis` |
| 타임라인 | `shape`, `group`, `text`, `annotation` |
| 프로세스 | `group`, `shape`, `text` |
| 퍼널 | `shape` (커스텀), `text` |
| 사이클 | `shape` (Arc), `group` |
| 피라미드 | `shape` (커스텀), `text` |
| 매트릭스 | `group`, `shape`, `text` |
| 동심원 | `shape` (Circle), `group` |
| 벤 다이어그램 | `shape` (Circle), `group` |
| 허브 앤 스포크 | `network` 또는 커스텀 |
| 레이어/스택 | `shape`, `group` |
| 조직도 | `hierarchy` (Tree) |
| 신경망 | `group`, `shape`, `network` |
| 파이프라인 | `group`, `shape`, 커스텀 커넥터 |

### 8.2 공통 사용 패키지

모든 인포그래픽에서 공통적으로 사용되는 패키지:

- `@visx/group` - SVG 그룹핑
- `@visx/text` - 텍스트 렌더링
- `@visx/responsive` - 반응형 처리
- `@visx/gradient` - 그라디언트 효과
- `@visx/pattern` - 패턴 채우기

---

## 9. 스타일 시스템

### 9.1 색상 팔레트

```typescript
interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}
```

### 9.2 테마 프리셋

| 테마 | 설명 | 용도 |
|------|------|------|
| `professional` | 블루/그레이 톤, 깔끔함 | 비즈니스 제안서 |
| `modern` | 그라디언트, 생동감 | 스타트업 피칭 |
| `minimal` | 흑백 중심, 미니멀 | 기술 문서 |
| `colorful` | 다채로운 색상 | 프레젠테이션 |
| `dark` | 다크 모드 | 기술 발표 |

### 9.3 SVG 스타일 효과

```typescript
// 그라디언트 정의
interface GradientStyle {
  type: 'linear' | 'radial';
  colors: Array<{ offset: string; color: string }>;
  angle?: number;  // linear only
}

// 섀도우 정의
interface ShadowStyle {
  dx: number;
  dy: number;
  blur: number;
  color: string;
  opacity?: number;
}

// 공통 스타일
interface CommonStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  gradient?: GradientStyle;
  shadow?: ShadowStyle;
  borderRadius?: number;
}
```

---

## 10. 구현 로드맵

### Phase 1: 기본 데이터형

- [ ] KPI 카드
- [ ] 바 차트 (수평/수직)
- [ ] 도넛 차트
- [ ] 라인 차트
- [ ] 비교표
- [ ] 진행률

### Phase 2: 흐름형

- [ ] 타임라인
- [ ] 프로세스 스텝
- [ ] 퍼널
- [ ] 사이클

### Phase 3: 구조형

- [ ] 피라미드
- [ ] 2x2 매트릭스
- [ ] 동심원
- [ ] 레이어/스택
- [ ] 조직도

### Phase 4: 기술 특화

- [ ] C4 다이어그램
- [ ] 마이크로서비스
- [ ] 데이터 파이프라인
- [ ] 신경망 아키텍처
- [ ] MLOps 파이프라인

---

## 11. 참고 자료

### Visx

- [Visx 공식 사이트](https://airbnb.io/visx/)
- [Visx GitHub](https://github.com/airbnb/visx)
- [Visx NPM](https://www.npmjs.com/package/@visx/visx)

### 디자인 참고

- [Venngage - 인포그래픽 유형](https://venngage.com/blog/9-types-of-infographic-template/)
- [C4 Model](https://c4model.com/)
- [McKinsey 슬라이드 구조](https://slidemodel.com/mckinsey-presentation-structure/)
