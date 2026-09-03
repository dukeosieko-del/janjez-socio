import { NextResponse } from "next/server";
import { getCategories } from "@/lib/blog/queries";
import { blogCategories } from "@/lib/blog/data";

export async function GET() {
  try {
    const categories = await getCategories();
    if (categories.length > 0) {
      return NextResponse.json({ ok: true, categories });
    }
  } catch (error) {
    console.error("Blog categories API error:", error);
  }

  // Fallback to static data
  return NextResponse.json({ ok: true, categories: blogCategories });
}
