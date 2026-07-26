export interface Deliverable {
  name: string;
  price: string;
  note?: string;
}

export interface Subcategory {
  name: string;
  count: number;
  deliverables: Deliverable[];
  note?: string;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  modalSize: 'small' | 'large';
  subcategories: Subcategory[];
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/icons/services/facebook.svg',
    href: '/services/facebook',
    modalSize: 'small',
    subcategories: [
      {
        name: 'Followers',
        count: 3,
        deliverables: [
          { name: 'Fast Speed (no refill)', price: '0.0999 Ksh' },
          { name: 'Recommended ⭐ (Most Popular)', price: '0.1496 Ksh' },
          { name: '🌍 Global [Real Active] Non-Drop', price: '0.5002 Ksh' },
        ],
      },
      {
        name: 'Post Likes',
        count: 3,
        deliverables: [
          { name: 'No Warranty 🚀', price: '0.099 Ksh' },
          { name: 'Recommended — 30-Day Warranty', price: '0.5002 Ksh' },
          { name: '🇰🇪🌍 Lifetime Warranty', price: '1 Ksh' },
        ],
      },
      {
        name: 'Comments',
        count: 1,
        deliverables: [
          { name: 'Custom — write your own', price: '0.5332 Ksh' },
        ],
      },
      {
        name: 'Post Reactions',
        count: 3,
        deliverables: [
          { name: 'Like 👍', price: '0.0695 Ksh' },
          { name: 'Love ❤️', price: '0.1698 Ksh' },
          { name: 'Haha 😂', price: '0.1499 Ksh' },
        ],
      },
      {
        name: 'Video Views',
        count: 2,
        deliverables: [
          { name: 'Standard ⭐ (Most Popular)', price: '0.0135 Ksh' },
          { name: 'Premium (High Retention)', price: '0.0518 Ksh' },
        ],
      },
      {
        name: 'Story Views',
        count: 1,
        deliverables: [
          { name: 'Story views 👀', price: '0.209 Ksh' },
        ],
      },
      {
        name: 'Page Likes + Followers',
        count: 3,
        deliverables: [
          { name: 'Recommended (Most Popular)', price: '0.2014 Ksh' },
          { name: 'Quick Boost', price: '0.3544 Ksh' },
          { name: 'Premium Shield 👑', price: '0.405 Ksh' },
        ],
      },
      {
        name: 'Live Stream Viewers',
        count: 4,
        deliverables: [
          { name: '15 minutes', price: '0.143 Ksh' },
          { name: '30 minutes', price: '0.2859 Ksh' },
          { name: '45 minutes', price: '0.4288 Ksh' },
          { name: '210 minutes', price: '2 Ksh' },
        ],
      },
      {
        name: 'Optimization & Audit',
        count: 1,
        deliverables: [
          { name: 'Page/Profile audit + growth guidance', price: '1 Ksh' },
        ],
      },
      {
        name: 'Group Join',
        count: 1,
        deliverables: [
          { name: 'Standard ⭐ (Most Popular)', price: '0.4002 Ksh' },
        ],
      },
      {
        name: 'Post Shares',
        count: 1,
        deliverables: [
          { name: 'Power Reach (Lifetime Warranty)', price: '0.0603 Ksh' },
        ],
      },
      {
        name: 'Facebook Reports',
        count: 3,
        deliverables: [
          { name: 'Account Report', price: '1.3 Ksh' },
          { name: 'Page Report', price: '1.3 Ksh' },
          { name: 'Post Report', price: '1.3 Ksh' },
        ],
        note: 'All three run 500–1K/day, max 1M.',
      },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '/icons/services/tiktok.svg',
    href: '/services/tiktok',
    modalSize: 'small',
    subcategories: [
      {
        name: 'Followers',
        count: 3,
        deliverables: [
          { name: 'Recommended ⭐', price: '0.6513 Ksh' },
          { name: 'Starter ⚡', price: '0.3839 Ksh' },
          { name: 'Premium Shield 👑', price: '0.8855 Ksh' },
        ],
      },
      {
        name: 'Real & Permanent Likes ⭐ Recommended',
        count: 4,
        deliverables: [
          { name: '🚀 Growth — 1,000 likes', price: '700 Ksh' },
          { name: '🔥 Creator — 2,500 likes', price: '1,650 Ksh' },
          { name: '👑 Viral — 5,000 likes', price: '3,200 Ksh' },
          { name: '💎 Ultimate — 10,000 likes', price: '6,000 Ksh' },
        ],
        note: 'Fixed bundles, not per-unit. Order note says to put a WhatsApp number in the link field — not a TikTok URL.',
      },
      {
        name: 'Likes ❤️',
        count: 1,
        deliverables: [
          { name: 'Recommended (Most Popular)', price: '0.087 Ksh' },
        ],
      },
      {
        name: 'Views 👀',
        count: 3,
        deliverables: [
          { name: 'Recommended (Most Popular)', price: '0.1046 Ksh' },
          { name: 'Quick Boost', price: '0.0395 Ksh' },
          { name: '🇰🇪 Kenyan — Premium Shield', price: '0.0377 Ksh' },
        ],
      },
      {
        name: 'Comments',
        count: 2,
        deliverables: [
          { name: '💎 Custom — you write them', price: '1.3 Ksh' },
          { name: '🏆 Random positive text (English)', price: '1.8 Ksh' },
        ],
      },
      {
        name: 'Video Shares',
        count: 1,
        deliverables: [
          { name: 'Instant start', price: '0.0484 Ksh' },
        ],
      },
      {
        name: 'Livestream Comments',
        count: 2,
        deliverables: [
          { name: 'Random, superfast', price: '0.1479 Ksh' },
          { name: 'Custom — write your own', price: '0.1994 Ksh' },
        ],
      },
      {
        name: 'Video Favorites',
        count: 2,
        deliverables: [
          { name: 'Save', price: '0.093 Ksh' },
          { name: 'Lifetime save (unlimited max)', price: '0.2441 Ksh' },
        ],
      },
      {
        name: 'Live Boost 🔴',
        count: 3,
        deliverables: [
          { name: '15 minutes (Starter)', price: '0.398 Ksh' },
          { name: '60 minutes (Recommended ⭐)', price: '1.6 Ksh' },
          { name: '120 minutes (Premium 👑)', price: '2.3 Ksh' },
        ],
      },
      {
        name: 'Livestream Likes',
        count: 2,
        deliverables: [
          { name: 'Recommended ⭐', price: '0.0152 Ksh' },
          { name: 'Premium Shield 👑', price: '0.0125 Ksh' },
        ],
      },
      {
        name: 'PK Battle Points',
        count: 1,
        deliverables: [
          { name: '🔥 PK Battle Boost', price: '0.0363 Ksh' },
        ],
      },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '/icons/services/instagram.svg',
    href: '/services/instagram',
    modalSize: 'small',
    subcategories: [
      {
        name: 'Followers',
        count: 3,
        deliverables: [
          { name: 'Recommended ⭐ (Most Popular)', price: '0.1549 Ksh' },
          { name: 'Quick Boost ⚡', price: '0.1681 Ksh' },
          { name: 'Premium Shield 👑', price: '0.299 Ksh' },
        ],
      },
      {
        name: 'Likes',
        count: 3,
        deliverables: [
          { name: 'Recommended ⭐ (Most Popular)', price: '0.08 Ksh' },
          { name: 'Quick Boost ⚡', price: '0.05 Ksh' },
          { name: 'Premium Shield 👑', price: '0.1553 Ksh' },
        ],
      },
      {
        name: 'Video Views',
        count: 2,
        deliverables: [
          { name: 'Recommended ⭐ (Most Popular)', price: '0.038 Ksh' },
          { name: 'Quick Boost ⚡', price: '0.028 Ksh' },
        ],
      },
      {
        name: 'Comments',
        count: 2,
        deliverables: [
          { name: 'Recommended (Random)', price: '0.1323 Ksh' },
          { name: 'Custom — Premium Shield 👑', price: '0.2641 Ksh' },
        ],
      },
      {
        name: 'Comment Likes',
        count: 1,
        deliverables: [
          { name: 'With username — max 20K', price: '0.1992 Ksh' },
        ],
      },
      {
        name: 'Shares',
        count: 2,
        deliverables: [
          { name: 'Unlimited, 100k/day, instant', price: '0.02 Ksh' },
          { name: 'Unlimited, 100k/day, instant (duplicate SKU)', price: '0.0028 Ksh' },
        ],
      },
      {
        name: 'Story | Save | Shares | Impression',
        count: 1,
        deliverables: [
          { name: 'Reach + impressions, 50k/day, 30-day refill', price: '0.0416 Ksh' },
        ],
      },
      {
        name: 'Repost',
        count: 2,
        deliverables: [
          { name: 'Starter pack 🚀 (cheap)', price: '0.1011 Ksh' },
          { name: 'Repost + Reach — Most popular ⭐ (best value)', price: '0.2014 Ksh' },
        ],
      },
      {
        name: 'Impression Services',
        count: 1,
        deliverables: [
          { name: 'Reach + Impression [1M] ⛔', price: '0.0452 Ksh' },
        ],
      },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '/icons/services/youtube.svg',
    href: '/services/youtube',
    modalSize: 'large',
    subcategories: [
      {
        name: 'Subscribers',
        count: 1,
        deliverables: [
          { name: 'Recommended ⭐ (Most Popular)', price: '4.9 Ksh' },
        ],
      },
      {
        name: 'Views 👀',
        count: 3,
        deliverables: [
          { name: 'Quick Boost ⚡', price: '0.2965 Ksh' },
          { name: 'Monetizable — Recommended ⭐', price: '0.3987 Ksh' },
          { name: 'Premium Shield 👑', price: '0.8488 Ksh' },
        ],
        note: 'The site-wide popup advertises "views from SH 99" — actual catalog price is per-unit, not a flat SH99 tier.',
      },
      {
        name: 'Likes',
        count: 1,
        deliverables: [
          { name: 'Recommended ⭐', price: '0.0982 Ksh' },
        ],
      },
      {
        name: 'AI-Generated Comment',
        count: 2,
        deliverables: [
          { name: 'Custom — refill 30D, 2k/day', price: '0.3495 Ksh' },
          { name: 'AI auto-generated from video content, 30 days, 2K/day', price: '0.8564 Ksh' },
        ],
      },
      {
        name: 'Watch Time',
        count: 3,
        deliverables: [
          { name: 'Video 60min+, 500hr/day', price: '6.5 Ksh' },
          { name: 'Video 10–20min, 200–500hr/day', price: '6.2 Ksh' },
          { name: 'Video 30min, 1k=250hrs, 200–500hr/day', price: '5 Ksh' },
        ],
        note: 'All three include 30-day refill.',
      },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '/icons/services/whatsapp.svg',
    href: '/services/whatsapp',
    modalSize: 'large',
    subcategories: [
      {
        name: 'Channel Followers',
        count: 1,
        deliverables: [
          { name: '👑 Premium Shield', price: '0.7324 Ksh' },
        ],
      },
      {
        name: 'Poll Votes',
        count: 5,
        deliverables: [
          { name: 'Pool [A] — max 100k, 50k/day, instant', price: '1.7 Ksh' },
          { name: 'Pool [B] — max 100k, 50k/day, instant', price: '1.7 Ksh' },
          { name: 'Pool [C] — max 100k, 50k/day, instant', price: '1.7 Ksh' },
          { name: 'Pool [D] — max 100k, 50k/day, instant', price: '1.7 Ksh' },
          { name: 'Pool [E] — max 100k, 50k/day, instant', price: '1.7 Ksh' },
        ],
        note: '5 identically-priced, identically-specced SKUs — likely load-balanced server pools, not real variants.',
      },
      {
        name: 'Channel Post Reactions (instant, 1 min)',
        count: 22,
        deliverables: [
          { name: '👍 Thumbs up', price: '0.3004 Ksh' },
          { name: '❤️ Heart', price: '0.3004 Ksh' },
          { name: '😂 Laughing', price: '0.3004 Ksh' },
          { name: '😲 Surprised', price: '0.3004 Ksh' },
          { name: '😥 Sad', price: '0.3004 Ksh' },
          { name: '🙏 Praying hands', price: '0.3004 Ksh' },
          { name: '🔥 Fire', price: '0.3004 Ksh' },
          { name: '🏆 Trophy', price: '0.3004 Ksh' },
          { name: '🎉 Party', price: '0.3004 Ksh' },
          { name: '👏 Clap', price: '0.3004 Ksh' },
          { name: '😎 Cool', price: '0.3004 Ksh' },
          { name: '😡 Angry', price: '0.3004 Ksh' },
          { name: '😮 Wow', price: '0.3004 Ksh' },
          { name: '💩 Poop', price: '0.3004 Ksh' },
          { name: '🖕 Middle finger', price: '0.3004 Ksh' },
          { name: '👎 Thumbs down', price: '0.3004 Ksh' },
          { name: '💔 Broken heart', price: '0.3004 Ksh' },
          { name: '💪 Muscle', price: '0.3004 Ksh' },
          { name: '🤮 Vomiting', price: '0.3004 Ksh' },
          { name: '💸 Money flying', price: '0.3004 Ksh' },
          { name: '💀 Skull', price: '0.3004 Ksh' },
          { name: 'Random mix [👍❤️😂😲😥🙏]', price: '0.3004 Ksh' },
        ],
        note: 'All 22 emoji SKUs priced identically — max 100K, instant start, completes in 1 minute.',
      },
      {
        name: 'Channel Auto Future Post Reactions',
        count: 4,
        deliverables: [
          { name: '😂 Auto-react next 500 posts', price: '20.5 Ksh' },
          { name: '❤️ Auto-react next 500 posts', price: '20.5 Ksh' },
          { name: '👍 Auto-react next 500 posts', price: '20.5 Ksh' },
          { name: 'Mix [🙏👍😂👏🎉🔥🏆❤️😮] — next 25 posts', price: '2.9 Ksh' },
        ],
        note: 'A recurring subscription-style service: reacts automatically to future channel posts, HQ profiles, 10K/day.',
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '/icons/services/telegram.svg',
    href: '/services/telegram',
    modalSize: 'large',
    subcategories: [
      {
        name: 'Comments',
        count: 2,
        deliverables: [
          { name: '🇩🇪 Germany random comments + view', price: '0.727 Ksh' },
          { name: '🇷🇺 Russia random comments + view', price: '0.7573 Ksh' },
        ],
      },
      {
        name: 'Post Views',
        count: 2,
        deliverables: [
          { name: 'Recommended ⭐', price: '0.0368 Ksh' },
          { name: 'Premium Shield 👑', price: '0.2945 Ksh' },
        ],
      },
      {
        name: '"Twitter Crypto & NFT Retweets"',
        count: 1,
        deliverables: [
          { name: 'NFT Retweet (100/50k), 50k/day', price: '1.6 Ksh' },
        ],
        note: 'Mislabeled: nested under Telegram, icon is literally the Twitter/X logo — a copy-paste catalog error.',
      },
      {
        name: 'Post Shares (Search Optimize)',
        count: 2,
        deliverables: [
          { name: '🇩🇪 Germany, share + views', price: '0.0178 Ksh' },
          { name: '🇮🇱 Israel, share + views', price: '0.0178 Ksh' },
        ],
      },
      {
        name: 'Channel Members',
        count: 3,
        deliverables: [
          { name: 'Recommended ⭐', price: '0.412 Ksh' },
          { name: 'Premium Shield 👑', price: '0.5184 Ksh' },
          { name: 'Quick Boost ⚡', price: '0.6631 Ksh' },
        ],
      },
      {
        name: 'Premium Members',
        count: 3,
        deliverables: [
          { name: '+Views (10/20K)', price: '2.2 Ksh' },
          { name: 'English names (10/100K)', price: '1.4 Ksh' },
          { name: '20–30 days premium, instant', price: '2.4 Ksh' },
        ],
      },
      {
        name: 'Reactions',
        count: 1,
        deliverables: [
          { name: 'Heart ❤️ (10/1M)', price: '0.0202 Ksh' },
        ],
      },
    ],
  },
  {
    id: 'x',
    name: 'X',
    icon: '/icons/services/x-icon.webp',
    href: '/services/x',
    modalSize: 'small',
    subcategories: [
      {
        name: 'Comments',
        count: 1,
        deliverables: [
          { name: 'Random, 50–100/day', price: '10.1 Ksh' },
        ],
      },
      {
        name: 'Comments — Crypto Packages',
        count: 1,
        deliverables: [
          { name: 'Custom, crypto bot, 1K/day', price: '10.1 Ksh' },
        ],
      },
      {
        name: 'Crypto & NFT Followers',
        count: 1,
        deliverables: [
          { name: 'NFT (100/5k), 300/day', price: '3.2 Ksh' },
        ],
      },
      {
        name: 'Favorites / Likes',
        count: 3,
        deliverables: [
          { name: '20/4K', price: '1.2 Ksh' },
          { name: '20/10K', price: '1.3 Ksh' },
          { name: '10/5K', price: '1 Ksh' },
        ],
      },
      {
        name: 'Followers [Refill]',
        count: 1,
        deliverables: [
          { name: '500/500k, "less drop"', price: '4.2 Ksh' },
        ],
      },
      {
        name: 'Live Viewers',
        count: 2,
        deliverables: [
          { name: '30 minutes, non-drop', price: '3.8 Ksh' },
          { name: '15 minutes, non-drop', price: '1.9 Ksh' },
        ],
      },
      {
        name: 'Mentions',
        count: 1,
        deliverables: [
          { name: 'User followers (500/5k), 1–2k/day', price: '1.3 Ksh' },
        ],
      },
      {
        name: '🇳🇬 Nigeria bundle',
        count: 1,
        deliverables: [
          { name: 'Followers Nigeria (100/5k), 5k/day', price: '12.6 Ksh' },
        ],
        note: 'Category name promises Followers/Likes/Comments/Retweets — only Followers is actually sold.',
      },
      {
        name: 'Poll Votes',
        count: 1,
        deliverables: [
          { name: '100/1M, 200k/day', price: '0.1767 Ksh' },
        ],
      },
      {
        name: 'Retweets',
        count: 1,
        deliverables: [
          { name: '5/5K', price: '1.8 Ksh' },
        ],
      },
      {
        name: 'Space Listeners',
        count: 3,
        deliverables: [
          { name: '120 minutes, non-drop', price: '15.1 Ksh' },
          { name: '5 minutes (10/100K)', price: '0.0505 Ksh' },
          { name: '30 minutes (10/100K)', price: '0.3433 Ksh' },
        ],
      },
      {
        name: 'Stats',
        count: 1,
        deliverables: [
          { name: 'Link click (100/100M), 10M/day', price: '0.0084 Ksh' },
        ],
      },
      {
        name: 'Views — Country Targeted',
        count: 2,
        deliverables: [
          { name: '🇺🇸 US (100/50M), 400k/day', price: '0.0081 Ksh' },
          { name: '🇩🇰 Denmark (100/50M), 400k/day', price: '0.0081 Ksh' },
        ],
      },
    ],
  },
  {
    id: 'google-maps-reviews',
    name: 'Google Maps Reviews',
    icon: '/icons/services/google-reviews-icon.png',
    href: '/services/google-maps-reviews',
    modalSize: 'large',
    subcategories: [],
  },
];

export const SERVICE_JOURNEY = [
  { step: 1, title: 'Enter quantity', body: 'Preset buttons (100 / 500 / 1,000 / 2,500 / 5,000) or a custom field. Min 10, max 10,000 for most services.' },
  { step: 2, title: 'Paste the link', body: 'Profile, channel, or post URL. For some TikTok/WhatsApp services, this field may ask for a WhatsApp number instead.' },
  { step: 3, title: 'Live price', body: 'Updates as you type, plus disclosure block: start time, speed, quality claim, drop risk, and refill guarantee status.' },
  { step: 4, title: 'Select payment system', body: 'M-Pesa shown first, with card/PayPal/crypto also available depending on flow variant.' },
  { step: 5, title: 'Pay', body: 'For M-Pesa, payment opens in a new tab; the page shows a waiting-for-payment polling screen.' },
  { step: 6, title: 'Redirect to dashboard', body: 'Once payment completes, a link to the personal order-tracking dashboard appears.' },
];
