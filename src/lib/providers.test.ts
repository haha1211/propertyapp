import { describe, expect, it } from "vitest";
import { MockTransactionPriceProvider, parseFinlifeMortgageProduct, parsePublicApartmentTradeItem } from "./providers";

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

  it("normalizes a Finlife mortgage product fixture", () => {
    const result = parseFinlifeMortgageProduct(
      { fin_prdt_cd: "M001", kor_co_nm: "테스트은행", fin_prdt_nm: "주담대" },
      { lend_rate_min: "3.5", lend_rate_max: "4.2" }
    );

    expect(result.bankName).toBe("테스트은행");
    expect(result.minRate).toBe(3.5);
  });
});
