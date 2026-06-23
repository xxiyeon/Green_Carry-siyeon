# GreenCarry

다회용기 사용과 친환경 배달 방식을 중심으로 설계한 음식 주문 플랫폼입니다.
사용자는 주변 매장을 탐색하고 메뉴를 주문하며, 점주는 매장/메뉴/주문/리뷰를 운영하고, 관리자는 회원/매장/리뷰/용기/통계를 관리할 수 있습니다.

GreenCarry는 단순 주문 서비스가 아니라 **주문-결제-배달 상태-리뷰-포인트-탄소 절감량**이 하나의 흐름으로 이어지는 서비스형 웹 애플리케이션입니다.

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [핵심 기능](#핵심-기능)
- [사용자 역할](#사용자-역할)
- [서비스 흐름](#서비스-흐름)
- [기술 스택](#기술-스택)
- [아키텍처](#아키텍처)
- [프로젝트 구조](#프로젝트-구조)
- [주요 API](#주요-api)
- [상태 관리와 데이터 흐름](#상태-관리와-데이터-흐름)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [구현 포인트](#구현-포인트)
- [개선 과제](#개선-과제)

## 프로젝트 개요

GreenCarry는 친환경 배달 경험을 제공하기 위해 다음 문제를 해결하는 데 초점을 둔 프로젝트입니다.

- 일회용기 사용을 줄이기 위한 다회용기 기반 메뉴/용기 관리
- 배달 방식에 따른 탄소 절감량 계산
- 탄소 절감량 기반 에코 포인트 제공
- 고객, 점주, 관리자 역할을 분리한 운영 구조
- 실제 결제, 주문 상태 변경, 리뷰, 고객센터, 알림까지 이어지는 서비스 흐름 구현

## 핵심 기능

### 사용자 기능

- 개인 회원가입, 점주 회원가입, 로그인, 로그아웃
- 자동 로그인과 refresh token 기반 access token 재발급
- 아이디 찾기, 비밀번호 재설정, 이메일 인증
- 회원 정보 수정, 프로필 이미지 업로드, 주소 변경
- 회원 탈퇴와 진행 중 주문 여부 확인
- 주변 매장 조회, 카테고리 필터, 매장명 검색
- 현재 위치 기반 거리 계산과 예상 소요 시간 표시
- 매장 상세 정보, 영업시간, 지도, 리뷰 조회
- 메뉴 상세 옵션 선택, 다회용기 선택, 수량 조절
- 장바구니 담기, 동일 옵션 메뉴 병합, 장바구니 수량 수정
- 배달 방식 선택, 배달비 계산, 탄소 절감량 계산
- 포인트 사용, Toss Payments 카드 결제
- 주문 완료 페이지, 주문 상태 타임라인, 예상 도착 시간 확인
- 주문 취소, 주문 내역 조회, 리뷰 작성, 리뷰 삭제
- 에코 포인트, 포인트 이력, 누적 탄소 절감량 확인
- FAQ 조회, 1:1 문의 등록/수정/삭제, 답변 확인
- SSE 기반 실시간 알림 수신
- 이스터에그 이벤트를 통한 포인트 보상

### 점주 기능

- 점주 전용 마이페이지 접근 제어
- 매장 통계 대시보드
- 월별 주문 통계, 배달 방식별 매출 비율, 리뷰 평점 분포 확인
- 매장 정보 수정
- 매장 이미지 업로드
- 주소 검색과 좌표 변환
- 영업시간, 24시간 운영, 요일별 운영, 정기 휴무 설정
- 메뉴 목록 조회, 메뉴 검색, 메뉴 등록, 메뉴 수정, 메뉴 삭제
- 메뉴 판매 상태 변경
- 메뉴 옵션 생성과 연결
- 메뉴별 다회용기 매핑과 탄소 배출량 관리
- 주문 목록 조회, 주문 상세 모달
- 주문 접수, 예상 조리 시간 입력, 조리중/배달중/완료 상태 변경
- 주문 취소/거절 처리
- 고객 리뷰 조회, 사장님 답글 등록
- 점주 FAQ 조회, 1:1 문의 등록/수정/삭제
- 점주 계정 정보 수정과 탈퇴

### 관리자 기능

- 관리자 전용 마이페이지 접근 제어
- 전체 서비스 대시보드
- 전체 매출 통계, 탄소 절감량 통계, 회원 가입 통계 조회
- 전체 회원 목록 조회, 회원 검색, 회원 정렬, 회원 상태 확인
- 전체 매장 목록 조회, 매장 검색, 매장 정렬
- 매장별 주문 내역 조회와 주문 상세 모달
- 전체 리뷰 조회와 기간 필터링
- 전체 고객 문의 조회, 답변완료/미답변 필터
- 고객 문의 답변 등록
- 다회용기 목록 조회, 검색, 정렬
- 다회용기 등록, 수정, 삭제
- 용기 이미지 업로드와 탄소 배출량 관리

### 공통 시스템 기능

- JWT 기반 인증 토큰 발급
- refresh token 기반 자동 로그인
- BCrypt 기반 비밀번호 암호화
- Axios interceptor 기반 Authorization 헤더 자동 첨부
- 401 응답 발생 시 access token 재발급 후 요청 재시도
- Zustand persist 기반 장바구니 상태 유지
- localStorage 기반 인증/좌표/포인트 상태 복구
- Cloudinary 기반 이미지 업로드
- JavaMailSender 기반 이메일 인증번호 발송
- SSE 기반 실시간 알림과 알림 읽음 처리
- 주문/메뉴/포인트/영업시간 저장 시 트랜잭션 처리
- 공통 페이지네이션
- 버튼 중복 클릭 방지
- 동일 mutation 요청 중복 방지
- Vercel Analytics, Speed Insights 적용

## 사용자 역할

| 역할 | 등급 | 주요 권한 |
| --- | --- | --- |
| 개인 회원 | `memberGrade = 1` | 매장 탐색, 주문, 결제, 리뷰, 포인트, 고객센터 |
| 점주 회원 | `memberGrade = 2` | 매장 관리, 메뉴 관리, 주문 처리, 리뷰 답글, 점주 고객센터 |
| 관리자 | `memberGrade = 0` | 회원 관리, 매장 관리, 리뷰 관리, 용기 관리, 통계, 문의 답변 |

## 서비스 흐름

### 고객 주문 흐름

```text
회원가입/로그인
  -> 주변 매장 탐색
  -> 매장 상세/메뉴 확인
  -> 메뉴 옵션 및 다회용기 선택
  -> 장바구니 담기
  -> 배달 방식 선택
  -> 포인트 사용
  -> Toss Payments 결제
  -> 주문 완료 페이지
  -> 주문 상태 실시간 확인
  -> 리뷰 작성
  -> 포인트/탄소 절감량 확인
```

### 점주 운영 흐름

```text
점주 로그인
  -> 매장 통계 확인
  -> 매장 정보/영업시간 관리
  -> 메뉴/옵션/용기 매핑 관리
  -> 신규 주문 확인
  -> 주문 접수 및 예상 시간 입력
  -> 조리/배달/완료 상태 변경
  -> 리뷰 확인 및 답글 작성
  -> 고객 문의 관리
```

### 관리자 운영 흐름

```text
관리자 로그인
  -> 전체 통계 확인
  -> 회원 목록 관리
  -> 매장 목록 및 주문 상세 확인
  -> 리뷰 모니터링
  -> 용기 탄소 데이터 관리
  -> 고객 문의 답변 처리
```

## 기술 스택

### Frontend

| 구분 | 기술 |
| --- | --- |
| Framework | React 19, Vite |
| Routing | React Router DOM |
| State | React Context, Zustand Persist |
| HTTP Client | Axios |
| UI | CSS Modules, MUI Icons, MUI Components, SweetAlert2 |
| Chart | ApexCharts, react-apexcharts |
| Payment | Toss Payments SDK |
| Map/Address | Naver Maps, Daum Postcode |
| Analytics | Vercel Analytics, Vercel Speed Insights |

### Backend

| 구분 | 기술 |
| --- | --- |
| Framework | Spring Boot 4, Spring Web MVC |
| Language | Java 17 |
| Persistence | MyBatis |
| Database | Oracle DB |
| Security | Spring Security, JWT, BCrypt |
| Mail | JavaMailSender |
| Realtime | Server-Sent Events |
| File Upload | Cloudinary |
| Build | Maven |

## 아키텍처

```text
Client
  -> React Router
  -> Page / Layout Component
  -> Context / Zustand Store
  -> Axios API Client
  -> Spring MVC Controller
  -> Service
  -> DAO / MyBatis Mapper
  -> Oracle DB
```

### 주요 설계 방향

- 프론트엔드와 백엔드를 분리한 SPA + REST API 구조
- 사용자, 점주, 관리자 화면을 라우트와 레이아웃 단위로 분리
- 주문, 포인트, 메뉴 저장처럼 데이터 정합성이 중요한 기능은 백엔드 트랜잭션으로 처리
- 이미지 파일은 서버 로컬 저장 대신 Cloudinary 업로드 URL을 저장
- 알림은 DB 저장 후 SSE로 실시간 전송
- 장바구니는 새로고침 후에도 유지되도록 Zustand persist 적용

## 프로젝트 구조

```text
green_carry/
├─ README.md
├─ green_carry_front/
│  ├─ package.json
│  ├─ index.html
│  └─ src/
│     ├─ App.jsx
│     ├─ main.jsx
│     ├─ components/
│     │  ├─ commons/
│     │  ├─ layout/
│     │  └─ Easter Egg/
│     ├─ context/
│     ├─ pages/
│     │  ├─ login/
│     │  ├─ signup/
│     │  ├─ main/
│     │  ├─ order/
│     │  └─ mypage/
│     │     ├─ user/
│     │     ├─ manager/
│     │     └─ admin/
│     ├─ store/
│     └─ utils/
└─ green_carry_back/
   ├─ pom.xml
   └─ src/main/
      ├─ java/kr/co/iei/
      │  ├─ admin/
      │  ├─ common/config/
      │  ├─ container/
      │  ├─ cs/
      │  ├─ member/
      │  ├─ notification/
      │  ├─ store/
      │  └─ utils/
      └─ resources/
         ├─ application.properties
         └─ mapper/
```

## 주요 API

### 회원/인증

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `POST` | `/member/login` | 로그인, access token 발급 |
| `POST` | `/member/refresh` | refresh token 기반 access token 재발급 |
| `POST` | `/member/logout` | 로그아웃 처리 |
| `POST` | `/member/userSignup` | 개인 회원가입 |
| `POST` | `/member/signupManager` | 점주 회원가입과 매장 생성 |
| `GET` | `/member/exists` | 아이디 중복 확인 |
| `GET` | `/member/emailDupCheck` | 이메일 중복 확인 |
| `POST` | `/member/email-verification` | 이메일 인증번호 발송 |
| `POST` | `/member/verifyCode` | 이메일 인증번호 검증 |
| `POST` | `/member/findId` | 아이디 찾기 |
| `POST` | `/member/resetPw` | 비밀번호 재설정 |
| `POST` | `/member/updateProfile` | 프로필 수정 |
| `POST` | `/member/updatePassword` | 비밀번호 변경 |
| `PATCH` | `/member/updateAddress` | 주소 변경 |
| `POST` | `/member/delete` | 회원 탈퇴 |

### 매장/메뉴/주문

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/stores` | 전체 매장 조회 |
| `GET` | `/stores/{storeId}` | 매장 상세 조회 |
| `GET` | `/stores/{storeId}/menus` | 매장 메뉴 조회 |
| `GET` | `/stores/{menuId}/options` | 메뉴 옵션 조회 |
| `GET` | `/stores/{storeId}/hours` | 매장 영업시간 조회 |
| `GET` | `/stores/location/{storeId}` | 매장 좌표 조회 |
| `POST` | `/stores/order` | 주문 생성 |
| `GET` | `/stores/order/{orderId}` | 주문 상세 조회 |
| `GET` | `/stores/orders/{memberId}` | 사용자 주문 목록 조회 |
| `GET` | `/stores/orders/owner/{storeId}` | 점주 주문 목록 조회 |
| `PATCH` | `/stores/order/{orderId}/status` | 주문 상태 변경 |
| `POST` | `/stores/update` | 매장 정보 및 영업시간 수정 |

### 점주 메뉴 관리

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/menus/containers` | 용기 마스터 목록 조회 |
| `GET` | `/menus/{menuId}` | 메뉴 단건 조회 |
| `GET` | `/menus/{menuId}/options` | 메뉴 옵션 조회 |
| `GET` | `/menus/{menuId}/containers` | 메뉴별 용기 매핑 조회 |
| `POST` | `/menus/{storeId}` | 메뉴 등록 |
| `POST` | `/menus/{storeId}/{menuId}` | 메뉴 수정 |
| `PATCH` | `/menus/{menuId}/status` | 메뉴 판매 상태 변경 |
| `DELETE` | `/menus/{menuId}` | 메뉴 삭제 |

### 리뷰/고객센터/알림

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/stores/reviews/{storeId}` | 매장 리뷰 조회 |
| `POST` | `/member/insertReview` | 리뷰 작성 |
| `GET` | `/member/myReviewList/{memberId}` | 내 리뷰 목록 조회 |
| `DELETE` | `/member/deleteReview/{orderId}` | 리뷰 삭제 |
| `POST` | `/stores/review/comment` | 점주 리뷰 답글 등록 |
| `GET` | `/cs/inquiries/faq` | 개인 FAQ 조회 |
| `GET` | `/cs/inquiries/faq/manager` | 점주 FAQ 조회 |
| `GET` | `/cs/inquiries/list` | 문의 목록 조회 |
| `POST` | `/cs/inquiries/submit` | 문의 등록 |
| `PUT` | `/cs/inquiries/update` | 문의 수정 |
| `DELETE` | `/cs/inquiries/delete` | 문의 삭제 |
| `PATCH` | `/cs/inquiries/adminAnswer` | 관리자 문의 답변 |
| `GET` | `/api/notification/subscribe` | SSE 알림 구독 |
| `GET` | `/api/notification/list` | 읽지 않은 알림 조회 |
| `PATCH` | `/api/notification/read/{notiId}` | 알림 읽음 처리 |
| `PATCH` | `/api/notification/read/all` | 전체 알림 읽음 처리 |

### 관리자

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/admin/api/sales/stats` | 전체 매출 통계 |
| `GET` | `/admin/api/point/stats` | 탄소 절감/포인트 통계 |
| `GET` | `/admin/{storeId}` | 매장별 주문 목록 |
| `GET` | `/admin/order-detail/{orderId}` | 관리자 주문 상세 |
| `GET` | `/admin/reviews` | 전체 리뷰 조회 |
| `GET` | `/carbon-list` | 용기 목록 조회 |
| `POST` | `/carbon-list/update` | 용기 등록/수정 |
| `DELETE` | `/carbon-list/{productId}` | 용기 삭제 |

## 상태 관리와 데이터 흐름

### 인증 상태

- `AuthContext`가 로그인 여부, 사용자 정보, 로그아웃 로직을 관리합니다.
- access token, refresh token, 회원 정보, 좌표, 포인트는 localStorage에 저장됩니다.
- 앱 시작 시 localStorage를 읽어 인증 상태를 복구합니다.
- access token 만료 시 `accessToken.js`의 interceptor가 refresh token으로 재발급을 시도합니다.

### 장바구니 상태

- `useCartStore`가 Zustand persist 기반으로 장바구니를 관리합니다.
- 저장 정보는 메뉴, 옵션, 수량, 가격, 매장명, 매장 ID, 탄소 절감량입니다.
- 동일 메뉴와 동일 옵션 조합은 수량만 증가합니다.
- 다른 매장의 메뉴를 담는 경우 기존 장바구니 초기화 확인을 거칩니다.

### 주문/결제 상태

- 주문 페이지에서 배달 방식, 배달비, 거리, 탄소 절감량을 계산합니다.
- 결제 페이지에서 사용 포인트와 최종 결제 금액을 확정합니다.
- 주문 생성 후 Toss Payments SDK로 결제를 요청합니다.
- 결제 완료 페이지는 주문 ID로 주문 정보를 조회하고 본인 주문 여부를 검증합니다.
- 주문 완료 후 장바구니를 초기화합니다.

### 알림 상태

- 로그인 사용자는 SSE로 알림을 구독합니다.
- 주문 생성, 주문 상태 변경, 리뷰 작성, 리뷰 답글, 문의 등록/답변 시 알림이 생성됩니다.
- 알림은 DB에 저장되고, 읽음 처리 전까지 헤더 알림 목록에 표시됩니다.

## 실행 방법

### Frontend

```bash
cd green_carry_front
npm install
npm run dev
```

빌드:

```bash
npm build
```

린트:

```bash
npm lint
```

### Backend

```bash
cd green_carry_back
mvn spring-boot:run
```

기본 서버 포트:

```text
10400
```

## 환경 변수
### Frontend `.env`

```env
VITE_BACKSERVER=http://localhost:10400
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
```

### Backend `application.properties`

```properties
server.port=10400

spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url=jdbc:oracle:thin:@host:port/service
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_mail_username
spring.mail.password=your_mail_app_password

TOSS_SECRET_KEY=your_toss_secret_key

naver.geocode.client.id=your_naver_client_id
naver.geocode.client.secret=your_naver_client_secret

cloudinary.cloud-name=your_cloudinary_cloud_name
cloudinary.api-key=your_cloudinary_api_key
cloudinary.api-secret=your_cloudinary_api_secret
```

## 구현 포인트

### 1. 주문과 포인트 정합성

주문 생성 시 사용 포인트를 먼저 차감하고, 주문 상세와 주문 이력을 같은 트랜잭션에서 저장합니다.
주문 취소 시 포인트를 롤백하고, 주문 완료 시 포인트 적립과 탄소 절감량 누적을 처리합니다.

### 2. 친환경 도메인 반영

배달 방식과 메뉴별 용기 정보를 기반으로 탄소 절감량을 계산합니다.
사용자는 마이페이지에서 누적 탄소 절감량, 에코 등급, 커뮤니티 전체 절감량을 확인할 수 있습니다.

### 3. 역할 기반 화면 분리

개인 회원, 점주, 관리자의 페이지와 사이드바를 분리했습니다.
라우트 접근은 `ProtectedRoute`에서 사용자 등급 기준으로 제어합니다.

### 4. 실시간 운영 알림

SSE 기반 알림을 사용해 주문 접수, 상태 변경, 리뷰, 문의 답변 등 운영 이벤트를 실시간으로 전달합니다.
알림은 DB에도 저장되어 새로고침 후에도 읽지 않은 알림을 유지합니다.

### 5. 실제 외부 서비스 연동

Toss Payments, Naver Maps/Geocode, Daum Postcode, Cloudinary, Gmail SMTP를 연동했습니다.
지도, 결제, 주소 검색, 이미지 업로드, 이메일 인증까지 실제 서비스에서 필요한 외부 연동 흐름을 포함합니다.

### 6. 중복 요청 방지

동일한 mutation 요청이 중복 실행되지 않도록 axios 요청을 정규화해 in-flight 요청을 재사용합니다.
버튼 단위로도 비동기 처리 중 클릭을 막아 중복 저장과 중복 결제를 줄입니다.

## 문서 링크

- [Spec](https://docs.google.com/spreadsheets/d/1y5An1r5wMXSMTQPvI4N7ahxKFxeL8jKXqveL0prBrEk/edit?gid=0#gid=0)
- [ERD](https://www.erdcloud.com/d/jihoxxucLefwcYJMj)
- [Figma](https://www.figma.com/design/23TrLwzZlitTNLkalzGG44/GreenCarry?node-id=0-1&t=219nPYaQOkhi9IX7-1)

## 개선 과제

- 백엔드 Spring Security 권한 정책을 `permitAll` 중심에서 API 권한 검증 중심으로 강화
- JWT secret, DB 계정, 외부 API key를 환경변수 기반으로 완전 분리
- refresh token 저장소를 Redis로 분리하고 중복 로그인 방지 필터 활성화
- 주문/결제 실패, Toss 결제 취소, 포인트 롤백 예외 케이스 테스트 강화
- 관리자 기능에 감사 로그와 운영 로그 추가
- 주문 상태 변경 이벤트에 대한 서버 단위 테스트 보강
- 이미지 업로드 파일 크기와 타입 검증 강화
- 공통 API 응답 포맷과 에러 코드 표준화
- JavaScript 기반 프론트 코드를 TypeScript로 점진 전환
- 프론트 라우트 단위 lazy loading과 성능 최적화

## 프로젝트 한 줄 요약

GreenCarry는 친환경 배달이라는 도메인을 기반으로 고객 주문 경험, 점주 운영 기능, 관리자 백오피스, 결제/알림/포인트/탄소 절감량을 통합 구현한 풀스택 웹 서비스입니다.
