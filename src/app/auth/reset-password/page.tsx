import { Suspense } from "react";
import ResetPasswordClient from "./page-client";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
