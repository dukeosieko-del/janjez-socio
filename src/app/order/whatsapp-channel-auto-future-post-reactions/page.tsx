import { Suspense } from "react";
import WhatsAppChannelAutoFuturePostReactionsClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function WhatsAppChannelAutoFuturePostReactionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <WhatsAppChannelAutoFuturePostReactionsClient />
    </Suspense>
  );
}
