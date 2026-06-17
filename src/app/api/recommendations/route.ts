import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getRecommendations } from "@/server/recommendation-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recommendations = await getRecommendations(body);
    return NextResponse.json({ recommendations });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "입력값을 확인해주세요.",
          issues: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "추천 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
      },
      { status: 500 }
    );
  }
}
