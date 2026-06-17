import { describe, expect, it } from "vitest";
import { rankRecommendations } from "./recommendations";
import type { ApartmentTransaction, BuyerPreferences, MortgageProduct } from "./types";

const mortgageProducts: MortgageProduct[] = [
  { id: "loan", bankName: "테스트은행", productName: "테스트론", minRate: 3.6, maxRate: 4.5, rateType: "mixed", maxLtv: 0.7 }
];

const transactions: ApartmentTransaction[] = [
  {
    id: "expensive",
    apartmentName: "비싼 아파트",
    region: "서울 마포구",
    neighborhood: "공덕동",
    areaM2: 84,
    floor: 10,
    buildYear: 2018,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 5,
    tradePrice: 1400000000,
    tradedAt: "2026-05-01"
  },
  {
    id: "fit",
    apartmentName: "맞는 아파트",
    region: "서울 마포구",
    neighborhood: "공덕동",
    areaM2: 59,
    floor: 8,
    buildYear: 2016,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 7,
    tradePrice: 800000000,
    tradedAt: "2026-05-02"
  }
];

const preferences: BuyerPreferences = {
  region: "서울",
  cashOnHand: 350000000,
  maxMonthlyInterest: 1500000,
  minRooms: 3,
  nearStation: true
};

describe("rankRecommendations", () => {
  it("prioritizes homes inside the monthly interest budget", () => {
    const result = rankRecommendations(transactions, mortgageProducts, preferences);

    expect(result[0].transaction.id).toBe("fit");
    expect(result[0].affordable).toBe(true);
    expect(result[1].affordable).toBe(false);
  });

  it("adds condition match reasons", () => {
    const [first] = rankRecommendations([transactions[1]], mortgageProducts, preferences);

    expect(first.reasons.join(" ")).toContain("방 3개");
    expect(first.reasons.join(" ")).toContain("역까지 약 7분");
  });

  it("returns an empty list when there are no candidates", () => {
    expect(rankRecommendations([], mortgageProducts, preferences)).toEqual([]);
  });
});
