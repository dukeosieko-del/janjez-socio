import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/mailer";
import { getArticlePublishedEmail, getArticleRejectedEmail } from "@/lib/email/templates";
import { SITE_URL } from "@/lib/email/config";

export interface BlogNotificationPayload {
  postId: string;
  postTitle: string;
  postSlug: string;
  authorId: string;
  status: "published" | "rejected";
  rejectionReason?: string;
}

export async function notifyAuthorOfPublication(payload: BlogNotificationPayload): Promise<void> {
  const supabase = createAdminClient();
  if (!supabase) return;

  try {
    if (payload.status === "published") {
      const { data: author } = await supabase.from("profiles").select("email, full_name").eq("id", payload.authorId).single();

      if (author?.email) {
        const { subject, html, text } = getArticlePublishedEmail({
          authorName: author.full_name || "Author",
          articleTitle: payload.postTitle,
          articleUrl: `${SITE_URL}/blog/${payload.postSlug}`,
        });

        await sendEmail({
          to: { address: author.email, name: author.full_name || "" },
          subject,
          html,
          text,
        }).catch((err) => console.error("[blog-email] publish notification failed:", err));
      }

      await supabase.from("notifications").insert({
        user_id: payload.authorId,
        audience: "user",
        category: "system",
        severity: "success",
        title: "Article Published",
        body: `Your article "${payload.postTitle}" has been published.`,
        link: `/blog/${payload.postSlug}`,
      }).then(() => {}, (err) => console.error("[blog-notification] publish notification insert failed:", err));
    } else if (payload.status === "rejected") {
      const { data: author } = await supabase.from("profiles").select("email, full_name").eq("id", payload.authorId).single();

      if (author?.email) {
        const { subject, html, text } = getArticleRejectedEmail({
          authorName: author.full_name || "Author",
          articleTitle: payload.postTitle,
          reason: payload.rejectionReason,
          articleUrl: `${SITE_URL}/blog/${payload.postSlug}/edit`,
        });

        await sendEmail({
          to: { address: author.email, name: author.full_name || "" },
          subject,
          html,
          text,
        }).catch((err) => console.error("[blog-email] reject notification failed:", err));
      }

      await supabase.from("notifications").insert({
        user_id: payload.authorId,
        audience: "user",
        category: "system",
        severity: "warning",
        title: "Article Rejected",
        body: `Your article "${payload.postTitle}" was not approved.${payload.rejectionReason ? ` Reason: ${payload.rejectionReason}` : ""}`,
        link: `/blog/${payload.postSlug}/edit`,
      }).then(() => {}, (err) => console.error("[blog-notification] reject notification insert failed:", err));
    }
  } catch (error) {
    console.error("[blog-notification] failed:", error);
  }
}
