import type { BlogPost, BlogCategory, BlogTag } from "./types";

export const blogCategories: BlogCategory[] = [
  {
    id: "cat-nav-howto",
    name: "Navigation & How To",
    slug: "navigation-how-to",
    description: "Step-by-step guides and tutorials for getting started with janjez.social",
    color_hex: "#00A859",
    display_order: 0,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "cat-instagram",
    name: "Instagram",
    slug: "instagram",
    description: "Guides and tips for growing your Instagram presence",
    color_hex: "#E44072",
    display_order: 1,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "cat-youtube",
    name: "YouTube",
    slug: "youtube",
    description: "Tips for boosting YouTube watch time and views",
    color_hex: "#FF0000",
    display_order: 2,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "cat-tiktok",
    name: "TikTok",
    slug: "tiktok",
    description: "TikTok growth strategies and service guides",
    color_hex: "#1EFF7F",
    display_order: 3,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "cat-mpesa",
    name: "M-Pesa",
    slug: "mpesa",
    description: "M-Pesa payment guides and wallet top-up instructions",
    color_hex: "#00A859",
    display_order: 4,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
  {
    id: "cat-promotions",
    name: "Promotions",
    slug: "promotions",
    description: "Latest deals, happy hour announcements, and promotions",
    color_hex: "#BB133E",
    display_order: 5,
    is_active: true,
    created_at: "2026-09-03T00:00:00Z",
  },
];

export const blogTags: BlogTag[] = [
  { id: "tag-beginner", name: "Beginner", slug: "beginner" },
  { id: "tag-advanced", name: "Advanced", slug: "advanced" },
  { id: "tag-tutorial", name: "Tutorial", slug: "tutorial" },
  { id: "tag-promotion", name: "Promotion", slug: "promotion" },
  { id: "tag-guest-checkout", name: "Guest Checkout", slug: "guest-checkout" },
  { id: "tag-mpesa", name: "M-Pesa", slug: "mpesa" },
  { id: "tag-budget", name: "Budget", slug: "budget" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "post-001",
    slug: "guest-order-no-login-mpesa-60-seconds",
    title: "You Don't Need to Log In — All Prices on Services You Will Ever Imagine Are Here",
    excerpt: "No account, no email verification, no passwords. Just M-Pesa STK push and instant social media growth. Here's how to place a guest order in 60 seconds.",
    content: JSON.stringify([
      {
        type: "paragraph",
        content: "You don't need to create an account, verify an email, or remember passwords to boost your social media presence on janjez.social. <strong>We are Kenya's cheapest SMM panel</strong> — you can browse thousands of budget-friendly social media services and check out instantly as a guest using M-Pesa. Whether you want <strong>Instagram followers from KES 100</strong>, <strong>YouTube views from KES 1.00</strong>, or <strong>TikTok likes for just KES 50</strong>, it's all here.",
      },
      {
        type: "heading",
        content: "Here Is the Exact Step-by-Step Walkthrough",
      },
      {
        type: "paragraph",
        content: "Everything below takes less than 60 seconds. No sign-up wall. No email trap. Just pure, instant social media growth paid via M-Pesa STK push.",
      },
      {
        type: "heading",
        content: "Step 1: Open the Service Catalog",
      },
      {
        type: "paragraph",
        content: "Navigate to the top navigation bar on <a href=\"https://janjez.social\" className=\"text-kenya-green\">janjez.social</a> and click on <strong>[🛒 New Order]</strong>. This takes you directly to the full catalog of available services — TikTok views, Instagram followers, YouTube watch time, WhatsApp channel members, X (Twitter) impressions, and more.",
      },
      {
        type: "image",
        attrs: { src: "/blog/step1-service-catalog.png", alt: "Click New Order in the navbar" },
      },
      {
        type: "heading",
        content: "Step 2: Choose Your Budget Tier",
      },
      {
        type: "paragraph",
        content: "At the top of the services page, select your preferred budget level. Click on the <strong>&lt;2k Champion</strong> tag to view budget packages priced below KES 2,000 per unit. We have <strong>5 budget tiers</strong>:</p><ul><li><strong>Starter (&lt;500 KES)</strong> — Perfect for testing</li><li><strong>Champion (&lt;2,000 KES)</strong> — Best value for most users</li><li><strong>Premium (2,000–5,000 KES)</strong> — High-volume packages</li><li><strong>Enterprise (5,000+ KES)</strong> — Bulk orders</li>",
      },
      {
        type: "image",
        attrs: { src: "/blog/step2-budget-tiers.png", alt: "Budget tier selection tags" },
      },
      {
        type: "heading",
        content: "Step 3: Filter by Platform",
      },
      {
        type: "paragraph",
        content: "Select the platform you want to boost under the <strong>SELECT CATEGORY</strong> options list. For example, click <strong>[X (95)]</strong> to view all X/Twitter services — Tweet views, profile clicks, impression expansion, and more. Each category shows the exact deliverable, speed, and refill guarantee.",
      },
      {
        type: "heading",
        content: "Step 4: Pick Your Package",
      },
      {
        type: "paragraph",
        content: "Scroll through the catalog to find your target package. For example:</p><blockquote>Twitter — Tweet Views + Impression + Details Expand + Profile Click [Speed 20M/Day] [SUPER FAST] [Non-Drop] [0-5Mins]</blockquote><p>Click <strong>[Order Now]</strong> on your chosen package. The checkout form pre-fills with the correct price, so you always see exactly what you're paying.",
      },
      {
        type: "heading",
        content: "Step 5: Fill in Details & Guest Option",
      },
      {
        type: "paragraph",
        content: "In the checkout form:</p><ol><li><strong>Paste your target post URL</strong> — e.g., <code>https://x.com/AMAZlNGNATURE/status/1234567890</code> — into the Link / Username field.</li><li><strong>Enter your desired Quantity</strong> — e.g., entering 1000 automatically sets the total price to KES 1.00 (that's how cheap we are!).</li><li><strong>Check the box for \"Place order as guest (no account needed)\"\"</strong> — this skips all login walls.</li><li><strong>Enter your M-Pesa phone number</strong> — e.g., 0773100000 (format: 07XXXXXXXX).</li></ol>",
      },
      {
        type: "image",
        attrs: { src: "/blog/step5-checkout-form.png", alt: "Guest checkout form with phone number and anonymous checkbox" },
      },
      {
        type: "heading",
        content: "Step 6: Trigger M-Pesa Payment",
      },
      {
        type: "paragraph",
        content: "Click <strong>[Place & Pay (Guest)]</strong>. An M-Pesa STK push prompt will be sent directly to your mobile phone for the exact amount (e.g., KES 1.00). Enter your M-Pesa PIN to complete the order instantly. That's it — your order starts processing immediately.",
      },
      {
        type: "blockquote",
        content: "Pata clout chapchap! No delays, no account needed. Just pay and watch your numbers grow in real time.",
      },
      {
        type: "heading",
        content: "Why janjez.social Has the Lowest Prices in Kenya",
      },
      {
        type: "paragraph",
        content: "Other SMM panels charge KES 500–2000 for 1000 followers. We work directly with providers and cut out the middleman, so you get:</p><ul><li><strong>Instagram followers from KES 1 per follower</strong></li><li><strong>YouTube views from KES 1 per 1000 views</strong></li><li><strong>TikTok likes from KES 50 for 100 likes</strong></li><li><strong>WhatsApp members from KES 100 per 10 members</strong></li></ul><p>All prices are <strong>locked in at the lowest rate</strong> — we don't change them mid-order.",
      },
      {
        type: "image",
        attrs: { src: "/blog/pricing-comparison.png", alt: "Price comparison chart" },
      },
      {
        type: "heading",
        content: "What Happens After Payment?",
      },
      {
        type: "paragraph",
        content: "Once you complete the M-Pesa payment, your order is queued immediately. You'll receive a confirmation page with your Order ID and a tracking link. Use that link to check your order status anytime — no login required. Delivery starts within 0–5 minutes for most services.",
      },
      {
        type: "heading",
        content: "FAQs: Guest Checkout",
      },
      {
        type: "paragraph",
        content: "</p><h3>Can I track my order without an account?</h3><p>Yes — we give you a tracking link in the confirmation page. Save it or bookmark it.</p><h3>Can I still create an account later?</h3><p>Absolutely. Creating an account gives you a wallet balance, order history, and faster checkout.</p><h3>What if my STK push fails?</h3><p>Contact us on WhatsApp [+254 0117 546 224] with your Order ID. We'll help or refund instantly.</p>",
      },
    ]),
    cover_image_url: "/blog/guest-order-cover.jpg",
    author_id: null,
    category_id: "cat-nav-howto",
    status: "published",
    visibility: "public",
    is_featured: true,
    reading_time_minutes: 6,
    view_count: 0,
    created_at: "2026-09-03T00:00:00Z",
    updated_at: "2026-09-03T00:00:00Z",
    published_at: "2026-09-03T00:00:00Z",
    approved_at: "2026-09-03T00:00:00Z",
    approved_by: null,
    rejection_reason: null,
    author: {
      id: "author-1",
      full_name: "janjez.social Team",
      email: null,
      avatar_url: "/logo-icon.png",
    },
    category: {
      id: "cat-nav-howto",
      name: "Navigation & How To",
      slug: "navigation-how-to",
      description: "Step-by-step guides and tutorials for getting started with janjez.social",
      color_hex: "#00A859",
      display_order: 0,
      is_active: true,
      created_at: "2026-09-03T00:00:00Z",
    },
    tags: [
      { id: "tag-beginner", name: "Beginner", slug: "beginner" },
      { id: "tag-tutorial", name: "Tutorial", slug: "tutorial" },
      { id: "tag-guest-checkout", name: "Guest Checkout", slug: "guest-checkout" },
      { id: "tag-mpesa", name: "M-Pesa", slug: "mpesa" },
      { id: "tag-budget", name: "Budget", slug: "budget" },
    ],
    average_rating: 4.8,
    rating_count: 42,
  },
];

export function getTagsForPost(slugOrId: string): BlogTag[] {
  const post = blogPosts.find((p) => p.slug === slugOrId || p.id === slugOrId);
  return post?.tags || [];
}

export function getPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) || null;
}
