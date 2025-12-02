# 다이어그램 생성 라이브러리 및 도구 조사

## 개요

코드 기반 다이어그램, 아키텍처 다이어그램, UML 생성을 위한 라이브러리와 도구들을 조사한 결과입니다.

---

## 1. Diagram-as-Code 도구

### 1.1 Mermaid

**특징**:
- JavaScript 기반, Markdown과 유사한 간단한 문법
- GitHub 마크다운에서 네이티브 렌더링 지원
- 플로우차트, 시퀀스 다이어그램, 간트 차트, 클래스 다이어그램 등 지원

**장점**:
- 학습 곡선이 낮음
- GitHub 통합으로 문서화에 최적
- 빠른 프로토타이핑 가능

**단점**:
- 세부 커스터마이징 제한적
- GitGraph 외 일부 다이어그램 유형 미지원
- C4 모델 지원이 실험적 단계

**링크**: [Mermaid.js](https://mermaid.js.org/)

---

### 1.2 PlantUML

**특징**:
- Java 기반의 오래된 도구, 안정적
- 광범위한 UML 다이어그램 유형 지원
- 텍스트 기반으로 버전 관리 용이

**장점**:
- 가장 포괄적인 UML 지원
- 고급 커스터마이징 가능
- JSON 데이터, MindMap 지원
- C4 모델 완벽 지원

**단점**:
- 학습 곡선이 가파름
- Java 런타임 필요
- Mermaid보다 문법이 복잡

**링크**: [PlantUML](https://plantuml.com/)

---

### 1.3 D2 (D2lang)

**특징**:
- 모던한 다이어그램 스크립팅 언어
- 여러 레이아웃 엔진 지원 (Dagre, ELK, TALA)
- 커스텀 요소와 셰이프 생성 가능

**레이아웃 엔진**:
| 엔진 | 특징 | 비용 |
|------|------|------|
| Dagre | 기본값, Mermaid와 동일, 빠름 | 무료 |
| ELK | 더 성숙하고 유지보수 활발 | 무료 |
| TALA | 소프트웨어 아키텍처 전용 설계 | 유료 |

**장점**:
- 기본 레이아웃이 다른 도구보다 우수
- 유연한 스타일링
- 오픈소스 (MIT 라이선스)

**단점**:
- 예쁜 다이어그램을 위해 수동 스타일링 필요
- Mermaid보다 복잡

**링크**: [D2lang](https://d2lang.com/) | [GitHub](https://github.com/terrastruct/d2)

---

### 1.4 Structurizr

**특징**:
- C4 모델 창시자가 개발
- 하나의 모델에서 여러 뷰 생성 (DRY 원칙)
- DSL(Domain Specific Language) 제공

**장점**:
- C4 모델에 최적화
- AWS, Azure, GCP, Kubernetes 테마 지원
- ADR(Architecture Decision Records) 지원
- Thoughtworks Technology Radar 선정 (2024년 4월)

**단점**:
- C4 모델에 특화되어 범용성이 낮음
- 유료 버전 존재

**링크**: [Structurizr](https://www.structurizr.com/)

---

### 1.5 Kroki

**특징**:
- 통합 API로 여러 다이어그램 도구 지원
- 지원 도구: Mermaid, PlantUML, D2, GraphViz, Excalidraw, C4, DBML, Erd 등 20개 이상

**장점**:
- 단일 API로 다양한 도구 활용
- 자체 호스팅 가능
- 일관된 인터페이스

**링크**: [Kroki](https://kroki.io/)

---

## 2. Python 라이브러리

### 2.1 Diagrams (mingrammer/diagrams)

**특징**:
- Python 코드로 클라우드 아키텍처 다이어그램 생성
- AWS, Azure, GCP, Kubernetes, Alibaba Cloud, Oracle Cloud 지원

**장점**:
- 프로그래매틱 생성
- 클라우드 아이콘 내장
- 파이프라인 통합 용이

**단점**:
- 클라우드 아키텍처에 특화
- Graphviz 바이너리 설치 필요

**링크**: [GitHub](https://github.com/mingrammer/diagrams)

---

### 2.2 Graphviz (Python)

**특징**:
- DOT 언어 기반 그래프 시각화
- 정적이고 결정론적인 레이아웃

**라이브러리 옵션**:
| 라이브러리 | 특징 |
|-----------|------|
| `graphviz` | 순수 Python, 간단한 인터페이스 |
| `PyGraphviz` | NetworkX 호환, C/C++ 컴파일러 필요 |

**장점**:
- 계층 구조, 워크플로우, 의존성 트리에 최적
- 고품질 출력 (SVG, PNG, PDF)

**단점**:
- 인터랙티브하지 않음
- 복잡한 비구조화 네트워크에는 부적합

**링크**: [Graphviz](https://graphviz.org/) | [PyPI](https://pypi.org/project/graphviz/)

---

### 2.3 SVG 생성 라이브러리

| 라이브러리 | 특징 | 링크 |
|-----------|------|------|
| **drawsvg** | SVG/애니메이션 생성, Jupyter 지원 | [PyPI](https://pypi.org/project/drawsvg/) |
| **svg.py** | 타입 안전, 순수 Python, SVG 표준 완벽 지원 | [GitHub](https://github.com/orsinium-labs/svg.py) |
| **Pygal** | 벡터 기반 차트, 인포그래픽에 적합 | [pygal.org](http://www.pygal.org/) |

---

### 2.4 LIDA

**특징**:
- LLM 기반 데이터 시각화 및 인포그래픽 생성
- 여러 시각화 라이브러리 지원 (matplotlib, seaborn, altair, d3)
- 여러 LLM 프로바이더 지원 (OpenAI, Azure, PaLM, Cohere, Huggingface)

**링크**: [PyPI](https://pypi.org/project/lida/)

---

## 3. UML 전용 도구

| 도구 | 특징 | 라이선스 |
|------|------|----------|
| **UMLet** | 빠른 UML 그리기, 텍스트에서 다이어그램 생성 | 오픈소스 |
| **StarUML** | 대부분의 UML 2 다이어그램 지원, 코드 생성 | 상용 |
| **GitUML** | 코드에서 UML 역공학 (Python, JS, Java, C#) | 무료 |
| **Modelio** | UML2, BPMN, ArchiMate 지원 | 오픈소스 |

---

## 4. 인터랙티브/화이트보드 도구

### 4.1 Excalidraw

**특징**:
- 손그림 스타일의 다이어그램
- 프로그래매틱 API 지원 (베타)
- Mermaid → Excalidraw 변환 라이브러리 존재

**API 기능**:
- `convertToExcalidrawElements`로 요소 생성
- MCP 서버를 통한 LLM 통합 가능

**링크**: [Excalidraw](https://excalidraw.com/) | [GitHub](https://github.com/excalidraw/excalidraw)

---

## 5. 비교 요약

### 용도별 추천

| 용도 | 추천 도구 |
|------|----------|
| 빠른 문서화 | Mermaid |
| 상세 UML | PlantUML |
| 클라우드 아키텍처 | Diagrams (Python) |
| C4 모델 | Structurizr |
| 모던 다이어그램 | D2 |
| 통합 API | Kroki |
| 인포그래픽 | Pygal, drawsvg, LIDA |
| 손그림 스타일 | Excalidraw |

### LLM 통합 관점

> "Diagrams as code have become even better with the rise of AI assistants. Commonly used LLMs like GPT-4o, Claude and Gemini are familiar with text-based diagram syntax."

대부분의 LLM이 Mermaid, PlantUML, D2 문법에 익숙하므로, 텍스트 기반 도구가 AI 활용에 유리합니다.

---

## 6. 프로젝트 적용 제안

### 우선 고려 도구

1. **Mermaid** - GitHub 통합, LLM 친화적, 빠른 프로토타이핑
2. **D2** - 더 나은 레이아웃, 모던한 문법
3. **Diagrams (Python)** - 클라우드 아키텍처 다이어그램
4. **Kroki** - 여러 도구 통합 API

### 인포그래픽용

1. **drawsvg** / **svg.py** - 커스텀 SVG 생성
2. **Pygal** - 벡터 차트
3. **LIDA** - LLM 기반 자동 생성

---

## 참고 자료

- [Top 6 Mermaid.js alternatives - Swimm](https://swimm.io/learn/mermaid-js/top-6-mermaid-js-alternatives)
- [Mermaid vs. PlantUML - Gleek.io](https://www.gleek.io/blog/mermaid-vs-plantuml)
- [Diagram as Code Tools in 2025 - Vinr Academy](https://vinr.academy/blog/diagram-as-code-tools-in-2025-a-comprehensive-comparison)
- [D2 Layout Engines](https://d2lang.com/tour/layouts/)
- [Structurizr](https://www.structurizr.com/)
- [Kroki](https://kroki.io/)
- [Excalidraw Developer Docs](https://docs.excalidraw.com/)
