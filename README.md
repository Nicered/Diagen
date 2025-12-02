# Diagen

[![Deploy to GitHub Pages](https://github.com/nicered/diagen/actions/workflows/deploy.yml/badge.svg)](https://github.com/nicered/diagen/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🎮 **[Live Playground](https://nicered.github.io/diagen/)** - 온라인에서 바로 체험해보세요!

코드 기반의 다이어그램 생성 도구입니다. 간단한 DSL(Domain Specific Language)로 아키텍처 다이어그램, 플로우차트, 시스템 구조도 등을 만들 수 있습니다.

## 특징

- **간단한 DSL**: 직관적인 문법으로 다이어그램 정의
- **다양한 도형**: rect, circle, diamond, cylinder, cloud, hexagon 등 10가지 도형 지원
- **그룹핑**: 관련 노드들을 그룹으로 묶어 계층 구조 표현
- **스타일링**: 색상, 테두리, 대시 스타일 등 커스터마이징
- **자동 레이아웃**: ELK.js 기반 자동 배치
- **SVG 출력**: 고품질 벡터 그래픽으로 내보내기
- **테마 지원**: Professional, Modern, Minimal 테마 제공

## 설치

```bash
# pnpm (권장)
pnpm add diagen

# npm
npm install diagen

# yarn
yarn add diagen
```

## 빠른 시작

### 기본 사용법

```typescript
import { dslToSvg } from 'diagen';

const svg = await dslToSvg(`
@diagram
---
title: "간단한 시스템"
---

Client: "클라이언트" [cloud]
Server: "API 서버" [rect]
DB: "데이터베이스" [cylinder]

Client -> Server -> DB
`);

// SVG 문자열 출력
console.log(svg);
```

### DSL 문법

```
@diagram
---
title: "3계층 아키텍처"
---

// 노드 정의
Client: "웹 브라우저" [cloud]

// 그룹
group Backend [label: "백엔드"] {
  API: "API 서버" [rect]
  Worker: "Worker" [rect]
}

group Database [label: "데이터베이스"] {
  Primary: "Primary DB" [cylinder]
  Replica: "Replica DB" [cylinder]
}

// 연결
Client -> Backend.API
Backend.API -> Backend.Worker
Backend.API -> Database.Primary
Database.Primary -> Database.Replica
```

### 지원하는 도형

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

### 화살표 타입

| 문법 | 설명 |
|------|------|
| `->` | 실선 화살표 |
| `<->` | 실선 양방향 |
| `-->` | 점선 화살표 |
| `<-->` | 점선 양방향 |
| `==>` | 굵은 화살표 |
| `<=>` | 굵은 양방향 |

### 스타일링

```
@diagram
Success: "성공" [roundRect, fill: #d4edda, stroke: #28a745]
Warning: "경고" [roundRect, fill: #fff3cd, stroke: #ffc107]
Error: "오류" [roundRect, fill: #f8d7da, stroke: #dc3545]

Success -> Warning -> Error
```

## API

### dslToSvg()

DSL을 SVG로 변환합니다.

```typescript
const svg = await dslToSvg(source, {
  theme: 'professional',    // 'professional' | 'modern' | 'minimal'
  layout: {
    direction: 'TB',        // 'TB' | 'BT' | 'LR' | 'RL'
    nodeSpacing: 50,
    rankSpacing: 80,
  },
  padding: 30,
  backgroundColor: '#ffffff',
});
```

### Builder API

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
```

### compileDsl()

DSL을 컴파일하여 DiagramModel을 생성합니다.

```typescript
import { compileDsl, toSvg } from 'diagen';

const { model, warnings } = await compileDsl(source, options);

console.log('노드 수:', model.nodes.length);
console.log('엣지 수:', model.edges.length);

const svg = await toSvg({ model, ir, warnings });
```

### 프로그래밍 방식

```typescript
import { createDiagram, toSvg } from 'diagen';

const diagram = await createDiagram({
  nodes: [
    { id: 'client', label: '클라이언트', shape: 'cloud' },
    { id: 'api', label: 'API 서버', shape: 'rect' },
    { id: 'db', label: '데이터베이스', shape: 'cylinder' },
  ],
  edges: [
    { source: 'client', target: 'api', label: 'HTTPS' },
    { source: 'api', target: 'db', label: 'SQL' },
  ],
}, {
  theme: 'professional',
  layout: { direction: 'LR' },
});

const svg = await toSvg(diagram);
```

## 플레이그라운드

웹 기반 에디터로 실시간 미리보기가 가능합니다.

```bash
# 개발 서버 실행
pnpm playground

# 브라우저에서 접속
open http://localhost:3000
```

## 예제

### 회원가입 플로우

```
@diagram flowchart
---
title: "회원가입 플로우"
---

Start: "시작" [circle]
InputForm: "정보 입력" [roundRect]
Validate: "입력 검증" [diamond]
CreateAccount: "계정 생성" [rect]
SendEmail: "인증 메일 발송" [rect]
End: "완료" [circle]
ShowError: "오류 표시" [roundRect, fill: #f8d7da]

Start -> InputForm -> Validate
Validate -> CreateAccount: "유효"
Validate -> ShowError: "무효"
ShowError -> InputForm
CreateAccount -> SendEmail -> End
```

### 마이크로서비스 아키텍처

```
@diagram architecture
---
title: "마이크로서비스 아키텍처"
---

Gateway: "API Gateway" [hexagon]

group Services [label: "마이크로서비스"] {
  Auth: "인증 서비스" [rect]
  User: "사용자 서비스" [rect]
  Order: "주문 서비스" [rect]
}

group DataStores [label: "데이터 저장소"] {
  UserDB: "User DB" [cylinder]
  OrderDB: "Order DB" [cylinder]
  Cache: "Redis" [cylinder, fill: #DC382D]
}

Gateway -> (Services.Auth, Services.User, Services.Order)
Services.User -> DataStores.UserDB
Services.Order -> DataStores.OrderDB
Services.Auth -> DataStores.Cache
```

## 문서

자세한 문서는 `docs/` 폴더를 참조하세요:

- [시작 가이드](./docs/getting-started.md)
- [DSL 레퍼런스](./docs/dsl-reference.md)
- [API 레퍼런스](./docs/api-reference.md)
- [예제 모음](./docs/examples.md)

## 개발

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build

# 테스트
pnpm test

# 타입 체크
pnpm typecheck

# 플레이그라운드 실행
pnpm playground
```

## 라이선스

MIT License
