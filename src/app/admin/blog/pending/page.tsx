import { redirect } from "next/navigation";

export default function AdminBlogPendingPage() {
  redirect("/admin/blog/articles?status=pending");
}
