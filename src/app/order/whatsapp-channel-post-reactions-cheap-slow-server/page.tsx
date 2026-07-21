import { Suspense } from "react";
import WhatsAppChannelPostReactionsCheapSlowServerClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function WhatsAppChannelPostReactionsCheapSlowServerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <WhatsAppChannelPostReactionsCheapSlowServerClient />
    </Suspense>
  );
}
