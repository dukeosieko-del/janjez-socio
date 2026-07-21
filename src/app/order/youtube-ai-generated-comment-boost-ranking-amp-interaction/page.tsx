import { Suspense } from "react";
import YouTubeAICommentsClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function YouTubeAICommentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <YouTubeAICommentsClient />
    </Suspense>
  );
}
