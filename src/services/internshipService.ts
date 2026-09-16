import { supabase } from './supabase';

export interface InternshipListing {
  id: string;
  recruiterId?: string;
  companyName: string;
  title: string;
  type: string;
  location: string;
  stipend: string;
  stipendAmount: number;
  duration: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  tags: string[];
  remote: boolean;
  urgent: boolean;
  education: string;
  experience: string;
  companyLogo?: string;
  status: 'active' | 'closed' | 'flagged';
  createdAt: string;
  deadline: string;
  matchScore?: number;
}

export interface Application {
  id: string;
  listingId: string;
  studentId: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'selected';
  coverLetter: string;
  resumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  listing?: InternshipListing;
  student?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    skills: string[];
    education?: string;
    phone?: string;
  };
}

// Fallback seed data if DB is empty or during offline testing
const FALLBACK_LISTINGS: InternshipListing[] = [
  {
    id: 'f1010000-0000-0000-0000-000000000101',
    companyName: 'TechCorp Solutions',
    title: 'Frontend Developer Intern',
    type: 'Internship',
    location: 'Remote',
    stipend: '₹25,000/month',
    stipendAmount: 25000,
    duration: '3 months',
    description: 'Join our dynamic frontend team to build modern React applications. You will collaborate with senior developers and UI designers.',
    requirements: ['Solid understanding of React and JavaScript', 'Familiarity with HTML/CSS & Tailwind', 'Good problem solving skills'],
    skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Git'],
    benefits: ['Certificate of Completion', 'Letter of Recommendation', 'Flexible Work Hours', 'Pre-placement Offer Potential'],
    tags: ['React', 'Frontend', 'Remote'],
    remote: true,
    urgent: true,
    education: 'B.Tech / BE (CS/IT/ECE)',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000102',
    companyName: 'DataFlow Systems',
    title: 'Backend Engineering Intern',
    type: 'Internship',
    location: 'Bangalore, India',
    stipend: '₹30,000/month',
    stipendAmount: 30000,
    duration: '6 months',
    description: 'Work on building scalable microservices and database optimizations using Node.js, Python, and PostgreSQL.',
    requirements: ['Proficiency in Node.js or Python', 'Basic knowledge of SQL databases', 'Understanding of RESTful APIs'],
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'Git'],
    benefits: ['Competitive Stipend', 'Mentorship Program', 'Free Lunch & Snacks', 'PPO Opportunity'],
    tags: ['Backend', 'Node.js', 'PostgreSQL'],
    remote: false,
    urgent: false,
    education: 'B.Tech / BE / MCA',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'f1010000-0000-0000-0000-000000000103',
    companyName: 'Analytics Pro',
    title: 'Data Science & ML Intern',
    type: 'Internship',
    location: 'Hyderabad, India',
    stipend: '₹28,000/month',
    stipendAmount: 28000,
    duration: '6 months',
    description: 'Extract insights from massive datasets and develop predictive models using Python, Pandas, and Machine Learning algorithms.',
    requirements: ['Strong Python programming', 'Knowledge of Pandas, NumPy, Scikit-learn', 'Basic statistics background'],
    skills: ['Python', 'Pandas', 'Machine Learning', 'PostgreSQL'],
    benefits: ['Hands-on project experience', 'Industry publication opportunities', 'Mentorship'],
    tags: ['Data Science', 'Python', 'ML'],
    remote: true,
    urgent: true,
    education: 'B.Tech / M.Tech / Data Science specialization',
    experience: 'Fresher',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&crop=faces',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export class InternshipService {
  /**
   * Fetch active listings with optional filtering, search & pagination
   */
  public static async fetchListings(params?: {
    search?: string;
    location?: string;
    minStipend?: number;
    skill?: string;
    remoteOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ listings: InternshipListing[]; total: number }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      let query = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (params?.search) {
        const s = `%${params.search}%`;
        query = query.or(`title.ilike.${s},company_name.ilike.${s},description.ilike.${s}`);
      }

      if (params?.location) {
        query = query.ilike('location', `%${params.location}%`);
      }

      if (params?.minStipend && params.minStipend > 0) {
        query = query.gte('stipend_amount', params.minStipend);
      }

      if (params?.remoteOnly) {
        query = query.eq('remote', true);
      }

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback filter
        let filtered = [...FALLBACK_LISTINGS];
        if (params?.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(l => 
            l.title.toLowerCase().includes(s) || 
            l.companyName.toLowerCase().includes(s) || 
            l.skills.some(sk => sk.toLowerCase().includes(s))
          );
        }
        if (params?.remoteOnly) {
          filtered = filtered.filter(l => l.remote);
        }
        if (params?.minStipend) {
          filtered = filtered.filter(l => l.stipendAmount >= params.minStipend!);
        }
        return {
          listings: filtered.slice(from, from + limit),
          total: filtered.length
        };
      }

      const listings: InternshipListing[] = data.map(item => ({
        id: item.id,
        recruiterId: item.recruiter_id,
        companyName: item.company_name,
        title: item.title,
        type: item.type || 'Internship',
        location: item.location || 'Remote',
        stipend: item.stipend || '₹20,000/month',
        stipendAmount: Number(item.stipend_amount || 0),
        duration: item.duration || '3 months',
        description: item.description || '',
        requirements: item.requirements || [],
        skills: item.skills || [],
        benefits: item.benefits || [],
        tags: item.tags || [],
        remote: item.remote ?? true,
        urgent: item.urgent ?? false,
        education: item.education || 'Any degree',
        experience: item.experience || 'Fresher',
        companyLogo: item.company_logo || 'https://via.placeholder.com/60?text=' + encodeURIComponent(item.company_name.charAt(0)),
        status: item.status || 'active',
        createdAt: item.created_at,
        deadline: item.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      return { listings, total: count || listings.length };
    } catch (err) {
      console.error('Error fetching listings from Supabase:', err);
      return { listings: FALLBACK_LISTINGS, total: FALLBACK_LISTINGS.length };
    }
  }

  /**
   * Create a new internship listing (Recruiter action)
   */
  public static async createListing(listing: Partial<InternshipListing>): Promise<InternshipListing> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Must be logged in as a recruiter to post an internship.');
    }

    const newRow = {
      recruiter_id: session.user.id,
      company_name: listing.companyName,
      title: listing.title,
      type: listing.type || 'Internship',
      location: listing.location || 'Remote',
      stipend: listing.stipend || '₹20,000/month',
      stipend_amount: listing.stipendAmount || 20000,
      duration: listing.duration || '3 months',
      description: listing.description || '',
      requirements: listing.requirements || [],
      skills: listing.skills || [],
      benefits: listing.benefits || [],
      tags: listing.tags || [],
      remote: listing.remote ?? true,
      urgent: listing.urgent ?? false,
      education: listing.education || 'Any degree',
      experience: listing.experience || 'Fresher',
      company_logo: listing.companyLogo || '',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('listings')
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      recruiterId: data.recruiter_id,
      companyName: data.company_name,
      title: data.title,
      type: data.type,
      location: data.location,
      stipend: data.stipend,
      stipendAmount: Number(data.stipend_amount),
      duration: data.duration,
      description: data.description,
      requirements: data.requirements,
      skills: data.skills,
      benefits: data.benefits,
      tags: data.tags,
      remote: data.remote,
      urgent: data.urgent,
      education: data.education,
      experience: data.experience,
      companyLogo: data.company_logo,
      status: data.status,
      createdAt: data.created_at,
      deadline: data.deadline
    };
  }

  /**
   * Submit student application (Strict RLS checked)
   */
  public static async applyToListing(listingId: string, coverLetter: string = '', resumeUrl: string = ''): Promise<Application> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Unauthenticated users cannot submit applications. Please log in first.');
    }

    const studentId = session.user.id;

    // Check existing application to prevent duplicate submissions
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('listing_id', listingId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      throw new Error('You have already submitted an application for this internship.');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        listing_id: listingId,
        student_id: studentId,
        status: 'applied',
        cover_letter: coverLetter,
        resume_url: resumeUrl
      })
      .select()
      .single();

    if (error) {
      console.error('Error applying to listing:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      listingId: data.listing_id,
      studentId: data.student_id,
      status: data.status,
      coverLetter: data.cover_letter,
      resumeUrl: data.resume_url,
      appliedAt: data.applied_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Fetch applications for student dashboard
   */
  public static async fetchStudentApplications(studentId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        listing_id,
        student_id,
        status,
        cover_letter,
        resume_url,
        applied_at,
        updated_at,
        listings (*)
      `)
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching student applications:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      listingId: item.listing_id,
      studentId: item.student_id,
      status: item.status,
      coverLetter: item.cover_letter,
      resumeUrl: item.resume_url,
      appliedAt: item.applied_at,
      updatedAt: item.updated_at,
      listing: item.listings ? {
        id: item.listings.id,
        companyName: item.listings.company_name,
        title: item.listings.title,
        type: item.listings.type,
        location: item.listings.location,
        stipend: item.listings.stipend,
        stipendAmount: Number(item.listings.stipend_amount),
        duration: item.listings.duration,
        description: item.listings.description,
        requirements: item.listings.requirements || [],
        skills: item.listings.skills || [],
        benefits: item.listings.benefits || [],
        tags: item.listings.tags || [],
        remote: item.listings.remote,
        urgent: item.listings.urgent,
        education: item.listings.education,
        experience: item.listings.experience,
        companyLogo: item.listings.company_logo,
        status: item.listings.status,
        createdAt: item.listings.created_at,
        deadline: item.listings.deadline
      } : undefined
    }));
  }

  /**
   * Fetch listings created by recruiter for recruiter dashboard
   */
  public static async fetchRecruiterListings(recruiterId: string): Promise<InternshipListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('recruiter_id', recruiterId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching recruiter listings:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      recruiterId: item.recruiter_id,
      companyName: item.company_name,
      title: item.title,
      type: item.type,
      location: item.location,
      stipend: item.stipend,
      stipendAmount: Number(item.stipend_amount),
      duration: item.duration,
      description: item.description,
      requirements: item.requirements || [],
      skills: item.skills || [],
      benefits: item.benefits || [],
      tags: item.tags || [],
      remote: item.remote,
      urgent: item.urgent,
      education: item.education,
      experience: item.experience,
      companyLogo: item.company_logo,
      status: item.status,
      createdAt: item.created_at,
      deadline: item.deadline
    }));
  }

  /**
   * Fetch applicants for a recruiter listing
   */
  public static async fetchApplicationsForListing(listingId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        listing_id,
        student_id,
        status,
        cover_letter,
        resume_url,
        applied_at,
        updated_at,
        profiles (id, name, email, avatar_url, skills, education, phone)
      `)
      .eq('listing_id', listingId)
      .order('applied_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching listing applications:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      listingId: item.listing_id,
      studentId: item.student_id,
      status: item.status,
      coverLetter: item.cover_letter,
      resumeUrl: item.resume_url,
      appliedAt: item.applied_at,
      updatedAt: item.updated_at,
      student: item.profiles ? {
        id: item.profiles.id,
        name: item.profiles.name || 'Anonymous Student',
        email: item.profiles.email,
        avatarUrl: item.profiles.avatar_url,
        skills: item.profiles.skills || [],
        education: item.profiles.education,
        phone: item.profiles.phone
      } : undefined
    }));
  }

  /**
   * Update application status (Recruiter action: applied / shortlisted / rejected / selected)
   */
  public static async updateApplicationStatus(applicationId: string, status: 'applied' | 'shortlisted' | 'rejected' | 'selected'): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating application status:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Delete or flag listing (Admin / Recruiter action)
   */
  public static async updateListingStatus(listingId: string, status: 'active' | 'closed' | 'flagged'): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', listingId);

    if (error) {
      console.error('Error updating listing status:', error);
      throw new Error(error.message);
    }
  }
}
