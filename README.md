# PropertyApp

원하는 지역, 보유 현금, 월 이자 부담 가능액, 주거 조건을 입력하면 실거래가와 대출 상품 데이터를 바탕으로 아파트 후보를 추천하는 MVP입니다.

## 개발

```bash
npm install
npm run dev
```

## 테스트

```bash
npm test
```

## 실 API 연동

`.env.local`에 아래 값을 설정하면 Mock provider 대신 실제 API provider를 사용할 수 있습니다.

```bash
MOLIT_API_KEY=공공데이터포털_국토부_API_키
FINLIFE_API_KEY=금융감독원_금융상품_API_키
USE_REAL_ESTATE_API=true
USE_REAL_MORTGAGE_API=true
```

실제 네트워크 integration test는 기본으로 skip됩니다. 키를 설정한 뒤 아래처럼 실행하면 실제 API 호출까지 검증합니다.

```bash
REAL_API_INTEGRATION_TESTS=true npm test
# 또는 한쪽만 검증
MOLIT_INTEGRATION_TESTS=true npm test
FINLIFE_INTEGRATION_TESTS=true npm test
```
