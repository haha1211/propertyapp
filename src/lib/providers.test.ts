import { describe, expect, it } from "vitest";
import {
  MockTransactionPriceProvider,
  buildFinlifeMortgageUrl,
  buildMolitTradeUrl,
  getDefaultDealMonth,
  parseFinlifeMortgagePayload,
  parseFinlifeMortgageProduct,
  parseMolitApartmentTradePayload,
  parsePublicApartmentTradeItem
} from "./providers";

describe("providers", () => {
  it("filters mock transactions by region", async () => {
    const provider = new MockTransactionPriceProvider();
    const result = await provider.findTransactions({
      region: "김포",
      cashOnHand: 300000000,
      maxMonthlyInterest: 1200000,
      minRooms: 3,
      nearStation: false
    });

    expect(result).toHaveLength(1);
    expect(result[0].apartmentName).toBe("김포 라온하임");
  });

  it("normalizes a public apartment trade fixture", () => {
    const result = parsePublicApartmentTradeItem({
      aptSeq: "123",
      aptNm: "테스트아파트",
      sggCd: "11680",
      umdNm: "역삼동",
      excluUseAr: "84.9",
      floor: "11",
      buildYear: "2015",
      dealAmount: "120,000",
      dealYear: "2026",
      dealMonth: "5",
      dealDay: "9"
    });

    expect(result.tradePrice).toBe(1200000000);
    expect(result.tradedAt).toBe("2026-05-09");
    expect(result.rooms).toBe(4);
  });

  it("normalizes a MOLIT XML fixture", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <response>
        <header><resultCode>00</resultCode><resultMsg>NORMAL SERVICE.</resultMsg></header>
        <body><items><item>
          <aptSeq>11440-1</aptSeq><aptNm>마포테스트</aptNm><umdNm>공덕동</umdNm>
          <excluUseAr>59.9</excluUseAr><floor>9</floor><buildYear>2018</buildYear>
          <dealAmount>88,000</dealAmount><dealYear>2026</dealYear><dealMonth>5</dealMonth><dealDay>3</dealDay>
        </item></items></body>
      </response>`;

    const [result] = parseMolitApartmentTradePayload(xml, "서울 마포구");

    expect(result.apartmentName).toBe("마포테스트");
    expect(result.region).toBe("서울 마포구");
    expect(result.tradePrice).toBe(880000000);
  });

  it("normalizes a Finlife mortgage product fixture", () => {
    const result = parseFinlifeMortgageProduct(
      { fin_prdt_cd: "M001", kor_co_nm: "테스트은행", fin_prdt_nm: "주담대" },
      { lend_rate_min: "3.5", lend_rate_max: "4.2", lend_rate_type_nm: "고정금리" }
    );

    expect(result.bankName).toBe("테스트은행");
    expect(result.minRate).toBe(3.5);
    expect(result.rateType).toBe("fixed");
  });

  it("normalizes a Finlife API payload", () => {
    const result = parseFinlifeMortgagePayload({
      result: {
        err_cd: "000",
        baseList: [{ fin_prdt_cd: "M001", kor_co_nm: "테스트은행", fin_prdt_nm: "주담대" }],
        optionList: [{ fin_prdt_cd: "M001", kor_co_nm: "테스트은행", lend_rate_min: "3.6", lend_rate_max: "4.6" }]
      }
    });

    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe("주담대");
  });

  it("builds real API URLs", () => {
    expect(buildMolitTradeUrl("abc+123", "11440", "202605")).toContain("serviceKey=abc%2B123");
    expect(buildFinlifeMortgageUrl("fin-key")).toContain("mortgageLoanProductsSearch.json");
    expect(getDefaultDealMonth(new Date("2026-06-17T00:00:00+09:00"))).toBe("202605");
  });
});
