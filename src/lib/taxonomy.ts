export interface TaxonomyDeliverable {
  name: string;
  price: string;
  minQty?: number;
  maxQty?: number;
  note?: string;
  flag?: string;
}

export interface TaxonomySubcategory {
  name: string;
  deliverables: TaxonomyDeliverable[];
}

export interface TaxonomyPlatform {
  id: string;
  name: string;
  icon: string;
  featured: boolean;
  subcategories: TaxonomySubcategory[];
}

export const FEATURED_PLATFORM_IDS = new Set([
  "facebook",
  "tiktok",
  "instagram",
  "youtube",
  "whatsapp",
  "telegram",
  "x",
]);

export const TAXONOMY_PLATFORMS: TaxonomyPlatform[] = [
  {
    id: "facebook",
    name: "Facebook",
    icon: "/icons/services/facebook.svg",
    featured: true,
    subcategories: [
      {
        name: "Followers",
        deliverables: [
          { name: "Fast Speed (no refill)", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Global Non-Drop", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Post Likes",
        deliverables: [
          { name: "No Warranty", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Recommended 30-Day", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Lifetime Warranty", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Comments",
        deliverables: [
          { name: "Custom", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Post Reactions",
        deliverables: [
          { name: "Like", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Love", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Haha", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Video Views",
        deliverables: [
          { name: "Standard", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium High Retention", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Story Views",
        deliverables: [
          { name: "Story Views", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Page Likes + Followers",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Live Stream Viewers",
        deliverables: [
          { name: "15 min", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "30 min", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "45 min", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "210 min", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Optimization & Audit",
        deliverables: [
          { name: "Page/Profile Audit", minQty: 1, maxQty: 1, price: "0 Ksh", },
        ],
      },
      {
        name: "Group Join",
        deliverables: [
          { name: "Standard", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Post Shares",
        deliverables: [
          { name: "Power Reach Lifetime Warranty", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Facebook Reports",
        deliverables: [
          { name: "Account Report", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
          { name: "Page Report", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
          { name: "Post Report", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "/icons/services/tiktok.svg",
    featured: true,
    subcategories: [
      {
        name: "Followers",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Starter", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Real & Permanent Likes",
        deliverables: [
          { name: "1000 Likes", minQty: 1000, maxQty: 1000, price: "0 Ksh", },
          { name: "2500 Likes", minQty: 2500, maxQty: 2500, price: "0 Ksh", },
          { name: "5000 Likes", minQty: 5000, maxQty: 5000, price: "0 Ksh", },
          { name: "10000 Likes", minQty: 10000, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Likes",
        deliverables: [
          { name: "Standard", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Views",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Kenyan Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Comments",
        deliverables: [
          { name: "Custom", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Random Positive", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Video Shares",
        deliverables: [
          { name: "Instant Start", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Livestream Comments",
        deliverables: [
          { name: "Random", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Custom", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Video Favorites",
        deliverables: [
          { name: "Save", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Lifetime Save", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Live Boost",
        deliverables: [
          { name: "15 min Starter", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "60 min Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "120 min Premium", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Livestream Likes",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "PK Battle Points",
        deliverables: [
          { name: "PK Battle Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "/icons/services/instagram.svg",
    featured: true,
    subcategories: [
      {
        name: "Followers",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Likes",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Video Views",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Comments",
        deliverables: [
          { name: "Recommended Random", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Custom Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Comment Likes",
        deliverables: [
          { name: "With Username Max 20K", minQty: 10, maxQty: 20000, price: "0 Ksh", },
        ],
      },
      {
        name: "Shares",
        deliverables: [
          { name: "Variant 1", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Variant 2", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Story Save Shares Impression",
        deliverables: [
          { name: "Reach + Impressions 50K/day", minQty: 10, maxQty: 50000, price: "0 Ksh", },
        ],
      },
      {
        name: "Repost",
        deliverables: [
          { name: "Starter Pack", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Repost + Reach", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Impression Services",
        deliverables: [
          { name: "Reach + Impression 1M Cap", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "/icons/services/youtube.svg",
    featured: true,
    subcategories: [
      {
        name: "Subscribers",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Views",
        deliverables: [
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Monetizable Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Likes",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "AI-Generated Comment",
        deliverables: [
          { name: "Custom Refill 30D", minQty: 10, maxQty: 5000, price: "0 Ksh", },
          { name: "AI Auto-Generated", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Watch Time",
        deliverables: [
          { name: "60min Plus", minQty: 100, maxQty: 4000, price: "0 Ksh", },
          { name: "10-20min", minQty: 50, maxQty: 4000, price: "0 Ksh", },
          { name: "30min", minQty: 50, maxQty: 4000, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "/icons/services/whatsapp.svg",
    featured: true,
    subcategories: [
      {
        name: "Channel Followers",
        deliverables: [
          { name: "Premium Shield", minQty: 100, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Poll Votes",
        deliverables: [
          { name: "Pool A", minQty: 20, maxQty: 5000, price: "0 Ksh", },
          { name: "Pool B", minQty: 50, maxQty: 10000, price: "0 Ksh", },
          { name: "Pool C", minQty: 30, maxQty: 15000, price: "0 Ksh", },
          { name: "Pool D", minQty: 50, maxQty: 25000, price: "0 Ksh", },
          { name: "Pool E", minQty: 100, maxQty: 50000, price: "0 Ksh", },
        ],
      },
      {
        name: "Channel Post Reactions",
        deliverables: [
          { name: "Thumbs Up", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Heart", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Laughing", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Surprised", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Sad", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Praying Hands", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Fire", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Trophy", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Party", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Clap", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Cool", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Angry", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Wow", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Poop", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Middle Finger", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Thumbs Down", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Broken Heart", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Muscle", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Vomiting", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Money Flying", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Skull", minQty: 50, maxQty: 100000, price: "0 Ksh", },
          { name: "Random Mix", minQty: 50, maxQty: 100000, price: "0 Ksh", },
        ],
      },
      {
        name: "Channel Auto Future Post Reactions",
        deliverables: [
          { name: "Laughing Next 500 Posts", minQty: 1, maxQty: 500, price: "0 Ksh", },
          { name: "Heart Next 500 Posts", minQty: 1, maxQty: 500, price: "0 Ksh", },
          { name: "Thumbs Up Next 500 Posts", minQty: 1, maxQty: 500, price: "0 Ksh", },
          { name: "Mix Next 25 Posts", minQty: 1, maxQty: 25, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "/icons/services/telegram.svg",
    featured: true,
    subcategories: [
      {
        name: "Comments",
        deliverables: [
          { name: "Germany Random", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Russia Random", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Post Views",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Crypto NFT Retweets",
        deliverables: [
          { name: "NFT Retweet", minQty: 10, maxQty: 50000, price: "0 Ksh", },
        ],
      },
      {
        name: "Post Shares Search Optimize",
        deliverables: [
          { name: "Germany", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Israel", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Channel Members",
        deliverables: [
          { name: "Recommended", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Premium Shield", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "Quick Boost", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Premium Members",
        deliverables: [
          { name: "Plus Views", minQty: 10, maxQty: 20000, price: "0 Ksh", },
          { name: "English Names", minQty: 10, maxQty: 100000, price: "0 Ksh", },
          { name: "20-30 Days Premium", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Reactions",
        deliverables: [
          { name: "Heart", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
        ],
      },
    ],
  },
  {
    id: "x",
    name: "X",
    icon: "/icons/services/x.svg",
    featured: true,
    subcategories: [
      {
        name: "Comments",
        deliverables: [
          { name: "Random 50-100/day", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Comments Crypto Packages",
        deliverables: [
          { name: "Custom Crypto Bot 1K/day", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Crypto NFT Followers",
        deliverables: [
          { name: "NFT 100/5k 300/day", minQty: 10, maxQty: 5000, price: "0 Ksh", },
        ],
      },
      {
        name: "Favorites Likes",
        deliverables: [
          { name: "20/4K", minQty: 20, maxQty: 4000, price: "0 Ksh", },
          { name: "20/10K", minQty: 20, maxQty: 10000, price: "0 Ksh", },
          { name: "10/5K", minQty: 10, maxQty: 5000, price: "0 Ksh", },
        ],
      },
      {
        name: "Followers Refill",
        deliverables: [
          { name: "500/500k Less Drop", minQty: 10, maxQty: 500000, price: "0 Ksh", },
        ],
      },
      {
        name: "Live Viewers",
        deliverables: [
          { name: "30 min Non-Drop", minQty: 10, maxQty: 10000, price: "0 Ksh", },
          { name: "15 min Non-Drop", minQty: 10, maxQty: 10000, price: "0 Ksh", },
        ],
      },
      {
        name: "Mentions",
        deliverables: [
          { name: "User Followers 1-2k/day", minQty: 10, maxQty: 5000, price: "0 Ksh", },
        ],
      },
      {
        name: "Nigeria Bundle",
        deliverables: [
          { name: "Followers Nigeria 5k/day", minQty: 10, maxQty: 5000, price: "0 Ksh", },
        ],
      },
      {
        name: "Poll Votes",
        deliverables: [
          { name: "100/1M 200k/day", minQty: 10, maxQty: 1000000, price: "0 Ksh", },
        ],
      },
      {
        name: "Retweets",
        deliverables: [
          { name: "5/5K", minQty: 5, maxQty: 5000, price: "0 Ksh", },
        ],
      },
      {
        name: "Space Listeners",
        deliverables: [
          { name: "120 min", minQty: 10, maxQty: 100000, price: "0 Ksh", },
          { name: "5 min", minQty: 10, maxQty: 100000, price: "0 Ksh", },
          { name: "30 min", minQty: 10, maxQty: 100000, price: "0 Ksh", },
        ],
      },
      {
        name: "Stats",
        deliverables: [
          { name: "Link Click 10M/day", minQty: 10, maxQty: 100000000, price: "0 Ksh", },
        ],
      },
      {
        name: "Views Country Targeted",
        deliverables: [
          { name: "US", minQty: 10, maxQty: 50000000, price: "0 Ksh", },
          { name: "Denmark", minQty: 10, maxQty: 50000000, price: "0 Ksh", },
        ],
      },
    ],
  },
];

export function getTaxonomyPlatform(platformId: string): TaxonomyPlatform | undefined {
  return TAXONOMY_PLATFORMS.find((p) => p.id === platformId);
}

export function getTaxonomySubcategory(
  platformId: string,
  subcategoryName: string
): TaxonomySubcategory | undefined {
  const platform = getTaxonomyPlatform(platformId);
  if (!platform) return undefined;
  return platform.subcategories.find((s) => s.name === subcategoryName);
}

export function getTaxonomyDeliverable(
  platformId: string,
  subcategoryName: string,
  deliverableName: string
): TaxonomyDeliverable | undefined {
  const sub = getTaxonomySubcategory(platformId, subcategoryName);
  if (!sub) return undefined;
  return sub.deliverables.find((d) => d.name === deliverableName);
}

export function isFeaturedPlatform(platformId: string): boolean {
  return FEATURED_PLATFORM_IDS.has(platformId);
}

export function normalizeProviderCategory(rawCategory: string): string {
  const c = rawCategory.trim().toLowerCase();

  const aliasMap: Record<string, string> = {
    "x (twitter)": "x",
    "x": "x",
    "twitter": "x",
    "google maps": "google-maps",
    "google maps reviews": "google-maps",
    "google": "google-maps",
    "facebook": "facebook",
    "tiktok": "tiktok",
    "instagram": "instagram",
    "youtube": "youtube",
    "whatsapp": "whatsapp",
    "telegram": "telegram",
    "spotify": "spotify",
    "twitch": "twitch",
    "discord": "discord",
    "reddit": "reddit",
    "threads": "threads",
    "linkedin": "linkedin",
    "pinterest": "pinterest",
    "soundcloud": "soundcloud",
    "kick": "kick",
    "snapchat": "snapchat",
  };

  if (aliasMap[c]) return aliasMap[c];

  return c.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function inferSubcategoryFromProviderName(
  platformId: string,
  providerName: string
): string {
  const lower = providerName.toLowerCase();

  if (platformId === "facebook") {
    if (lower.includes("follower")) return "Followers";
    if (lower.includes("like") && !lower.includes("comment")) return "Post Likes";
    if (lower.includes("comment")) return "Comments";
    if (lower.includes("reaction")) return "Post Reactions";
    if (lower.includes("view") && !lower.includes("story")) return "Video Views";
    if (lower.includes("story")) return "Story Views";
    if (lower.includes("page")) return "Page Likes + Followers";
    if (lower.includes("live") || lower.includes("stream")) return "Live Stream Viewers";
    if (lower.includes("audit") || lower.includes("optimization")) return "Optimization & Audit";
    if (lower.includes("group")) return "Group Join";
    if (lower.includes("share")) return "Post Shares";
    if (lower.includes("report")) return "Facebook Reports";
    return "Other";
  }

  if (platformId === "tiktok") {
    if (lower.includes("follower")) return "Followers";
    if (lower.includes("real") && lower.includes("like")) return "Real & Permanent Likes";
    if (lower.includes("like") && !lower.includes("comment")) return "Likes";
    if (lower.includes("view") && !lower.includes("live")) return "Views";
    if (lower.includes("comment")) return "Comments";
    if (lower.includes("share")) return "Video Shares";
    if (lower.includes("livestream") && lower.includes("comment")) return "Livestream Comments";
    if (lower.includes("favorite") || lower.includes("save")) return "Video Favorites";
    if (lower.includes("live boost") || lower.includes("live") && lower.includes("viewer")) return "Live Boost";
    if (lower.includes("livestream") && lower.includes("like")) return "Livestream Likes";
    if (lower.includes("pk") || lower.includes("battle")) return "PK Battle Points";
    return "Other";
  }

  if (platformId === "instagram") {
    if (lower.includes("follower")) return "Followers";
    if (lower.includes("like") && !lower.includes("comment")) return "Likes";
    if (lower.includes("view") && !lower.includes("story")) return "Video Views";
    if (lower.includes("comment")) return "Comments";
    if (lower.includes("comment like")) return "Comment Likes";
    if (lower.includes("share")) return "Shares";
    if (lower.includes("story") || lower.includes("impression")) return "Story Save Shares Impression";
    if (lower.includes("repost")) return "Repost";
    if (lower.includes("impression")) return "Impression Services";
    return "Other";
  }

  if (platformId === "youtube") {
    if (lower.includes("subscriber")) return "Subscribers";
    if (lower.includes("view")) return "Views";
    if (lower.includes("like")) return "Likes";
    if (lower.includes("comment") || lower.includes("ai")) return "AI-Generated Comment";
    if (lower.includes("watch") || lower.includes("hour")) return "Watch Time";
    return "Other";
  }

  if (platformId === "whatsapp") {
    if (lower.includes("channel") && lower.includes("follower")) return "Channel Followers";
    if (lower.includes("poll")) return "Poll Votes";
    if (lower.includes("reaction")) return "Channel Post Reactions";
    if (lower.includes("auto") || lower.includes("future")) return "Channel Auto Future Post Reactions";
    return "Other";
  }

  if (platformId === "telegram") {
    if (lower.includes("comment")) return "Comments";
    if (lower.includes("view") && !lower.includes("member")) return "Post Views";
    if (lower.includes("crypto") || lower.includes("nft")) return "Crypto NFT Retweets";
    if (lower.includes("share") || lower.includes("search")) return "Post Shares Search Optimize";
    if (lower.includes("member") && !lower.includes("premium")) return "Channel Members";
    if (lower.includes("premium")) return "Premium Members";
    if (lower.includes("reaction")) return "Reactions";
    return "Other";
  }

  if (platformId === "x") {
    if (lower.includes("comment") && !lower.includes("crypto")) return "Comments";
    if (lower.includes("comment") && lower.includes("crypto")) return "Comments Crypto Packages";
    if (lower.includes("crypto") || lower.includes("nft")) return "Crypto NFT Followers";
    if (lower.includes("favorite") || lower.includes("like")) return "Favorites Likes";
    if (lower.includes("follower") && lower.includes("refill")) return "Followers Refill";
    if (lower.includes("live") && lower.includes("viewer")) return "Live Viewers";
    if (lower.includes("mention")) return "Mentions";
    if (lower.includes("nigeria")) return "Nigeria Bundle";
    if (lower.includes("poll")) return "Poll Votes";
    if (lower.includes("retweet")) return "Retweets";
    if (lower.includes("space")) return "Space Listeners";
    if (lower.includes("stat")) return "Stats";
    if (lower.includes("view") && lower.includes("country")) return "Views Country Targeted";
    return "Other";
  }

  return "Other";
}
