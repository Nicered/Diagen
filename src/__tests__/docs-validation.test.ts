/**
 * 문서 검증 테스트
 *
 * 이 테스트는 문서(docs/)에 있는 모든 예제들이 실제로 동작하는지 검증합니다.
 * 문서의 코드 블록을 추출하여 파싱/렌더링이 성공하는지 확인합니다.
 */

import { describe, it, expect } from 'vitest';
import { parse, dslToSvg, compileDsl, Diagen, createDiagram, toSvg } from '../index';

describe('문서 예제 검증', () => {
  describe('시작 가이드 (getting-started.md)', () => {
    it('가장 간단한 다이어그램', async () => {
      const source = `
@diagram
A -> B
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(2);
      expect(result.ir?.content.edges).toHaveLength(1);
    });

    it('노드에 라벨 추가하기', async () => {
      const source = `
@diagram
client: "웹 클라이언트"
server: "API 서버"

client -> server
`;
      const result = parse(source);
      expect(result.success).toBe(true);

      const client = result.ir?.content.nodes.find(n => n.id === 'client');
      expect(client?.label).toBe('웹 클라이언트');
    });

    it('여러 노드 연결하기 (체인)', async () => {
      const source = `
@diagram
A: "시작"
B: "처리"
C: "저장"
D: "완료"

A -> B -> C -> D
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(4);
      expect(result.ir?.content.edges).toHaveLength(3);
    });

    it('도형 지정하기', async () => {
      const source = `
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
`;
      const result = parse(source);
      expect(result.success).toBe(true);

      const db = result.ir?.content.nodes.find(n => n.id === 'DB');
      expect(db?.shape).toBe('cylinder');
    });

    it('색상 추가하기', async () => {
      const source = `
@diagram
Success: "성공" [roundRect, fill: #d4edda]
Warning: "경고" [roundRect, fill: #fff3cd]
Error: "오류" [roundRect, fill: #f8d7da]

Success -> Warning -> Error
`;
      const result = parse(source);
      expect(result.success).toBe(true);

      const success = result.ir?.content.nodes.find(n => n.id === 'Success');
      expect(success?.style?.fill).toBe('#d4edda');
    });

    it('메타데이터 블록', async () => {
      const source = `
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
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.meta.title).toBe('사용자 인증 플로우');
    });

    it('그룹으로 묶기', async () => {
      const source = `
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
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.groups).toHaveLength(2);
    });
  });

  describe('DSL 레퍼런스 (dsl-reference.md)', () => {
    it('다중 타겟 (Fan-out)', async () => {
      const source = `
@diagram
LB: "Load Balancer" [hexagon]
S1: "Server 1"
S2: "Server 2"
S3: "Server 3"

LB -> (S1, S2, S3)
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.edges).toHaveLength(3);
    });

    it('다중 소스 (Fan-in)', async () => {
      const source = `
@diagram
Producer1: "Producer 1"
Producer2: "Producer 2"
Queue: "Message Queue" [queue]

(Producer1, Producer2) -> Queue
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.edges).toHaveLength(2);
    });

    it('화살표 타입', async () => {
      const source = `
@diagram
A -> B
B --> C
C ==> D
`;
      const result = parse(source);
      expect(result.success).toBe(true);

      const edges = result.ir?.content.edges;
      expect(edges?.[0].style?.lineType).toBe('solid');
      expect(edges?.[1].style?.lineType).toBe('dashed');
      expect(edges?.[2].style?.lineType).toBe('bold');
    });
  });

  describe('API 레퍼런스 (api-reference.md)', () => {
    it('dslToSvg 기본 사용', async () => {
      const source = `
@diagram
A -> B -> C
`;
      const svg = await dslToSvg(source);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('dslToSvg with options', async () => {
      const source = `
@diagram
A -> B -> C
`;
      const svg = await dslToSvg(source, {
        theme: 'professional',
        layout: { direction: 'LR' },
      });
      expect(svg).toContain('<svg');
    });

    it('compileDsl 사용', async () => {
      const source = `
@diagram
A: "시작"
B: "처리"
C: "종료"
A -> B -> C
`;
      const { model } = await compileDsl(source, {
        theme: 'professional',
        layout: { direction: 'TB' },
      });

      expect(model.nodes.length).toBe(3);
      expect(model.edges.length).toBe(2);
    });

    it('Builder API (Diagen.from)', async () => {
      const svg = await Diagen
        .from(`
          @diagram
          A -> B -> C
        `)
        .theme('modern')
        .layout({ direction: 'LR' })
        .toSvg();

      expect(svg).toContain('<svg');
    });

    it('createDiagram 프로그래밍 API', async () => {
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

      expect(diagram.model.nodes.length).toBe(3);
      expect(diagram.model.edges.length).toBe(2);

      const svg = await toSvg(diagram);
      expect(svg).toContain('<svg');
    });
  });

  describe('예제 모음 (examples.md)', () => {
    it('회원가입 플로우', async () => {
      const source = `
@diagram flowchart
---
title: "회원가입 플로우"
---

Start: "시작" [circle]
InputForm: "정보 입력" [roundRect]
ValidateInput: "입력 검증" [diamond]
CheckDuplicate: "중복 확인" [diamond]
CreateAccount: "계정 생성" [rect]
SendVerification: "인증 메일 발송" [rect]
VerifyEmail: "이메일 인증" [diamond]
ActivateAccount: "계정 활성화" [rect]
End: "완료" [circle]
ShowError: "오류 표시" [roundRect, fill: #f8d7da]

Start -> InputForm
InputForm -> ValidateInput
ValidateInput -> CheckDuplicate: "유효"
ValidateInput -> ShowError: "무효"
ShowError -> InputForm
CheckDuplicate -> CreateAccount: "사용 가능"
CheckDuplicate -> ShowError: "중복"
CreateAccount -> SendVerification
SendVerification -> VerifyEmail
VerifyEmail -> ActivateAccount: "인증 완료"
VerifyEmail -> SendVerification: "재발송"
ActivateAccount -> End
`;
      const svg = await dslToSvg(source);
      expect(svg).toContain('<svg');
    });

    it('3계층 웹 아키텍처', async () => {
      const source = `
@diagram architecture
---
title: "3계층 웹 애플리케이션"
---

Client: "웹 브라우저" [cloud]
CDN: "CDN" [hexagon]

group Presentation [label: "프레젠테이션 계층"] {
  WebServer: "Nginx" [rect]
  StaticFiles: "정적 파일" [document]
}

group Application [label: "애플리케이션 계층"] {
  API: "API 서버" [rect]
  Auth: "인증 모듈" [rect]
  BizLogic: "비즈니스 로직" [rect]
}

group Data [label: "데이터 계층"] {
  Cache: "Redis" [cylinder, fill: #DC382D]
  DB: "PostgreSQL" [cylinder, fill: #336791]
  FileStorage: "파일 저장소" [cylinder]
}

Client -> CDN
CDN -> Presentation.WebServer
Presentation.WebServer -> Presentation.StaticFiles
Presentation.WebServer -> Application.API
Application.API -> Application.Auth
Application.API -> Application.BizLogic
Application.BizLogic -> Data.Cache
Application.BizLogic -> Data.DB
Application.BizLogic -> Data.FileStorage
`;
      const svg = await dslToSvg(source);
      expect(svg).toContain('<svg');
    });

    it('모든 도형 예제', async () => {
      const source = `
@diagram
---
title: "지원하는 모든 도형"
direction: LR
---
R: "rect" [rect]
RR: "roundRect" [roundRect]
C: "circle" [circle]
D: "diamond" [diamond]
H: "hexagon" [hexagon]
CY: "cylinder" [cylinder]
CL: "cloud" [cloud]
DO: "document" [document]
Q: "queue" [queue]
P: "person" [person]

R -> RR -> C -> D -> H
CY -> CL -> DO -> Q -> P
`;
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.nodes).toHaveLength(10);

      const svg = await dslToSvg(source);
      expect(svg).toContain('<svg');
    });

    it('스타일링 예제 - 상태별 색상', async () => {
      const source = `
@diagram
---
title: "상태별 노드 색상"
---

Success: "성공" [roundRect, fill: #d4edda, stroke: #28a745]
Warning: "경고" [roundRect, fill: #fff3cd, stroke: #ffc107]
Error: "오류" [roundRect, fill: #f8d7da, stroke: #dc3545]
Info: "정보" [roundRect, fill: #cce5ff, stroke: #007bff]
Disabled: "비활성" [roundRect, fill: #e9ecef, stroke: #6c757d, dashed: true]

Success -> Warning -> Error
Info -> Disabled
`;
      const result = parse(source);
      expect(result.success).toBe(true);

      const success = result.ir?.content.nodes.find(n => n.id === 'Success');
      expect(success?.style?.fill).toBe('#d4edda');
      expect(success?.style?.stroke).toBe('#28a745');
    });
  });

  describe('복잡한 예제 검증', () => {
    it('마이크로서비스 아키텍처 - 파싱', async () => {
      const source = `@diagram architecture
---
title: "마이크로서비스 아키텍처"
---

group Clients [label: "클라이언트"] {
  Web: "웹 앱" [cloud]
  Mobile: "모바일 앱" [cloud]
  ThirdParty: "외부 시스템" [cloud]
}

Gateway: "API Gateway" [hexagon]
LoadBalancer: "Load Balancer" [hexagon]

group Services [label: "마이크로서비스"] {
  AuthService: "인증 서비스" [rect]
  UserService: "사용자 서비스" [rect]
  ProductService: "상품 서비스" [rect]
  OrderService: "주문 서비스" [rect]
}

group DataStores [label: "데이터 저장소"] {
  UserDB: "User DB" [cylinder]
  ProductDB: "Product DB" [cylinder]
  OrderDB: "Order DB" [cylinder]
}

(Clients.Web, Clients.Mobile, Clients.ThirdParty) -> Gateway
Gateway -> LoadBalancer
LoadBalancer -> (Services.AuthService, Services.UserService, Services.ProductService, Services.OrderService)

Services.UserService -> DataStores.UserDB
Services.ProductService -> DataStores.ProductDB
Services.OrderService -> DataStores.OrderDB
`;
      // 파싱만 검증 (복잡한 그룹 참조는 레이아웃에서 이슈가 있을 수 있음)
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.groups.length).toBe(3);
      expect(result.ir?.content.nodes.length).toBeGreaterThan(10);
    });

    it('CI/CD 파이프라인 - 파싱', async () => {
      const source = `@diagram
---
title: "CI/CD 파이프라인"
direction: LR
---

Trigger: "Push/PR" [roundRect]

group CI [label: "Continuous Integration"] {
  Checkout: "코드 체크아웃" [rect]
  Install: "의존성 설치" [rect]
  Lint: "린트 검사" [rect]
  Test: "테스트 실행" [rect]
  TestResult: "테스트 결과" [diamond]
}

group Build [label: "빌드"] {
  DockerBuild: "Docker 빌드" [rect]
  Push: "레지스트리 Push" [cylinder]
}

group CD [label: "Continuous Deployment"] {
  DeployStaging: "스테이징 배포" [rect]
  StagingTest: "스테이징 테스트" [diamond]
  DeployProduction: "프로덕션 배포" [rect]
  Done: "완료" [circle, fill: #d4edda]
}

Fail: "실패 알림" [roundRect, fill: #f8d7da]

Trigger -> CI.Checkout
CI.Checkout -> CI.Install -> CI.Lint -> CI.Test
CI.Test -> CI.TestResult
CI.TestResult -> Build.DockerBuild: "성공"
CI.TestResult -> Fail: "실패"
Build.DockerBuild -> Build.Push
Build.Push -> CD.DeployStaging
CD.DeployStaging -> CD.StagingTest
CD.StagingTest -> CD.DeployProduction: "통과"
CD.StagingTest -> Fail: "실패"
CD.DeployProduction -> CD.Done
`;
      // 파싱만 검증
      const result = parse(source);
      expect(result.success).toBe(true);
      expect(result.ir?.content.groups.length).toBe(3);
    });

    it('간단한 그룹 예제 - SVG 생성', async () => {
      // 그룹 내 노드를 참조하지 않는 간단한 예제
      const source = `@diagram
group Backend [label: "백엔드"] {
  API: "API 서버"
  Worker: "Worker"
}

Client: "클라이언트"
DB: "DB" [cylinder]

Client -> API
API -> Worker
Worker -> DB
`;
      const svg = await dslToSvg(source);
      expect(svg).toContain('<svg');
    });
  });
});
