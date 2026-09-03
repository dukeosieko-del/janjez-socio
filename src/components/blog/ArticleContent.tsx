"use client";

import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";

interface ArticleContentProps {
  post: BlogPost;
  relatedPosts?: Array<{
    slug: string;
    title: string;
    excerpt: string | null;
  }>;
  ctaConfig?: {
    showOrderCta?: boolean;
    orderCategory?: string;
    orderLabel?: string;
    showWhatsAppCta?: boolean;
    showNewsletterCta?: boolean;
  };
}

export default function ArticleContent({
  post,
  relatedPosts = [],
  ctaConfig = {},
}: ArticleContentProps) {
  const {
    showOrderCta = false,
    orderCategory = "",
    orderLabel = "Place Your Order Now",
    showWhatsAppCta = false,
    showNewsletterCta = false,
  } = ctaConfig;

  const renderContent = () => {
    if (post.content) {
      try {
        const parsed = JSON.parse(post.content);
        if (Array.isArray(parsed)) {
          return renderRichText(parsed);
        }
      } catch {
        return <div dangerouslySetInnerHTML={{ __html: post.content }} />;
      }
    }
    return <p className="text-kenya-white/60">Content not available.</p>;
  };

  function renderRichText(nodes: Array<{ type: string; content?: string; attrs?: Record<string, unknown> }>) {
    return (
      <div className="prose prose-invert prose-green prose-lg max-w-none">
        {nodes.map((node, i) => {
          switch (node.type) {
            case "heading":
              return <h2 key={i} className="text-2xl font-bold text-kenya-white mt-8 mb-4" dangerouslySetInnerHTML={{ __html: node.content || "" }} />;
            case "paragraph":
              return <p key={i} className="mb-4 text-kenya-white/80" dangerouslySetInnerHTML={{ __html: node.content || "" }} />;
            case "list-item":
            case "bullet-list":
            case "ordered-list":
              return <li key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: node.content || "" }} />;
            case "blockquote":
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-kenya-green pl-4 italic text-kenya-white/70 my-6"
                  dangerouslySetInnerHTML={{ __html: node.content || "" }}
                />
              );
            case "image":
              return (
                <div key={i} className="my-6">
                  <img
                    src={node.attrs?.src as string}
                    alt={node.attrs?.alt as string}
                    className="rounded-xl w-full border border-kenya-white/10"
                  />
                  {Boolean(node.attrs?.alt) && (
                    <p className="text-xs text-kenya-white/50 mt-2 text-center">
                      {String(node.attrs?.alt)}
                    </p>
                  )}
                </div>
              );
            case "code-block":
              return (
                <pre key={i} className="bg-kenya-white/5 border border-kenya-white/10 rounded-xl p-4 overflow-x-auto">
                  <code className="text-sm text-kenya-green/70" dangerouslySetInnerHTML={{ __html: node.content || "" }} />
                </pre>
              );
            default:
              return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: node.content || "" }} />;
          }
        })}
      </div>
    );
  }

  return (
    <div className="prose-content">
      {renderContent()}

      {/* CTA Section 1 - Order CTA */}
      {showOrderCta && (
        <div className="my-12 bg-gradient-to-r from-kenya-green/20 to-kenya-green/5 border border-kenya-green/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-kenya-white mb-4">
            Ready to Boost Your Social Media?
          </h3>
          <p className="text-kenya-white/70 mb-6 max-w-2xl mx-auto">
            Don&apos;t let your growth wait. Place your order now and see instant results.
          </p>
          <Link
            href={`/order${orderCategory ? `?category=${orderCategory}` : ""}`}
            className="inline-flex items-center justify-center gap-2 bg-kenya-green text-kenya-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-kenya-green/90 transition-all shadow-lg shadow-kenya-green/20"
          >
            {orderLabel}
          </Link>
        </div>
      )}

      {/* CTA Section 2 - WhatsApp Community */}
      {showWhatsAppCta && (
        <div className="my-12 bg-kenya-white/5 border border-kenya-white/10 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-kenya-white mb-2">
                Join the janjez.social WhatsApp Community
              </h3>
              <p className="text-kenya-white/70 mb-4">
                Get exclusive deals, early access to promotions, and instant support from our team.
                Over 15,000 Kenyan creators already in the community!
              </p>
              <a
                href="https://wa.me/2540117546224"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#22C55E] transition-all"
              >
                Join WhatsApp Group
              </a>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-[#25D366]/20 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section 3 - Newsletter Popup Trigger */}
      {showNewsletterCta && (
        <div className="my-12 bg-gradient-to-br from-kenya-green/10 via-kenya-green/5 to-kenya-black/30 border border-kenya-green/20 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-kenya-white mb-3">
              Get More Tips Like This
            </h3>
            <p className="text-kenya-white/70 mb-6 max-w-xl mx-auto">
              Subscribe to our newsletter for weekly SMM tips, exclusive promotions, and
              insider news from the janjez.social team.
            </p>
            <button
              onClick={() => {
                const event = new Event("open-newsletter-modal");
                window.dispatchEvent(event);
              }}
              className="bg-kenya-green text-kenya-black font-bold px-8 py-3 rounded-xl hover:bg-kenya-green/90 transition-all"
            >
              Subscribe Now&mdash; It&apos;s Free
            </button>
          </div>
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="my-12 border-t border-kenya-white/10 pt-8">
          <h3 className="text-xl font-bold text-kenya-white mb-4">Related Articles</h3>
          <div className="space-y-4">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="block group"
              >
                <div className="p-4 bg-kenya-white/3 border border-kenya-white/5 rounded-xl hover:bg-kenya-white/5 transition-colors">
                  <h4 className="font-medium text-kenya-white group-hover:text-kenya-green transition-colors">
                    {related.title}
                  </h4>
                  {related.excerpt && (
                    <p className="text-sm text-kenya-white/60 mt-1 line-clamp-2">
                      {related.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
