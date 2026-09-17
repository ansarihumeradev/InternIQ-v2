-- ====================================================================
-- InternIQ Complete Database Schema & Row Level Security (RLS) Setup
-- ====================================================================

-- 1. PROFILES TABLE & AUTOMATIC USER SIGNUP TRIGGER
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'recruiter', 'admin')),
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  experience TEXT DEFAULT 'Fresher',
  location TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  portfolio TEXT DEFAULT '',
  education TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  github_username TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "System can insert profile on signup" ON public.profiles;
CREATE POLICY "System can insert profile on signup" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Trigger Function: Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    role = COALESCE(public.profiles.role, EXCLUDED.role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. INTERNSHIP LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'Internship',
  location TEXT DEFAULT 'Remote',
  stipend TEXT DEFAULT '₹20,000/month',
  stipend_amount NUMERIC DEFAULT 20000,
  duration TEXT DEFAULT '3 months',
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  remote BOOLEAN DEFAULT true,
  urgent BOOLEAN DEFAULT false,
  education TEXT DEFAULT 'Any degree',
  experience TEXT DEFAULT 'Fresher',
  company_logo TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Listings Policies
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone" ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Recruiters and admins can insert listings" ON public.listings;
CREATE POLICY "Recruiters and admins can insert listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = recruiter_id
  );

DROP POLICY IF EXISTS "Recruiters can update own listings" ON public.listings;
CREATE POLICY "Recruiters can update own listings" ON public.listings
  FOR UPDATE USING (
    auth.uid() = recruiter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Recruiters can delete own listings" ON public.listings;
CREATE POLICY "Recruiters can delete own listings" ON public.listings
  FOR DELETE USING (
    auth.uid() = recruiter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- 3. APPLICATIONS TABLE (STRICT RLS COVERAGE)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
  cover_letter TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_listing UNIQUE (listing_id, student_id)
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications RLS Policies (Fixing Issue #2)
DROP POLICY IF EXISTS "Students can insert own applications" ON public.applications;
CREATE POLICY "Students can insert own applications" ON public.applications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = student_id
  );

DROP POLICY IF EXISTS "Users can view relevant applications" ON public.applications;
CREATE POLICY "Users can view relevant applications" ON public.applications
  FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = applications.listing_id 
      AND listings.recruiter_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Recruiters and admins can update applications" ON public.applications;
CREATE POLICY "Recruiters and admins can update applications" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = applications.listing_id 
      AND listings.recruiter_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) OR
    auth.uid() = student_id
  );

DROP POLICY IF EXISTS "Students can delete own applications" ON public.applications;
CREATE POLICY "Students can delete own applications" ON public.applications
  FOR DELETE USING (auth.uid() = student_id);


-- 4. SKILL GRAPH DATA MODEL TABLES

-- 4a. SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skills viewable by everyone" ON public.skills;
CREATE POLICY "Skills viewable by everyone" ON public.skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage skills" ON public.skills;
CREATE POLICY "Admins can manage skills" ON public.skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- 4b. STUDENT_SKILLS
CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  confidence_score NUMERIC DEFAULT 0.7 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  source TEXT DEFAULT 'self' CHECK (source IN ('self', 'github', 'resume', 'assessment')),
  evidence JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_skill_source UNIQUE (student_id, skill_id, source)
);

ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Student skills viewable by everyone" ON public.student_skills;
CREATE POLICY "Student skills viewable by everyone" ON public.student_skills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can manage own skills" ON public.student_skills;
CREATE POLICY "Students can manage own skills" ON public.student_skills
  FOR ALL USING (auth.uid() = student_id);


-- 4c. SKILL_EDGES
CREATE TABLE IF NOT EXISTS public.skill_edges (
  from_skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  to_skill_id TEXT REFERENCES public.skills(id) ON DELETE CASCADE,
  relation TEXT DEFAULT 'depends_on',
  PRIMARY KEY (from_skill_id, to_skill_id)
);

ALTER TABLE public.skill_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skill edges viewable by everyone" ON public.skill_edges;
CREATE POLICY "Skill edges viewable by everyone" ON public.skill_edges
  FOR SELECT USING (true);


-- 4d. ROLE_REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.role_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT NOT NULL,
  skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  min_proficiency TEXT DEFAULT 'beginner',
  weight NUMERIC DEFAULT 1.0
);

ALTER TABLE public.role_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Role requirements viewable by everyone" ON public.role_requirements;
CREATE POLICY "Role requirements viewable by everyone" ON public.role_requirements
  FOR SELECT USING (true);


-- 5. SEED DEFAULT SKILLS & ROLE REQUIREMENTS
INSERT INTO public.skills (id, name, category) VALUES
  ('react', 'React', 'Frontend'),
  ('javascript', 'JavaScript', 'Languages'),
  ('typescript', 'TypeScript', 'Languages'),
  ('python', 'Python', 'Languages'),
  ('java', 'Java', 'Languages'),
  ('php', 'PHP', 'Languages'),
  ('nodejs', 'Node.js', 'Backend'),
  ('postgresql', 'PostgreSQL', 'Databases'),
  ('mongodb', 'MongoDB', 'Databases'),
  ('figma', 'Figma', 'Design'),
  ('docker', 'Docker', 'DevOps'),
  ('git', 'Git', 'Tools'),
  ('html', 'HTML5', 'Frontend'),
  ('css', 'CSS3', 'Frontend'),
  ('tailwind', 'Tailwind CSS', 'Frontend'),
  ('pandas', 'Pandas', 'Data Science'),
  ('machine-learning', 'Machine Learning', 'Data Science')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.skill_edges (from_skill_id, to_skill_id, relation) VALUES
  ('react', 'javascript', 'depends_on'),
  ('typescript', 'javascript', 'extends'),
  ('nodejs', 'javascript', 'depends_on'),
  ('tailwind', 'css', 'depends_on')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_requirements (role_id, skill_id, min_proficiency, weight) VALUES
  ('frontend-developer', 'react', 'intermediate', 1.0),
  ('frontend-developer', 'javascript', 'intermediate', 0.9),
  ('frontend-developer', 'typescript', 'beginner', 0.8),
  ('frontend-developer', 'html', 'intermediate', 0.7),
  ('frontend-developer', 'tailwind', 'beginner', 0.7),
  ('backend-developer', 'nodejs', 'intermediate', 1.0),
  ('backend-developer', 'postgresql', 'intermediate', 0.9),
  ('backend-developer', 'python', 'beginner', 0.7),
  ('data-science-intern', 'python', 'intermediate', 1.0),
  ('data-science-intern', 'pandas', 'intermediate', 0.9),
  ('data-science-intern', 'machine-learning', 'beginner', 0.8)
ON CONFLICT DO NOTHING;


-- 6. SAVED / BOOKMARKED ITEMS TABLE & POLICIES
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('job', 'internship', 'company', 'resource')),
  item_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_saved_item UNIQUE (user_id, item_id, item_type)
);

-- Enable RLS on saved_items
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Saved items policies
DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
CREATE POLICY "Users can view own saved items" ON public.saved_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved items" ON public.saved_items;
CREATE POLICY "Users can insert own saved items" ON public.saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved items" ON public.saved_items;
CREATE POLICY "Users can delete own saved items" ON public.saved_items
  FOR DELETE USING (auth.uid() = user_id);

