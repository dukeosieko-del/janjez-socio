import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-kenya-green mx-auto mb-4" />
            <p>Completing sign-in…</p>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
