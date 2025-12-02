# Diagen 아키텍처 설계 문서

## 1. 개요

### 1.1 프로젝트 목표

코드 기반으로 프로페셔널 품질의 다이어그램과 인포그래픽을 생성하는 도구

### 1.2 핵심 요구사항

- 코드/DSL로 다이어그램 및 인포그래픽 정의
- 제안서/발표자료 수준의 디자인 품질
- 깔끔한 레이아웃 (텍스트/화살표 배치 최적화)
- 다양한 출력 포맷 지원 (SVG, PNG, PDF)

---

## 2. 기술 스택

### 2.1 다이어그램 엔진

| 구성요소 | 기술 | 역할 |
|---------|------|------|
| 렌더링 | **React Flow** | 노드-엣지 다이어그램 렌더링 |
| 레이아웃 | **ELK.js** | 자동 레이아웃 계산 |
| 스타일링 | Tailwind CSS / CSS-in-JS | 프로페셔널 스타일 |

#### React Flow 선택 이유

- 노드가 일반 React 컴포넌트 → 무제한 커스터마이징
- 그라디언트, 섀도우, 애니메이션 자유롭게 적용 가능
- 활발한 커뮤니티, MIT 라이선스

#### ELK.js 선택 이유 (vs Dagre)

| 기능 | Dagre | ELK |
|------|-------|-----|
| 라벨 배치 최적화 | ❌ | ✅ |
| 엣지 교차 최소화 | 기본 | 고급 알고리즘 |
| 포트(핸들) 위치 지정 | ❌ | ✅ |
| 폴리라인/직교 엣지 | 제한적 | ✅ |
| 노드 간격 세밀 조정 | 기본 | 20+ 옵션 |
| 레이아웃 알고리즘 | 1개 | 19개 |

### 2.2 인포그래픽 엔진

| 구성요소 | 기술 | 역할 |
|---------|------|------|
| 렌더링 | **Visx** (Airbnb) | 저수준 시각화 프리미티브 |
| 애니메이션 | Framer Motion | 부드러운 전환 효과 |
| 스타일링 | SVG + CSS | 그라디언트, 섀도우 등 |

#### Visx 선택 이유

- D3의 파워 + React의 편의성
- "차트 라이브러리가 아님" → 완전한 자유도
- 30+ 모듈 패키지, 필요한 것만 사용
- 번들 사이즈 최적화

### 2.3 공통 인프라

| 구성요소 | 기술 | 역할 |
|---------|------|------|
| 언어 | TypeScript | 타입 안전성 |
| 빌드 | Vite | 빠른 개발 환경 |
| 패키지 관리 | pnpm | 효율적인 의존성 관리 |

---

## 3. 시스템 아키텍처

### 3.1 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                        사용자 입력                           │
│              (DSL 코드 / 설정 객체 / API 호출)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         파서 레이어                          │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  다이어그램 파서  │              │  인포그래픽 파서  │       │
│  │   (DSL → AST)   │              │   (DSL → AST)   │       │
│  └─────────────────┘              └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       코어 레이어                            │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  다이어그램 코어  │              │  인포그래픽 코어  │       │
│  │  - 노드/엣지 모델 │              │  - 차트 모델     │       │
│  │  - 스타일 시스템  │              │  - 레이아웃 모델  │       │
│  │  - 테마          │              │  - 테마          │       │
│  └─────────────────┘              └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      레이아웃 레이어                          │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │     ELK.js      │              │   Visx Layout   │       │
│  │  - 노드 위치 계산 │              │  - 차트 스케일   │       │
│  │  - 엣지 라우팅   │              │  - 요소 배치     │       │
│  │  - 라벨 배치    │              │                 │       │
│  └─────────────────┘              └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      렌더링 레이어                           │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │   React Flow    │              │      Visx       │       │
│  │  - 커스텀 노드   │              │  - SVG 프리미티브│       │
│  │  - 커스텀 엣지   │              │  - 애니메이션    │       │
│  │  - 인터랙션     │              │                 │       │
│  └─────────────────┘              └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        출력 레이어                           │
│         SVG  /  PNG  /  PDF  /  React Component             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 다이어그램 파이프라인

```
입력 (DSL)                    중간 표현                     출력
───────────                  ─────────                   ─────
diagram`                     {                           ┌─────────┐
  A[API] -> B[Auth]            nodes: [                  │   API   │
  B -> C[DB]                     {id:'A', label:'API'},  └────┬────┘
`                                {id:'B', label:'Auth'},      │
                                 {id:'C', label:'DB'}        ▼
                               ],                        ┌─────────┐
                               edges: [                  │  Auth   │
                                 {source:'A',target:'B'},└────┬────┘
                                 {source:'B',target:'C'}      │
                               ]                              ▼
                             }                           ┌─────────┐
                                      │                  │   DB    │
                                      ▼                  └─────────┘
                              ELK 레이아웃 계산
                                      │
                                      ▼
                             React Flow 렌더링
```

---

## 4. 핵심 컴포넌트

### 4.1 다이어그램 컴포넌트

```typescript
// 노드 타입
interface DiagramNode {
  id: string;
  type: 'box' | 'circle' | 'diamond' | 'cylinder' | 'custom';
  label: string;
  style?: NodeStyle;
  ports?: Port[];
}

// 엣지 타입
interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  style?: EdgeStyle;
}

// 스타일 타입
interface NodeStyle {
  fill?: string;
  stroke?: string;
  gradient?: Gradient;
  shadow?: Shadow;
  borderRadius?: number;
}
```

### 4.2 인포그래픽 컴포넌트

```typescript
// 인포그래픽 요소 타입
type InfographicElement =
  | ChartElement      // 차트 (바, 라인, 파이 등)
  | StatElement       // 통계 수치
  | IconElement       // 아이콘
  | TextElement       // 텍스트 블록
  | ImageElement      // 이미지
  | ContainerElement; // 컨테이너/그룹

// 레이아웃 타입
interface InfographicLayout {
  type: 'flow' | 'grid' | 'absolute' | 'timeline';
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  padding?: number;
}
```

---

## 5. ELK 레이아웃 설정

### 5.1 기본 설정

```typescript
const defaultElkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',

  // 노드 간격
  'elk.spacing.nodeNode': '50',
  'elk.layered.spacing.nodeNodeBetweenLayers': '80',

  // 엣지 라우팅
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.spacing.edgeNodeBetweenLayers': '30',

  // 라벨 배치
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',

  // 노드 배치 최적화
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
};
```

### 5.2 레이아웃 알고리즘 옵션

| 알고리즘 | 용도 | 특징 |
|---------|------|------|
| `layered` | 플로우차트, 아키텍처 | 계층적, 방향성 |
| `force` | 네트워크, 관계도 | 물리 시뮬레이션 |
| `stress` | 일반 그래프 | 거리 기반 |
| `mrtree` | 트리 구조 | 계층적 트리 |
| `radial` | 방사형 | 중심에서 확산 |

---

## 6. 스타일 시스템

### 6.1 테마 구조

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };

  node: {
    default: NodeStyle;
    variants: Record<string, NodeStyle>;
  };

  edge: {
    default: EdgeStyle;
    variants: Record<string, EdgeStyle>;
  };

  typography: {
    fontFamily: string;
    fontSize: Record<string, number>;
    fontWeight: Record<string, number>;
  };
}
```

### 6.2 프리셋 테마

- `professional` - 비즈니스 제안서용, 깔끔한 블루/그레이
- `modern` - 모던 UI, 그라디언트 활용
- `minimal` - 미니멀, 흑백 중심
- `colorful` - 다채로운 색상, 프레젠테이션용

---

## 7. 출력 포맷

### 7.1 지원 포맷

| 포맷 | 용도 | 구현 방식 |
|------|------|----------|
| SVG | 웹, 편집 가능 | 직접 렌더링 |
| PNG | 이미지 삽입 | html-to-image |
| PDF | 문서 첨부 | jsPDF + SVG |
| React | 앱 통합 | 컴포넌트 export |

### 7.2 해상도 옵션

- `@1x` - 일반 (72dpi)
- `@2x` - 레티나 (144dpi)
- `@3x` - 고해상도 (216dpi)

---

## 8. 향후 확장 계획

### 8.1 Phase 1 (MVP)

- [ ] 기본 다이어그램 DSL 및 파서
- [ ] React Flow + ELK 통합
- [ ] 기본 노드/엣지 스타일
- [ ] SVG 출력

### 8.2 Phase 2

- [ ] 인포그래픽 기본 구현 (Visx)
- [ ] 테마 시스템
- [ ] PNG/PDF 출력

### 8.3 Phase 3

- [ ] CLI 도구
- [ ] VS Code 확장
- [ ] 실시간 미리보기

---

## 9. 참고 자료

### 라이브러리 문서

- [React Flow](https://reactflow.dev/)
- [ELK.js](https://github.com/kieler/elkjs)
- [Visx](https://airbnb.io/visx/)
- [Framer Motion](https://www.framer.com/motion/)

### 레이아웃 알고리즘

- [ELK Algorithm Reference](https://eclipse.dev/elk/reference/algorithms.html)
- [ELK Options Reference](https://eclipse.dev/elk/reference/options.html)
