# Diagen 시작 가이드

Diagen은 코드 기반의 다이어그램 생성 도구입니다. 간단한 DSL(Domain Specific Language)로 아키텍처 다이어그램, 플로우차트, 시스템 구조도 등을 만들 수 있습니다.

## 목차

1. [설치](#설치)
2. [첫 번째 다이어그램 만들기](#첫-번째-다이어그램-만들기)
3. [플레이그라운드 사용하기](#플레이그라운드-사용하기)
4. [프로젝트에서 사용하기](#프로젝트에서-사용하기)
5. [다음 단계](#다음-단계)

---

## 설치

### 요구사항

- Node.js 18 이상
- pnpm, npm, 또는 yarn

### 패키지 설치

```bash
# pnpm (권장)
pnpm add diagen

# npm
npm install diagen

# yarn
yarn add diagen
```

### 설치 확인

설치가 완료되면 다음 코드로 확인할 수 있습니다:

```typescript
import { dslToSvg } from 'diagen';

const svg = await dslToSvg('@diagram\nA -> B');
console.log(svg.slice(0, 100)); // SVG 시작 부분 출력
```

---

## 첫 번째 다이어그램 만들기

### 1단계: 가장 간단한 다이어그램

Diagen DSL은 `@diagram`으로 시작합니다. 가장 간단한 다이어그램은 두 노드와 하나의 연결선입니다:

```
@diagram
A -> B
```

이 코드는 다음과 같은 다이어그램을 생성합니다:

```
┌───┐     ┌───┐
│ A │ ──> │ B │
└───┘     └───┘
```

### 2단계: 노드에 라벨 추가하기

노드 ID 뒤에 콜론과 따옴표로 라벨을 지정합니다:

```
@diagram
client: "웹 클라이언트"
server: "API 서버"

client -> server
```

**결과:**
```
┌────────────┐     ┌──────────┐
│ 웹 클라이언트 │ ──> │ API 서버  │
└────────────┘     └──────────┘
```

### 3단계: 여러 노드 연결하기

화살표를 체인으로 연결할 수 있습니다:

```
@diagram
A: "시작"
B: "처리"
C: "저장"
D: "완료"

A -> B -> C -> D
```

**결과:**
```
┌────┐    ┌────┐    ┌────┐    ┌────┐
│시작 │ -> │처리 │ -> │저장 │ -> │완료 │
└────┘    └────┘    └────┘    └────┘
```

### 4단계: 도형 지정하기

대괄호 `[]` 안에 도형을 지정합니다:

```
@diagram
Start: "시작" [circle]
Process: "데이터 처리" [roundRect]
Decision: "성공?" [diamond]
DB: "데이터베이스" [cylinder]
End: "종료" [circle]

Start -> Process -> Decision
Decision -> DB: "예"
Decision -> End: "아니오"
DB -> End
```

**지원 도형:**

| 도형 | 설명 | 용도 |
|------|------|------|
| `rect` | 사각형 (기본값) | 일반 프로세스 |
| `roundRect` | 둥근 사각형 | 부드러운 프로세스 |
| `circle` | 원 | 시작/종료 지점 |
| `diamond` | 마름모 | 조건/분기점 |
| `cylinder` | 원통 | 데이터베이스 |
| `hexagon` | 육각형 | 준비/초기화 |
| `cloud` | 구름 | 외부 서비스 |
| `document` | 문서 | 리포트/문서 |
| `queue` | 큐 | 메시지 큐 |
| `person` | 사람 | 사용자/액터 |

### 5단계: 색상 추가하기

대괄호 안에 `fill` 속성으로 배경색을 지정합니다:

```
@diagram
Success: "성공" [roundRect, fill: #d4edda]
Warning: "경고" [roundRect, fill: #fff3cd]
Error: "오류" [roundRect, fill: #f8d7da]

Success -> Warning -> Error
```

### 6단계: 메타데이터 추가하기

제목과 방향 등의 메타데이터를 `---` 블록 안에 정의합니다:

```
@diagram
---
title: "사용자 인증 플로우"
---

User: "사용자" [person]
Login: "로그인 페이지" [document]
Auth: "인증 서버" [rect]
Token: "토큰 발급" [rect]
Home: "홈 화면" [document]

User -> Login -> Auth
Auth -> Token: "성공"
Token -> Home
```

### 7단계: 그룹으로 묶기

관련 노드들을 그룹으로 묶을 수 있습니다:

```
@diagram
---
title: "3계층 아키텍처"
---

Client: "클라이언트" [cloud]

group Backend [label: "백엔드"] {
  API: "API 서버"
  Worker: "Worker"
}

group Database [label: "데이터베이스"] {
  Primary: "Primary DB" [cylinder]
  Replica: "Replica DB" [cylinder]
}

Client -> Backend.API
Backend.API -> Backend.Worker
Backend.API -> Database.Primary
Database.Primary -> Database.Replica
```

---

## 플레이그라운드 사용하기

웹 기반 에디터로 실시간 미리보기가 가능합니다.

### 플레이그라운드 실행

```bash
# 저장소 클론
git clone https://github.com/your-repo/diagen.git
cd diagen

# 의존성 설치
pnpm install

# 플레이그라운드 실행
pnpm playground
```

### 브라우저에서 접속

브라우저에서 `http://localhost:3000` 을 열면 에디터가 표시됩니다.

### 플레이그라운드 기능

1. **실시간 미리보기**: 코드를 입력하면 300ms 후 자동으로 렌더링
2. **테마 선택**: Professional, Modern, Minimal 중 선택
3. **방향 선택**: 위→아래, 좌→우, 아래→위, 우→좌
4. **예제 버튼**: Flowchart, Architecture, Pipeline 등 예제 로드
5. **SVG 내보내기**: Export SVG 버튼으로 파일 다운로드
6. **패널 리사이즈**: 에디터와 미리보기 크기 조절 가능

### 에디터 단축키

| 키 | 동작 |
|----|------|
| `Tab` | 2칸 들여쓰기 |
| `Ctrl+A` | 전체 선택 |

---

## 프로젝트에서 사용하기

### 기본 사용법: dslToSvg()

DSL 문자열을 SVG로 변환합니다:

```typescript
import { dslToSvg } from 'diagen';
import { writeFileSync } from 'fs';

const diagram = `
@diagram
---
title: "간단한 시스템"
---
Client: "클라이언트"
Server: "서버"
DB: "DB" [cylinder]

Client -> Server -> DB
`;

// SVG 생성
const svg = await dslToSvg(diagram, {
  theme: 'professional',
  layout: { direction: 'LR' }
});

// 파일로 저장
writeFileSync('diagram.svg', svg);
console.log('diagram.svg 파일이 생성되었습니다.');
```

### 옵션 설명

```typescript
const svg = await dslToSvg(diagram, {
  // 테마 선택
  theme: 'professional',  // 'professional' | 'modern' | 'minimal'

  // 레이아웃 옵션
  layout: {
    direction: 'TB',      // 'TB' | 'BT' | 'LR' | 'RL'
    nodeSpacing: 50,      // 노드 간 간격 (기본: 50)
    rankSpacing: 80,      // 계층 간 간격 (기본: 80)
  },

  // SVG 옵션
  padding: 30,            // 여백 (기본: 30)
  backgroundColor: '#ffffff',  // 배경색
});
```

### Builder API 사용하기

체이닝 방식으로 더 직관적인 코드를 작성할 수 있습니다:

```typescript
import { Diagen } from 'diagen';

const svg = await Diagen
  .from(`
    @diagram
    A -> B -> C
  `)
  .theme('modern')
  .layout({ direction: 'LR' })
  .toSvg();

console.log(svg);
```

### 단계별 컴파일

파싱, 컴파일, 렌더링을 분리해서 사용할 수 있습니다:

```typescript
import { compileDsl, toSvg } from 'diagen';

// 1. DSL 컴파일
const { model, warnings } = await compileDsl(dslSource, {
  theme: 'professional',
  layout: { direction: 'TB' }
});

// 2. 경고 확인
if (warnings.length > 0) {
  console.warn('경고:', warnings);
}

// 3. 모델 정보 확인
console.log('노드 수:', model.nodes.length);
console.log('엣지 수:', model.edges.length);

// 4. SVG로 변환
const svg = await toSvg({ model, ir: {} as any, warnings });
```

### 프로그래밍 방식으로 다이어그램 생성

DSL 없이 JavaScript 객체로 다이어그램을 정의할 수 있습니다:

```typescript
import { createDiagram, toSvg } from 'diagen';

const diagram = await createDiagram({
  nodes: [
    { id: 'client', label: '클라이언트', shape: 'cloud' },
    { id: 'api', label: 'API 서버', shape: 'rect' },
    { id: 'db', label: '데이터베이스', shape: 'cylinder' }
  ],
  edges: [
    { source: 'client', target: 'api', label: 'HTTPS' },
    { source: 'api', target: 'db', label: 'SQL' }
  ]
}, {
  theme: 'professional',
  layout: { direction: 'LR' }
});

const svg = await toSvg(diagram);
```

### Express 서버에서 사용하기

```typescript
import express from 'express';
import { dslToSvg } from 'diagen';

const app = express();
app.use(express.json());

app.post('/api/diagram', async (req, res) => {
  try {
    const { dsl, theme = 'professional', direction = 'TB' } = req.body;

    const svg = await dslToSvg(dsl, {
      theme,
      layout: { direction }
    });

    res.type('image/svg+xml').send(svg);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
```

### React에서 사용하기

```tsx
import { useEffect, useState } from 'react';
import { dslToSvg } from 'diagen';

function DiagramViewer({ source }: { source: string }) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const result = await dslToSvg(source, {
          theme: 'professional'
        });
        if (!cancelled) {
          setSvg(result);
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Render failed');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [source]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

---

## 에러 처리

### 파싱 에러

DSL 문법이 잘못된 경우:

```typescript
import { parse } from 'diagen';

const result = parse('@diagram\nA ->\n'); // 불완전한 엣지

if (!result.success) {
  for (const error of result.errors) {
    console.error(`줄 ${error.line}: ${error.message}`);
  }
}
```

### 컴파일 에러

```typescript
import { dslToSvg } from 'diagen';

try {
  const svg = await dslToSvg(invalidDsl);
} catch (error) {
  console.error('컴파일 실패:', error.message);
}
```

### 일반적인 에러와 해결 방법

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `Expecting token of type --> Arrow <--` | 화살표 뒤에 노드 없음 | `A -> B` 형태로 완성 |
| `Duplicate node ID: X` | 같은 ID의 노드 중복 정의 | 고유한 ID 사용 |
| `Group not found: X` | 존재하지 않는 그룹 참조 | 그룹 이름 확인 |

---

## 다음 단계

더 자세한 내용은 다음 문서를 참조하세요:

- **[DSL 레퍼런스](./dsl-reference.md)**: 모든 DSL 문법 상세 설명
- **[API 레퍼런스](./api-reference.md)**: 모든 함수와 타입 상세 설명
- **[예제 모음](./examples.md)**: 다양한 다이어그램 예제

### 추가 리소스

- GitHub 이슈: 버그 리포트 및 기능 요청
- 플레이그라운드: `pnpm playground`로 실시간 테스트
