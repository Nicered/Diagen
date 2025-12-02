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

group Services [label: "서비스", direction: LR] {
  Auth: "인증" [rect]
  User: "사용자" [rect]
  Order: "주문" [rect]
  Payment: "결제" [rect]
}

group Data [label: "데이터", direction: LR] {
  Cache: "Redis" [cylinder, fill: #DC382D]
  UserDB: "User DB" [cylinder]
  OrderDB: "Order DB" [cylinder]
  Queue: "Message Queue" [queue]
}

Gateway -> (Services.Auth, Services.User, Services.Order, Services.Payment)
Services.Auth -> Data.Cache
Services.User -> Data.UserDB
Services.Order -> Data.OrderDB
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

  userJourney: {
    name: '사용자 여정',
    code: `@diagram
---
title: "쇼핑몰 사용자 여정"
direction: LR
---

group Discovery [label: "탐색 단계", direction: LR] {
  Visit: "사이트 방문" [circle, fill: #e3f2fd]
  Browse: "상품 탐색" [roundRect, fill: #e3f2fd]
  Search: "검색" [roundRect, fill: #e3f2fd]
}

group Decision [label: "결정 단계", direction: LR] {
  Detail: "상품 상세" [roundRect, fill: #fff3e0]
  Compare: "비교" [roundRect, fill: #fff3e0]
  Cart: "장바구니" [roundRect, fill: #fff3e0]
}

group Purchase [label: "구매 단계", direction: LR] {
  Checkout: "결제" [roundRect, fill: #e8f5e9]
  Complete: "완료" [circle, fill: #c8e6c9]
}

Discovery.Visit -> Discovery.Browse
Discovery.Browse -> Discovery.Search
Discovery.Search -> Decision.Detail
Decision.Detail -> Decision.Compare
Decision.Compare -> Decision.Cart
Decision.Cart -> Purchase.Checkout
Purchase.Checkout -> Purchase.Complete`,
  },

  processFlow: {
    name: '업무 프로세스',
    code: `@diagram
---
title: "채용 프로세스"
---

Start: "지원서 접수" [document, fill: #e3f2fd]

group Screening [label: "서류 심사"] {
  Review: "이력서 검토" [rect]
  Filter: "적격 여부" [diamond]
}

group Interview [label: "면접 단계", direction: LR] {
  Phone: "전화 면접" [rect]
  Tech: "기술 면접" [rect]
  Culture: "컬처핏" [rect]
}

Offer: "오퍼 제안" [document, fill: #c8e6c9]
Reject: "불합격 통보" [document, fill: #ffcdd2]
Hire: "입사" [circle, fill: #a5d6a7]

Start -> Screening.Review -> Screening.Filter
Screening.Filter -> Interview.Phone: "합격"
Screening.Filter -> Reject: "불합격"
Interview.Phone -> Interview.Tech -> Interview.Culture
Interview.Culture -> Offer: "합격"
Interview.Culture -> Reject: "불합격"
Offer -> Hire`,
  },

  systemOverview: {
    name: '시스템 개요',
    code: `@diagram architecture
---
title: "이커머스 시스템 아키텍처"
---

group Frontend [label: "프론트엔드", direction: LR] {
  Web: "웹" [cloud]
  Mobile: "모바일" [cloud]
  Admin: "관리자" [cloud]
}

LB: "로드밸런서" [hexagon, fill: #ffecb3]

group Backend [label: "백엔드 서비스", direction: LR] {
  Product: "상품" [rect, fill: #e3f2fd]
  Order: "주문" [rect, fill: #e3f2fd]
  User: "회원" [rect, fill: #e3f2fd]
  Payment: "결제" [rect, fill: #e3f2fd]
}

group Storage [label: "저장소", direction: LR] {
  DB: "PostgreSQL" [cylinder]
  Cache: "Redis" [cylinder, fill: #ffcdd2]
  Search: "Elasticsearch" [cylinder, fill: #fff9c4]
  S3: "S3" [cylinder, fill: #ffcc80]
}

Frontend.Web -> LB
Frontend.Mobile -> LB
Frontend.Admin -> LB
LB -> (Backend.Product, Backend.Order, Backend.User, Backend.Payment)
Backend.Product -> Storage.DB
Backend.Product -> Storage.Search
Backend.Order -> Storage.DB
Backend.User -> Storage.DB
Backend.User -> Storage.Cache
Backend.Payment -> Storage.DB`,
  },

  dataFlow: {
    name: '데이터 흐름',
    code: `@diagram
---
title: "ETL 데이터 파이프라인"
direction: LR
---

group Sources [label: "데이터 소스"] {
  API: "API 로그" [document]
  DB: "운영 DB" [cylinder]
  Events: "이벤트" [queue]
}

group Processing [label: "처리"] {
  Ingest: "수집" [rect, fill: #e3f2fd]
  Transform: "변환" [rect, fill: #fff3e0]
  Validate: "검증" [diamond, fill: #fce4ec]
}

group Destination [label: "저장"] {
  DW: "데이터 웨어하우스" [cylinder, fill: #e8f5e9]
  Lake: "데이터 레이크" [cylinder, fill: #e0f7fa]
}

BI: "BI 대시보드" [rect, fill: #f3e5f5]

Sources.API -> Processing.Ingest
Sources.DB -> Processing.Ingest
Sources.Events -> Processing.Ingest
Processing.Ingest -> Processing.Transform -> Processing.Validate
Processing.Validate -> Destination.DW: "정형"
Processing.Validate -> Destination.Lake: "비정형"
Destination.DW -> BI`,
  },
};

export type ExampleKey = keyof typeof examples;
