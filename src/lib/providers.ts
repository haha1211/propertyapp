import type { ApartmentTransaction, BuyerPreferences, MortgageProduct } from "./types";

export interface TransactionPriceProvider {
  findTransactions(preferences: BuyerPreferences): Promise<ApartmentTransaction[]>;
}

export interface MortgageProductProvider {
  findMortgageProducts(): Promise<MortgageProduct[]>;
}

export const mockTransactions: ApartmentTransaction[] = [
  {
    id: "apt-001",
    apartmentName: "마포 리버파크",
    region: "서울 마포구",
    neighborhood: "공덕동",
    areaM2: 59.9,
    floor: 12,
    buildYear: 2017,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 6,
    tradePrice: 880000000,
    tradedAt: "2026-04-15"
  },
  {
    id: "apt-002",
    apartmentName: "성수 브릿지타운",
    region: "서울 성동구",
    neighborhood: "성수동",
    areaM2: 84.5,
    floor: 8,
    buildYear: 2012,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 9,
    tradePrice: 1450000000,
    tradedAt: "2026-03-28"
  },
  {
    id: "apt-003",
    apartmentName: "분당 그린뷰",
    region: "경기 성남시 분당구",
    neighborhood: "정자동",
    areaM2: 72.6,
    floor: 15,
    buildYear: 2009,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 5,
    tradePrice: 980000000,
    tradedAt: "2026-05-03"
  },
  {
    id: "apt-004",
    apartmentName: "김포 라온하임",
    region: "경기 김포시",
    neighborhood: "장기동",
    areaM2: 84.9,
    floor: 18,
    buildYear: 2020,
    rooms: 4,
    nearStation: false,
    stationDistanceMinutes: 18,
    tradePrice: 610000000,
    tradedAt: "2026-04-21"
  },
  {
    id: "apt-005",
    apartmentName: "송도 센트럴스테이",
    region: "인천 연수구",
    neighborhood: "송도동",
    areaM2: 74.8,
    floor: 22,
    buildYear: 2019,
    rooms: 3,
    nearStation: true,
    stationDistanceMinutes: 11,
    tradePrice: 720000000,
    tradedAt: "2026-05-12"
  }
];

export const mockMortgageProducts: MortgageProduct[] = [
  {
    id: "loan-001",
    bankName: "하나은행",
    productName: "하나 아파트론",
    minRate: 3.65,
    maxRate: 4.7,
    rateType: "mixed",
    maxLtv: 0.7
  },
  {
    id: "loan-002",
    bankName: "국민은행",
    productName: "KB 주택담보대출",
    minRate: 3.82,
    maxRate: 4.9,
    rateType: "fixed",
    maxLtv: 0.68
  },
  {
    id: "loan-003",
    bankName: "신한은행",
    productName: "신한 주택대출",
    minRate: 3.74,
    maxRate: 4.85,
    rateType: "variable",
    maxLtv: 0.7
  }
];

export class MockTransactionPriceProvider implements TransactionPriceProvider {
  async findTransactions(preferences: BuyerPreferences) {
    const region = preferences.region.trim();
    return mockTransactions.filter((transaction) => {
      const inRegion = transaction.region.includes(region) || transaction.neighborhood.includes(region) || region.includes(transaction.region.split(" ")[0]);
      const aboveMinArea = preferences.minAreaM2 ? transaction.areaM2 >= preferences.minAreaM2 : true;
      const belowMaxArea = preferences.maxAreaM2 ? transaction.areaM2 <= preferences.maxAreaM2 : true;
      const aboveMinPrice = preferences.minPrice ? transaction.tradePrice >= preferences.minPrice : true;
      const belowMaxPrice = preferences.maxPrice ? transaction.tradePrice <= preferences.maxPrice : true;
      return inRegion && aboveMinArea && belowMaxArea && aboveMinPrice && belowMaxPrice;
    });
  }
}

export class MockMortgageProductProvider implements MortgageProductProvider {
  async findMortgageProducts() {
    return mockMortgageProducts;
  }
}

export function parsePublicApartmentTradeItem(item: Record<string, unknown>): ApartmentTransaction {
  const priceText = String(item.dealAmount ?? item.거래금액 ?? "0").replace(/,/g, "").trim();
  const year = String(item.dealYear ?? item.년 ?? "");
  const month = String(item.dealMonth ?? item.월 ?? "").padStart(2, "0");
  const day = String(item.dealDay ?? item.일 ?? "").padStart(2, "0");
  const exclusiveArea = Number(item.excluUseAr ?? item.전용면적 ?? 0);

  return {
    id: String(item.aptSeq ?? item.아파트일련번호 ?? item.id ?? "unknown"),
    apartmentName: String(item.aptNm ?? item.아파트 ?? "이름 미상"),
    region: String(item.sggCd ?? item.지역코드 ?? "지역 미상"),
    neighborhood: String(item.umdNm ?? item.법정동 ?? ""),
    areaM2: exclusiveArea,
    floor: Number(item.floor ?? item.층 ?? 0),
    buildYear: Number(item.buildYear ?? item.건축년도 ?? 0),
    rooms: exclusiveArea >= 80 ? 4 : exclusiveArea >= 55 ? 3 : 2,
    nearStation: false,
    tradePrice: Number(priceText) * 10000,
    tradedAt: year && month && day ? `${year}-${month}-${day}` : "날짜 미상"
  };
}

export function parseFinlifeMortgageProduct(base: Record<string, unknown>, option?: Record<string, unknown>): MortgageProduct {
  const minRate = Number(option?.lend_rate_min ?? option?.lendRateMin ?? base.lend_rate_min ?? 0);
  const maxRate = Number(option?.lend_rate_max ?? option?.lendRateMax ?? base.lend_rate_max ?? minRate);

  return {
    id: String(base.fin_prdt_cd ?? base.id ?? base.finPrdtCd ?? "unknown"),
    bankName: String(base.kor_co_nm ?? base.bankName ?? "은행 미상"),
    productName: String(base.fin_prdt_nm ?? base.productName ?? "상품명 미상"),
    minRate,
    maxRate,
    rateType: "mixed",
    maxLtv: 0.7
  };
}
