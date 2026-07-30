import { Suspense } from "react";
import WhatsAppClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function WhatsAppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <WhatsAppClient />
    </Suspense>
  );
}
