import { Suspense } from "react";
import YouTubeOrderClient from "./page-client";
import { getJanjezServicesByCategory } from "@/lib/server/dynamic-services";

export const dynamic = "force-dynamic";

export default async function YouTubeOrderPage() {
  const services = await getJanjezServicesByCategory("youtube");

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-kenya-black text-kenya-white">Loading...</div>}>
      <YouTubeOrderClient services={services} />
    </Suspense>
  );
}