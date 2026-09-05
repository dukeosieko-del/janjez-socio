import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { notifyAuthorOfPublication } from "@/lib/blog/notifications";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof Response) return admin;

  try {
    const body = await request.json();
    const { postId, postTitle, postSlug, authorId, status, rejectionReason } = body;

    if (!postId || !postTitle || !postSlug || !authorId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await notifyAuthorOfPublication({
      postId,
      postTitle,
      postSlug,
      authorId,
      status,
      rejectionReason,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
