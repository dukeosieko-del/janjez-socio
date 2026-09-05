import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/blog/posts/route";
import { GET as GetPost } from "@/app/api/blog/posts/[slug]/route";
import { GET as GetCategories } from "@/app/api/blog/categories/route";
import { GET as GetTags } from "@/app/api/blog/tags/route";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
        })),
        range: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: "post-new", slug: "new-post", title: "New Post", status: "draft" }, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    rpc: vi.fn(),
  })),
}));

vi.mock("@/lib/server/auth-helpers", () => ({
  getUserFromRequest: vi.fn(() => ({ id: "user-1", email: "test@test.com", role: "user" })),
}));

vi.mock("@/lib/blog/data", () => ({
  blogCategories: [
    { id: "cat-1", name: "Test", slug: "test", color_hex: "#00A859", display_order: 0, is_active: true, created_at: "2026-01-01" },
  ],
  blogTags: [
    { id: "tag-1", name: "Test", slug: "test" },
  ],
  blogPosts: [
    {
      id: "post-1",
      slug: "test-post",
      title: "Test Post",
      excerpt: "Test excerpt",
      content: "<p>Test</p>",
      cover_image_url: null,
      author_id: "user-1",
      category_id: "cat-1",
      status: "published",
      visibility: "public",
      is_featured: false,
      reading_time_minutes: 1,
      view_count: 0,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
      published_at: "2026-01-01",
      approved_at: "2026-01-01",
      approved_by: null,
      rejection_reason: null,
      author: { id: "user-1", full_name: "Test User", avatar_url: null },
      category: { id: "cat-1", name: "Test", slug: "test", color_hex: "#00A859", display_order: 0, is_active: true, created_at: "2026-01-01" },
      tags: [{ id: "tag-1", name: "Test", slug: "test" }],
      average_rating: 4.0,
      rating_count: 10,
    },
  ],
  getTagsForPost: vi.fn(() => [{ id: "tag-1", name: "Test", slug: "test" }]),
  getPostBySlug: vi.fn(() => ({
    id: "post-1",
    slug: "test-post",
    title: "Test Post",
    excerpt: "Test excerpt",
    content: "<p>Test</p>",
    cover_image_url: null,
    author_id: "user-1",
    category_id: "cat-1",
    status: "published",
    visibility: "public",
    is_featured: false,
    reading_time_minutes: 1,
    view_count: 0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    published_at: "2026-01-01",
    approved_at: "2026-01-01",
    approved_by: null,
    rejection_reason: null,
    author: { id: "user-1", full_name: "Test User", avatar_url: null },
    category: { id: "cat-1", name: "Test", slug: "test", color_hex: "#00A859", display_order: 0, is_active: true, created_at: "2026-01-01" },
    tags: [{ id: "tag-1", name: "Test", slug: "test" }],
    average_rating: 4.0,
    rating_count: 10,
  })),
}));

describe("Blog API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/blog/posts", () => {
    it("returns posts from static fallback when DB fails", async () => {
      const request = new Request("http://localhost:3000/api/blog/posts");
      const res = await GET(request);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(Array.isArray(data.posts)).toBe(true);
      expect(data.source).toBe("static");
    });
  });

  describe("GET /api/blog/categories", () => {
    it("returns categories from static fallback", async () => {
      const res = await GetCategories();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.categories.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/blog/tags", () => {
    it("returns tags from static fallback", async () => {
      const res = await GetTags();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.tags.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/blog/posts/[slug]", () => {
    it("returns post by slug from static fallback", async () => {
      const request = new Request("http://localhost:3000/api/blog/posts/test-post");
      const res = await GetPost(request, { params: Promise.resolve({ slug: "test-post" }) });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.post.slug).toBe("test-post");
    });
  });

  describe("POST /api/blog/posts", () => {
    it("creates a new draft post", async () => {
      const request = new Request("http://localhost:3000/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Post", content: "<p>Content</p>", status: "draft" }),
      });
      const res = await POST(request);
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.ok).toBe(true);
      expect(data.post.title).toBe("New Post");
    });
  });
});
