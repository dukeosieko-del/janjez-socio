import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import CategoryNav from "@/components/blog/CategoryNav";
import BlogSearch from "@/components/blog/BlogSearch";
import BlogFilters from "@/components/blog/BlogFilters";
import { getCategories, getFeaturedPosts, getLatestPosts } from "@/lib/blog/queries";
import { blogCategories, blogPosts } from "@/lib/blog/data";
import type { BlogPostListItem } from "@/lib/blog/queries";
import type { BlogCategory } from "@/lib/blog/types";
import type { Metadata } from "next";
import { SITE_URL } from "../lib/config";
import Link from "next/link";
import PopupOffer from "@/components/blog/PopupOffer";

function toListItem(post: typeof blogPosts[0]): BlogPostListItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image_url: post.cover_image_url,
    category: post.category ? {
      id: post.category.id,
      name: post.category.name,
      slug: post.category.slug,
      color_hex: post.category.color_hex,
    } : null,
    tags: post.tags || [],
    author: post.author ? {
      id: post.author.id,
      full_name: post.author.full_name,
      avatar_url: post.author.avatar_url,
    } : null,
    reading_time_minutes: post.reading_time_minutes,
    view_count: post.view_count,
    published_at: post.published_at,
    is_featured: post.is_featured,
    average_rating: post.average_rating ?? null,
    rating_count: post.rating_count ?? 0,
  };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & News — SMM Panel Kenya Guides | janjez.social",
  description: "Latest SMM tips, Instagram guides, YouTube growth, and M-Pesa payment news from janjez.social team. Grow your social media in Kenya.",
  keywords: [
    "SMM panel Kenya",
    "social media marketing Nairobi",
    "Instagram followers Kenya",
    "buy YouTube views Kenya",
    "TikTok views Kenya",
    "M-Pesa SMM panel",
    "Pata clout chapchap",
    "cheap SMM panel East Africa",
    "best SMM panel 2026",
    "social media growth service",
  ],
  openGraph: {
    title: "Blog & News — SMM Panel Kenya Guides | janjez.social",
    description: "Latest SMM tips, Instagram guides, YouTube growth, and M-Pesa payment news from janjez.social team.",
    url: `${SITE_URL}/blog`,
    siteName: "janjez.social",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "janjez.social Blog" }],
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

async function getBlogData() {
  const categories = await getCategories().catch(() => blogCategories as BlogCategory[]);
  let featuredPosts = await getFeaturedPosts(3).catch(() => blogPosts.map(toListItem));
  let latestPosts = await getLatestPosts(12).catch(() => blogPosts.map(toListItem));

  const staticMap = new Map(blogPosts.map((p) => [p.slug, p]));
  const enrichPost = (post: BlogPostListItem): BlogPostListItem => {
    const staticPost = staticMap.get(post.slug);
    if (staticPost && !post.cover_image_url) {
      return { ...post, cover_image_url: staticPost.cover_image_url };
    }
    return post;
  };

  featuredPosts = featuredPosts.map(enrichPost);
  latestPosts = latestPosts.map(enrichPost);

  return {
    categories: categories.length > 0 ? categories : blogCategories,
    featuredPosts: featuredPosts.length > 0 ? featuredPosts : blogPosts.map(toListItem),
    latestPosts: latestPosts.length > 0 ? latestPosts : blogPosts.map(toListItem),
  };
}

export default async function BlogPage({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const { categories, featuredPosts, latestPosts } = await getBlogData();
  const searchQuery = searchParams.q || "";
  const selectedCategory = searchParams.category || "";

  let displayedPosts = latestPosts;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedPosts = latestPosts.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt?.toLowerCase().includes(q) ?? false)
    );
  }

  if (selectedCategory) {
    displayedPosts = displayedPosts.filter((p) => p.category?.slug === selectedCategory);
  }

  const featuredPost = featuredPosts[0];
  const otherFeatured = featuredPosts.slice(1);

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <PopupOffer
          trigger="open-blog-offer"
          title="Exclusive Deal For Blog Readers!"
          description="As a thank you for reading, get 10% off your first order. Use code BLOG10 at checkout."
          offerLabel="Claim 10% Off"
          offerHref="/services"
          storageKey="blog-offer-dismissed"
          delayMs={8000}
        />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">Blog & News</span>
            </nav>

            {/* Header */}
            <div className="mb-8" data-walkthrough="walkthrough-blog-entry">
              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-3">
                Blog &amp; News
              </h1>
              <p className="text-kenya-white/60 text-lg max-w-2xl">
                Latest SMM tips, Instagram guides, YouTube growth strategies, and M-Pesa
                payment news from the janjez.social team. Grow your social media in Kenya —
                no login required.
              </p>
            </div>

            {/* Search */}
            <div className="mb-8">
              <BlogSearch initialValue={searchQuery} placeholder="Search guides, tips, and promotions..." />
            </div>

            {/* Category Navigation */}
            <div className="mb-8">
              <CategoryNav categories={categories} activeCategory={selectedCategory} />
            </div>

            {/* Sort Filters */}
            <div className="mb-6">
              <BlogFilters
                currentSort="latest"
                currentView="grid"
              />
            </div>

            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <h2 className="text-sm font-bold text-kenya-green uppercase tracking-wider mb-4">
                  Featured Article
                </h2>
                <BlogCard post={featuredPost} featured walkthroughTarget="walkthrough-blog-article" />
              </div>
            )}

            {/* Other Featured (if any) */}
            {otherFeatured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-bold text-kenya-white/50 uppercase tracking-wider mb-4">
                  Editor&apos;s Picks
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {otherFeatured.map((post) => (
                    <BlogCard key={post.id} post={post} walkthroughTarget="walkthrough-blog-article" />
                  ))}
                </div>
              </div>
            )}

            {/* Latest Posts */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-kenya-white/50 uppercase tracking-wider mb-4">
                {searchQuery && `Search results for "${searchQuery}"`}
                {!searchQuery && selectedCategory &&
                  `Posts in "${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}"`}
                {!searchQuery && !selectedCategory && "Latest Articles"}
              </h2>

              {displayedPosts.length === 0 ? (
                <div className="text-center py-16 text-kenya-white/50">
                  <p className="mb-4">No articles found matching your search.</p>
                  <Link
                    href="/blog"
                    className="text-kenya-green hover:text-kenya-green/80"
                  >
                    View all articles
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPosts.map((post) => (
                    <BlogCard key={post.id} post={post} walkthroughTarget="walkthrough-blog-article" />
                  ))}
                </div>
              )}
            </div>

            {/* Newsletter CTA at bottom */}
            <div className="border-t border-kenya-white/10 pt-12 mt-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-kenya-white mb-4">
                  Never Miss a Growth Tip
                </h3>
                <p className="text-kenya-white/60 mb-6 max-w-xl mx-auto">
                  Get weekly SMM strategies, exclusive promotions, and early access to
                  new services delivered to your inbox. No spam, ever.
                </p>
                <button
                  type="button"
                  className="bg-kenya-green text-kenya-black font-bold px-8 py-3 rounded-xl hover:bg-kenya-green/90 transition-all"
                >
                  Join the Newsletter
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
