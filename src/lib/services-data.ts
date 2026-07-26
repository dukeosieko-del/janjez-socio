export const SERVICES = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/icons/services/facebook.svg',
    category: 'social',
    description: 'Boost your Facebook presence with followers, likes, and post reactions.',
    href: '/services/facebook',
    status: 'active',
    modalSize: 'small'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '/icons/services/tiktok.svg',
    category: 'social',
    description: 'Grow your TikTok audience with views, followers, and live stream viewers.',
    href: '/services/tiktok',
    status: 'active',
    modalSize: 'small'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '/icons/services/instagram.svg',
    category: 'social',
    description: 'Increase Instagram followers, likes, comments, and Reels views.',
    href: '/services/instagram',
    status: 'active',
    modalSize: 'small'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '/icons/services/youtube.svg',
    category: 'social',
    description: 'Get more YouTube views, subscribers, likes, and watch time.',
    href: '/services/youtube',
    status: 'active',
    modalSize: 'large'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '/icons/services/whatsapp.svg',
    category: 'messaging',
    description: 'Grow WhatsApp channel members, status views, and poll votes.',
    href: '/services/whatsapp',
    status: 'active',
    modalSize: 'large'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '/icons/services/telegram.svg',
    category: 'messaging',
    description: 'Expand Telegram channels and groups with members, views, and poll votes.',
    href: '/services/telegram',
    status: 'active',
    modalSize: 'large'
  },
  {
    id: 'google-maps-reviews',
    name: 'Google Maps Reviews',
    icon: '/icons/services/google-maps-2020-icon.svg',
    category: 'reviews',
    description: 'Get 5-star custom reviews, local guide feedback, and place saves on Google Maps.',
    href: '/services/google-maps-reviews',
    status: 'active',
    modalSize: 'large'
  },
  {
    id: 'x',
    name: 'X',
    icon: '/icons/services/x-icon.webp',
    category: 'social',
    description: 'Increase X followers, post likes, and retweets.',
    href: '/services/x',
    status: 'active',
    modalSize: 'small'
  }
];

export const SERVICES_CATEGORIES = [
  { id: 'all', label: 'All Platforms', value: 'all' },
  { id: 'social', label: 'Social Media', value: 'social', children: ['facebook', 'tiktok', 'instagram', 'youtube', 'x'] },
  { id: 'messaging', label: 'Messaging', value: 'messaging', children: ['whatsapp', 'telegram'] },
  { id: 'reviews', label: 'Reviews', value: 'reviews', children: ['google-maps-reviews'] }
];
