import { NextResponse } from "next/server";
import { getTags } from "@/lib/blog/queries";
import { blogTags } from "@/lib/blog/data";

export async function GET() {
  try {
    const tags = await getTags();
    if (tags.length > 0) {
      return NextResponse.json({ ok: true, tags });
    }
  } catch (error) {
    console.error("Blog tags API error:", error);
  }

  // Fallback to static data
  return NextResponse.json({ ok: true, tags: blogTags });
}
