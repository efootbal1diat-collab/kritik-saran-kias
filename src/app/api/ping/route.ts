import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Transaksi Read: Query layanan aktif
    const { data: services, error: readError } = await supabase
      .from("services")
      .select("id")
      .limit(1);

    if (readError) {
      return NextResponse.json(
        { status: "error", message: readError.message },
        { status: 500 }
      );
    }

    // 2. Transaksi Write: Update timestamp heartbeat di database
    // Ini memaksa engine PostgreSQL mencatat aktivitas write (WAL log)
    // sehingga Supabase Free Tier 100% mendeteksi komputasi aktif dan tidak ter-pause
    const nowIso = new Date().toISOString();
    await supabase
      .from("admin_settings")
      .update({ updated_at: nowIso })
      .eq("id", 1);

    return NextResponse.json({
      status: "ok",
      timestamp: nowIso,
      active: true,
      services_found: Boolean(services && services.length > 0)
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
