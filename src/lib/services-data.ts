export const SERVICES = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/facebook-icon.png',
    category: 'social',
    description: 'Boost your Facebook presence with followers, likes, and post reactions.',
    href: '/services/facebook',
    status: 'active'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '/tiktok-icon.png',
    category: 'social',
    description: 'Grow your TikTok audience with views, followers, and live stream viewers.',
    href: '/services/tiktok',
    status: 'active'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '/instagram-icon.png',
    category: 'social',
    description: 'Increase Instagram followers, likes, comments, and Reels views.',
    href: '/services/instagram',
    status: 'active'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '/youtube-icon.png',
    category: 'social',
    description: 'Get more YouTube views, subscribers, likes, and watch time.',
    href: '/services/youtube',
    status: 'active'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '/whatsapp-icon.png',
    category: 'messaging',
    description: 'Grow WhatsApp channel members, status views, and poll votes.',
    href: '/services/whatsapp',
    status: 'active'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '/telegram-icon.png',
    category: 'messaging',
    description: 'Expand Telegram channels and groups with members, views, and poll votes.',
    href: '/services/telegram',
    status: 'active'
  },
  {
    id: 'google-maps',
    name: 'Google Maps Reviews',
    icon: '/google-reviews-icon.png',
    category: 'reviews',
    description: 'Get 5-star custom reviews, local guide feedback, and place saves on Google Maps.',
    href: '/services/google-maps',
    status: 'active'
  },
  {
    id: 'x-twitter',
    name: 'X (Twitter)',
    icon: '/x-icon.png',
    category: 'social',
    description: 'Increase X followers, post likes, and retweets.',
    href: '/services/x-twitter',
    status: 'active'
  }
];

export const SERVICES_CATEGORIES = [
  { id: 'all', label: 'All Platforms', value: 'all' },
  { id: 'social', label: 'Social Media', value: 'social', children: ['facebook', 'tiktok', 'instagram', 'youtube', 'x-twitter'] },
  { id: 'messaging', label: 'Messaging', value: 'messaging', children: ['whatsapp', 'telegram'] },
  { id: 'reviews', label: 'Reviews', value: 'reviews', children: ['google-maps'] }
];
