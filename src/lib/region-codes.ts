import { ProviderError } from "./provider-errors";

export type SupportedRegion = {
  code: string;
  label: string;
  aliases: string[];
};

export const SUPPORTED_REGIONS: SupportedRegion[] = [
  { code: "11140", label: "서울 중구", aliases: ["서울", "서울시", "중구", "서울 중구"] },
  { code: "11440", label: "서울 마포구", aliases: ["마포", "마포구", "서울 마포구", "공덕", "공덕동"] },
  { code: "11200", label: "서울 성동구", aliases: ["성동", "성동구", "서울 성동구", "성수", "성수동"] },
  { code: "41135", label: "경기 성남시 분당구", aliases: ["분당", "분당구", "성남 분당구", "성남시 분당구", "정자", "정자동"] },
  { code: "41570", label: "경기 김포시", aliases: ["김포", "김포시", "장기", "장기동"] },
  { code: "28185", label: "인천 연수구", aliases: ["연수", "연수구", "인천 연수구", "송도", "송도동"] }
];

export function resolveRegionCode(input: string) {
  const normalized = input.trim().replace(/\s+/g, " ");
  const compact = normalized.replace(/\s/g, "");
  const match = SUPPORTED_REGIONS.find((region) => {
    return region.aliases.some((alias) => {
      const aliasCompact = alias.replace(/\s/g, "");
      return normalized === alias || compact.includes(aliasCompact) || aliasCompact.includes(compact);
    });
  });

  if (!match) {
    throw new ProviderError(
      "MOLIT",
      "UNSUPPORTED_REGION",
      `아직 지원하지 않는 지역입니다. 현재 지원 지역: ${SUPPORTED_REGIONS.map((region) => region.label).join(", ")}`
    );
  }

  return match;
}
