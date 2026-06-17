import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import RecommendationApp from "./RecommendationApp";

const recommendation = {
  transaction: {
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
  mortgageProduct: {
    id: "loan-001",
    bankName: "하나은행",
    productName: "하나 아파트론",
    minRate: 3.65,
    maxRate: 4.7,
    rateType: "mixed",
    maxLtv: 0.7
  },
  score: 94,
  estimatedLoanAmount: 530000000,
  estimatedMonthlyInterest: 1612083,
  cashShortfall: 0,
  affordable: true,
  reasons: ["월 이자 한도 안에 들어옵니다.", "방 3개로 희망 조건을 만족합니다."]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RecommendationApp", () => {
  it("submits conditions and renders recommendations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ recommendations: [recommendation] })
      }))
    );

    render(<RecommendationApp />);
    await userEvent.click(screen.getByRole("button", { name: "추천 받기" }));

    await waitFor(() => expect(screen.getByText("마포 리버파크")).toBeInTheDocument());
    expect(screen.getByText("추천 결과 1건")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/recommendations", expect.objectContaining({ method: "POST" }));
  });
});
