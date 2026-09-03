# JANJEZ.SOCIAL — BLOG / COMMUNITY CONTENT ARCHITECTURE

## Implementation Framework

---

## 1. CURRENT STATE GAP ANALYSIS

### Existing Infrastructure
- **Auth**: `AuthContext.tsx` provides `user`, `profile` (with `role` field), `session`, `isAdmin`
- **DB**: Profiles table with `role`, `wallet_balance`, `email_verified`, `theme`, `language`
- **Notifications**: Table with `audience`, `category`, `severity`, `body`, `read_at` — already extended for v2
- **Middleware**: Protects `/dashboard/*`, `/admin/*`, `/orders/*` (except `/orders/track`), `/pay`, `/wallet/*`, `/settings/*`
- **Admin pages**: `/admin/page.tsx` and `/admin/notifications/page.tsx` — admin gated via client-side `isAdmin` check
- **Styling**: Tailwind CSS, `bg-kenya-black` / `text-kenya-white` / `text-kenya-green` palette
- **API**: Route handlers in `src/app/api/`, admin auth via `getUserFromRequest()` and `requireAdmin()` in `src/lib/server/auth-helpers.ts`
- **Existing "blog-like" pages**: `/blog/page.tsx`, `/instagram-setup-guide/page.tsx`, `/how-it-works/page.tsx` — all static, hardcoded content

### Missing for Full Figma Architecture
- **No blog-related DB tables** — need: `blog_categories`, `blog_posts`, `blog_post_tags`, `blog_tags`, `blog_comments`, `blog_ratings`, `blog_post_views`
- **No blog API routes** — need: CRUD + moderation + search endpoints
- **No admin blog dashboard** — need full moderation interface
- **No rich text editor** — need a Tiptap/ProseMirror or similar (currently no rich text deps in package.json)
- **No image upload** — need to wire into existing Supabase storage (avatar bucket exists in migration 15)
- **No email notification system** — existing email infrastructure in `src/lib/email/` can be reused
- **No in-app notification dispatch** — can use existing `notifications` table via admin client

---

## 2. DATABASE SCHEMA (New Migration: `20250101000031_blog_community_tables.sql`)

```sql
-- Categories for blog posts (e.g., "Instagram", "YouTube", "M-Pesa", "Tips")
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT DEFAULT '#00A859',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,                    -- JSON from rich text editor
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.blog_categories(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'members')),
  is_featured BOOLEAN DEFAULT FALSE,
  reading_time_minutes INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT
);

-- Tags for fine-grained categorization
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Many-to-many: posts <-> tags
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- User ratings (1-5 stars, fractional support via DECIMAL)
CREATE TABLE IF NOT EXISTS public.blog_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Comments with nested replies
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,                         -- for anonymous or deleted users
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'reported', 'removed')),
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View tracking (for "most discussed", "trending")
CREATE TABLE IF NOT EXISTS public.blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- Categories: read public, admin write
CREATE POLICY "Categories are publicly readable" ON public.blog_categories
  FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON public.blog_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Posts: only published posts visible to public; authors see their own; admins see all
CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' AND visibility IN ('public', 'members'));
CREATE POLICY "Authors can read own posts" ON public.blog_posts
  FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can read all posts" ON public.blog_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
CREATE POLICY "Authors can insert draft posts" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own drafts" ON public.blog_posts
  FOR UPDATE USING (auth.uid() = author_id OR author_id IS NULL);
CREATE POLICY "Admins can update all posts" ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Tags: public read
CREATE POLICY "Tags are publicly readable" ON public.blog_tags FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage tags" ON public.blog_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Post tags: public read
CREATE POLICY "Post tags are publicly readable" ON public.blog_post_tags FOR SELECT USING (TRUE);

-- Ratings: public read (average), authenticated users can rate
CREATE POLICY "Ratings are publicly readable" ON public.blog_ratings FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can rate" ON public.blog_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.blog_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments: approved comments visible to public; authors see own pending
CREATE POLICY "Public can read approved comments" ON public.blog_comments
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can read own comments" ON public.blog_comments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can comment" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id OR author_name IS NOT NULL);
CREATE POLICY "Comment authors can edit own comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can moderate comments" ON public.blog_comments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Views: authenticated users can log views
CREATE POLICY "Authenticated users can log views" ON public.blog_post_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Views are readable by authenticated users" ON public.blog_post_views
  FOR SELECT USING (TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_ratings_post ON public.blog_ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_post ON public.blog_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON public.blog_post_tags(tag_id);
```

---

## 3. API ROUTE STRUCTURE

### Public (no auth required)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/blog/posts` | GET | List published posts (with pagination, category/tag filter, search) |
| `/api/blog/posts/[slug]` | GET | Get single published post by slug |
| `/api/blog/categories` | GET | List all active categories |
| `/api/blog/tags` | GET | List all tags |
| `/api/blog/posts/[slug]/ratings` | GET | Get average rating for a post |
| `/api/blog/posts/[slug]/comments` | GET | Get approved comments for a post |

### Authenticated (user session required)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/blog/posts` | POST | Create draft post (user must have `role` of 'contributor' or 'admin') |
| `/api/blog/posts/[id]` | PATCH | Update own draft post |
| `/api/blog/posts/[id]/submit` | POST | Submit draft for review (status: pending) |
| `/api/blog/posts/[slug]/ratings` | POST | Submit/update rating |
| `/api/blog/posts/[slug]/comments` | POST | Create top-level comment |
| `/api/blog/comments/[id]/replies` | POST | Create reply to comment |
| `/api/blog/comments/[id]` | DELETE | Delete own comment (if pending or approved by author) |
| `/api/blog/comments/[id]/report` | POST | Report a comment |
| `/api/blog/search` | GET | Search posts by title/content/tags |

### Admin/Moderator (role = 'admin' or 'moderator')
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/blog/posts` | GET | List all posts (any status) |
| `/api/admin/blog/posts/[id]` | PATCH | Update any post (status, featured, etc.) |
| `/api/admin/blog/categories` | GET/POST | Manage categories |
| `/api/admin/blog/tags` | GET/POST | Manage tags |
| `/api/admin/blog/posts/pending` | GET | List posts pending review |
| `/api/admin/blog/comments` | GET | List all comments (moderation queue) |
| `/api/admin/blog/comments/[id]` | PATCH | Approve/reject/remove comment |
| `/api/admin/blog/ratings` | GET | List reported ratings |
| `/api/admin/blog/analytics` | GET | Views, ratings, comments, engagement stats |
| `/api/admin/blog/notifications` | POST | Dispatch in-app + email notifications |

---

## 4. PAGE STRUCTURE (App Router)

### Public Pages
```
src/app/blog/
├── page.tsx                          # Blog hub: featured + latest + categories + search
├── [category]/                      # Category filter pages (catch-all: /blog/[category])
│   └── page.tsx                     # Filtered posts by category slug
├── [slug]/                          # Individual article pages
│   └── page.tsx                     # Full article with comments, ratings, related posts
└── search/
    └── page.tsx                     # Search results page (or use ?q= query param)
```

### Authenticated Pages
```
src/app/blog/write/
├── page.tsx                         # Write new article (rich text editor)
└── [id]/edit/
    └── page.tsx                     # Edit existing draft

src/app/blog/drafts/
└── page.tsx                         # User's drafts and pending posts

src/app/blog/my-articles/
└── page.tsx                         # User's published articles
```

### Admin Pages
```
src/app/admin/blog/
├── page.tsx                         # Blog dashboard overview
├── articles/
│   ├── page.tsx                     # All articles list (with status filter tabs)
│   ├── pending/
│   │   └── page.tsx                 # Pending review queue
│   └── [id]/edit/
│       └── page.tsx                 # Edit any article (admin view)
├── categories/
│   └── page.tsx                     # Manage categories
├── tags/
│   └── page.tsx                     # Manage tags
├── comments/
│   └── page.tsx                     # Moderation queue for comments
├── ratings/
│   └── page.tsx                     # Moderate ratings
├── reports/
│   └── page.tsx                     # Reported content queue
├── analytics/
│   └── page.tsx                     # Blog analytics dashboard
└── notifications/
    └── page.tsx                     # Send blog-related notifications
```

### User Dashboard Pages
```
src/app/notifications/
└── page.tsx                         # User notification center (All/Unread/Articles/Comments/Replies/Ratings/System)
```

---

## 5. COMPONENT LIBRARY

### Blog-specific components (`/src/components/blog/`)
```
blog/
├── BlogCard.tsx                    # Post card: title, excerpt, cover, author, date, reading time
├── FeaturedBlogCard.tsx            # Larger card for featured posts
├── CategoryBadge.tsx               # Colored category pill
├── TagBadge.tsx                    # Tag pill
├── RatingStars.tsx                 # Display average rating (fractional)
├── RatingInput.tsx                 # Interactive star input (1-5, fractional)
├── CommentCard.tsx                 # Single comment with nested replies
├── ReplyThread.tsx                 # Nested reply display
├── RichTextEditor.tsx              # Tiptap-based editor (needs tiptap deps)
├── BlogSearch.tsx                  # Search input with debounced results
├── CategoryNav.tsx                 # Horizontal category filter bar
├── BlogPagination.tsx              # Pagination component
├── BlogFilters.tsx                 # Sort/filter dropdowns (latest, trending, top-rated)
├── ShareButtons.tsx                # Social sharing + copy link
├── RelatedArticles.tsx             # Carousel/grid of related posts
├── AuthorCard.tsx                  # Author bio + other articles
├── BlogHeader.tsx                  # Blog page header with nav
├── EmptyState.tsx                  # Empty search/category results
├── LoadingState.tsx                # Skeleton loaders
└── ErrorState.tsx                  # Error boundaries
```

### Admin components (`/src/components/admin/blog/`)
```
admin/blog/
├── BlogDashboardStats.tsx          # Overview metrics cards
├── ArticleModerationTable.tsx      # Table with status tabs
├── CommentModerationQueue.tsx      # Comment moderation interface
├── RatingModerationList.tsx        # Flagged ratings
├── CategoryManager.tsx             # CRUD categories UI
├── TagManager.tsx                  # CRUD tags UI
├── BlogAnalytics.tsx               # Charts/graphs for engagement
└── NotificationComposer.tsx        # Send notifications to audience
```

### Reused existing components
- `Sidebar.tsx`, `Header.tsx`, `Footer.tsx`, `AnnouncementBanner.tsx`, `LiveTicker.tsx`
- `AuthContext` for user/auth state
- `AuthModal` for sign-in/register prompts
- `ErrorBoundary` for error boundaries
- `Skeleton` for loading states
- `CountdownTimer` for promotion posts
- `ThemeProvider` / `ThemeToggle` for dark/light mode

---

## 6. PERMISSION MODEL IMPLEMENTATION

### Middleware additions (`src/middleware.ts`)
Add to `isProtectedPage`:
```typescript
pathname.startsWith("/blog/write") ||
pathname.startsWith("/blog/drafts") ||
pathname.startsWith("/blog/my-articles") ||
pathname.startsWith("/admin/blog")
```

`/blog/[slug]` and `/blog` and `/blog/search` remain public (read-only).

### Auth context additions
Add to `Profile` interface:
```typescript
interface Profile {
  // existing fields...
  role: string;          // 'user' | 'contributor' | 'moderator' | 'admin'
}
```

New role levels:
- `user` — can read, rate, comment
- `contributor` — can write articles (submit for review)
- `moderator` — can approve/reject articles and comments
- `admin` — full access

Add to `AuthContext`:
```typescript
isContributor: boolean; // user.role === 'contributor' || user.role === 'moderator' || user.role === 'admin'
```

### API auth pattern
Use existing `getUserFromRequest()` for server-side auth checks. Return 401 for unauthenticated, 403 for insufficient role.

---

## 7. INCREMENTAL IMPLEMENTATION PHASES

### Phase 1: Core Blog Infrastructure (2-3 days)
**Goal**: Working blog hub with static content structure, ready for dynamic data

1. Create DB migration `20250101000031_blog_community_tables.sql`
2. Create `src/lib/blog/types.ts` — shared types
3. Create `src/lib/blog/data.ts` — data access layer (Supabase queries)
4. Create `src/app/blog/data.ts` — server-side data fetching helpers
5. Build `src/app/blog/page.tsx` — enhanced blog hub with:
   - Featured post carousel
   - Latest posts grid
   - Category filter bar
   - Search bar
   - Sort options (latest, trending, top-rated)
6. Create `src/components/blog/` components for the hub

**Deliverable**: `/blog` page with dynamic categories, search, and sortable post grid

### Phase 2: Individual Article Pages (2 days)
**Goal**: Full article page with all interactive features

1. Create `src/app/blog/[slug]/page.tsx` — server-rendered article page
2. Build article page components:
   - `RatingStars.tsx` — fractional star display
   - `RatingInput.tsx` — interactive rating (auth required)
   - `CommentCard.tsx` + `ReplyThread.tsx` — comment system
   - `RelatedArticles.tsx` — related post suggestions
   - `ShareButtons.tsx` — social sharing
   - `AuthorCard.tsx` — author info
3. Create API routes:
   - `GET /api/blog/posts/[slug]` — fetch article + related
   - `POST /api/blog/posts/[slug]/ratings` — submit rating
   - `GET /api/blog/posts/[slug]/comments` — fetch approved comments
   - `POST /api/blog/posts/[slug]/comments` — create comment
   - `POST /api/blog/comments/[id]/replies` — create reply

**Deliverable**: Full article pages with ratings, comments, reply threads, related posts, sharing

### Phase 3: Writing & CMS (3 days)
**Goal**: Authors can write, submit, and manage articles

1. Install rich text editor: `tiptap` (or `react-hook-form` + custom)
2. Create `src/app/blog/write/page.tsx` — rich text editor page
3. Create `src/app/blog/drafts/page.tsx` — user's drafts/pending
4. Create `src/app/blog/my-articles/page.tsx` — user's published articles
5. Build `RichTextEditor.tsx` component
6. Create API routes:
   - `POST /api/blog/posts` — create draft
   - `PATCH /api/blog/posts/[id]` — update draft
   - `POST /api/blog/posts/[id]/submit` — submit for review
7. Add role check: `contributor` or higher can access write pages

**Deliverable**: Full write/edit workflow with drafts, submission, and article management

### Phase 4: Admin Moderation (2-3 days)
**Goal**: Admin dashboard for content moderation

1. Create `src/app/admin/blog/page.tsx` — dashboard overview
2. Create `src/app/admin/blog/articles/page.tsx` — all articles with status tabs
3. Create `src/app/admin/blog/articles/pending/page.tsx` — pending review queue
4. Create `src/app/admin/blog/articles/[id]/edit/page.tsx` — admin article editor
5. Create `src/app/admin/blog/comments/page.tsx` — comment moderation
6. Create `src/app/admin/blog/ratings/page.tsx` — rating moderation
7. Create `src/app/admin/blog/reports/page.tsx` — reported content queue
8. Create `src/app/admin/blog/categories/page.tsx` — category management
9. Create `src/app/admin/blog/tags/page.tsx` — tag management
10. Create `src/app/admin/blog/analytics/page.tsx` — analytics dashboard
11. Create `src/app/admin/blog/notifications/page.tsx` — notification composer
12. Add admin API routes for all moderation actions

**Deliverable**: Full admin blog dashboard with moderation capabilities

### Phase 5: Community Features & Notifications (2 days)
**Goal**: Community engagement and notification system

1. Create `src/app/notifications/page.tsx` — user notification center
2. Build notification UI components:
   - Notification bell in Header
   - Notification center with category tabs
3. Wire blog events to notification system:
   - New article approved → notification to author
   - Comment on your article → notification
   - Reply to your comment → notification
   - Rating received → notification
4. Email notification dispatch via existing `src/lib/email/` infrastructure

**Deliverable**: Full notification system integrated with blog

### Phase 6: Polish & Analytics (1-2 days)
**Goal**: Production-ready polish

1. Implement view tracking (increment on page view, deduplicate by IP/user)
2. Add structured data (JSON-LD) for blog posts and articles
3. Add sitemap.xml entries for blog posts
4. Implement OG image generation for blog posts
5. Add print styles for articles
6. Mobile responsiveness QA
7. Performance optimization (lazy loading, image optimization)

**Deliverable**: Production-ready blog with SEO, analytics, and polish

---

## 8. ROUTING MAP (Updated `middleware.ts` matcher)

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/admin",
    "/admin/:path*",
    "/blog/write/:path*",              // ADD
    "/blog/drafts/:path*",             // ADD
    "/blog/my-articles/:path*",        // ADD
    "/notifications/:path*",           // ADD
    "/orders/:path*",
    "/pay",
    "/wallet/:path*",
    "/settings/:path*",
  ],
};
```

Public routes (no middleware protection):
- `/blog/*` (read-only)
- `/blog/[slug]` (public article view)
- `/blog/search` (search results)
- `/blog/[category]` (category listing)

---

## 9. COMPONENT INTERACTION FLOW

```
User visits /blog
  → BlogPage (server component) fetches categories + featured + latest posts
  → Renders BlogHeader, CategoryNav, BlogSearch, FeaturedBlogCard, BlogCard[]
  → Clicking a post → /blog/[slug]
    → BlogPostPage (server component) fetches post + related + comments
    → Renders article content, RatingStars, CommentCard[], ShareButtons
    → Authenticated users can: submit rating (RatingInput), comment (CommentCard)
    → Clicking reply → creates nested ReplyThread
  → Clicking "Write" → /blog/write
    → BlogWritePage (client component with RichTextEditor)
    → Save Draft → POST /api/blog/posts (status: draft)
    → Submit for Review → POST /api/blog/posts/[id]/submit (status: pending)
    → Moderator gets notification → approves via /admin/blog/articles/pending
    → Admin updates status to 'published' → triggers notification to author + active users
```

---

## 10. DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "@tiptap/react": "^2.x",           // Rich text editor
    "@tiptap/starter-kit": "^2.x",     // Basic editor extensions
    "@tiptap/extension-link": "^2.x",  // Link support
    "@tiptap/extension-image": "^2.x",  // Image support
    "@tiptap/extension-placeholder": "^2.x",
    "lucide-react": "^0.400.x",        // Icons (check if already available)
    "date-fns": "^3.x"                  // Date formatting (or use Intl)
  }
}
```

Check if `lucide-react` is already available:
- Current deps only have: `@supabase/ssr`, `@supabase/supabase-js`, `next`, `nodemailer`, `react`, `react-dom`
- No icon library currently — would need to add `lucide-react` or use inline SVGs

**Alternative**: Use existing inline SVGs (the codebase already uses raw SVG icons extensively in Header, Footer, etc.) to avoid adding dependencies.

---

## 11. MIGRATION STRATEGY

### Approach: Database-first
1. Apply migration to Supabase dashboard SQL editor
2. Verify tables with `SELECT * FROM blog_posts LIMIT 1;`
3. Deploy API routes
4. Deploy frontend pages

### Seeding
- Create 3-5 initial categories: "Instagram", "YouTube", "TikTok", "M-Pesa", "Tips & Tricks"
- Create 2-3 initial tags: "beginner", "advanced", "promotion", "tutorial"

### Data migration from existing static content
- Move content from `/blog/page.tsx` posts → `blog_posts` table
- Move `/instagram-setup-guide/` → `/blog/instagram-setup-guide/` (redirect old URL)
- Move `/how-it-works/` → `/blog/how-it-works/` (redirect old URL)
- Create category mappings for each existing post

---

## 12. TESTING STRATEGY

### Unit tests (vitest)
- `src/app/api/blog/posts/route.test.ts` — list/filter/permissions
- `src/app/api/blog/posts/[slug]/route.test.ts` — single post fetch
- `src/app/api/blog/ratings/route.test.ts` — rating submit/validate
- `src/app/api/blog/comments/route.test.ts` — comment create/moderate
- `src/lib/blog/data.test.ts` — data access layer

### Integration points to test
- Auth role checks at API level
- Moderation workflow: draft → pending → published
- Comment nesting depth limits
- Rating validation (1-5, fractional)
- Search relevancy scoring

---

## 13. SEO & MARKETING INTEGRATION

### Structured Data
- JSON-LD `BlogPosting` for individual articles
- JSON-LD `Blog` for the main listing page
- BreadcrumbList for navigation
- HowTo schema where applicable (matching the "guide" style posts)

### Marketing Funnel CTAs
- Article pages include relevant order CTAs:
  - Instagram article → "Ready to boost your Instagram? → [Place Order](/order?category=instagram)"
  - YouTube article → "Need real watch time? → [Order YouTube Views](/order?category=youtube)"
- Newsletter signup at bottom of articles
- Related articles section drives internal linking

### Analytics Events
- Post view (for trending calculation)
- Rating submission
- Comment submission
- Share button clicks
- CTA clicks to ordering

---

## 14. NEXT STEPS

1. **Get approval on the schema** — review DB design, suggest adjustments
2. **Apply migration** — create tables in Supabase dashboard
3. **Create seed data** — categories + tags
4. **Start Phase 1** — blog hub with dynamic data
5. **Set up rich text editor** — evaluate Tiptap vs. native contentEditable vs. MDX