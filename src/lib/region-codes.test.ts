import { describe, expect, it } from "vitest";
import { ProviderError } from "./provider-errors";
import { resolveRegionCode } from "./region-codes";

describe("resolveRegionCode", () => {
  it("maps supported Korean region names to lawd codes", () => {
    expect(resolveRegionCode("마포구")).toMatchObject({ code: "11440", label: "서울 마포구" });
    expect(resolveRegionCode("송도동")).toMatchObject({ code: "28185", label: "인천 연수구" });
  });

  it("throws a provider error for unsupported regions", () => {
    expect(() => resolveRegionCode("부산 해운대구")).toThrow(ProviderError);
  });
});
