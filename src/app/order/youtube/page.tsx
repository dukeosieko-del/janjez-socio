import { Suspense } from "react";
import YouTubeOrderClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function YouTubeOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <YouTubeOrderClient />
    </Suspense>
  );
}
