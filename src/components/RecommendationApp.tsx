"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Calculator, Loader2, MapPin, Search, TrainFront } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { buyerPreferencesSchema, type BuyerPreferencesInput } from "@/lib/validation";
import type { Recommendation } from "@/lib/types";

const defaultValues: BuyerPreferencesInput = {
  region: "서울",
  cashOnHand: 350000000,
  maxMonthlyInterest: 1600000,
  minRooms: 3,
  nearStation: true,
  minAreaM2: 55,
  maxAreaM2: undefined,
  minPrice: undefined,
  maxPrice: 1000000000
};

function formatWon(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(value % 100000000 === 0 ? 0 : 1)}억원`;
  }
  return `${Math.round(value / 10000).toLocaleString("ko-KR")}만원`;
}

function formatNumberInput(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : "";
}

export default function RecommendationApp() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<BuyerPreferencesInput>({
    resolver: zodResolver(buyerPreferencesSchema),
    defaultValues
  });

  const watched = watch();
  const monthlyInterest = useMemo(() => Number(watched.maxMonthlyInterest || 0), [watched.maxMonthlyInterest]);

  async function onSubmit(values: BuyerPreferencesInput) {
    setError(null);
    setHasSearched(true);
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = await response.json();

    if (!response.ok) {
      setRecommendations([]);
      setError(payload.message ?? "추천 결과를 불러오지 못했습니다.");
      return;
    }

    setRecommendations(payload.recommendations ?? []);
  }

  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:px-8">
          <div className="flex items-center gap-3 text-accent">
            <Building2 aria-hidden="true" className="h-7 w-7" />
            <span className="text-sm font-semibold uppercase tracking-wide">PropertyApp MVP</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-ink md:text-5xl">내 현금 흐름에 맞는 아파트 후보 찾기</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                지역, 보유 현금, 월 이자 가능액, 방 개수와 역세권 조건을 넣으면 Mock 실거래가와 주택담보대출 상품으로 추천 순위를 계산합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface p-4">
              <div>
                <p className="text-xs font-semibold text-muted">월 이자 한도</p>
                <p className="mt-1 text-xl font-bold text-ink">{formatWon(monthlyInterest)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted">데이터 모드</p>
                <p className="mt-1 text-xl font-bold text-ink">Mock API</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 md:px-8 lg:grid-cols-[380px_1fr]">
        <form aria-label="추천 조건 입력" onSubmit={handleSubmit(onSubmit)} className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            <Calculator aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-ink">추천 조건</h2>
          </div>

          <label className="block text-sm font-semibold text-ink">
            원하는 지역
            <input className="mt-2 w-full rounded-md border border-line px-3 py-2" placeholder="서울, 마포구, 분당..." {...register("region")} />
          </label>
          {errors.region && <p className="mt-1 text-sm text-coral">{errors.region.message}</p>}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="block text-sm font-semibold text-ink">
              보유 현금
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="1000000" {...register("cashOnHand", { valueAsNumber: true })} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              월 이자 가능액
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="100000" {...register("maxMonthlyInterest", { valueAsNumber: true })} />
            </label>
          </div>
          {(errors.cashOnHand || errors.maxMonthlyInterest) && (
            <p className="mt-1 text-sm text-coral">{errors.cashOnHand?.message ?? errors.maxMonthlyInterest?.message}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-ink">
              최소 방 개수
              <select className="mt-2 w-full rounded-md border border-line px-3 py-2" {...register("minRooms", { valueAsNumber: true })}>
                {[1, 2, 3, 4, 5, 6].map((room) => (
                  <option key={room} value={room}>{room}개 이상</option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 text-sm font-semibold text-ink">
              <input className="h-5 w-5 accent-accent" type="checkbox" {...register("nearStation")} />
              역세권 선호
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-ink">
              최소 면적(㎡)
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="1" {...register("minAreaM2", { setValueAs: formatNumberInput })} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              최대 면적(㎡)
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="1" {...register("maxAreaM2", { setValueAs: formatNumberInput })} />
            </label>
          </div>
          {errors.maxAreaM2 && <p className="mt-1 text-sm text-coral">{errors.maxAreaM2.message}</p>}

          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-ink">
              최소 가격
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="10000000" {...register("minPrice", { setValueAs: formatNumberInput })} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              최대 가격
              <input className="mt-2 w-full rounded-md border border-line px-3 py-2" type="number" step="10000000" {...register("maxPrice", { setValueAs: formatNumberInput })} />
            </label>
          </div>
          {errors.maxPrice && <p className="mt-1 text-sm text-coral">{errors.maxPrice.message}</p>}

          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-bold text-white transition hover:bg-ink" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> : <Search aria-hidden="true" className="h-5 w-5" />}
            추천 받기
          </button>

          <p className="mt-4 text-xs leading-5 text-muted">대출 가능 여부와 규제 적용은 실제 심사 결과가 아니며, MVP에서는 공개 금리 기반 단순 추정치로만 계산합니다.</p>
        </form>

        <div className="min-w-0">
          {error && <div role="alert" className="mb-4 rounded-lg border border-coral bg-white p-4 text-coral">{error}</div>}

          {!hasSearched && (
            <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
              <MapPin aria-hidden="true" className="mx-auto h-10 w-10 text-accent" />
              <h2 className="mt-3 text-xl font-bold text-ink">조건을 입력하고 추천을 받아보세요</h2>
              <p className="mt-2 text-muted">기본값으로 서울 지역의 Mock 실거래 데이터를 바로 조회할 수 있습니다.</p>
            </div>
          )}

          {hasSearched && recommendations.length === 0 && !error && (
            <div className="rounded-lg border border-line bg-white p-8 text-center shadow-soft">
              <h2 className="text-xl font-bold text-ink">조건에 맞는 후보가 없습니다</h2>
              <p className="mt-2 text-muted">지역이나 가격 범위를 넓히면 더 많은 후보를 볼 수 있습니다.</p>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-ink">추천 결과 {recommendations.length}건</h2>
                <span className="rounded-md border border-line bg-white px-3 py-1 text-sm font-semibold text-muted">월부담 우선 정렬</span>
              </div>

              {recommendations.map((item) => (
                <article key={item.transaction.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-bold text-ink">{item.transaction.apartmentName}</h3>
                        <span className="rounded-md bg-surface px-2 py-1 text-sm font-bold text-accent">점수 {item.score}</span>
                      </div>
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-muted">
                        <MapPin aria-hidden="true" className="h-4 w-4" />
                        {item.transaction.region} {item.transaction.neighborhood} · {item.transaction.areaM2}㎡ · 방 {item.transaction.rooms}개
                        {item.transaction.nearStation && <TrainFront aria-label="역세권" className="h-4 w-4 text-accent" />}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4 md:min-w-[430px]">
                      <div>
                        <p className="text-xs font-semibold text-muted">최근 거래가</p>
                        <p className="mt-1 font-bold text-ink">{formatWon(item.transaction.tradePrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted">예상 대출</p>
                        <p className="mt-1 font-bold text-ink">{formatWon(item.estimatedLoanAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted">월 이자</p>
                        <p className="mt-1 font-bold text-ink">{formatWon(item.estimatedMonthlyInterest)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted">대출 상품</p>
                        <p className="mt-1 font-bold text-ink">{item.mortgageProduct.bankName}</p>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-2">
                    {item.reasons.map((reason) => (
                      <li key={reason} className="rounded-md bg-surface px-3 py-2">{reason}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
