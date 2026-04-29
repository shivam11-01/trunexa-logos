import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  try {
    const { logoName, brandId } = await req.json();

    if (!logoName || !brandId) {
      return NextResponse.json({ error: "Missing logoName or brandId" }, { status: 400 });
    }

    // Fetch all rows in this logo group so we can clean up storage
    const { data: rows, error: fetchError } = await supabaseAdmin
      .from("logos")
      .select("id, storage_path")
      .eq("brand_id", brandId)
      .eq("name", logoName);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Delete all DB rows for this logo group
    const { error: dbError } = await supabaseAdmin
      .from("logos")
      .delete()
      .eq("brand_id", brandId)
      .eq("name", logoName);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Remove all associated storage files
    const storagePaths = (rows ?? [])
      .map((r) => r.storage_path)
      .filter(Boolean) as string[];

    if (storagePaths.length > 0) {
      await supabaseAdmin.storage.from("logos").remove(storagePaths);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
