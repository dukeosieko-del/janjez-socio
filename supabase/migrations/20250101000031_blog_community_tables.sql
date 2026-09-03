-- Blog & community content tables
-- Migration for janjez.social blog section

-- Categories for blog posts
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex TEXT DEFAULT '#00A859',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Main blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'members')),
  is_featured BOOLEAN DEFAULT FALSE,
  reading_time_minutes INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- Comments with nested replies
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'reported', 'removed')),
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- View tracking
CREATE TABLE IF NOT EXISTS public.blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- Categories: read public, admin write
CREATE POLICY "Categories are publicly readable" ON public.blog_categories FOR SELECT USING (TRUE);
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
  FOR UPDATE USING (auth.uid() = author_id);
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
  FOR INSERT WITH CHECK (auth.uid() = user_id);
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

-- RPC: Increment view count for a blog post
CREATE OR REPLACE FUNCTION public.increment_blog_view(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;
