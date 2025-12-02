# 예제 모음

실제로 동작하는 다양한 다이어그램 예제입니다. 모든 예제는 플레이그라운드(`pnpm playground`)에서 테스트할 수 있습니다.

## 목차

1. [기본 예제](#기본-예제)
2. [플로우차트](#플로우차트)
3. [아키텍처 다이어그램](#아키텍처-다이어그램)
4. [데이터 파이프라인](#데이터-파이프라인)
5. [CI/CD 파이프라인](#cicd-파이프라인)
6. [실제 사용 사례](#실제-사용-사례)
7. [스타일링 예제](#스타일링-예제)

---

## 기본 예제

### 가장 간단한 다이어그램

두 노드와 하나의 연결:

```
@diagram
A -> B
```

**설명:**
- `@diagram`: 모든 다이어그램의 시작
- `A -> B`: A에서 B로 연결

### 노드에 라벨 추가

```
@diagram
client: "클라이언트"
server: "서버"
db: "데이터베이스"

client -> server -> db
```

**설명:**
- `client: "클라이언트"`: ID는 `client`, 화면에 표시되는 라벨은 "클라이언트"
- 라벨을 지정하지 않으면 ID가 라벨로 사용됨

### 도형 지정하기

```
@diagram
Start: "시작" [circle]
Process: "처리" [roundRect]
Decision: "결정" [diamond]
DB: "저장소" [cylinder]
End: "종료" [circle]

Start -> Process -> Decision
Decision -> DB: "저장"
Decision -> End: "취소"
DB -> End
```

**설명:**
- `[circle]`: 원형 도형 (시작/종료에 적합)
- `[roundRect]`: 둥근 사각형 (일반 프로세스)
- `[diamond]`: 마름모 (조건 분기)
- `[cylinder]`: 원통 (데이터베이스)

### 모든 도형 한눈에 보기

```
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
```

---

## 플로우차트

### 사용자 회원가입 플로우

```
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
```

**핵심 포인트:**
- `[diamond]`: 조건 분기에 사용
- `-> ShowError: "무효"`: 화살표에 라벨 추가
- `[fill: #f8d7da]`: 오류 상태를 색상으로 강조

### 주문 처리 프로세스

```
@diagram flowchart
---
title: "주문 처리 프로세스"
direction: LR
---

Order: "주문 접수" [roundRect]
StockCheck: "재고 확인" [diamond]
PaymentProcess: "결제 처리" [rect]
PaymentResult: "결제 결과" [diamond]
PrepareShipping: "배송 준비" [rect]
Ship: "배송" [rect]
Notify: "고객 알림" [rect]
Complete: "완료" [circle]

OutOfStock: "재고 부족 알림" [roundRect, fill: #fff3cd]
PaymentFailed: "결제 실패" [roundRect, fill: #f8d7da]
Cancel: "주문 취소" [roundRect, fill: #f8d7da]

Order -> StockCheck
StockCheck -> PaymentProcess: "재고 있음"
StockCheck -> OutOfStock: "재고 없음"
OutOfStock -> Cancel
PaymentProcess -> PaymentResult
PaymentResult -> PrepareShipping: "성공"
PaymentResult -> PaymentFailed: "실패"
PaymentFailed -> Cancel
PrepareShipping -> Ship
Ship -> Notify
Notify -> Complete
```

---

## 아키텍처 다이어그램

### 3계층 웹 아키텍처

```
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
```

**핵심 포인트:**
- `group ... [label: "..."] { }`: 관련 노드들을 그룹으로 묶음
- `Presentation.WebServer`: 그룹 외부에서 그룹 내 노드 참조
- `[fill: #DC382D]`: Redis의 브랜드 색상 적용

### 마이크로서비스 아키텍처

```
@diagram architecture
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
  PaymentService: "결제 서비스" [rect]
  NotificationService: "알림 서비스" [rect]
}

group DataStores [label: "데이터 저장소"] {
  UserDB: "User DB" [cylinder]
  ProductDB: "Product DB" [cylinder]
  OrderDB: "Order DB" [cylinder]
}

group Infrastructure [label: "인프라"] {
  MessageQueue: "Kafka" [queue]
  Cache: "Redis Cluster" [cylinder, fill: #DC382D]
  SearchEngine: "Elasticsearch" [cylinder]
}

(Clients.Web, Clients.Mobile, Clients.ThirdParty) -> Gateway
Gateway -> LoadBalancer
LoadBalancer -> (Services.AuthService, Services.UserService, Services.ProductService, Services.OrderService)

Services.UserService -> DataStores.UserDB
Services.ProductService -> DataStores.ProductDB
Services.OrderService -> DataStores.OrderDB

Services.OrderService -> Infrastructure.MessageQueue
Infrastructure.MessageQueue -> Services.PaymentService
Infrastructure.MessageQueue -> Services.NotificationService

Services.AuthService -> Infrastructure.Cache
Services.ProductService -> Infrastructure.SearchEngine
```

### AWS 클라우드 인프라

```
@diagram architecture
---
title: "AWS 인프라 구성"
---

Internet: "인터넷" [cloud]
Route53: "Route 53" [hexagon]
CloudFront: "CloudFront" [hexagon]
WAF: "WAF" [hexagon]

group VPC [label: "VPC (10.0.0.0/16)"] {
  group PublicSubnet [label: "Public Subnet"] {
    ALB: "Application Load Balancer" [hexagon]
    NAT: "NAT Gateway" [hexagon]
    Bastion: "Bastion Host" [rect]
  }

  group PrivateSubnet [label: "Private Subnet"] {
    ECS1: "ECS Task 1" [rect]
    ECS2: "ECS Task 2" [rect]
    ECS3: "ECS Task 3" [rect]
  }

  group DatabaseSubnet [label: "Database Subnet"] {
    RDS_Primary: "RDS Primary" [cylinder, fill: #3B48CC]
    RDS_Replica: "RDS Replica" [cylinder, fill: #3B48CC]
  }
}

group AWSServices [label: "AWS 관리형 서비스"] {
  S3: "S3" [cylinder]
  SQS: "SQS" [queue]
  ElastiCache: "ElastiCache" [cylinder, fill: #DC382D]
  SecretsManager: "Secrets Manager" [rect]
}

Internet -> Route53 -> CloudFront -> WAF
WAF -> VPC.PublicSubnet.ALB
VPC.PublicSubnet.ALB -> (VPC.PrivateSubnet.ECS1, VPC.PrivateSubnet.ECS2, VPC.PrivateSubnet.ECS3)
VPC.PrivateSubnet.ECS1 -> VPC.DatabaseSubnet.RDS_Primary
VPC.PrivateSubnet.ECS2 -> VPC.DatabaseSubnet.RDS_Primary
VPC.PrivateSubnet.ECS3 -> VPC.DatabaseSubnet.RDS_Primary
VPC.DatabaseSubnet.RDS_Primary -> VPC.DatabaseSubnet.RDS_Replica

VPC.PrivateSubnet.ECS1 -> AWSServices.S3
VPC.PrivateSubnet.ECS1 -> AWSServices.SQS
VPC.PrivateSubnet.ECS1 -> AWSServices.ElastiCache
```

---

## 데이터 파이프라인

### ETL 데이터 파이프라인

```
@diagram pipeline
---
title: "ETL 데이터 파이프라인"
direction: LR
---

group Sources [label: "데이터 소스"] {
  MySQL: "MySQL" [cylinder]
  MongoDB: "MongoDB" [cylinder]
  API: "외부 API" [cloud]
  Files: "파일 시스템" [document]
}

group Ingestion [label: "수집 레이어"] {
  Kafka: "Kafka" [queue]
  Debezium: "Debezium CDC" [rect]
}

group Processing [label: "처리 레이어"] {
  Spark: "Apache Spark" [rect]
  Transform: "데이터 변환" [rect]
  Validate: "데이터 검증" [diamond]
}

group Storage [label: "저장 레이어"] {
  DataLake: "Data Lake (S3)" [cylinder]
  DataWarehouse: "Data Warehouse" [cylinder]
}

group Serving [label: "서빙 레이어"] {
  Presto: "Presto" [rect]
  Dashboard: "대시보드" [document]
  MLPlatform: "ML Platform" [rect]
}

Alert: "알림" [rect, fill: #f8d7da]

Sources.MySQL -> Ingestion.Debezium
Sources.MongoDB -> Ingestion.Kafka
Sources.API -> Ingestion.Kafka
Sources.Files -> Processing.Spark

Ingestion.Debezium -> Ingestion.Kafka
Ingestion.Kafka -> Processing.Spark
Processing.Spark -> Processing.Transform
Processing.Transform -> Processing.Validate
Processing.Validate -> Storage.DataLake: "성공"
Processing.Validate -> Alert: "실패"
Storage.DataLake -> Storage.DataWarehouse
Storage.DataWarehouse -> Serving.Presto
Serving.Presto -> Serving.Dashboard
Storage.DataLake -> Serving.MLPlatform
```

### 실시간 스트리밍 파이프라인

```
@diagram pipeline
---
title: "실시간 스트리밍 파이프라인"
---

group Sources [label: "이벤트 소스"] {
  WebEvents: "웹 이벤트" [cloud]
  AppEvents: "앱 이벤트" [cloud]
  IoTDevices: "IoT 디바이스" [cloud]
}

group Ingestion [label: "이벤트 수집"] {
  EventCollector: "이벤트 수집기" [rect]
  Kafka: "Kafka" [queue]
}

group StreamProcessing [label: "스트림 처리"] {
  Flink: "Apache Flink" [rect]
  Enrichment: "데이터 보강" [rect]
  Aggregation: "집계" [rect]
  Routing: "라우팅" [diamond]
}

group Destinations [label: "목적지"] {
  Redis: "Redis (실시간)" [cylinder, fill: #DC382D]
  Elasticsearch: "Elasticsearch (검색)" [cylinder]
  S3: "S3 (아카이브)" [cylinder]
  Alerts: "알림 시스템" [rect]
}

(Sources.WebEvents, Sources.AppEvents, Sources.IoTDevices) -> Ingestion.EventCollector
Ingestion.EventCollector -> Ingestion.Kafka
Ingestion.Kafka -> StreamProcessing.Flink
StreamProcessing.Flink -> StreamProcessing.Enrichment
StreamProcessing.Enrichment -> StreamProcessing.Aggregation
StreamProcessing.Aggregation -> StreamProcessing.Routing
StreamProcessing.Routing -> Destinations.Redis: "실시간 조회"
StreamProcessing.Routing -> Destinations.Elasticsearch: "검색"
StreamProcessing.Routing -> Destinations.S3: "백업"
StreamProcessing.Routing -> Destinations.Alerts: "이상 탐지"
```

---

## CI/CD 파이프라인

### GitHub Actions 워크플로우

```
@diagram
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
  Coverage: "커버리지 리포트" [document]
  SecurityScan: "보안 스캔" [rect]
}

group Build [label: "빌드"] {
  DockerBuild: "Docker 빌드" [rect]
  Push: "레지스트리 Push" [cylinder]
}

group CD [label: "Continuous Deployment"] {
  DeployStaging: "스테이징 배포" [rect]
  StagingTest: "스테이징 테스트" [diamond]
  DeployProduction: "프로덕션 배포" [rect]
  HealthCheck: "헬스 체크" [diamond]
  Done: "완료" [circle, fill: #d4edda]
}

Fail: "실패 알림" [roundRect, fill: #f8d7da]
Rollback: "롤백" [roundRect, fill: #fff3cd]

Trigger -> CI.Checkout
CI.Checkout -> CI.Install -> CI.Lint -> CI.Test
CI.Test -> CI.TestResult
CI.TestResult -> CI.Coverage: "성공"
CI.TestResult -> Fail: "실패"
CI.Coverage -> CI.SecurityScan
CI.SecurityScan -> Build.DockerBuild
Build.DockerBuild -> Build.Push
Build.Push -> CD.DeployStaging
CD.DeployStaging -> CD.StagingTest
CD.StagingTest -> CD.DeployProduction: "통과"
CD.StagingTest -> Fail: "실패"
CD.DeployProduction -> CD.HealthCheck
CD.HealthCheck -> CD.Done: "정상"
CD.HealthCheck -> Rollback: "비정상"
Rollback -> Fail
```

---

## 실제 사용 사례

### E-commerce 전체 시스템

```
@diagram architecture
---
title: "E-commerce 시스템 아키텍처"
---

group Clients [label: "클라이언트"] {
  WebBrowser: "웹 브라우저" [cloud]
  MobileApp: "모바일 앱" [cloud]
  AdminPortal: "관리자 포털" [cloud]
}

CDN: "CDN" [hexagon]
WAF: "WAF" [hexagon]
APIGateway: "API Gateway" [hexagon]

group CoreServices [label: "핵심 서비스"] {
  UserService: "사용자 서비스" [rect]
  ProductService: "상품 서비스" [rect]
  CartService: "장바구니 서비스" [rect]
  OrderService: "주문 서비스" [rect]
  PaymentService: "결제 서비스" [rect]
  ShippingService: "배송 서비스" [rect]
}

group SupportServices [label: "지원 서비스"] {
  SearchService: "검색 서비스" [rect]
  RecommendService: "추천 서비스" [rect]
  NotificationService: "알림 서비스" [rect]
  ReviewService: "리뷰 서비스" [rect]
}

group DataLayer [label: "데이터 레이어"] {
  UserDB: "사용자 DB" [cylinder]
  ProductDB: "상품 DB" [cylinder]
  OrderDB: "주문 DB" [cylinder]
  SearchIndex: "검색 인덱스" [cylinder]
}

group Infrastructure [label: "인프라"] {
  MessageQueue: "메시지 큐" [queue]
  Cache: "캐시" [cylinder, fill: #DC382D]
  ObjectStorage: "객체 저장소" [cylinder]
}

group ExternalServices [label: "외부 서비스"] {
  PaymentGateway: "PG사" [cloud]
  ShippingAPI: "물류 API" [cloud]
  SMSService: "SMS" [cloud]
  EmailService: "이메일" [cloud]
}

(Clients.WebBrowser, Clients.MobileApp) -> CDN
CDN -> WAF -> APIGateway
Clients.AdminPortal -> APIGateway

APIGateway -> (CoreServices.UserService, CoreServices.ProductService, CoreServices.CartService, CoreServices.OrderService)

CoreServices.UserService -> DataLayer.UserDB
CoreServices.ProductService -> DataLayer.ProductDB
CoreServices.OrderService -> DataLayer.OrderDB

CoreServices.OrderService -> Infrastructure.MessageQueue
Infrastructure.MessageQueue -> CoreServices.PaymentService
Infrastructure.MessageQueue -> CoreServices.ShippingService
Infrastructure.MessageQueue -> SupportServices.NotificationService

CoreServices.PaymentService -> ExternalServices.PaymentGateway
CoreServices.ShippingService -> ExternalServices.ShippingAPI
SupportServices.NotificationService -> ExternalServices.SMSService
SupportServices.NotificationService -> ExternalServices.EmailService

CoreServices.ProductService -> Infrastructure.Cache
SupportServices.SearchService -> DataLayer.SearchIndex
```

### SaaS 멀티테넌트 아키텍처

```
@diagram architecture
---
title: "SaaS 멀티테넌트 아키텍처"
---

group Tenants [label: "테넌트"] {
  TenantA: "고객사 A" [cloud]
  TenantB: "고객사 B" [cloud]
  TenantC: "고객사 C" [cloud]
}

group EdgeLayer [label: "엣지 레이어"] {
  DNS: "DNS" [hexagon]
  GlobalLB: "Global Load Balancer" [hexagon]
  CDN: "CDN" [hexagon]
}

group ApplicationLayer [label: "애플리케이션 레이어"] {
  TenantRouter: "테넌트 라우터" [rect]
  AuthService: "인증 서비스" [rect]
  CoreApp: "핵심 애플리케이션" [rect]
  TenantConfig: "테넌트 설정" [rect]
}

group DataLayer [label: "데이터 레이어 (테넌트별 격리)"] {
  SharedDB: "공유 DB (메타)" [cylinder]
  TenantADB: "테넌트 A DB" [cylinder]
  TenantBDB: "테넌트 B DB" [cylinder]
  TenantCDB: "테넌트 C DB" [cylinder]
}

group PlatformServices [label: "플랫폼 서비스"] {
  Monitoring: "모니터링" [rect]
  Billing: "빌링" [rect]
  Analytics: "분석" [rect]
  BackupService: "백업" [rect]
}

(Tenants.TenantA, Tenants.TenantB, Tenants.TenantC) -> EdgeLayer.DNS
EdgeLayer.DNS -> EdgeLayer.GlobalLB -> EdgeLayer.CDN
EdgeLayer.CDN -> ApplicationLayer.TenantRouter
ApplicationLayer.TenantRouter -> ApplicationLayer.AuthService
ApplicationLayer.AuthService -> ApplicationLayer.CoreApp
ApplicationLayer.CoreApp -> ApplicationLayer.TenantConfig

ApplicationLayer.TenantConfig -> DataLayer.SharedDB
ApplicationLayer.CoreApp -> DataLayer.TenantADB
ApplicationLayer.CoreApp -> DataLayer.TenantBDB
ApplicationLayer.CoreApp -> DataLayer.TenantCDB

ApplicationLayer.CoreApp -> PlatformServices.Monitoring
ApplicationLayer.CoreApp -> PlatformServices.Billing
PlatformServices.Analytics -> DataLayer.SharedDB
PlatformServices.BackupService -> (DataLayer.TenantADB, DataLayer.TenantBDB, DataLayer.TenantCDB)
```

---

## 스타일링 예제

### 상태별 색상 지정

```
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
```

### 브랜드 색상 적용

```
@diagram
---
title: "기술 스택 브랜드 색상"
direction: LR
---

React: "React" [roundRect, fill: #61DAFB]
Vue: "Vue.js" [roundRect, fill: #4FC08D]
Node: "Node.js" [roundRect, fill: #339933]
Python: "Python" [roundRect, fill: #3776AB]
Go: "Go" [roundRect, fill: #00ADD8]
Rust: "Rust" [roundRect, fill: #000000]
PostgreSQL: "PostgreSQL" [cylinder, fill: #336791]
MongoDB: "MongoDB" [cylinder, fill: #47A248]
Redis: "Redis" [cylinder, fill: #DC382D]
Kafka: "Kafka" [queue, fill: #231F20]

React -> Node -> PostgreSQL
Vue -> Python -> MongoDB
Go -> Redis
Rust -> Kafka
```

### 강조와 그림자

```
@diagram
---
title: "스타일 조합"
---

Normal: "일반 노드" [rect]
Highlighted: "강조 노드" [roundRect, fill: #4A90D9, stroke: #2E5B8A, shadow: true]
Dashed: "점선 테두리" [rect, dashed: true, stroke: #6c757d]
Transparent: "투명" [roundRect, fill: #4A90D9, opacity: 0.5]

Normal -> Highlighted
Highlighted -> Dashed
Dashed -> Transparent
```

---

## 복합 예제

### 전체 시스템 조합

```
@diagram
---
title: "완전한 시스템 예제"
---

User: "사용자" [person]

group Frontend [label: "프론트엔드", fill: #e3f2fd] {
  WebApp: "React 웹앱" [roundRect, fill: #61DAFB]
  MobileApp: "React Native" [roundRect, fill: #61DAFB]
}

Gateway: "API Gateway" [hexagon, fill: #FF9900]

group Backend [label: "백엔드 서비스", fill: #e8f5e9] {
  AuthService: "인증" [rect]
  CoreAPI: "Core API" [rect]
  WorkerService: "Worker" [rect]
}

group DataStores [label: "데이터 저장소", fill: #fce4ec] {
  MainDB: "PostgreSQL" [cylinder, fill: #336791]
  CacheDB: "Redis" [cylinder, fill: #DC382D]
  SearchDB: "Elasticsearch" [cylinder, fill: #005571]
}

MessageQueue: "Kafka" [queue, fill: #231F20]

group External [label: "외부 서비스"] {
  EmailProvider: "SendGrid" [cloud]
  PaymentProvider: "Stripe" [cloud]
  StorageProvider: "S3" [cloud]
}

User -> (Frontend.WebApp, Frontend.MobileApp)
Frontend.WebApp -> Gateway
Frontend.MobileApp -> Gateway
Gateway -> Backend.AuthService
Gateway -> Backend.CoreAPI
Backend.CoreAPI -> DataStores.MainDB
Backend.CoreAPI -> DataStores.CacheDB
Backend.CoreAPI -> DataStores.SearchDB
Backend.CoreAPI -> MessageQueue
MessageQueue -> Backend.WorkerService
Backend.WorkerService -> External.EmailProvider
Backend.CoreAPI -> External.PaymentProvider
Backend.CoreAPI -> External.StorageProvider
```

---

## 다음 단계

- [시작 가이드](./getting-started.md) - 처음 시작하기
- [DSL 레퍼런스](./dsl-reference.md) - 전체 DSL 문법
- [API 레퍼런스](./api-reference.md) - 프로그래밍 API

### 문서에 있는 예제 테스트하기

모든 예제는 플레이그라운드에서 즉시 테스트할 수 있습니다:

```bash
pnpm playground
```

브라우저에서 `http://localhost:3000`을 열고, 예제 코드를 에디터에 붙여넣으면 실시간으로 결과를 확인할 수 있습니다.
