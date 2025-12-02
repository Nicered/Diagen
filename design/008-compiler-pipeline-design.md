# 컴파일러 파이프라인 설계

## 1. 개요

DSL 텍스트 입력부터 최종 출력(React 컴포넌트, SVG, PNG)까지의 전체 데이터 흐름을 정의합니다.

---

## 2. 파이프라인 아키텍처

### 2.1 전체 흐름

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              입력 (Input)                                    │
│                                                                             │
│   DSL 텍스트 (.diagen 파일)     또는     JavaScript/TypeScript API           │
│                                                                             │
│   @diagram flowchart                    createDiagram({                     │
│   ---                                     nodes: [...],                     │
│   theme: professional                     edges: [...],                     │
│   ---                                   })                                  │
│   A: "시작" -> B: "처리"                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           1단계: 어휘 분석 (Lexer)                            │
│                                                                             │
│   DSL 텍스트 → 토큰 스트림                                                    │
│                                                                             │
│   입력: "@diagram flowchart\nA: \"시작\" -> B"                               │
│   출력: [AtDiagram, Identifier("flowchart"), Newline,                       │
│          Identifier("A"), Colon, StringLiteral("시작"), Arrow, ...]         │
│                                                                             │
│   구현: src/parser/lexer.ts                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           2단계: 구문 분석 (Parser)                           │
│                                                                             │
│   토큰 스트림 → CST (Concrete Syntax Tree)                                   │
│                                                                             │
│   Chevrotain CstParser가 문법 규칙에 따라 구문 트리 생성                        │
│   에러 복구 기능으로 부분적 오류에도 파싱 계속                                   │
│                                                                             │
│   구현: src/parser/parser.ts                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           3단계: IR 변환 (Visitor)                           │
│                                                                             │
│   CST → DiagramIR (중간 표현)                                                │
│                                                                             │
│   DiagramIR {                                                               │
│     type: 'diagram',                                                        │
│     subtype: 'flowchart',                                                   │
│     meta: { theme: 'professional' },                                        │
│     nodes: [{ id: 'A', label: '시작', ... }],                               │
│     edges: [{ source: 'A', target: 'B', ... }],                            │
│     groups: []                                                              │
│   }                                                                         │
│                                                                             │
│   구현: src/parser/visitor.ts                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         4단계: 컴파일 (Compiler)                             │
│                                                                             │
│   DiagramIR → DiagramModel                                                  │
│                                                                             │
│   - IR 유효성 검사                                                           │
│   - 테마 적용 (스타일 병합)                                                   │
│   - 기본값 처리                                                              │
│   - 암시적 노드 생성 (엣지에서 참조된 미정의 노드)                               │
│   - ID 정규화                                                                │
│   - 그룹 계층 구조 구축                                                       │
│                                                                             │
│   구현: src/compiler/compiler.ts (신규)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         5단계: 레이아웃 (Layout)                             │
│                                                                             │
│   DiagramModel → DiagramModel (위치 정보 추가)                               │
│                                                                             │
│   - ELK.js 그래프로 변환                                                     │
│   - 레이아웃 알고리즘 실행 (layered, force, radial 등)                        │
│   - 계산된 위치를 모델에 적용                                                 │
│   - 엣지 라우팅 정보 적용                                                     │
│                                                                             │
│   구현: src/layout/elkAdapter.ts                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          6단계: 렌더링 (Render)                              │
│                                                                             │
│   DiagramModel → React Element / SVG / PNG                                  │
│                                                                             │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │  React Flow     │   │   SVG Export    │   │   PNG Export    │          │
│   │  Component      │   │                 │   │                 │          │
│   │                 │   │  독립 실행형     │   │  html-to-image  │          │
│   │  인터랙티브     │   │  정적 SVG       │   │  래스터 이미지   │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                             │
│   구현: src/renderer/, src/export/                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 컴파일러 상세 설계

### 3.1 컴파일러 책임

```typescript
// src/compiler/compiler.ts

interface CompilerOptions {
  theme?: Theme | string;        // 테마 객체 또는 프리셋 이름
  defaultNodeStyle?: NodeStyle;  // 전역 노드 기본 스타일
  defaultEdgeStyle?: EdgeStyle;  // 전역 엣지 기본 스타일
  strictMode?: boolean;          // 엄격 모드 (미정의 노드 참조 시 에러)
  autoCreateNodes?: boolean;     // 암시적 노드 자동 생성 (기본: true)
}

interface CompileResult {
  model: DiagramModel;
  warnings: CompileWarning[];
  errors: CompileError[];
}

class Compiler {
  compile(ir: DiagramIR, options?: CompilerOptions): CompileResult;
}
```

### 3.2 컴파일 단계

#### 3.2.1 유효성 검사 (Validation)

```typescript
// 검사 항목
interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// 에러 유형
type ValidationError =
  | { type: 'DUPLICATE_ID'; id: string; locations: Location[] }
  | { type: 'INVALID_REFERENCE'; ref: string; context: string }
  | { type: 'CIRCULAR_GROUP'; groups: string[] }
  | { type: 'MISSING_REQUIRED'; field: string; element: string };

// 경고 유형
type ValidationWarning =
  | { type: 'UNDEFINED_NODE'; id: string; autoCreated: boolean }
  | { type: 'UNUSED_NODE'; id: string }
  | { type: 'STYLE_OVERRIDE'; property: string };
```

#### 3.2.2 테마 적용 (Theme Application)

```typescript
// 테마 적용 순서 (우선순위 낮음 → 높음)
// 1. 테마 기본값
// 2. 노드/엣지 타입별 스타일
// 3. 인라인 스타일

function applyTheme(ir: DiagramIR, theme: Theme): DiagramIR {
  return {
    ...ir,
    nodes: ir.nodes.map(node => ({
      ...node,
      style: mergeStyles(
        theme.node.default,
        theme.node.variants[node.shape],
        node.style
      )
    })),
    edges: ir.edges.map(edge => ({
      ...edge,
      style: mergeStyles(
        theme.edge.default,
        theme.edge.variants[edge.type],
        edge.style
      )
    }))
  };
}
```

#### 3.2.3 노드 정규화 (Node Normalization)

```typescript
// 암시적 노드 생성
// 엣지에서 참조되었지만 명시적으로 정의되지 않은 노드 자동 생성

function normalizeNodes(ir: DiagramIR): DiagramNode[] {
  const definedIds = new Set(ir.nodes.map(n => n.id));
  const referencedIds = new Set([
    ...ir.edges.map(e => e.source),
    ...ir.edges.map(e => e.target)
  ]);

  const implicitNodes: DiagramNode[] = [];
  for (const id of referencedIds) {
    if (!definedIds.has(id)) {
      implicitNodes.push({
        id,
        label: id,  // ID를 라벨로 사용
        shape: 'rect',
        // 기본 스타일 적용
      });
    }
  }

  return [...ir.nodes, ...implicitNodes];
}
```

#### 3.2.4 그룹 계층 구축 (Group Hierarchy)

```typescript
// 그룹 계층 구조 구축 및 검증
interface GroupHierarchy {
  root: DiagramGroup[];
  nodeToGroup: Map<string, string>;  // nodeId -> groupId
  groupToParent: Map<string, string>; // groupId -> parentGroupId
}

function buildGroupHierarchy(ir: DiagramIR): GroupHierarchy {
  // 1. 그룹 트리 구축
  // 2. 순환 참조 검사
  // 3. 노드-그룹 매핑 생성
}
```

### 3.3 컴파일러 구현 구조

```
src/compiler/
├── index.ts              # 공개 API
├── compiler.ts           # 메인 컴파일러 클래스
├── validator.ts          # 유효성 검사
├── themeApplier.ts       # 테마 적용
├── nodeNormalizer.ts     # 노드 정규화
├── groupResolver.ts      # 그룹 계층 처리
└── errors.ts             # 에러/경고 타입
```

---

## 4. 통합 파이프라인 API

### 4.1 고수준 API

```typescript
// src/pipeline/index.ts

// 원스텝 변환: DSL → 렌더링 가능 상태
async function compile(
  source: string,
  options?: PipelineOptions
): Promise<CompiledDiagram> {
  // 1. 파싱
  const ir = parse(source);

  // 2. 컴파일
  const model = compile(ir, options);

  // 3. 레이아웃
  await layout(model, options?.layout);

  return { model, ir };
}

// React 컴포넌트로 렌더링
function render(compiled: CompiledDiagram): React.ReactElement {
  return <DiagramRenderer model={compiled.model} />;
}

// SVG로 내보내기
async function exportSvg(compiled: CompiledDiagram): Promise<string> {
  return generateSvg(compiled.model);
}

// PNG로 내보내기
async function exportPng(
  compiled: CompiledDiagram,
  options?: PngOptions
): Promise<Blob> {
  // html-to-image 사용
}
```

### 4.2 파이프라인 옵션

```typescript
interface PipelineOptions {
  // 파서 옵션
  parser?: {
    strict?: boolean;        // 엄격 모드
    comments?: boolean;      // 주석 보존
  };

  // 컴파일러 옵션
  compiler?: {
    theme?: Theme | string;
    autoCreateNodes?: boolean;
  };

  // 레이아웃 옵션
  layout?: {
    algorithm?: 'layered' | 'force' | 'stress' | 'mrtree' | 'radial';
    direction?: 'TB' | 'BT' | 'LR' | 'RL';
    nodeSpacing?: number;
    layerSpacing?: number;
  };

  // 렌더링 옵션
  render?: {
    fitView?: boolean;
    interactive?: boolean;
    showMiniMap?: boolean;
  };
}
```

### 4.3 빌더 패턴 API

```typescript
// 체이닝 방식의 빌더 API
const diagram = await Diagen
  .from('@diagram\nA -> B -> C')
  .theme('professional')
  .layout({ algorithm: 'layered', direction: 'LR' })
  .compile();

// React에서 사용
<DiagramView diagram={diagram} />

// SVG 내보내기
const svg = await diagram.toSvg();
```

---

## 5. 에러 처리

### 5.1 에러 계층 구조

```typescript
// 기본 에러 클래스
class DiagenError extends Error {
  code: string;
  location?: SourceLocation;
}

// 파싱 에러
class ParseError extends DiagenError {
  token?: Token;
  expected?: string[];
}

// 컴파일 에러
class CompileError extends DiagenError {
  node?: string;
  details?: Record<string, unknown>;
}

// 레이아웃 에러
class LayoutError extends DiagenError {
  algorithm?: string;
}
```

### 5.2 에러 메시지 형식

```
Error: [DIAGEN-001] Undefined node reference

  → node "C" is referenced in edge but not defined

  5 │ A: "시작" -> B: "처리"
  6 │ B -> C
        ───┬
           └── "C" is not defined

  Hint: Define the node explicitly or enable autoCreateNodes option

  at line 6, column 6
  in /path/to/diagram.diagen
```

---

## 6. 사용 시나리오

### 6.1 CLI 사용

```bash
# DSL 파일 → SVG
diagen build diagram.diagen -o output.svg

# 옵션 지정
diagen build diagram.diagen \
  --theme professional \
  --layout layered \
  --direction LR \
  -o output.svg

# 감시 모드
diagen watch diagram.diagen --preview
```

### 6.2 프로그래밍 API 사용

```typescript
import { compile, render, exportSvg } from 'diagen';

// DSL에서 컴파일
const diagram = await compile(`
  @diagram flowchart
  ---
  theme: professional
  ---
  A: "시작" -> B: "처리" -> C: "완료"
`);

// React 컴포넌트로 사용
function MyDiagram() {
  return <DiagramRenderer model={diagram.model} />;
}

// SVG로 내보내기
const svg = await exportSvg(diagram);
```

### 6.3 에디터 통합

```typescript
// VS Code 확장에서 사용
import { parse, validate } from 'diagen';

// 실시간 검증
function onDocumentChange(text: string) {
  const result = parse(text);

  if (result.errors.length > 0) {
    // 에러 표시
    showDiagnostics(result.errors);
  }

  // 미리보기 업데이트
  updatePreview(result);
}
```

---

## 7. 확장 포인트

### 7.1 커스텀 노드 타입

```typescript
// 커스텀 노드 타입 등록
Diagen.registerNodeType('myCustomNode', {
  // 기본 스타일
  defaultStyle: { ... },

  // React 컴포넌트
  component: MyCustomNodeComponent,

  // SVG 렌더링 함수 (독립 실행형 SVG용)
  renderSvg: (node) => `<g>...</g>`,
});
```

### 7.2 커스텀 레이아웃

```typescript
// 커스텀 레이아웃 알고리즘 등록
Diagen.registerLayout('myLayout', {
  layout: async (model) => {
    // 노드 위치 계산
    for (const node of model.nodes) {
      node.position = calculatePosition(node);
    }
  }
});
```

### 7.3 커스텀 내보내기 형식

```typescript
// 커스텀 내보내기 형식 등록
Diagen.registerExporter('pptx', {
  export: async (model) => {
    // PowerPoint 파일 생성
    return pptxBlob;
  }
});
```

---

## 8. 구현 우선순위

### Phase 1 (MVP)
1. ✅ 파서 (lexer, parser, visitor)
2. ✅ 코어 모델 (DiagramModel)
3. ⬜ **컴파일러** (IR → Model 변환)
4. ✅ 레이아웃 (ELK 어댑터)
5. ✅ 렌더러 (React Flow)
6. ⬜ **통합 파이프라인** (compile, render, export)

### Phase 2
7. ⬜ CLI 도구
8. ⬜ 에러 메시지 개선
9. ⬜ PNG 내보내기

### Phase 3
10. ⬜ VS Code 확장
11. ⬜ 웹 플레이그라운드
12. ⬜ 커스텀 확장 API

---

## 9. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-12-01 | 초기 설계 문서 작성 |
