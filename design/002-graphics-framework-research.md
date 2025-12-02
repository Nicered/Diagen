# 다이어그램/인포그래픽 직접 구현을 위한 그래픽 프레임워크 조사

## 개요

다이어그램과 인포그래픽 생성기를 직접 구현하기 위해 필요한 저수준 그래픽 프레임워크와 레이아웃 알고리즘을 조사한 결과입니다.

> **Note**: TypeScript/프론트엔드 프레임워크가 디자인 품질과 생태계 측면에서 더 적합합니다. Python 섹션은 참고용으로 유지합니다.

---

## Part 1: TypeScript/JavaScript 프레임워크 (권장)

디자인 품질이 중요한 경우 프론트엔드 생태계가 훨씬 풍부합니다.

### 1. 캔버스/렌더링 라이브러리

#### 1.1 Konva.js

**특징**:
- HTML5 Canvas 기반, 씬 그래프 아키텍처
- 게임 엔진에서 영감받은 설계
- React (react-konva), Vue 바인딩 제공

**성능**: 8k 박스 벤치마크에서 23fps (Chrome)

**장점**:
- 뛰어난 인터랙션 (드래그 앤 드롭)
- Dirty region 감지로 최적화된 렌더링
- 여러 캔버스 레이어 지원

**용도**: 인터랙티브 다이어그램, CAD 스타일 앱

**링크**: [Konva.js](https://konvajs.org/)

---

#### 1.2 Fabric.js

**특징**:
- TypeScript로 작성됨
- 객체 지향 Canvas API
- SVG ↔ Canvas 상호 변환

**성능**: 8k 박스 벤치마크에서 9fps (Chrome)

**장점**:
- 텍스트 인라인 편집 기본 지원
- 풍부한 필터/이펙트
- 애니메이션 프레임워크 내장
- 성숙한 커뮤니티 (30k+ GitHub 스타)

**용도**: 이미지 에디터, 복잡한 그래픽 조작

**링크**: [Fabric.js](https://fabricjs.com/)

---

#### 1.3 Pixi.js

**특징**:
- WebGL 기반 (Canvas 폴백)
- 최고 성능의 2D 렌더링

**성능**: 8k 박스 벤치마크에서 60fps (Chrome)

**장점**:
- 게임 수준의 성능
- 픽셀 레벨 이펙트
- 대규모 그래픽 처리

**단점**:
- 인터랙션 기능이 제한적
- 학습 곡선 (WebGL 개념)

**용도**: 그래픽 집약적 앱, 애니메이션

**링크**: [Pixi.js](https://pixijs.com/)

---

#### 1.4 Two.js

**특징**:
- 렌더러 불가지론 (SVG, Canvas, WebGL)
- 동일 API로 여러 출력 지원
- 헤드리스 환경 지원

**TypeScript 지원**:
```typescript
import { Vector } from 'two.js/src/vector';
```

**장점**:
- 유연한 렌더링 타겟
- 60fps 애니메이션
- 비트맵 이미지 처리

**링크**: [Two.js](https://two.js.org/)

---

### 2. SVG 전용 라이브러리

#### 2.1 SVG.js

**특징**:
- 경량, 빠름
- TypeScript 타입 정의 내장
- 직관적인 API

**크기**: Snap.svg의 절반

**성능**: 벤치마크에서 Snap.svg보다 우수

**사용량**: 주간 598k 다운로드 (npm)

```typescript
import * as SVG from 'svg.js';
let draw = SVG(document.body).size('100%', '100%');
draw.rect(400, 400).fill({ color: '#f00', opacity: 1 });
```

**링크**: [SVG.js](https://svgjs.dev/)

---

#### 2.2 Snap.svg

**특징**:
- Raphaël 저자가 개발
- 기존 SVG 파일 조작에 강점
- Illustrator/Inkscape 파일과 연동

**장점**:
- 매트릭스 변환 기능
- 기존 SVG와 작업 용이

**단점**:
- 문서화 부족
- 다운로드 수 감소 추세 (주간 60k)

**링크**: [Snap.svg](http://snapsvg.io/)

---

### 3. 프로페셔널 다이어그램 라이브러리

#### 3.1 React Flow (xyflow) ⭐

**특징**:
- 노드 기반 UI 구축의 표준
- React/Svelte 버전 제공
- shadcn/ui, Tailwind CSS 통합

**커스터마이징**:
- CSS Variables (v12+)
- 커스텀 노드/엣지 컴포넌트
- 다크/라이트 모드 내장

**프로페셔널 기능**:
- Workflow Editor 템플릿
- Turbo Flow 테마 (깔끔한 스타일)
- 줌/팬, 미니맵

```typescript
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
```

**링크**: [React Flow](https://reactflow.dev/) | [Theming Guide](https://reactflow.dev/learn/customization/theming)

---

#### 3.2 yFiles (엔터프라이즈급)

**특징**:
- 25년 이상의 그래프 드로잉 전문성
- 5개 플랫폼 지원 (HTML, JavaFX, Java, WinForms, WPF)
- NASA, 대형 기업에서 사용

**자동 레이아웃**:
- Hierarchical (워크플로우, 의존성)
- Organic (네트워크, 소셜 그래프)
- Orthogonal (회로도, ERD)
- Tree, Radial, Circular 등

**고급 기능**:
- 그룹핑/폴딩 (Collapse/Expand)
- Swimlanes
- Edge Bridges (교차선 처리)
- BPMN-DI 완벽 지원

**스타일링**:
- 노드/엣지/라벨/포트 커스텀 시각화
- 화살표 스타일, 대시, 곡선
- 그라디언트, 섀도우

**라이선스**: 상용 (엔터프라이즈)

**링크**: [yFiles](https://www.yfiles.com/) | [Features](https://www.yfiles.com/the-yfiles-sdk/features)

---

#### 3.3 D3.js

**특징**:
- 데이터 시각화의 업계 표준
- NYT, Airbnb, MTV 사용
- 무제한 커스터마이징

**내장 기능**:
- 레이아웃: treemap, force-directed, Voronoi, chord
- 프리미티브: arcs, curves, lines, pies, symbols
- 인터랙션: pan, zoom, brush, drag

**장점**:
- 완전한 제어권
- SVG/Canvas 모두 지원
- 풍부한 예제 (D3 Graph Gallery)

**단점**:
- 학습 곡선이 가파름
- 간단한 차트에는 과함

**링크**: [D3.js](https://d3js.org/) | [Graph Gallery](https://d3-graph-gallery.com/)

---

### 4. 다이어그램 전용 라이브러리

#### 4.1 JointJS / JointJS+

**특징**:
- 2010년부터 발전한 성숙한 라이브러리
- 모듈식 플러그인 아키텍처
- SVG와 HTML5 지원

**프레임워크 통합**: React, Vue, Angular, Svelte

**기본 제공**:
- 드래그 앤 드롭
- 줌/팬
- ERD, Org chart, FSA, UML, PN, DEVS 요소

**라이선스**:
- JointJS: 오픈소스 (MPL 2.0)
- JointJS+: 상용

**링크**: [JointJS](https://www.jointjs.com/)

---

#### 4.2 GoJS

**특징**:
- 200+ 샘플 앱 제공
- 엔터프라이즈급 (NASA, 대형 은행 사용)
- TypeScript 지원

**다이어그램 유형**:
- 플로우차트, 조직도, 마인드맵
- UML, BPMN, 네트워크 다이어그램
- 커스텀 레이아웃

**링크**: [GoJS](https://gojs.net/)

---

### 5. 디자인 시스템/스타일링

#### 5.1 SVG 스타일링 기법

**그라디언트**:
```svg
<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" style="stop-color:#4A90D9" />
  <stop offset="100%" style="stop-color:#357ABD" />
</linearGradient>
<rect fill="url(#grad1)" />
```

**섀도우 (필터)**:
```svg
<filter id="shadow">
  <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
</filter>
<rect filter="url(#shadow)" />
```

**둥근 모서리**:
```svg
<rect rx="8" ry="8" />
```

---

#### 5.2 아이콘/에셋 리소스

| 리소스 | 특징 | 링크 |
|--------|------|------|
| **Icons8 Gradient** | 그라디언트 아이콘 | [icons8.com](https://icons8.com/icons/nolan) |
| **Flaticon Gradient** | 모던 그라디언트 스타일 | [flaticon.com](https://www.flaticon.com/gradient-icons) |
| **Untitled UI** | 차트/그래프 아이콘 | [untitledui.com](https://www.untitledui.com/free-icons/charts) |
| **Gradientify** | 400+ 무료 SVG 아이콘 | [iconshock.com](https://www.iconshock.com/svg-icons/) |

---

### 6. 비교표 (프로페셔널 품질 기준)

| 라이브러리 | 렌더링 | 프로 품질 | 레이아웃 | 라이선스 |
|-----------|--------|----------|---------|---------|
| **React Flow** | SVG | ⭐⭐⭐⭐⭐ | Dagre/ELK | MIT |
| **yFiles** | SVG/Canvas | ⭐⭐⭐⭐⭐ | 내장 (최고) | 상용 |
| **JointJS+** | SVG | ⭐⭐⭐⭐⭐ | 내장 | 상용 |
| **GoJS** | Canvas | ⭐⭐⭐⭐⭐ | 내장 | 상용 |
| **D3.js** | SVG/Canvas | ⭐⭐⭐⭐⭐ | 내장 | BSD |
| **Konva** | Canvas | ⭐⭐⭐⭐ | 외부 필요 | MIT |
| **SVG.js** | SVG | ⭐⭐⭐⭐ | 외부 필요 | MIT |
| **Two.js** | 다중 | ⭐⭐⭐⭐ | 외부 필요 | MIT |

---

### 7. TypeScript 추천 조합

**제안서/발표자료 품질 다이어그램 (프로페셔널)**:

#### 옵션 1: React Flow + 커스텀 스타일
- React 앱 통합
- shadcn/ui, Tailwind CSS
- 자동 레이아웃 (Dagre/ELK)
- **무료**, MIT 라이선스

#### 옵션 2: SVG.js + D3 레이아웃
- 저수준 SVG 제어
- D3의 레이아웃 알고리즘 활용
- 그라디언트, 섀도우 완전 제어
- **무료**

#### 옵션 3: JointJS + 커스텀 테마
- 다이어그램 전용 라이브러리
- 풍부한 내장 셰이프
- 프레임워크 독립적
- 오픈소스 버전 **무료**

**레이아웃 엔진**:
- **Dagre** - 계층적 레이아웃, Mermaid가 사용
- **ELK.js** - 다양한 알고리즘, 학술 연구 기반
- **D3-hierarchy** - 트리 레이아웃

---

## Part 2: Python 프레임워크 (참고)

---

## 1. 렌더링 레이어 (그래픽 프리미티브)

직접 구현 시 선택해야 할 **렌더링 백엔드** 옵션들입니다.

### 1.1 Python SVG 라이브러리

#### svgwrite

**특징**:
- 순수 Python, 외부 의존성 없음
- SVG 1.1 Full 지원
- 모든 SVG 프리미티브 지원

**프리미티브**:
- `line`, `rect`, `circle`, `ellipse`, `polyline`, `polygon`, `path`
- 그룹핑, 변환, 클리핑, 마스크, 필터 효과
- 그라디언트, 패턴

**예시**:
```python
import svgwrite

dwg = svgwrite.Drawing('diagram.svg', size=('800px', '600px'))
dwg.add(dwg.rect(insert=(10, 10), size=(100, 50), fill='blue', rx=5, ry=5))
dwg.add(dwg.line((60, 60), (200, 100), stroke='black', stroke_width=2))
dwg.add(dwg.text('Node A', insert=(20, 40), fill='white'))
dwg.save()
```

**상태**: ⚠️ UNMAINTAINED (버그 수정만)

**링크**: [svgwrite 문서](https://svgwrite.readthedocs.io/) | [GitHub](https://github.com/mozman/svgwrite)

---

#### drawsvg

**특징**:
- Python 3, SVG 및 애니메이션 생성
- PNG, MP4 렌더링 가능
- Jupyter 노트북 지원
- 활발히 유지보수됨

**확장성**: 커스텀 SVG 요소를 `DrawableBasicElement` 서브클래스로 추가 가능

**링크**: [PyPI](https://pypi.org/project/drawsvg/)

---

#### svg.py

**특징**:
- 타입 안전 (Type hints)
- SVG 표준 1.1, 1.2, 2.0, Tiny 완벽 지원
- 순수 Python, 런타임 의존성 없음

**링크**: [GitHub](https://github.com/orsinium-labs/svg.py)

---

### 1.2 Cairo (2D 벡터 그래픽 라이브러리)

**특징**:
- C 라이브러리, Python 바인딩 제공
- 다양한 출력: SVG, PDF, PNG, PostScript, X Window
- 수학적 정밀도의 벡터 그래픽

**Python 바인딩**:
| 라이브러리 | 특징 |
|-----------|------|
| `pycairo` | 공식 바인딩 |
| `cairocffi` | CFFI 기반, PyPy 호환 |

**프리미티브**:
- `move_to`, `line_to`, `curve_to` (베지어 곡선)
- `rectangle`, `arc`
- `fill`, `stroke`, `clip`
- 변환 매트릭스, 알파 블렌딩

**장점**:
- 단일 코드로 SVG/PDF/PNG 동시 출력
- 고품질 안티앨리어싱
- 복잡한 경로 연산

**예시**:
```python
import cairo

surface = cairo.SVGSurface("diagram.svg", 800, 600)
ctx = cairo.Context(surface)

# 박스 그리기
ctx.rectangle(10, 10, 100, 50)
ctx.set_source_rgb(0, 0, 1)
ctx.fill()

# 선 그리기
ctx.move_to(60, 60)
ctx.line_to(200, 100)
ctx.set_source_rgb(0, 0, 0)
ctx.set_line_width(2)
ctx.stroke()

surface.finish()
```

**링크**: [Cairo](https://www.cairographics.org/) | [PyCairo 튜토리얼](https://zetcode.com/gfx/pycairo/)

---

### 1.3 Skia (고성능 2D 그래픽)

**특징**:
- Google 개발, Chrome/Android/Flutter에서 사용
- 하드웨어 가속 지원
- 고성능 렌더링

**Python 바인딩**: `skia-python`

**용도**: 성능이 중요한 실시간 렌더링

**링크**: [Skia](https://skia.org/) | [skia-python](https://github.com/kyamagu/skia-python)

---

## 2. 레이아웃 엔진 (노드 배치 알고리즘)

다이어그램에서 노드와 엣지를 자동으로 배치하는 알고리즘/라이브러리입니다.

### 2.1 Dagre (JavaScript)

**특징**:
- 방향 그래프 레이아웃 전문
- 클라이언트 사이드 계산
- MIT 라이선스

**알고리즘**: Sugiyama 계층적 레이아웃 기반
- 논문: "A Technique for Drawing Directed Graphs" (Gansner et al.)
- 네트워크 심플렉스 알고리즘으로 랭킹

**출력**:
- 노드: `(x, y)` 중심 좌표
- 엣지: 컨트롤 포인트 배열 `[{x, y}, ...]`

**연동**:
- React Flow, Cytoscape.js, JointJS 등에서 사용
- D3.js와 함께 사용 (`dagre-d3`)

**설치**: `npm i dagre`

**링크**: [GitHub](https://github.com/dagrejs/dagre)

---

### 2.2 ELK (Eclipse Layout Kernel)

**특징**:
- 다양한 레이아웃 알고리즘 컬렉션
- Java 기반, JavaScript 포트 (elkjs) 제공
- 학술 연구팀이 유지보수

**JavaScript 사용** (elkjs):
```javascript
const ELK = require('elkjs');
const elk = new ELK();

const graph = {
  id: "root",
  children: [
    { id: "n1", width: 100, height: 50 },
    { id: "n2", width: 100, height: 50 }
  ],
  edges: [
    { id: "e1", sources: ["n1"], targets: ["n2"] }
  ]
};

elk.layout(graph).then(console.log);
```

**특징**:
- Promise 기반 API
- Web Worker 지원
- 렌더링 없음 (좌표만 계산)

**링크**: [ELK](https://eclipse.dev/elk/) | [elkjs](https://github.com/kieler/elkjs)

---

### 2.3 Python 레이아웃 라이브러리

#### Grandalf

**특징**:
- 순수 Python
- Sugiyama 계층적 레이아웃
- Force-directed 레이아웃

**제약**: DAG(방향성 비순환 그래프)에서만 Sugiyama 작동

**링크**: [PyPI](https://pypi.org/project/grandalf/) | [GitHub](https://github.com/bdcht/grandalf)

---

#### igraph

**특징**:
- 대규모 그래프 처리
- 다양한 레이아웃 알고리즘 내장

**레이아웃 알고리즘**:
- Fruchterman-Reingold (spring-electric)
- Kamada-Kawai (spring)
- Davidson-Harel (simulated annealing)
- DrL (대규모 그래프용)
- Sugiyama (계층적)

**자동 선택**: `layout_auto()` - 그래프 특성에 따라 자동 선택

**링크**: [igraph Python](https://igraph.org/python/)

---

#### NetworkX + Graphviz

**특징**:
- NetworkX로 그래프 구조 정의
- Graphviz로 레이아웃 계산

**Graphviz 레이아웃**:
| 알고리즘 | 용도 |
|---------|------|
| `dot` | 계층적, 방향 그래프 |
| `neato` | Spring 모델, 중소규모 |
| `fdp` | Force-directed |
| `sfdp` | 대규모 그래프용 |
| `twopi` | 방사형 |
| `circo` | 원형 |

**링크**: [NetworkX](https://networkx.org/) | [Graphviz](https://graphviz.org/)

---

## 3. 아키텍처 제안

### 3.1 계층 구조

```
┌─────────────────────────────────────────┐
│           사용자 인터페이스               │
│  (CLI / API / 웹 인터페이스)             │
├─────────────────────────────────────────┤
│           다이어그램 DSL                 │
│  (Python API 또는 텍스트 문법)           │
├─────────────────────────────────────────┤
│           레이아웃 엔진                   │
│  (Grandalf / igraph / Graphviz)         │
├─────────────────────────────────────────┤
│           렌더링 엔진                     │
│  (svgwrite / drawsvg / Cairo)           │
├─────────────────────────────────────────┤
│           출력 포맷                       │
│  (SVG / PDF / PNG)                       │
└─────────────────────────────────────────┘
```

### 3.2 핵심 컴포넌트

1. **Shape 프리미티브**: Box, Circle, Diamond, Arrow, Text 등
2. **Connector 시스템**: 직선, 곡선, 직교선 연결
3. **레이아웃 매니저**: 자동 배치 또는 수동 좌표
4. **스타일 시스템**: 색상, 폰트, 선 스타일 등
5. **렌더러**: SVG/PDF/PNG 출력

### 3.3 추천 조합

| 용도 | 레이아웃 | 렌더링 | 이유 |
|------|---------|--------|------|
| 범용 다이어그램 | Grandalf | drawsvg | 순수 Python, 활발한 유지보수 |
| 고품질 출력 | Graphviz | Cairo | PDF 지원, 전문적 품질 |
| 대규모 그래프 | igraph | Cairo | 성능, 다양한 알고리즘 |
| 웹 통합 | ELK (JS) | SVG 직접 | 브라우저 호환 |

---

## 4. 직접 구현 시 고려사항

### 4.1 필수 구현 요소

1. **노드 (Node)**
   - 위치 (x, y)
   - 크기 (width, height)
   - 셰이프 (rect, circle, diamond 등)
   - 스타일 (fill, stroke, text)

2. **엣지 (Edge)**
   - 시작점, 끝점
   - 연결 유형 (직선, 곡선, 직교)
   - 화살표 마커
   - 라벨

3. **레이아웃**
   - 계층적 (위→아래, 좌→우)
   - Force-directed
   - 수동 좌표

### 4.2 선택적 고급 기능

- 그룹핑/컨테이너
- 중첩 다이어그램
- 애니메이션
- 인터랙션 (웹용)

---

## 5. 결론 및 추천

### Python으로 직접 구현 시

**1순위: drawsvg + Grandalf**
- 순수 Python
- 활발한 유지보수
- 빠른 프로토타이핑

**2순위: Cairo + Graphviz**
- 최고 품질 출력
- SVG/PDF/PNG 동시 지원
- 검증된 레이아웃 알고리즘

### 빠른 시작

```python
# 최소 구현 예시 (drawsvg 기반)
import drawsvg as draw

d = draw.Drawing(800, 600)

# 노드
d.append(draw.Rectangle(50, 50, 120, 60, fill='#4A90D9', rx=8, ry=8))
d.append(draw.Text('Service A', 16, 110, 85, fill='white', text_anchor='middle'))

d.append(draw.Rectangle(250, 50, 120, 60, fill='#50C878', rx=8, ry=8))
d.append(draw.Text('Service B', 16, 310, 85, fill='white', text_anchor='middle'))

# 화살표
d.append(draw.Line(170, 80, 250, 80, stroke='black', stroke_width=2,
                   marker_end=draw.Marker(-0.8, -0.5, 0.2, 0.5, scale=10, orient='auto').append(
                       draw.Lines(-0.8, -0.5, -0.8, 0.5, 0, 0, fill='black', close=True))))

d.save_svg('diagram.svg')
```

---

## 참고 자료

### 렌더링
- [svgwrite 문서](https://svgwrite.readthedocs.io/)
- [drawsvg PyPI](https://pypi.org/project/drawsvg/)
- [PyCairo 튜토리얼](https://zetcode.com/gfx/pycairo/)
- [Cairo 공식](https://www.cairographics.org/)

### 레이아웃
- [Dagre GitHub](https://github.com/dagrejs/dagre)
- [ELK](https://eclipse.dev/elk/)
- [Grandalf PyPI](https://pypi.org/project/grandalf/)
- [igraph Python](https://igraph.org/python/)

### 알고리즘 참고
- "A Technique for Drawing Directed Graphs" (Gansner et al.) - Sugiyama 알고리즘 기반
