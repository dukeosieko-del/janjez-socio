import { Suspense } from "react";
import YouTubeWatchTimeClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function YouTubeWatchTimePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <YouTubeWatchTimeClient />
    </Suspense>
  );
}
