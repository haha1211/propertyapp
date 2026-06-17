# Project Context

## Product Goal
사용자가 원하는 지역, 보유 현금, 월 이자 가능액, 방 개수, 역세권 여부, 면적/가격 조건을 입력하면 아파트 후보를 추천하는 웹앱 MVP입니다.

## Current Implementation
- Stack: Next.js App Router, TypeScript, Tailwind CSS, Vitest, Testing Library.
- Data mode: Mock 실거래가와 Mock 주택담보대출 상품을 기본으로 사용하며, `.env.local`의 API 키와 `USE_REAL_*` 플래그가 있으면 실제 provider로 전환합니다.
- Recommendation priority: 월 이자 부담 가능성, 현금/대출 충당 가능성, 집 조건 일치, 가격 매력도 순서입니다.
- Area handling: 사용자는 평수로 입력하고, 내부 필터링과 추천 계산은 ㎡로 변환해 수행합니다.

## Planned External APIs
- Apartment transactions: 국토교통부 아파트 실거래가 공공데이터 API 후보.
- Mortgage products: 금융감독원 금융상품통합비교공시 주택담보대출 API 후보.
- 실제 API 구현 전에는 공식 문서의 키 발급 방식, 응답 필드, 호출 제한을 다시 확인해야 합니다.

## Scope Boundaries
- MVP는 한국 아파트 매매 추천만 대상으로 합니다.
- 로그인, 저장한 검색 조건, 지도 보기, 실제 매물 중개 플랫폼 연동은 후속 범위입니다.
- 대출 결과는 실제 승인 여부가 아니라 공개 금리 기반 단순 추정치입니다.
- DSR/LTV/지역 규제 정밀 반영은 후속 고도화 항목입니다.

## Real API Test Notes
- `MOLIT_API_KEY`와 `RUN_INTEGRATION_TESTS=true`가 있으면 국토교통부 실거래가 provider가 실제 네트워크 호출을 수행합니다.
- `FINLIFE_API_KEY`와 `RUN_INTEGRATION_TESTS=true`가 있으면 금융감독원 주택담보대출 provider가 실제 네트워크 호출을 수행합니다.
- 키가 없을 때 integration test는 skip되고 unit/parser/provider selection test만 실행됩니다.
