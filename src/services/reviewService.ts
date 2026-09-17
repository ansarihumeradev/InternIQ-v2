import { supabase } from './supabase';

export interface CompanyReview {
  id: string;
  studentId: string;
  listingId: string;
  companyName: string;
  rating: number;
  reviewText: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  studentName?: string;
}

export interface ScamReport {
  id: string;
  studentId: string;
  listingId: string;
  companyName: string;
  reason: 'Asked for money' | 'No response after selection' | 'Fake/misleading listing' | 'Other';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ApplicantEligibility {
  hasApplied: boolean;
  hasReviewed: boolean;
  hasReported: boolean;
}

export interface TrustIndicator {
  companyName: string;
  avgRating: number;
  reviewCount: number;
  pendingReportCount: number;
}

// Fallback seed reviews for demo & offline mode
const FALLBACK_REVIEWS: CompanyReview[] = [
  {
    id: 'rev-101',
    studentId: 'stud-1',
    listingId: 'f1010000-0000-0000-0000-000000000101',
    companyName: 'TechCorp Solutions',
    rating: 5,
    reviewText: 'Great internship program! Mentors were super supportive and I got to work on real React microfrontends.',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    studentName: 'Aarav Sharma'
  },
  {
    id: 'rev-102',
    studentId: 'stud-2',
    listingId: 'f1010000-0000-0000-0000-000000000101',
    companyName: 'TechCorp Solutions',
    rating: 4,
    reviewText: 'Stipend was paid on time every month. Good work environment and remote flexibility.',
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    studentName: 'Priya Patel'
  },
  {
    id: 'rev-103',
    studentId: 'stud-3',
    listingId: 'f1010000-0000-0000-0000-000000000101',
    companyName: 'TechCorp Solutions',
    rating: 5,
    reviewText: 'Received a Pre-Placement Offer (PPO) after 3 months! Highly recommend applying.',
    status: 'approved',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    studentName: 'Rohan Gupta'
  },
  {
    id: 'rev-104',
    studentId: 'stud-4',
    listingId: 'f1010000-0000-0000-0000-000000000102',
    companyName: 'DataFlow Systems',
    rating: 4,
    reviewText: 'Challenging backend tasks with Node.js and PostgreSQL. Learned a ton about system architecture.',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    studentName: 'Ananya Verma'
  },
  {
    id: 'rev-105',
    studentId: 'stud-5',
    listingId: 'f1010000-0000-0000-0000-000000000103',
    companyName: 'Analytics Pro',
    rating: 5,
    reviewText: 'Outstanding data science projects with real machine learning models in production.',
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    studentName: 'Kabir Mehta'
  }
];

// Fallback memory cache for offline/demo reviews & reports
let localReviewsMemory: CompanyReview[] = [...FALLBACK_REVIEWS];
let localScamReportsMemory: ScamReport[] = [];

export class ReviewService {
  /**
   * Fetch approved reviews for a specific company or listing
   */
  public static async fetchReviewsForCompany(companyName: string): Promise<CompanyReview[]> {
    try {
      const { data, error } = await supabase
        .from('company_reviews')
        .select(`
          id,
          student_id,
          listing_id,
          company_name,
          rating,
          review_text,
          status,
          created_at,
          profiles (name)
        `)
        .eq('company_name', companyName)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Could not fetch reviews from Supabase, using fallback cache:', error?.message);
        return localReviewsMemory.filter(r => r.companyName.toLowerCase() === companyName.toLowerCase() && r.status === 'approved');
      }

      return data.map((row: any) => ({
        id: row.id,
        studentId: row.student_id,
        listingId: row.listing_id,
        companyName: row.company_name,
        rating: row.rating,
        reviewText: row.review_text || '',
        status: row.status,
        createdAt: row.created_at,
        studentName: row.profiles?.name || 'Verified Applicant'
      }));
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return localReviewsMemory.filter(r => r.companyName.toLowerCase() === companyName.toLowerCase() && r.status === 'approved');
    }
  }

  /**
   * Calculate company average rating & review count
   */
  public static async fetchCompanyRatingSummary(companyName: string): Promise<{ avgRating: number; reviewCount: number }> {
    const reviews = await this.fetchReviewsForCompany(companyName);
    if (reviews.length === 0) {
      return { avgRating: 0, reviewCount: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Number((sum / reviews.length).toFixed(1));
    return { avgRating, reviewCount: reviews.length };
  }

  /**
   * Check whether a student has applied, reviewed, or reported a specific listing
   */
  public static async checkApplicantEligibility(
    userId: string | undefined,
    listingId: string
  ): Promise<ApplicantEligibility> {
    if (!userId) {
      return { hasApplied: false, hasReviewed: false, hasReported: false };
    }

    try {
      // 1. Check if student applied
      const { data: appData } = await supabase
        .from('applications')
        .select('id')
        .eq('listing_id', listingId)
        .eq('student_id', userId)
        .maybeSingle();

      const hasApplied = !!appData;

      // 2. Check if student already submitted a review
      const { data: revData } = await supabase
        .from('company_reviews')
        .select('id')
        .eq('listing_id', listingId)
        .eq('student_id', userId)
        .maybeSingle();

      const hasReviewed = !!revData || localReviewsMemory.some(r => r.listingId === listingId && r.studentId === userId);

      // 3. Check if student already reported
      const { data: repData } = await supabase
        .from('scam_reports')
        .select('id')
        .eq('listing_id', listingId)
        .eq('student_id', userId)
        .maybeSingle();

      const hasReported = !!repData || localScamReportsMemory.some(r => r.listingId === listingId && r.studentId === userId);

      return { hasApplied, hasReviewed, hasReported };
    } catch (err) {
      console.error('Error checking eligibility:', err);
      const isLocalApp = true; // Fallback for testing
      const hasRev = localReviewsMemory.some(r => r.listingId === listingId && r.studentId === userId);
      const hasRep = localScamReportsMemory.some(r => r.listingId === listingId && r.studentId === userId);
      return { hasApplied: isLocalApp, hasReviewed: hasRev, hasReported: hasRep };
    }
  }

  /**
   * Submit a student review for a company
   */
  public static async submitReview(data: {
    listingId: string;
    companyName: string;
    rating: number;
    reviewText: string;
  }): Promise<CompanyReview> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('You must be signed in to submit a review.');
    }

    const userId = session.user.id;
    const studentName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Verified Applicant';

    const newReview: Partial<CompanyReview> = {
      studentId: userId,
      listingId: data.listingId,
      companyName: data.companyName,
      rating: data.rating,
      reviewText: data.reviewText,
      status: 'approved'
    };

    const { data: inserted, error } = await supabase
      .from('company_reviews')
      .insert({
        student_id: userId,
        listing_id: data.listingId,
        company_name: data.companyName,
        rating: data.rating,
        review_text: data.reviewText,
        status: 'approved'
      })
      .select(`
        id,
        student_id,
        listing_id,
        company_name,
        rating,
        review_text,
        status,
        created_at
      `)
      .single();

    if (error || !inserted) {
      console.warn('Supabase insert review failed, caching locally:', error?.message);
      const fallbackObj: CompanyReview = {
        id: `rev-local-${Date.now()}`,
        studentId: userId,
        listingId: data.listingId,
        companyName: data.companyName,
        rating: data.rating,
        reviewText: data.reviewText,
        status: 'approved',
        createdAt: new Date().toISOString(),
        studentName
      };
      localReviewsMemory.unshift(fallbackObj);
      return fallbackObj;
    }

    const created: CompanyReview = {
      id: inserted.id,
      studentId: inserted.student_id,
      listingId: inserted.listing_id,
      companyName: inserted.company_name,
      rating: inserted.rating,
      reviewText: inserted.review_text || '',
      status: inserted.status,
      createdAt: inserted.created_at,
      studentName
    };

    localReviewsMemory.unshift(created);
    return created;
  }

  /**
   * Submit a private scam report for a listing
   */
  public static async submitScamReport(data: {
    listingId: string;
    companyName: string;
    reason: 'Asked for money' | 'No response after selection' | 'Fake/misleading listing' | 'Other';
    details: string;
  }): Promise<ScamReport> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('You must be signed in to report a listing.');
    }

    const userId = session.user.id;

    const { data: inserted, error } = await supabase
      .from('scam_reports')
      .insert({
        student_id: userId,
        listing_id: data.listingId,
        company_name: data.companyName,
        reason: data.reason,
        details: data.details,
        status: 'pending'
      })
      .select()
      .single();

    if (error || !inserted) {
      console.warn('Supabase insert scam report failed, caching locally:', error?.message);
      const fallbackRep: ScamReport = {
        id: `report-local-${Date.now()}`,
        studentId: userId,
        listingId: data.listingId,
        companyName: data.companyName,
        reason: data.reason,
        details: data.details,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      localScamReportsMemory.push(fallbackRep);
      return fallbackRep;
    }

    const createdRep: ScamReport = {
      id: inserted.id,
      studentId: inserted.student_id,
      listingId: inserted.listing_id,
      companyName: inserted.company_name,
      reason: inserted.reason,
      details: inserted.details || '',
      status: inserted.status,
      createdAt: inserted.created_at
    };

    localScamReportsMemory.push(createdRep);
    return createdRep;
  }

  /**
   * Fetch aggregate trust indicators (average ratings, review counts, pending report counts)
   * for a batch of company names (used for listing card trust badges)
   */
  public static async fetchTrustIndicatorsMap(
    companyNames: string[]
  ): Promise<Record<string, TrustIndicator>> {
    const map: Record<string, TrustIndicator> = {};
    if (companyNames.length === 0) return map;

    try {
      // 1. Fetch review stats from Supabase
      const { data: revData } = await supabase
        .from('company_reviews')
        .select('company_name, rating')
        .in('company_name', companyNames)
        .eq('status', 'approved');

      // 2. Fetch pending report counts
      const { data: repData } = await supabase
        .from('scam_reports')
        .select('company_name')
        .in('company_name', companyNames)
        .eq('status', 'pending');

      const reviewsByCompany: Record<string, number[]> = {};
      const reportsByCompany: Record<string, number> = {};

      if (revData) {
        revData.forEach((row: any) => {
          if (!reviewsByCompany[row.company_name]) reviewsByCompany[row.company_name] = [];
          reviewsByCompany[row.company_name].push(row.rating);
        });
      }

      if (repData) {
        repData.forEach((row: any) => {
          reportsByCompany[row.company_name] = (reportsByCompany[row.company_name] || 0) + 1;
        });
      }

      // Merge with local memory fallback
      localReviewsMemory.forEach(r => {
        if (!reviewsByCompany[r.companyName]) reviewsByCompany[r.companyName] = [];
        reviewsByCompany[r.companyName].push(r.rating);
      });

      localScamReportsMemory.forEach(rep => {
        reportsByCompany[rep.companyName] = (reportsByCompany[rep.companyName] || 0) + 1;
      });

      companyNames.forEach(name => {
        const ratings = reviewsByCompany[name] || [];
        const count = ratings.length;
        const avg = count > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / count).toFixed(1)) : 0;
        const pendingReportCount = reportsByCompany[name] || 0;

        map[name] = {
          companyName: name,
          avgRating: avg,
          reviewCount: count,
          pendingReportCount
        };
      });

      return map;
    } catch (err) {
      console.error('Error fetching trust indicators map:', err);
      companyNames.forEach(name => {
        const ratings = localReviewsMemory.filter(r => r.companyName.toLowerCase() === name.toLowerCase()).map(r => r.rating);
        const count = ratings.length;
        const avg = count > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / count).toFixed(1)) : 0;
        const pendingReportCount = localScamReportsMemory.filter(r => r.companyName.toLowerCase() === name.toLowerCase()).length;
        map[name] = { companyName: name, avgRating: avg, reviewCount: count, pendingReportCount };
      });
      return map;
    }
  }
}
