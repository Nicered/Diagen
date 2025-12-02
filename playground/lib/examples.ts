export const examples = {
  simple: {
    name: '간단한 예제',
    code: `@diagram
---
title: "간단한 다이어그램"
---

A: "시작"
B: "처리"
C: "종료"

A -> B -> C`,
  },

  flowchart: {
    name: '플로우차트',
    code: `@diagram flowchart
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
CreateAccount -> SendEmail -> End`,
  },

  architecture: {
    name: '아키텍처',
    code: `@diagram architecture
---
title: "3계층 웹 애플리케이션"
---

Client: "웹 브라우저" [cloud]
CDN: "CDN" [hexagon]

group Backend [label: "백엔드"] {
  API: "API 서버" [rect]
  Worker: "Worker" [rect]
}

group Database [label: "데이터베이스"] {
  Primary: "Primary DB" [cylinder]
  Cache: "Redis" [cylinder, fill: #DC382D]
}

Client -> CDN -> Backend.API
Backend.API -> Backend.Worker
Backend.API -> Database.Primary
Backend.API -> Database.Cache`,
  },

  microservices: {
    name: '마이크로서비스',
    code: `@diagram architecture
---
title: "마이크로서비스 아키텍처"
---

Gateway: "API Gateway" [hexagon]

group Services [label: "서비스"] {
  Auth: "인증" [rect]
  User: "사용자" [rect]
  Order: "주문" [rect]
  Payment: "결제" [rect]
}

group Data [label: "데이터"] {
  UserDB: "User DB" [cylinder]
  OrderDB: "Order DB" [cylinder]
  Cache: "Redis" [cylinder, fill: #DC382D]
  Queue: "Message Queue" [queue]
}

Gateway -> (Services.Auth, Services.User, Services.Order)
Services.Order -> Services.Payment
Services.User -> Data.UserDB
Services.Order -> Data.OrderDB
Services.Auth -> Data.Cache
Services.Order -> Data.Queue
Services.Payment -> Data.Queue`,
  },

  pipeline: {
    name: 'CI/CD 파이프라인',
    code: `@diagram
---
title: "CI/CD 파이프라인"
direction: LR
---

Trigger: "Push" [roundRect]
Build: "빌드" [rect]
Test: "테스트" [diamond]
Deploy: "배포" [rect]
Done: "완료" [circle, fill: #d4edda]
Fail: "실패" [roundRect, fill: #f8d7da]

Trigger -> Build -> Test
Test -> Deploy: "통과"
Test -> Fail: "실패"
Deploy -> Done`,
  },

  shapes: {
    name: '도형 종류',
    code: `@diagram
---
title: "지원하는 도형"
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
CY -> CL -> DO -> Q -> P`,
  },
};

export type ExampleKey = keyof typeof examples;
