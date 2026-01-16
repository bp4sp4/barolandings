import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Node.js 런타임을 명시적으로 설정
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// 환경 변수가 없을 때를 대비한 클라이언트 생성
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: NextRequest) {
  // 함수 시작 로그 (배포 환경에서도 확인 가능하도록)
  console.log("=== POST /api/submit called ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Environment:", process.env.NODE_ENV);

  try {
    const body = await request.json();
    const { name, contact, privacyAgreed, clickSource } = body;

    console.log("Request body received:", {
      name,
      contact,
      privacyAgreed,
      clickSource,
    });

    // 필수 필드 검증
    if (!name || !contact) {
      return NextResponse.json(
        { error: "이름과 연락처를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { error: "개인정보 처리방침에 동의해주세요." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 가져오기
    console.log("Getting Supabase client...");
    console.log(
      "Supabase URL configured:",
      !!process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    console.log(
      "Supabase Service Key configured:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error("Supabase client is null - configuration missing");
      return NextResponse.json(
        { error: "데이터베이스 연결 설정이 필요합니다." },
        { status: 500 }
      );
    }

    console.log("Supabase client created successfully");

    // Supabase에 데이터 저장
    console.log("Inserting data into Supabase...");
    const { data, error } = await supabase
      .from("consultations")
      .insert([
        {
          name,
          contact,
          is_completed: false, // 신청 시에는 미완료 상태
          click_source: clickSource || "unknown", // 클릭 출처 추적
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      console.error("Supabase error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          error: "데이터 저장 중 오류가 발생했습니다.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Data inserted successfully:", data);

    console.log("=== Request processed successfully ===");
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : undefined
    );
    console.error(
      "Full error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
