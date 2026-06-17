import { XMLParser } from "fast-xml-parser";
import { ProviderError } from "./provider-errors";
import { resolveRegionCode } from "./region-codes";
import type { ApartmentTransaction, BuyerPreferences, MortgageProduct } from "./types";

const MOLIT_ENDPOINT = "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";
const FINLIFE_MORTGAGE_ENDPOINT = "https://finlife.fss.or.kr/finlifeapi/mortgageLoanProductsSearch.json";

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
    return filterTransactions(
      mockTransactions.filter((transaction) => {
        const inRegion = transaction.region.includes(region) || transaction.neighborhood.includes(region) || region.includes(transaction.region.split(" ")[0]);
        return inRegion;
      }),
      preferences
    );
  }
}

export class MockMortgageProductProvider implements MortgageProductProvider {
  async findMortgageProducts() {
    return mockMortgageProducts;
  }
}

export class MolitApartmentTradeProvider implements TransactionPriceProvider {
  constructor(private readonly apiKey: string, private readonly dealMonth = getDefaultDealMonth()) {}

  async findTransactions(preferences: BuyerPreferences) {
    const region = resolveRegionCode(preferences.region);
    const url = buildMolitTradeUrl(this.apiKey, region.code, this.dealMonth);
    const response = await fetch(url, { headers: { Accept: "application/json, application/xml, text/xml" } });

    if (!response.ok) {
      throw mapHttpError("MOLIT", response.status);
    }

    const payload = await response.text();
    const parsed = parseMolitApartmentTradePayload(payload, region.label);
    const filtered = filterTransactions(parsed, preferences);

    if (filtered.length === 0) {
      throw new ProviderError("MOLIT", "NO_DATA", "조건에 맞는 실거래가 데이터가 없습니다.");
    }

    return filtered;
  }
}

export class FinlifeMortgageProductProvider implements MortgageProductProvider {
  constructor(private readonly apiKey: string) {}

  async findMortgageProducts() {
    const url = buildFinlifeMortgageUrl(this.apiKey);
    const response = await fetch(url, { headers: { Accept: "application/json" } });

    if (!response.ok) {
      throw mapHttpError("FINLIFE", response.status);
    }

    const payload = await response.json();
    const products = parseFinlifeMortgagePayload(payload);

    if (products.length === 0) {
      throw new ProviderError("FINLIFE", "NO_DATA", "주택담보대출 상품 데이터가 없습니다.");
    }

    return products;
  }
}

export function getDefaultDealMonth(date = new Date()) {
  const target = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${target.getFullYear()}${String(target.getMonth() + 1).padStart(2, "0")}`;
}

export function buildMolitTradeUrl(apiKey: string, lawdCode: string, dealMonth: string) {
  const serviceKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
  return `${MOLIT_ENDPOINT}?serviceKey=${serviceKey}&LAWD_CD=${lawdCode}&DEAL_YMD=${dealMonth}&pageNo=1&numOfRows=1000`;
}

export function buildFinlifeMortgageUrl(apiKey: string) {
  const url = new URL(FINLIFE_MORTGAGE_ENDPOINT);
  url.searchParams.set("auth", apiKey);
  url.searchParams.set("topFinGrpNo", "020000");
  url.searchParams.set("pageNo", "1");
  return url.toString();
}

export function parseMolitApartmentTradePayload(payload: string, regionLabel = "지역 미상") {
  const trimmed = payload.trim();
  try {
    const parsed = trimmed.startsWith("{") ? JSON.parse(trimmed) : new XMLParser({ ignoreAttributes: false }).parse(trimmed);
    const header = parsed?.response?.header ?? parsed?.OpenAPI_ServiceResponse?.cmmMsgHeader;
    const resultCode = String(header?.resultCode ?? header?.returnReasonCode ?? "00");
    const resultMessage = String(header?.resultMsg ?? header?.returnAuthMsg ?? "");

    if (resultCode !== "00" && resultCode !== "0") {
      throw classifyOpenApiError("MOLIT", resultCode, resultMessage);
    }

    const rawItems = parsed?.response?.body?.items?.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    return items.filter(Boolean).map((item) => parsePublicApartmentTradeItem(item, regionLabel));
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new ProviderError("MOLIT", "PARSE", "실거래가 API 응답을 해석하지 못했습니다.");
  }
}

export function parseFinlifeMortgagePayload(payload: unknown) {
  const result = (payload as { result?: { baseList?: Record<string, unknown>[]; optionList?: Record<string, unknown>[]; err_cd?: string; err_msg?: string } }).result;
  if (!result) {
    throw new ProviderError("FINLIFE", "PARSE", "금융상품 API 응답 형식이 올바르지 않습니다.");
  }

  if (result.err_cd && result.err_cd !== "000") {
    throw classifyOpenApiError("FINLIFE", result.err_cd, result.err_msg ?? "");
  }

  const bases = result.baseList ?? [];
  const options = result.optionList ?? [];
  return bases
    .map((base) => {
      const productOptions = options.filter((option) => option.fin_prdt_cd === base.fin_prdt_cd && option.kor_co_nm === base.kor_co_nm);
      const bestOption = productOptions.sort((a, b) => Number(a.lend_rate_min ?? Number.POSITIVE_INFINITY) - Number(b.lend_rate_min ?? Number.POSITIVE_INFINITY))[0];
      return parseFinlifeMortgageProduct(base, bestOption);
    })
    .filter((product) => product.minRate > 0)
    .sort((a, b) => a.minRate - b.minRate);
}

export function parsePublicApartmentTradeItem(item: Record<string, unknown>, regionLabel?: string): ApartmentTransaction {
  const priceText = String(item.dealAmount ?? item.거래금액 ?? "0").replace(/,/g, "").trim();
  const year = String(item.dealYear ?? item.년 ?? "");
  const month = String(item.dealMonth ?? item.월 ?? "").padStart(2, "0");
  const day = String(item.dealDay ?? item.일 ?? "").padStart(2, "0");
  const exclusiveArea = Number(item.excluUseAr ?? item.전용면적 ?? 0);
  const neighborhood = String(item.umdNm ?? item.법정동 ?? "").trim();
  const apartmentName = String(item.aptNm ?? item.아파트 ?? "이름 미상").trim();

  return {
    id: String(item.aptSeq ?? item.아파트일련번호 ?? `${apartmentName}-${year}${month}${day}-${exclusiveArea}`),
    apartmentName,
    region: regionLabel ?? String(item.sggCd ?? item.지역코드 ?? "지역 미상"),
    neighborhood,
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
  const rateTypeName = String(option?.lend_rate_type_nm ?? option?.lendRateTypeName ?? "");

  return {
    id: String(base.fin_prdt_cd ?? base.id ?? base.finPrdtCd ?? "unknown"),
    bankName: String(base.kor_co_nm ?? base.bankName ?? "은행 미상"),
    productName: String(base.fin_prdt_nm ?? base.productName ?? "상품명 미상"),
    minRate,
    maxRate,
    rateType: resolveRateType(rateTypeName),
    maxLtv: 0.7
  };
}

function filterTransactions(transactions: ApartmentTransaction[], preferences: BuyerPreferences) {
  return transactions.filter((transaction) => {
    const aboveMinArea = preferences.minAreaM2 ? transaction.areaM2 >= preferences.minAreaM2 : true;
    const belowMaxArea = preferences.maxAreaM2 ? transaction.areaM2 <= preferences.maxAreaM2 : true;
    const aboveMinPrice = preferences.minPrice ? transaction.tradePrice >= preferences.minPrice : true;
    const belowMaxPrice = preferences.maxPrice ? transaction.tradePrice <= preferences.maxPrice : true;
    return aboveMinArea && belowMaxArea && aboveMinPrice && belowMaxPrice;
  });
}

function resolveRateType(rateTypeName: string): MortgageProduct["rateType"] {
  if (rateTypeName.includes("고정")) return "fixed";
  if (rateTypeName.includes("변동")) return "variable";
  return "mixed";
}

function mapHttpError(provider: string, status: number) {
  if (status === 401 || status === 403) {
    return new ProviderError(provider, "AUTH", "API 인증에 실패했습니다.", status);
  }
  if (status === 429) {
    return new ProviderError(provider, "RATE_LIMIT", "API 호출 한도를 초과했습니다.", status);
  }
  return new ProviderError(provider, "NETWORK", "API 호출에 실패했습니다.", status);
}

function classifyOpenApiError(provider: string, code: string, message: string) {
  const normalized = `${code} ${message}`.toLowerCase();
  if (normalized.includes("auth") || normalized.includes("service key") || normalized.includes("인증") || normalized.includes("key")) {
    return new ProviderError(provider, "AUTH", message || "API 인증에 실패했습니다.");
  }
  if (normalized.includes("limit") || normalized.includes("quota") || normalized.includes("트래픽")) {
    return new ProviderError(provider, "RATE_LIMIT", message || "API 호출 한도를 초과했습니다.");
  }
  return new ProviderError(provider, "NETWORK", message || "API 응답 오류가 발생했습니다.");
}
