# DSL 문법 설계 문서

## 1. 개요

다이어그램과 인포그래픽을 코드로 정의하기 위한 DSL(Domain Specific Language) 설계 문서입니다.

### 1.1 설계 목표

- **가독성**: 코드만 봐도 결과물을 예측할 수 있어야 함
- **간결성**: 최소한의 코드로 다이어그램 생성
- **확장성**: 복잡한 커스터마이징도 가능해야 함
- **타입 안전성**: TypeScript 자동완성 및 타입 체크 지원
- **LLM 친화적**: AI가 쉽게 생성할 수 있는 문법

### 1.2 접근 방식 비교

| 방식 | 장점 | 단점 | 예시 |
|------|------|------|------|
| **텍스트 DSL** | 가장 간결, LLM 친화적 | 타입 안전성 부족 | Mermaid, D2, PlantUML |
| **Tagged Template** | 간결 + JS 표현식 사용 | 파싱 복잡도 | styled-components |
| **Fluent Builder** | 완벽한 타입 안전성 | 다소 장황함 | jQuery, D3 |
| **객체 리터럴** | 구조화, JSON 호환 | 장황함 | React props |

### 1.3 선택: 하이브리드 접근

**1차: Fluent Builder API** (메인)
- TypeScript 타입 안전성
- IDE 자동완성 지원
- 메서드 체이닝으로 가독성 확보

**2차: 객체 리터럴** (대안)
- JSON 호환 필요 시
- 설정 파일 저장 시

**3차: Tagged Template** (단축 문법)
- 빠른 프로토타이핑
- 간단한 다이어그램

---

## 2. 다이어그램 DSL

### 2.1 Fluent Builder API

#### 기본 구조

```typescript
import { diagram } from 'diagen';

const myDiagram = diagram()
  .title('시스템 아키텍처')
  .direction('TB')  // TB, BT, LR, RL
  .theme('professional')

  // 노드 정의
  .node('client', 'Client App', { shape: 'rect' })
  .node('api', 'API Gateway', { shape: 'rect', style: 'primary' })
  .node('auth', 'Auth Service', { shape: 'rect' })
  .node('db', 'PostgreSQL', { shape: 'cylinder' })

  // 연결 정의
  .edge('client', 'api', { label: 'HTTPS' })
  .edge('api', 'auth', { label: 'gRPC' })
  .edge('auth', 'db', { label: 'TCP' })

  .build();
```

#### 축약 문법

```typescript
// 체이닝으로 노드와 엣지를 한 번에
diagram()
  .node('a').to('b').to('c')  // a -> b -> c
  .node('d').from('b')         // b -> d
  .build();

// 그룹/컨테이너
diagram()
  .group('backend', group => group
    .node('api', 'API Server')
    .node('worker', 'Worker')
  )
  .group('database', group => group
    .node('primary', 'Primary DB')
    .node('replica', 'Replica DB')
  )
  .edge('api', 'primary')
  .build();
```

#### 스타일 적용

```typescript
diagram()
  .node('important', 'Critical Service', {
    shape: 'rect',
    style: {
      fill: 'gradient:primary',
      stroke: '#333',
      shadow: true,
      borderRadius: 8,
    }
  })
  .edge('a', 'b', {
    style: {
      stroke: '#666',
      strokeWidth: 2,
      strokeDasharray: '5,5',  // 점선
      animated: true,
    },
    label: 'async',
    labelPosition: 'center',
  })
  .build();
```

---

### 2.2 노드 타입 정의

```typescript
// 기본 셰이프
type NodeShape =
  | 'rect'        // 사각형 (기본값)
  | 'roundRect'   // 둥근 사각형
  | 'circle'      // 원
  | 'ellipse'     // 타원
  | 'diamond'     // 다이아몬드 (조건)
  | 'hexagon'     // 육각형
  | 'parallelogram' // 평행사변형
  | 'cylinder'    // 실린더 (DB)
  | 'document'    // 문서
  | 'cloud'       // 클라우드
  | 'person'      // 사람 아이콘
  | 'queue'       // 큐/메시지
  | 'storage'     // 스토리지
  ;

// 노드 옵션
interface NodeOptions {
  shape?: NodeShape;
  label?: string;
  icon?: string;           // 아이콘 이름 또는 URL
  style?: NodeStyle;
  width?: number;
  height?: number;
  ports?: PortDefinition[];  // 연결점 정의
}

// 포트 정의 (다중 연결점)
interface PortDefinition {
  id: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
}
```

---

### 2.3 엣지 타입 정의

```typescript
// 엣지 옵션
interface EdgeOptions {
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';

  // 화살표
  sourceArrow?: ArrowType;
  targetArrow?: ArrowType;

  // 라우팅
  routing?: 'straight' | 'orthogonal' | 'curved' | 'step';

  // 스타일
  style?: EdgeStyle;

  // 포트 연결
  sourcePort?: string;
  targetPort?: string;
}

type ArrowType =
  | 'none'
  | 'arrow'       // 기본 화살표
  | 'triangle'    // 삼각형
  | 'diamond'     // 다이아몬드 (집합)
  | 'circle'      // 원
  | 'square'      // 사각형
  ;
```

---

### 2.4 Tagged Template 단축 문법

빠른 프로토타이핑을 위한 간단한 문법:

```typescript
import { d } from 'diagen';

// 기본 연결
const simple = d`
  Client -> API Gateway -> Auth Service
  Auth Service -> Database
`;

// 노드 속성 지정
const withProps = d`
  Client[shape=person] -> API[shape=rect, style=primary]
  API -> DB[shape=cylinder]
`;

// 양방향 연결
const bidirectional = d`
  Service A <-> Service B
  Service B <-> Service C
`;

// 라벨
const withLabels = d`
  Client -[HTTPS]-> API
  API -[gRPC]-> Auth
  Auth -[SQL]-> DB
`;

// 그룹
const grouped = d`
  group Backend {
    API
    Worker
    Scheduler
  }

  group Data {
    PostgreSQL
    Redis
  }

  API -> PostgreSQL
  Worker -> Redis
`;
```

---

### 2.5 C4 다이어그램 특화 문법

```typescript
import { c4 } from 'diagen';

// Context Diagram
const context = c4.context()
  .system('MySystem', '우리 시스템', { description: '핵심 비즈니스 처리' })
  .person('User', '사용자', { external: false })
  .system('Email', '이메일 시스템', { external: true })
  .system('Payment', '결제 시스템', { external: true })

  .rel('User', 'MySystem', '사용')
  .rel('MySystem', 'Email', '이메일 전송')
  .rel('MySystem', 'Payment', '결제 요청')
  .build();

// Container Diagram
const container = c4.container('MySystem')
  .webapp('WebApp', 'React SPA', { technology: 'React, TypeScript' })
  .api('API', 'REST API', { technology: 'Node.js, Express' })
  .database('DB', 'PostgreSQL', { technology: 'PostgreSQL 15' })
  .queue('Queue', 'Message Queue', { technology: 'RabbitMQ' })

  .rel('WebApp', 'API', 'JSON/HTTPS')
  .rel('API', 'DB', 'SQL/TCP')
  .rel('API', 'Queue', 'AMQP')
  .build();
```

---

## 3. 인포그래픽 DSL

### 3.1 Fluent Builder API

#### 데이터형 인포그래픽

```typescript
import { infographic } from 'diagen';

// KPI 카드
const kpi = infographic.kpi()
  .value('+35%')
  .label('매출 증가')
  .icon('trending-up')
  .trend('up', '+5% vs 전월')
  .color('success')
  .build();

// 바 차트
const bar = infographic.barChart()
  .title('분기별 매출')
  .data([
    { label: 'Q1', value: 120 },
    { label: 'Q2', value: 150 },
    { label: 'Q3', value: 180 },
    { label: 'Q4', value: 210 },
  ])
  .orientation('vertical')
  .showValues(true)
  .color('primary')
  .build();

// 도넛 차트
const donut = infographic.donutChart()
  .title('시장 점유율')
  .data([
    { label: '우리 회사', value: 35, color: 'primary' },
    { label: '경쟁사 A', value: 25, color: 'secondary' },
    { label: '경쟁사 B', value: 20, color: 'neutral' },
    { label: '기타', value: 20, color: 'muted' },
  ])
  .centerValue('35%')
  .centerLabel('Market Share')
  .build();

// 라인 차트
const line = infographic.lineChart()
  .title('월별 트래픽')
  .series('방문자', [
    { x: 'Jan', y: 1000 },
    { x: 'Feb', y: 1200 },
    { x: 'Mar', y: 1100 },
    { x: 'Apr', y: 1500 },
  ])
  .series('가입자', [
    { x: 'Jan', y: 100 },
    { x: 'Feb', y: 150 },
    { x: 'Mar', y: 120 },
    { x: 'Apr', y: 200 },
  ])
  .showArea(true)
  .curve('smooth')
  .build();
```

#### 흐름형 인포그래픽

```typescript
// 타임라인
const timeline = infographic.timeline()
  .title('프로젝트 로드맵')
  .orientation('horizontal')
  .event('2024 Q1', '킥오프', { status: 'completed' })
  .event('2024 Q2', 'MVP 출시', { status: 'completed' })
  .event('2024 Q3', '베타 테스트', { status: 'current' })
  .event('2024 Q4', '정식 출시', { status: 'upcoming' })
  .build();

// 프로세스 스텝
const process = infographic.processSteps()
  .title('개발 프로세스')
  .step(1, '요구사항 분석', { icon: 'search' })
  .step(2, '설계', { icon: 'pen-tool' })
  .step(3, '개발', { icon: 'code' })
  .step(4, '테스트', { icon: 'check-circle' })
  .step(5, '배포', { icon: 'rocket' })
  .currentStep(3)
  .build();

// 퍼널
const funnel = infographic.funnel()
  .title('세일즈 퍼널')
  .stage('방문', 10000)
  .stage('가입', 3000)
  .stage('활성화', 1500)
  .stage('결제', 500)
  .stage('재구매', 200)
  .showPercentage(true)
  .build();

// 사이클
const cycle = infographic.cycle()
  .title('PDCA 사이클')
  .step('Plan', '계획 수립', { icon: 'clipboard' })
  .step('Do', '실행', { icon: 'play' })
  .step('Check', '점검', { icon: 'eye' })
  .step('Act', '개선', { icon: 'refresh' })
  .centerLabel('지속적 개선')
  .build();
```

#### 구조형 인포그래픽

```typescript
// 피라미드
const pyramid = infographic.pyramid()
  .title('전략 계층')
  .level('비전', { color: 'primary' })
  .level('전략', { color: 'secondary' })
  .level('전술', { color: 'tertiary' })
  .level('실행', { color: 'quaternary' })
  .direction('up')
  .build();

// 2x2 매트릭스
const matrix = infographic.matrix2x2()
  .title('우선순위 매트릭스')
  .axisX('노력', { low: '낮음', high: '높음' })
  .axisY('영향', { low: '낮음', high: '높음' })
  .quadrant('topLeft', 'Quick Wins', { color: 'success' })
  .quadrant('topRight', 'Major Projects', { color: 'primary' })
  .quadrant('bottomLeft', 'Fill-ins', { color: 'muted' })
  .quadrant('bottomRight', 'Thankless Tasks', { color: 'warning' })
  .build();

// 동심원
const concentric = infographic.concentricCircles()
  .title('영향 범위')
  .layer('핵심', { color: 'primary' })
  .layer('내부', { color: 'secondary' })
  .layer('외부', { color: 'tertiary' })
  .layer('생태계', { color: 'quaternary' })
  .build();

// 레이어 스택
const stack = infographic.layerStack()
  .title('기술 스택')
  .layer('Frontend', 'React, TypeScript', { color: 'blue' })
  .layer('API', 'Node.js, GraphQL', { color: 'green' })
  .layer('Services', 'Microservices', { color: 'purple' })
  .layer('Data', 'PostgreSQL, Redis', { color: 'orange' })
  .layer('Infra', 'Kubernetes, AWS', { color: 'gray' })
  .style('3d')
  .build();

// 조직도
const org = infographic.orgChart()
  .title('팀 구조')
  .root('CEO', 'Kim')
  .under('CEO', 'CTO', 'Lee')
  .under('CEO', 'CFO', 'Park')
  .under('CTO', 'Dev Lead', 'Choi')
  .under('CTO', 'QA Lead', 'Jung')
  .under('Dev Lead', 'Frontend', 'Team A')
  .under('Dev Lead', 'Backend', 'Team B')
  .build();
```

---

### 3.2 기술 특화 인포그래픽

#### 데이터 파이프라인

```typescript
import { infographic } from 'diagen';

const pipeline = infographic.dataPipeline()
  .title('ETL 파이프라인')

  // 소스
  .source('mysql', 'MySQL', { type: 'db' })
  .source('api', 'REST API', { type: 'api' })
  .source('s3', 'S3 Bucket', { type: 'storage' })

  // 변환
  .transform('clean', '데이터 정제')
  .transform('enrich', '데이터 보강')
  .transform('aggregate', '집계')

  // 목적지
  .destination('warehouse', 'Snowflake', { type: 'warehouse' })
  .destination('bi', 'Tableau', { type: 'bi' })

  // 플로우
  .flow('mysql', 'clean')
  .flow('api', 'clean')
  .flow('s3', 'enrich')
  .flow('clean', 'enrich')
  .flow('enrich', 'aggregate')
  .flow('aggregate', 'warehouse')
  .flow('warehouse', 'bi')

  .orchestrator('airflow')
  .build();
```

#### 신경망 아키텍처

```typescript
const nn = infographic.neuralNetwork()
  .title('CNN Architecture')

  .layer('input', { type: 'input', shape: [224, 224, 3] })
  .layer('conv1', { type: 'conv2d', filters: 64, kernel: 3, activation: 'relu' })
  .layer('pool1', { type: 'maxpool', size: 2 })
  .layer('conv2', { type: 'conv2d', filters: 128, kernel: 3, activation: 'relu' })
  .layer('pool2', { type: 'maxpool', size: 2 })
  .layer('flatten', { type: 'flatten' })
  .layer('dense1', { type: 'dense', units: 256, activation: 'relu' })
  .layer('dropout', { type: 'dropout', rate: 0.5 })
  .layer('output', { type: 'dense', units: 10, activation: 'softmax' })

  .style('horizontal')
  .build();
```

#### MLOps 파이프라인

```typescript
const mlops = infographic.mlopsPipeline()
  .title('ML 파이프라인')

  // 단계
  .stage('data', '데이터 수집', { tools: ['Airflow', 'Spark'] })
  .stage('feature', '피처 엔지니어링', { tools: ['Feast'] })
  .stage('train', '모델 학습', { tools: ['PyTorch', 'Ray'] })
  .stage('evaluate', '모델 평가', { tools: ['MLflow'] })
  .stage('register', '모델 등록', { tools: ['MLflow Registry'] })
  .stage('deploy', '모델 배포', { tools: ['Kubernetes', 'Seldon'] })
  .stage('monitor', '모니터링', { tools: ['Prometheus', 'Grafana'] })

  // 아티팩트
  .artifact('dataset', '학습 데이터', { type: 'dataset' })
  .artifact('features', '피처셋', { type: 'feature' })
  .artifact('model', '학습된 모델', { type: 'model' })
  .artifact('metrics', '평가 지표', { type: 'metrics' })

  // 플로우
  .flow('data', 'feature', 'dataset')
  .flow('feature', 'train', 'features')
  .flow('train', 'evaluate', 'model')
  .flow('evaluate', 'register', 'metrics')
  .flow('register', 'deploy')
  .flow('deploy', 'monitor')

  // 트리거
  .trigger('schedule', 'data', '매일 0시')
  .trigger('drift', 'train', '드리프트 감지 시')

  .build();
```

#### 클라우드 아키텍처

```typescript
const cloud = infographic.cloudArchitecture()
  .title('AWS 아키텍처')
  .provider('aws')

  // VPC
  .vpc('main', {
    subnets: [
      { name: 'public-1', type: 'public' },
      { name: 'public-2', type: 'public' },
      { name: 'private-1', type: 'private' },
      { name: 'private-2', type: 'private' },
    ]
  })

  // 서비스
  .service('alb', 'ALB', { type: 'alb', subnet: 'public' })
  .service('ecs', 'ECS Cluster', { type: 'ecs', subnet: 'private' })
  .service('rds', 'Aurora', { type: 'aurora', subnet: 'private' })
  .service('elasticache', 'Redis', { type: 'elasticache', subnet: 'private' })
  .service('s3', 'S3 Bucket', { type: 's3' })

  // 연결
  .connect('alb', 'ecs')
  .connect('ecs', 'rds')
  .connect('ecs', 'elasticache')
  .connect('ecs', 's3')

  .build();
```

---

## 4. 복합 레이아웃

여러 인포그래픽을 조합하여 하나의 페이지를 구성합니다.

```typescript
import { page, infographic } from 'diagen';

const dashboardPage = page()
  .title('Executive Dashboard')
  .size(1920, 1080)
  .theme('professional')

  // 그리드 레이아웃
  .grid(12, 8)  // 12 columns, 8 rows

  // KPI 카드 (상단)
  .place(kpi1, { col: 0, row: 0, width: 3, height: 2 })
  .place(kpi2, { col: 3, row: 0, width: 3, height: 2 })
  .place(kpi3, { col: 6, row: 0, width: 3, height: 2 })
  .place(kpi4, { col: 9, row: 0, width: 3, height: 2 })

  // 차트 (중앙)
  .place(lineChart, { col: 0, row: 2, width: 6, height: 3 })
  .place(donutChart, { col: 6, row: 2, width: 6, height: 3 })

  // 프로세스 (하단)
  .place(processSteps, { col: 0, row: 5, width: 12, height: 3 })

  .build();
```

---

## 5. 출력 및 내보내기

```typescript
import { render, exportSVG, exportPNG, exportPDF } from 'diagen';

// React 컴포넌트로 렌더링
const MyDiagram = () => {
  return <DiagramRenderer diagram={myDiagram} />;
};

// SVG 문자열로 내보내기
const svg = await exportSVG(myDiagram);

// PNG 이미지로 내보내기
const png = await exportPNG(myDiagram, {
  scale: 2,  // @2x
  backgroundColor: '#ffffff',
});

// PDF로 내보내기
const pdf = await exportPDF(myDiagram, {
  format: 'A4',
  orientation: 'landscape',
});
```

---

## 6. 타입 정의 (전체)

```typescript
// === 다이어그램 ===

interface DiagramBuilder {
  title(title: string): this;
  direction(dir: 'TB' | 'BT' | 'LR' | 'RL'): this;
  theme(theme: ThemeName): this;

  node(id: string, label?: string, options?: NodeOptions): this;
  edge(from: string, to: string, options?: EdgeOptions): this;
  group(id: string, builder: (g: GroupBuilder) => void): this;

  build(): Diagram;
}

interface NodeOptions {
  shape?: NodeShape;
  label?: string;
  icon?: string;
  style?: NodeStyle;
  width?: number;
  height?: number;
  ports?: PortDefinition[];
}

interface EdgeOptions {
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
  sourceArrow?: ArrowType;
  targetArrow?: ArrowType;
  routing?: 'straight' | 'orthogonal' | 'curved' | 'step';
  style?: EdgeStyle;
  sourcePort?: string;
  targetPort?: string;
}

interface NodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shadow?: boolean | ShadowStyle;
  gradient?: GradientStyle;
  borderRadius?: number;
  opacity?: number;
}

interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  animated?: boolean;
  opacity?: number;
}

// === 인포그래픽 ===

interface InfographicBuilders {
  // 데이터형
  kpi(): KPIBuilder;
  barChart(): BarChartBuilder;
  lineChart(): LineChartBuilder;
  donutChart(): DonutChartBuilder;

  // 흐름형
  timeline(): TimelineBuilder;
  processSteps(): ProcessStepsBuilder;
  funnel(): FunnelBuilder;
  cycle(): CycleBuilder;

  // 구조형
  pyramid(): PyramidBuilder;
  matrix2x2(): Matrix2x2Builder;
  concentricCircles(): ConcentricCirclesBuilder;
  layerStack(): LayerStackBuilder;
  orgChart(): OrgChartBuilder;

  // 기술 특화
  dataPipeline(): DataPipelineBuilder;
  neuralNetwork(): NeuralNetworkBuilder;
  mlopsPipeline(): MLOpsPipelineBuilder;
  cloudArchitecture(): CloudArchitectureBuilder;
}

// === 테마 ===

type ThemeName =
  | 'professional'
  | 'modern'
  | 'minimal'
  | 'colorful'
  | 'dark'
  ;

interface Theme {
  colors: ColorPalette;
  node: NodeTheme;
  edge: EdgeTheme;
  typography: Typography;
}
```

---

## 7. 사용 예시 모음

### 7.1 시스템 아키텍처

```typescript
import { diagram } from 'diagen';

const systemArch = diagram()
  .title('E-Commerce System Architecture')
  .direction('TB')
  .theme('professional')

  // 클라이언트
  .node('web', 'Web App', { shape: 'rect', icon: 'globe' })
  .node('mobile', 'Mobile App', { shape: 'rect', icon: 'smartphone' })

  // API 레이어
  .node('gateway', 'API Gateway', { shape: 'hexagon', style: 'primary' })

  // 서비스
  .group('services', g => g
    .node('user', 'User Service')
    .node('product', 'Product Service')
    .node('order', 'Order Service')
    .node('payment', 'Payment Service')
  )

  // 데이터
  .group('data', g => g
    .node('userdb', 'User DB', { shape: 'cylinder' })
    .node('productdb', 'Product DB', { shape: 'cylinder' })
    .node('orderdb', 'Order DB', { shape: 'cylinder' })
    .node('cache', 'Redis', { shape: 'cylinder' })
  )

  // 연결
  .edge('web', 'gateway', { label: 'HTTPS' })
  .edge('mobile', 'gateway', { label: 'HTTPS' })
  .edge('gateway', 'user')
  .edge('gateway', 'product')
  .edge('gateway', 'order')
  .edge('order', 'payment')
  .edge('user', 'userdb')
  .edge('product', 'productdb')
  .edge('order', 'orderdb')
  .edge('product', 'cache', { style: { strokeDasharray: '5,5' } })

  .build();
```

### 7.2 제안서 대시보드

```typescript
import { page, infographic } from 'diagen';

const proposalDashboard = page()
  .title('프로젝트 제안서')
  .theme('professional')
  .size(1920, 1080)
  .grid(12, 8)

  // KPI
  .place(
    infographic.kpi()
      .value('$2.5M')
      .label('예상 비용 절감')
      .icon('dollar-sign')
      .build(),
    { col: 0, row: 0, width: 4, height: 2 }
  )
  .place(
    infographic.kpi()
      .value('6개월')
      .label('예상 기간')
      .icon('calendar')
      .build(),
    { col: 4, row: 0, width: 4, height: 2 }
  )
  .place(
    infographic.kpi()
      .value('40%')
      .label('효율성 향상')
      .icon('trending-up')
      .trend('up', '+15% vs 현재')
      .build(),
    { col: 8, row: 0, width: 4, height: 2 }
  )

  // 프로세스
  .place(
    infographic.processSteps()
      .title('구현 로드맵')
      .step(1, '분석', { description: '4주' })
      .step(2, '설계', { description: '6주' })
      .step(3, '개발', { description: '12주' })
      .step(4, '테스트', { description: '4주' })
      .step(5, '배포', { description: '2주' })
      .build(),
    { col: 0, row: 2, width: 12, height: 2 }
  )

  // 비교 차트
  .place(
    infographic.barChart()
      .title('As-Is vs To-Be 비교')
      .data([
        { label: '처리 시간', asIs: 100, toBe: 30 },
        { label: '비용', asIs: 100, toBe: 60 },
        { label: '오류율', asIs: 100, toBe: 10 },
      ])
      .grouped(true)
      .build(),
    { col: 0, row: 4, width: 6, height: 4 }
  )

  // 기술 스택
  .place(
    infographic.layerStack()
      .title('제안 기술 스택')
      .layer('Frontend', 'React, TypeScript')
      .layer('Backend', 'Node.js, GraphQL')
      .layer('Data', 'PostgreSQL, Redis')
      .layer('Infrastructure', 'Kubernetes, AWS')
      .build(),
    { col: 6, row: 4, width: 6, height: 4 }
  )

  .build();
```

---

## 8. 구현 로드맵

### Phase 1: 핵심 인프라

- [ ] TypeScript 프로젝트 설정
- [ ] 기본 타입 정의
- [ ] Fluent Builder 패턴 구현
- [ ] React Flow 통합 (다이어그램)
- [ ] Visx 통합 (인포그래픽)

### Phase 2: 기본 컴포넌트

- [ ] 노드 셰이프 (rect, circle, diamond, cylinder 등)
- [ ] 엣지 스타일 (직선, 직교, 곡선)
- [ ] KPI 카드, 바 차트, 도넛 차트
- [ ] 타임라인, 프로세스 스텝

### Phase 3: 고급 컴포넌트

- [ ] C4 다이어그램
- [ ] 데이터 파이프라인
- [ ] 신경망 아키텍처
- [ ] 복합 레이아웃 (page)

### Phase 4: 내보내기

- [ ] SVG 내보내기
- [ ] PNG 내보내기
- [ ] PDF 내보내기

---

## 9. 참고 자료

### DSL 설계

- [D2 Documentation](https://d2lang.com/tour/)
- [Mermaid Syntax](https://mermaid.js.org/syntax/)
- [PlantUML Guide](https://plantuml.com/guide)

### TypeScript 패턴

- [Fluent Interface Pattern](https://en.wikipedia.org/wiki/Fluent_interface)
- [Builder Pattern in TypeScript](https://refactoring.guru/design-patterns/builder/typescript/example)
- [Tagged Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
