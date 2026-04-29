import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const brandId = formData.get("brand_id") as string;
    const brandSlug = formData.get("brand_slug") as string;
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const fileType = formData.get("file_type") as string;

    if (!file || !brandId || !brandSlug || !name || !color || !fileType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Build the unique storage path
    const filename = `${Date.now()}-${file.name}`;
    const storagePath = `${brandSlug}/${color}/${filename}`;

    // Upload to Supabase Storage using the admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from("logos")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(storagePath);

    // Insert the logo record into the database
    const { data: logo, error: dbError } = await supabaseAdmin
      .from("logos")
      .insert([{
        brand_id: brandId,
        name,
        variant: "Primary",
        color,
        file_type: fileType,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
      }])
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ logo }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
