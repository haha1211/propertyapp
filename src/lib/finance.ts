import type { ApartmentTransaction, MortgageProduct } from "./types";

export function calculateLoanAmount(price: number, cashOnHand: number, maxLtv = 0.7) {
  const requiredLoan = Math.max(price - cashOnHand, 0);
  const ltvLimit = Math.floor(price * maxLtv);
  return Math.min(requiredLoan, ltvLimit);
}

export function calculateCashShortfall(price: number, cashOnHand: number, loanAmount: number) {
  return Math.max(price - cashOnHand - loanAmount, 0);
}

export function calculateMonthlyInterest(loanAmount: number, annualRatePercent: number) {
  return Math.round((loanAmount * (annualRatePercent / 100)) / 12);
}

export function pickBestMortgageProduct(products: MortgageProduct[]) {
  if (products.length === 0) {
    throw new Error("대출 상품 데이터가 없습니다.");
  }
  return [...products].sort((a, b) => a.minRate - b.minRate || b.maxLtv - a.maxLtv)[0];
}

export function estimateAffordability(transaction: ApartmentTransaction, product: MortgageProduct, cashOnHand: number) {
  const estimatedLoanAmount = calculateLoanAmount(transaction.tradePrice, cashOnHand, product.maxLtv);
  const estimatedMonthlyInterest = calculateMonthlyInterest(estimatedLoanAmount, product.minRate);
  const cashShortfall = calculateCashShortfall(transaction.tradePrice, cashOnHand, estimatedLoanAmount);

  return {
    estimatedLoanAmount,
    estimatedMonthlyInterest,
    cashShortfall
  };
}
