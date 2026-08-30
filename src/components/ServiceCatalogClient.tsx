"use client";

import dynamic from "next/dynamic";

const ServiceCatalog = dynamic(() => import("@/components/ServiceCatalog"), { ssr: false });

export default function ServiceCatalogClient() {
  return <ServiceCatalog />;
}
