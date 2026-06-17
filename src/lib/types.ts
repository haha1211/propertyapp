export type BuyerPreferences = {
  region: string;
  cashOnHand: number;
  maxMonthlyInterest: number;
  minRooms: number;
  nearStation: boolean;
  minAreaM2?: number;
  maxAreaM2?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type ApartmentTransaction = {
  id: string;
  apartmentName: string;
  region: string;
  neighborhood: string;
  areaM2: number;
  floor: number;
  buildYear: number;
  rooms: number;
  nearStation: boolean;
  stationDistanceMinutes?: number;
  tradePrice: number;
  tradedAt: string;
};

export type MortgageProduct = {
  id: string;
  bankName: string;
  productName: string;
  minRate: number;
  maxRate: number;
  rateType: "fixed" | "variable" | "mixed";
  maxLtv: number;
};

export type Recommendation = {
  transaction: ApartmentTransaction;
  mortgageProduct: MortgageProduct;
  score: number;
  estimatedLoanAmount: number;
  estimatedMonthlyInterest: number;
  cashShortfall: number;
  affordable: boolean;
  reasons: string[];
};
