import { Suspense } from "react";
import XTwitterPageClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function XTwitterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <XTwitterPageClient />
    </Suspense>
  );
}
