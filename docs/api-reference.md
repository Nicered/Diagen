# API 레퍼런스

Diagen의 모든 프로그래밍 인터페이스를 상세히 설명합니다.

## 목차

1. [개요](#개요)
2. [고수준 API](#고수준-api)
3. [Builder API](#builder-api)
4. [저수준 API](#저수준-api)
5. [타입 정의](#타입-정의)
6. [에러 처리](#에러-처리)
7. [React 통합](#react-통합)

---

## 개요

Diagen은 세 가지 수준의 API를 제공합니다:

| 수준 | 용도 | 추천 대상 |
|------|------|----------|
| 고수준 API | DSL → SVG 직접 변환 | 빠른 시작, 간단한 사용 |
| Builder API | 체이닝 방식의 직관적 인터페이스 | 옵션이 많은 경우 |
| 저수준 API | 파이프라인 각 단계 제어 | 커스텀 처리, 확장 |

### 기본 Import

```typescript
// 고수준 API (권장)
import { dslToSvg, compileDsl, toSvg, parse } from 'diagen';

// Builder API
import { Diagen } from 'diagen';

// 프로그래밍 방식 다이어그램 생성
import { createDiagram } from 'diagen';

// 저수준 API
import { Compiler, compile, validate } from 'diagen';

// 테마
import { themes, getTheme, createTheme } from 'diagen';

// 타입
import type { DiagramIR, DiagramNode, Theme, PipelineOptions } from 'diagen';
```

---

## 고수준 API

### dslToSvg()

DSL 문자열을 SVG로 직접 변환하는 가장 간단한 함수입니다.

#### 시그니처

```typescript
async function dslToSvg(
  source: string,
  options?: PipelineOptions & SvgExportOptions
): Promise<string>
```

#### 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `source` | `string` | O | DSL 소스 문자열 |
| `options` | `PipelineOptions & SvgExportOptions` | X | 컴파일 및 렌더링 옵션 |

#### 반환값

`Promise<string>` - SVG 문자열

#### 예시

```typescript
import { dslToSvg } from 'diagen';

// 기본 사용
const svg = await dslToSvg(`
  @diagram
  A -> B -> C
`);

// 모든 옵션 사용
const svg = await dslToSvg(`
  @diagram
  A -> B -> C
`, {
  // 테마 (문자열 또는 Theme 객체)
  theme: 'professional',

  // 레이아웃 옵션
  layout: {
    direction: 'LR',     // 'TB' | 'BT' | 'LR' | 'RL'
    nodeSpacing: 50,     // 노드 간 간격 (기본: 50)
    rankSpacing: 80,     // 계층 간 간격 (기본: 80)
    padding: 30,         // 전체 패딩 (기본: 30)
  },

  // 컴파일 옵션
  strictMode: false,     // 엄격 모드 (미정의 노드 에러)
  autoCreateNodes: true, // 암묵적 노드 자동 생성

  // SVG 옵션
  padding: 30,           // SVG 여백
  backgroundColor: '#ffffff',
  includeStyles: true,   // 인라인 스타일 포함
});
```

#### 에러 처리

```typescript
import { dslToSvg } from 'diagen';

try {
  const svg = await dslToSvg(source);
} catch (error) {
  if (error instanceof Error) {
    // 파싱 에러 또는 컴파일 에러
    console.error('다이어그램 생성 실패:', error.message);
  }
}
```

---

### compileDsl()

DSL을 컴파일하여 DiagramModel을 생성합니다. SVG 생성 전에 모델을 조작하거나 검사할 때 사용합니다.

#### 시그니처

```typescript
async function compileDsl(
  source: string,
  options?: PipelineOptions
): Promise<CompiledDiagram>
```

#### 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `source` | `string` | O | DSL 소스 문자열 |
| `options` | `PipelineOptions` | X | 컴파일 옵션 |

#### 반환값

```typescript
interface CompiledDiagram {
  model: DiagramModel;  // 렌더링 가능한 다이어그램 모델
  ir: DiagramIR;        // 중간 표현 (Intermediate Representation)
  warnings: string[];   // 컴파일 경고 메시지
}
```

#### 예시

```typescript
import { compileDsl, toSvg } from 'diagen';

const source = `
  @diagram
  A: "시작"
  B: "처리"
  C: "종료"
  A -> B -> C
`;

// 1. 컴파일
const { model, ir, warnings } = await compileDsl(source, {
  theme: 'professional',
  layout: { direction: 'TB' }
});

// 2. 경고 확인
if (warnings.length > 0) {
  console.warn('컴파일 경고:', warnings);
}

// 3. 모델 정보 확인
console.log('노드 수:', model.nodes.length);
console.log('엣지 수:', model.edges.length);
console.log('그룹 수:', model.groups.length);

// 4. 노드 정보 출력
for (const node of model.nodes) {
  console.log(`- ${node.id}: ${node.label} (${node.shape})`);
}

// 5. SVG 생성
const svg = await toSvg({ model, ir, warnings });
```

---

### toSvg()

CompiledDiagram을 SVG 문자열로 변환합니다.

#### 시그니처

```typescript
async function toSvg(
  diagram: CompiledDiagram,
  options?: SvgExportOptions
): Promise<string>
```

#### 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `diagram` | `CompiledDiagram` | O | compileDsl() 결과 |
| `options` | `SvgExportOptions` | X | SVG 출력 옵션 |

#### SvgExportOptions

```typescript
interface SvgExportOptions {
  width?: number;           // SVG 너비 (자동 계산)
  height?: number;          // SVG 높이 (자동 계산)
  padding?: number;         // 여백 (기본: 30)
  backgroundColor?: string; // 배경색 (기본: '#ffffff')
  includeStyles?: boolean;  // 인라인 스타일 포함 (기본: true)
}
```

#### 예시

```typescript
import { compileDsl, toSvg } from 'diagen';

const diagram = await compileDsl(source);

// 기본 옵션
const svg1 = await toSvg(diagram);

// 커스텀 옵션
const svg2 = await toSvg(diagram, {
  padding: 50,
  backgroundColor: '#f5f5f5',
});

// 크기 고정
const svg3 = await toSvg(diagram, {
  width: 800,
  height: 600,
});
```

---

### parse()

DSL 문자열을 파싱하여 IR(중간 표현)을 생성합니다.

#### 시그니처

```typescript
function parse(source: string): ParseResult
```

#### 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `source` | `string` | O | DSL 소스 문자열 |

#### 반환값

```typescript
interface ParseResult {
  success: boolean;      // 파싱 성공 여부
  ir?: DiagramIR;        // 성공시 IR
  errors: ParseError[];  // 파싱 에러 목록
}

interface ParseError {
  message: string;       // 에러 메시지
  line?: number;         // 에러 발생 줄
  column?: number;       // 에러 발생 열
}
```

#### 예시

```typescript
import { parse } from 'diagen';

const result = parse(`
  @diagram
  A -> B -> C
`);

if (result.success) {
  console.log('파싱 성공!');
  console.log('노드 수:', result.ir?.content.nodes.length);
  console.log('엣지 수:', result.ir?.content.edges.length);
} else {
  console.error('파싱 실패:');
  for (const error of result.errors) {
    console.error(`  줄 ${error.line}: ${error.message}`);
  }
}
```

#### 에러 처리 패턴

```typescript
import { parse } from 'diagen';

function validateDsl(source: string): { valid: boolean; errors: string[] } {
  const result = parse(source);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: result.errors.map(e =>
      e.line ? `줄 ${e.line}: ${e.message}` : e.message
    )
  };
}
```

---

## Builder API

### Diagen 클래스

체이닝 방식으로 다이어그램을 생성하는 빌더 클래스입니다.

#### 기본 사용법

```typescript
import { Diagen } from 'diagen';

const svg = await Diagen
  .from(source)
  .theme('professional')
  .layout({ direction: 'LR' })
  .toSvg();
```

#### 메서드

##### Diagen.from(source)

빌더 인스턴스를 생성합니다.

```typescript
static from(source: string): Diagen
```

##### .theme(theme)

테마를 설정합니다.

```typescript
theme(theme: Theme | string): Diagen
```

**예시:**
```typescript
// 테마 이름으로
Diagen.from(source).theme('modern')

// Theme 객체로
import { createTheme } from 'diagen';
const customTheme = createTheme({ ... });
Diagen.from(source).theme(customTheme)
```

##### .layout(options)

레이아웃 옵션을 설정합니다.

```typescript
layout(options: LayoutOptions): Diagen
```

**예시:**
```typescript
Diagen.from(source).layout({
  direction: 'LR',
  nodeSpacing: 60,
  rankSpacing: 100,
})
```

##### .strict()

엄격 모드를 활성화합니다. 정의되지 않은 노드 참조 시 에러가 발생합니다.

```typescript
strict(): Diagen
```

**예시:**
```typescript
// 엄격 모드 - 정의되지 않은 노드 참조 시 에러
Diagen.from(`
  @diagram
  A: "시작"
  A -> B  // B가 정의되지 않음 - 에러!
`).strict().compile()
```

##### .skipLayout()

자동 레이아웃을 건너뜁니다. 수동으로 위치를 지정할 때 사용합니다.

```typescript
skipLayout(): Diagen
```

##### .compile()

DSL을 컴파일합니다.

```typescript
async compile(): Promise<CompiledDiagram>
```

##### .toSvg(options?)

SVG 문자열을 생성합니다.

```typescript
async toSvg(options?: SvgExportOptions): Promise<string>
```

##### .getModel()

DiagramModel을 반환합니다.

```typescript
async getModel(): Promise<DiagramModel>
```

#### 전체 예시

```typescript
import { Diagen } from 'diagen';
import { writeFileSync } from 'fs';

async function generateDiagram() {
  const builder = Diagen.from(`
    @diagram architecture
    ---
    title: "마이크로서비스"
    ---

    Client: "클라이언트" [cloud]
    Gateway: "API Gateway" [hexagon]

    group Services [label: "서비스"] {
      Auth: "인증" [rect]
      User: "사용자" [rect]
    }

    Client -> Gateway
    Gateway -> Services.Auth
    Gateway -> Services.User
  `);

  // 옵션 체이닝
  const svg = await builder
    .theme('professional')
    .layout({ direction: 'TB', nodeSpacing: 60 })
    .toSvg({ padding: 40 });

  writeFileSync('microservices.svg', svg);

  // 모델 정보도 확인 가능
  const model = await builder.getModel();
  console.log(`생성된 다이어그램: ${model.nodes.length}개 노드`);
}
```

---

## 저수준 API

### createDiagram()

DSL 없이 프로그래밍 방식으로 다이어그램을 생성합니다.

#### 시그니처

```typescript
async function createDiagram(
  definition: DiagramDefinition,
  options?: PipelineOptions
): Promise<CompiledDiagram>
```

#### DiagramDefinition

```typescript
interface DiagramDefinition {
  nodes: Array<{
    id: string;              // 노드 ID
    label: string;           // 표시 라벨
    shape?: NodeShape;       // 도형 (기본: 'rect')
    style?: NodeStyle;       // 스타일
    icon?: string;           // 아이콘
  }>;

  edges: Array<{
    id?: string;             // 엣지 ID (자동 생성)
    source: string;          // 소스 노드 ID
    target: string;          // 타겟 노드 ID
    label?: string;          // 엣지 라벨
    style?: EdgeStyle;       // 스타일
  }>;

  groups?: Array<{
    id: string;              // 그룹 ID
    label: string;           // 그룹 라벨
    children: string[];      // 자식 노드 ID 목록
    style?: NodeStyle;       // 스타일
  }>;
}
```

#### 예시

```typescript
import { createDiagram, toSvg } from 'diagen';

// 프로그래밍 방식으로 다이어그램 정의
const diagram = await createDiagram({
  nodes: [
    { id: 'client', label: '클라이언트', shape: 'cloud' },
    { id: 'lb', label: 'Load Balancer', shape: 'hexagon' },
    { id: 'api1', label: 'API Server 1', shape: 'rect' },
    { id: 'api2', label: 'API Server 2', shape: 'rect' },
    {
      id: 'db',
      label: 'PostgreSQL',
      shape: 'cylinder',
      style: { fill: '#336791' }
    },
  ],
  edges: [
    { source: 'client', target: 'lb', label: 'HTTPS' },
    { source: 'lb', target: 'api1' },
    { source: 'lb', target: 'api2' },
    { source: 'api1', target: 'db', label: 'SQL' },
    { source: 'api2', target: 'db', label: 'SQL' },
  ],
  groups: [
    {
      id: 'backend',
      label: '백엔드',
      children: ['api1', 'api2'],
    },
  ],
}, {
  theme: 'professional',
  layout: { direction: 'TB' },
});

const svg = await toSvg(diagram);
```

#### 동적 다이어그램 생성

```typescript
import { createDiagram, toSvg } from 'diagen';

// 데이터에서 다이어그램 생성
interface ServiceInfo {
  name: string;
  dependencies: string[];
}

async function generateServiceDiagram(services: ServiceInfo[]) {
  const nodes = services.map(service => ({
    id: service.name.toLowerCase().replace(/\s/g, '_'),
    label: service.name,
    shape: 'roundRect' as const,
  }));

  const edges = services.flatMap(service =>
    service.dependencies.map(dep => ({
      source: service.name.toLowerCase().replace(/\s/g, '_'),
      target: dep.toLowerCase().replace(/\s/g, '_'),
    }))
  );

  const diagram = await createDiagram(
    { nodes, edges },
    { layout: { direction: 'LR' } }
  );

  return toSvg(diagram);
}

// 사용
const svg = await generateServiceDiagram([
  { name: 'API Gateway', dependencies: ['Auth Service', 'User Service'] },
  { name: 'Auth Service', dependencies: ['User DB'] },
  { name: 'User Service', dependencies: ['User DB'] },
  { name: 'User DB', dependencies: [] },
]);
```

---

### compile()

IR을 DiagramModel로 컴파일합니다.

#### 시그니처

```typescript
function compile(
  ir: DiagramIR,
  options?: CompilerOptions
): CompileResult
```

#### CompilerOptions

```typescript
interface CompilerOptions {
  theme?: Theme | string;    // 테마
  strictMode?: boolean;      // 엄격 모드
  autoCreateNodes?: boolean; // 암묵적 노드 자동 생성 (기본: true)
}
```

#### CompileResult

```typescript
interface CompileResult {
  model: DiagramModel | null;  // 성공 시 모델
  errors: CompileError[];      // 컴파일 에러
  warnings: CompileWarning[];  // 경고
}
```

#### 예시

```typescript
import { parse, compile } from 'diagen';

const parseResult = parse(source);

if (parseResult.success && parseResult.ir) {
  const compileResult = compile(parseResult.ir, {
    theme: 'professional',
    strictMode: true,
  });

  if (compileResult.model) {
    console.log('컴파일 성공!');
  } else {
    console.error('컴파일 실패:', compileResult.errors);
  }
}
```

---

### validate()

IR의 유효성을 검사합니다.

#### 시그니처

```typescript
function validate(ir: DiagramIR): ValidationResult
```

#### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}
```

#### 검증 항목

- 중복 노드 ID
- 순환 그룹 참조
- 정의되지 않은 노드 참조
- 정의되지 않은 그룹 참조

#### 예시

```typescript
import { parse, validate } from 'diagen';

const { ir } = parse(source);
if (ir) {
  const result = validate(ir);

  if (!result.valid) {
    console.error('유효성 검사 실패:');
    for (const error of result.errors) {
      console.error(`  - ${error.message}`);
    }
  }
}
```

---

## 타입 정의

### PipelineOptions

파이프라인 전체 옵션입니다.

```typescript
interface PipelineOptions {
  // 테마
  theme?: Theme | string;

  // 컴파일러 옵션
  strictMode?: boolean;       // 엄격 모드
  autoCreateNodes?: boolean;  // 암묵적 노드 자동 생성

  // 레이아웃 옵션
  layout?: LayoutOptions;

  // 단계 건너뛰기
  skipLayout?: boolean;
}
```

### LayoutOptions

레이아웃 설정입니다.

```typescript
interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';  // 방향 (기본: 'TB')
  nodeSpacing?: number;    // 노드 간 간격 (기본: 50)
  rankSpacing?: number;    // 계층 간 간격 (기본: 80)
  padding?: number;        // 전체 패딩 (기본: 30)
}
```

### NodeShape

지원하는 노드 도형입니다.

```typescript
type NodeShape =
  | 'rect'       // 사각형
  | 'roundRect'  // 둥근 사각형
  | 'circle'     // 원
  | 'diamond'    // 마름모
  | 'hexagon'    // 육각형
  | 'cylinder'   // 원통
  | 'cloud'      // 구름
  | 'document'   // 문서
  | 'queue'      // 큐
  | 'person';    // 사람
```

### NodeStyle

노드 스타일 속성입니다.

```typescript
interface NodeStyle {
  fill?: string;          // 배경색
  stroke?: string;        // 테두리색
  strokeWidth?: number;   // 테두리 두께
  opacity?: number;       // 투명도 (0-1)
  dashed?: boolean;       // 점선 테두리
  shadow?: Shadow;        // 그림자
  gradient?: Gradient;    // 그라데이션
}

interface Shadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

interface Gradient {
  type: 'linear' | 'radial';
  from: string;
  to: string;
  angle?: number;
}
```

### EdgeStyle

엣지 스타일 속성입니다.

```typescript
interface EdgeStyle {
  stroke?: string;                      // 선 색상
  strokeWidth?: number;                 // 선 두께
  lineType?: 'solid' | 'dashed' | 'bold'; // 선 스타일
}
```

### Theme

테마 정의입니다.

```typescript
interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  node: {
    default: NodeStyle;
    variants?: Record<string, NodeStyle>;
  };
  edge: {
    default: EdgeStyle;
  };
  group?: {
    default: NodeStyle;
  };
}

interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  text: string;
  textLight: string;
}
```

---

## 에러 처리

### 에러 타입

```typescript
import { DiagenError, CompileError, ValidationError } from 'diagen';

// 기본 에러
class DiagenError extends Error {
  code: string;
  location?: SourceLocation;
}

// 컴파일 에러
class CompileError extends DiagenError {}

// 유효성 검사 에러
class ValidationError extends DiagenError {}
```

### 에러 코드

```typescript
import { ErrorCodes } from 'diagen';

ErrorCodes.PARSE_ERROR           // 파싱 에러
ErrorCodes.VALIDATION_ERROR      // 유효성 에러
ErrorCodes.DUPLICATE_ID          // 중복 ID
ErrorCodes.UNDEFINED_REFERENCE   // 정의되지 않은 참조
ErrorCodes.CIRCULAR_REFERENCE    // 순환 참조
```

### 에러 처리 패턴

```typescript
import { dslToSvg, DiagenError, ErrorCodes } from 'diagen';

async function safeDiagramGeneration(source: string) {
  try {
    return await dslToSvg(source);
  } catch (error) {
    if (error instanceof DiagenError) {
      switch (error.code) {
        case ErrorCodes.PARSE_ERROR:
          console.error('DSL 문법 오류:', error.message);
          if (error.location) {
            console.error(`  위치: ${error.location.line}:${error.location.column}`);
          }
          break;

        case ErrorCodes.DUPLICATE_ID:
          console.error('중복 ID:', error.message);
          break;

        default:
          console.error('다이어그램 생성 오류:', error.message);
      }
    } else {
      throw error;
    }
  }
}
```

---

## React 통합

### DiagramRenderer 컴포넌트

React Flow 기반 인터랙티브 렌더러입니다.

```tsx
import { DiagramRenderer, compileDsl } from 'diagen';
import { useEffect, useState } from 'react';

function InteractiveDiagram({ source }: { source: string }) {
  const [model, setModel] = useState(null);

  useEffect(() => {
    compileDsl(source).then(({ model }) => setModel(model));
  }, [source]);

  if (!model) return <div>Loading...</div>;

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <DiagramRenderer model={model} />
    </div>
  );
}
```

### 정적 SVG 렌더링

```tsx
import { dslToSvg } from 'diagen';
import { useEffect, useState } from 'react';

function StaticDiagram({ source }: { source: string }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    dslToSvg(source, { theme: 'professional' })
      .then(result => {
        if (!cancelled) {
          setSvg(result);
          setError('');
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

### 실시간 편집기

```tsx
import { useState, useCallback } from 'react';
import { dslToSvg } from 'diagen';
import debounce from 'lodash/debounce';

function DiagramEditor() {
  const [source, setSource] = useState('@diagram\nA -> B -> C');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  const render = useCallback(
    debounce(async (src: string) => {
      try {
        const result = await dslToSvg(src);
        setSvg(result);
        setError('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSource(value);
    render(value);
  };

  return (
    <div className="editor-container">
      <textarea
        value={source}
        onChange={handleChange}
        className="editor"
      />
      <div className="preview">
        {error ? (
          <div className="error">{error}</div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        )}
      </div>
    </div>
  );
}
```

---

## 테마 커스터마이징

### 기본 테마 사용

```typescript
import { getTheme, themes } from 'diagen';

// 이름으로 가져오기
const professional = getTheme('professional');
const modern = getTheme('modern');
const minimal = getTheme('minimal');

// 직접 가져오기
import { professionalTheme, modernTheme, minimalTheme } from 'diagen';
```

### 커스텀 테마 생성

```typescript
import { createTheme } from 'diagen';

const darkTheme = createTheme({
  colors: {
    background: '#1a1a2e',
    foreground: '#eee',
    primary: '#e94560',
    secondary: '#0f3460',
    accent: '#16213e',
    border: '#0f3460',
    text: '#eee',
    textLight: '#888',
  },
  typography: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    labelFontSize: 12,
  },
  node: {
    default: {
      fill: '#16213e',
      stroke: '#0f3460',
      strokeWidth: 1,
    },
    variants: {
      highlight: {
        fill: '#e94560',
        stroke: '#d63850',
      },
    },
  },
  edge: {
    default: {
      stroke: '#0f3460',
      strokeWidth: 1,
    },
  },
});

// 사용
const svg = await dslToSvg(source, { theme: darkTheme });
```

---

## 다음 단계

- [시작 가이드](./getting-started.md) - 빠른 시작
- [DSL 레퍼런스](./dsl-reference.md) - 전체 DSL 문법
- [예제 모음](./examples.md) - 다양한 예제
