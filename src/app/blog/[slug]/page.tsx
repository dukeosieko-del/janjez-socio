import { Metadata } from "next";
import { notFound } from "next/navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import RatingStars from "@/components/blog/RatingStars";
import ArticleContent from "@/components/blog/ArticleContent";
import PopupOffer from "@/components/blog/PopupOffer";
import Link from "next/link";
import { Clock, Eye, MessageCircle } from "@/components/blog/icons";
import { getPostBySlug } from "@/lib/blog/data";
import { blogPosts } from "@/lib/blog/data";
import type { BlogPostListItem } from "@/lib/blog/queries";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post Not Found | Blog | janjez.social" };
  }
  return {
    title: `${post.title} | Blog | janjez.social`,
    description: post.excerpt || `${post.title} — janjez.social Blog & News`,
    openGraph: {
      title: `${post.title} | Blog | janjez.social`,
      description: post.excerpt || `${post.title} — janjez.social Blog & News`,
      url: `https://janjez.social/blog/${post.slug}`,
      siteName: "janjez.social",
      locale: "en_KE",
      type: "article",
      images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630 }] : [],
    },
    alternates: { canonical: `https://janjez.social/blog/${post.slug}` },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3)
    .map(toListItem);

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const categoryColor = post.category?.color_hex || "#00A859";

  const getCTADisplay = () => {
    if (post.category?.slug === "instagram") {
      return { showOrderCta: true, orderCategory: "instagram", orderLabel: "Boost Your Instagram Now →" };
    }
    if (post.category?.slug === "youtube") {
      return { showOrderCta: true, orderCategory: "youtube", orderLabel: "Buy YouTube Views →" };
    }
    if (post.category?.slug === "tiktok") {
      return { showOrderCta: true, orderCategory: "tiktok", orderLabel: "Get TikTok Views →" };
    }
    return { showOrderCta: true, orderCategory: "", orderLabel: "See All Services →" };
  };

  const ctaConfig = getCTADisplay();

  return (
    <div className="min-h-screen flex bg-kenya-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AnnouncementBanner />
        <LiveTicker />
        <Header />
        <PopupOffer
          trigger="open-blog-article-offer"
          title="First Order? Get 15% Off!"
          description="Use code BLOG15 at checkout. Valid for first-time orders only."
          offerLabel="Claim 15% Off"
          offerHref="/services"
          storageKey="blog-article-offer-dismissed"
          delayMs={10000}
        />

        <main className="flex-1">
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-kenya-white/50 mb-6">
              <Link href="/" className="hover:text-kenya-green transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-kenya-green transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-kenya-green font-medium">
                {post.title.length > 40 ? post.title.substring(0, 40) + "..." : post.title}
              </span>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {post.category && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                  >
                    {post.category.name}
                  </span>
                )}
                {post.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-kenya-white/5 text-kenya-white/60"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-kenya-white mb-4 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-lg text-kenya-white/70 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}

              {/* Author / Meta */}
              <div className="flex items-center justify-between border-t border-kenya-white/10 border-b border-kenya-white/10 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-kenya-white/10">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.full_name || "Author"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-kenya-white">
                      {post.author?.full_name || "janjez.social Team"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-kenya-white/50">
                      {date && <span>{date}</span>}
                      {post.reading_time_minutes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.reading_time_minutes} min read
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-kenya-white/50">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.view_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    12 comments
                  </span>
                </div>
              </div>

              {/* Average Rating */}
              {post.average_rating != null && (
                <div className="mt-4 flex items-center gap-2">
                  <RatingStars rating={post.average_rating} showCount count={post.rating_count ?? 0} />
                  <span className="text-sm text-kenya-white/60">
                    {post.average_rating.toFixed(1)} / 5
                  </span>
                </div>
              )}
            </header>

            {/* Cover Image */}
            {post.cover_image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-kenya-white/10">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <ArticleContent post={post} relatedPosts={relatedPosts} ctaConfig={ctaConfig} />

            {/* Comments Section */}
            <div className="border-t border-kenya-white/10 pt-8 mt-12">
              <h2 className="text-2xl font-bold text-kenya-white mb-6">Discussion (12)</h2>

              <div className="space-y-6">
                <div className="border border-kenya-white/10 rounded-xl p-4 bg-kenya-white/3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-kenya-white/10 flex-shrink-0 flex items-center justify-center">
                      👤
                    </div>
                    <div className="flex-1">
                      <textarea
                        placeholder="Write a comment..."
                        className="w-full bg-transparent text-kenya-white placeholder-kenya-white/40 border-none outline-none resize-none min-h-[60px]"
                      />
                      <div className="flex justify-end mt-2">
                        <button className="px-4 py-2 bg-kenya-green text-kenya-black font-bold rounded-lg hover:bg-kenya-green/90 transition-colors">
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </div>
  );
}
