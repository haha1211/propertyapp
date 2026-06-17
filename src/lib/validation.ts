import { z } from "zod";

const moneySchema = z.coerce.number().finite().nonnegative();
const optionalNumber = z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.number().finite().optional());

export const buyerPreferencesSchema = z
  .object({
    region: z.string().trim().min(1, "지역을 입력해주세요."),
    cashOnHand: moneySchema.min(1000000, "보유 현금은 100만원 이상이어야 합니다."),
    maxMonthlyInterest: moneySchema.min(10000, "월 이자 가능액은 1만원 이상이어야 합니다."),
    minRooms: z.coerce.number().int().min(1).max(6),
    nearStation: z.coerce.boolean().default(false),
    minAreaM2: optionalNumber,
    maxAreaM2: optionalNumber,
    minPrice: optionalNumber,
    maxPrice: optionalNumber
  })
  .superRefine((value, ctx) => {
    if (value.maxMonthlyInterest > 20000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxMonthlyInterest"],
        message: "월 이자 가능액이 너무 큽니다. 2천만원 이하로 입력해주세요."
      });
    }
    if (value.minAreaM2 && value.maxAreaM2 && value.minAreaM2 > value.maxAreaM2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxAreaM2"],
        message: "최대 면적은 최소 면적보다 커야 합니다."
      });
    }
    if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxPrice"],
        message: "최대 가격은 최소 가격보다 커야 합니다."
      });
    }
  });

export type BuyerPreferencesInput = z.input<typeof buyerPreferencesSchema>;
