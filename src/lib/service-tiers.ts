import { TIERS, type ServiceTier, getTierInfo, filterServicesByTier } from "@/lib/janjez-services";
import { listJanjezServices } from "@/lib/janjez-services";
import type { JanjezService } from "@/lib/janjez-services";
import ServiceDenseList from "@/components/ServiceDenseList";

export const TIER_TITLES: Record<ServiceTier, { title: string; description: string }> = {
  champion: {
    title: "Champion Packages",
    description: "Budget-friendly essentials — under KES 2,000",
  },
  premium: {
    title: "Premium Packages",
    description: "Mid-tier services — KES 2,000 to KES 6,000",
  },
  enterprise: {
    title: "Enterprise Packages",
    description: "High-volume solutions — above KES 6,000",
  },
};

export interface TierPageProps {
  tier: ServiceTier;
}

export interface TierData {
  tier: ServiceTier;
  title: string;
  description: string;
  tierInfo: ReturnType<typeof getTierInfo>;
  services: JanjezService[];
}

export async function fetchTierData(tier: ServiceTier): Promise<TierData> {
  const allServices = await listJanjezServices(true, "show_catalogue");
  const tierInfo = getTierInfo(tier);
  const filtered = filterServicesByTier(allServices, tier);
  const { title, description } = TIER_TITLES[tier];

  return {
    tier,
    title,
    description,
    tierInfo,
    services: filtered,
  };
}
