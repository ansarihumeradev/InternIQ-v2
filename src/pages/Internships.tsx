import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter,
  Bookmark,
  Building,
  DollarSign,
  RefreshCw,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  BookOpen,
  Star,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Lock,
  FileText,
  Upload
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { InternshipService, InternshipListing } from '../services/internshipService';
import { SkillGraphService, StudentSkill, CourseRecommendation } from '../services/skillGraphService';
import { BookmarkService } from '../services/bookmarkService';
import { ReviewService, CompanyReview, ApplicantEligibility, TrustIndicator } from '../services/reviewService';
import { openResume } from '../utils/resumeViewer';
import ReviewModal from '../components/ReviewModal';
import ScamReportModal from '../components/ScamReportModal';

const Internships: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [listings, setListings] = useState<InternshipListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minStipend, setMinStipend] = useState<number>(0);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  
  const [selectedListing, setSelectedListing] = useState<InternshipListing | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // Resume attachment state for applying
  const [resumeDataUrl, setResumeDataUrl] = useState<string>('');
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [resumeFileSize, setResumeFileSize] = useState<string>('');
  const [resumeError, setResumeError] = useState<string>('');
  const resumeInputRef = React.useRef<HTMLInputElement>(null);

  // Skill Graph integration
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [courseGaps, setCourseGaps] = useState<CourseRecommendation[]>([]);

  // Community Reviews & Scam Reporting state
  const [trustIndicators, setTrustIndicators] = useState<Record<string, TrustIndicator>>({});
  const [listingReviews, setListingReviews] = useState<CompanyReview[]>([]);
  const [applicantEligibility, setApplicantEligibility] = useState<ApplicantEligibility>({
    hasApplied: false,
    hasReviewed: false,
    hasReported: false
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (user?.role !== 'recruiter') {
      loadListings();
      loadStudentSkillsAndApplications();
    }
  }, [user?.id, user?.role]);

  if (user?.role === 'recruiter') {
    return <Navigate to="/dashboard" replace />;
  }

  const loadStudentSkillsAndApplications = async () => {
    try {
      const savedSet = await BookmarkService.fetchSavedItemIds(user?.id);
      setBookmarkedIds(savedSet);

      if (!user?.id) return;

      const skills = await SkillGraphService.fetchStudentSkills(user.id);
      setStudentSkills(skills);

      const applications = await InternshipService.fetchStudentApplications(user.id);
      const appliedSet = new Set(applications.map(a => a.listingId));
      setAppliedIds(appliedSet);
    } catch (err) {
      console.error('Error loading student data:', err);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await InternshipService.fetchListings({
        search,
        location,
        minStipend,
        remoteOnly
      });

      // Calculate match score for each listing using Skill Graph
      const scoredListings = res.listings.map(listing => ({
        ...listing,
        matchScore: SkillGraphService.calculateMatchScore(studentSkills, listing.skills)
      }));

      // Sort by matchScore descending
      scoredListings.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setListings(scoredListings);

      // Load trust indicators for company names
      const companyNames = Array.from(new Set(scoredListings.map(l => l.companyName)));
      const trustMap = await ReviewService.fetchTrustIndicatorsMap(companyNames);
      setTrustIndicators(trustMap);
    } catch (err) {
      console.error('Error loading listings:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load internship listings.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const handleBookmarkToggle = async (listing: InternshipListing) => {
    if (!isAuthenticated) {
      addNotification({ type: 'warning', title: 'Sign In Required', message: 'Please sign in to bookmark listings.' });
      return;
    }
    const isSavedNow = await BookmarkService.toggleSavedItem(user?.id, listing.id, 'internship', listing);
    setBookmarkedIds(prev => {
      const updated = new Set(prev);
      if (isSavedNow) updated.add(listing.id);
      else updated.delete(listing.id);
      return updated;
    });
    addNotification({
      type: isSavedNow ? 'success' : 'info',
      title: isSavedNow ? 'Saved' : 'Removed',
      message: `Listing ${isSavedNow ? 'saved to' : 'removed from'} bookmarks`
    });
  };

  const openApplyModal = async (listing: InternshipListing) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or create an account to view and apply for internships.'
      });
      return;
    }
    setSelectedListing(listing);

    // Initialize resume state: only attach if user has a real, non-placeholder profile resume
    const hasRealProfileResume = Boolean(
      user?.resumeUrl && 
      user.resumeUrl.trim() !== '' && 
      !user.resumeUrl.includes('placeholder.url')
    );

    if (hasRealProfileResume) {
      setResumeDataUrl(user!.resumeUrl!);
      setResumeFileName('Profile_Resume.pdf');
      setResumeFileSize('Verified Profile PDF');
    } else {
      setResumeDataUrl('');
      setResumeFileName('');
      setResumeFileSize('');
    }
    setResumeError('');

    // Calculate course gap recommendations for missing skills
    const gaps = SkillGraphService.getSkillGapCourses(studentSkills, listing.skills);
    setCourseGaps(gaps);
    setShowApplyModal(true);

    // Fetch reviews & eligibility for selected listing
    setLoadingReviews(true);
    try {
      const [reviews, eligibility] = await Promise.all([
        ReviewService.fetchReviewsForCompany(listing.companyName),
        ReviewService.checkApplicantEligibility(user?.id, listing.id)
      ]);
      setListingReviews(reviews);
      setApplicantEligibility(eligibility);
    } catch (err) {
      console.error('Error loading reviews/eligibility:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate that it is a PDF
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setResumeError('Please upload a valid PDF document (.pdf).');
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError('Resume file size must be 5MB or less.');
      if (e.target) e.target.value = '';
      return;
    }

    setResumeError('');
    setResumeFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setResumeFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

    // Read real file into Base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeDataUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setResumeError('Failed to read the selected file. Please select again.');
    };
    reader.readAsDataURL(file);
  };

  const submitApplication = async () => {
    if (!selectedListing || !user) return;

    // Strict validation: Resume is strictly required
    if (!resumeDataUrl || resumeDataUrl.trim() === '') {
      setResumeError('A valid PDF resume is required to apply. Please upload or select your resume.');
      return;
    }

    setApplying(true);
    try {
      await InternshipService.applyToListing(selectedListing.id, coverLetter, resumeDataUrl);
      
      // Update student profile with real resume if profile doesn't have one or has an outdated placeholder
      if (updateProfile && (!user.resumeUrl || user.resumeUrl.includes('placeholder.url'))) {
        try {
          await updateProfile({ resumeUrl: resumeDataUrl });
        } catch (profileErr) {
          console.warn('Profile resume sync note:', profileErr);
        }
      }

      setAppliedIds(prev => new Set(prev).add(selectedListing.id));
      
      addNotification({
        type: 'success',
        title: 'Application Submitted!',
        message: `Successfully applied to ${selectedListing.title} at ${selectedListing.companyName} with your PDF resume.`
      });

      setShowApplyModal(false);
      setCoverLetter('');
      setResumeDataUrl('');
      setResumeFileName('');
      setResumeFileSize('');
      setSelectedListing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application.';
      addNotification({
        type: 'error',
        title: 'Application Failed',
        message: msg
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-iq-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="bg-iq-surface rounded-card p-8 sm:p-10 border border-iq-sage/40 shadow-nav relative overflow-hidden iq-watercolor">
          <div className="absolute right-0 top-0 opacity-15 transform translate-x-12 -translate-y-8 pointer-events-none">
            <Sparkles className="w-96 h-96 text-iq-teal" />
          </div>
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-iq-tealsoft border border-iq-sage rounded-full text-xs font-bold text-iq-teal">
              <Sparkles className="w-3.5 h-3.5 text-iq-teal" />
              <span>Skill Graph Matching Engine Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-iq-navy tracking-tight">
              Explore Top Internship Opportunities
            </h1>
            <p className="text-iq-muted text-sm sm:text-base leading-relaxed">
              Find internships tailored to your skill graph, apply with one click, and track your application status in real-time.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-iq-surface rounded-card p-6 shadow-nav border border-iq-sage/30">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-iq-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, company, or skills (e.g. React, Python)"
                className="w-full pl-11 pr-4 py-3 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy placeholder:text-iq-faint transition-all"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-iq-faint" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Remote, Mumbai)"
                className="w-full pl-11 pr-4 py-3 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy placeholder:text-iq-faint transition-all"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="w-full bg-iq-teal text-white font-semibold py-3 rounded-btn hover:bg-iq-tealdark hover:shadow-cta transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>Search Internships</span>
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-iq-sage/30 text-xs">
            <span className="font-bold text-iq-navy flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-iq-teal" /> Quick Filters:
            </span>
            <button
              onClick={() => { setRemoteOnly(!remoteOnly); loadListings(); }}
              className={`px-3 py-1.5 rounded-tag border transition-all font-semibold ${
                remoteOnly ? 'bg-iq-teal text-white border-iq-teal shadow-sm' : 'bg-iq-bg text-iq-navy border-iq-sage/60 hover:bg-iq-tealsoft/40 hover:border-iq-teal/30'
              }`}
            >
              🌐 Remote Only
            </button>
            <button
              onClick={() => { setMinStipend(minStipend === 20000 ? 0 : 20000); loadListings(); }}
              className={`px-3 py-1.5 rounded-tag border transition-all font-semibold ${
                minStipend >= 20000 ? 'bg-iq-teal text-white border-iq-teal shadow-sm' : 'bg-iq-bg text-iq-navy border-iq-sage/60 hover:bg-iq-tealsoft/40 hover:border-iq-teal/30'
              }`}
            >
              💵 Stipend &ge; ₹20,000/mo
            </button>
            <button
              onClick={() => { setSearch(''); setLocation(''); setMinStipend(0); setRemoteOnly(false); loadListings(); }}
              className="text-iq-muted hover:text-iq-teal font-medium underline ml-auto transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-iq-teal animate-spin mx-auto" />
            <p className="text-iq-muted text-sm font-medium">Matching opportunities with your Skill Graph...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-iq-surface rounded-card p-12 text-center border border-iq-sage/30 shadow-nav space-y-3">
            <Building className="w-12 h-12 text-iq-faint mx-auto" />
            <h3 className="text-lg font-bold text-iq-navy">No internships found</h3>
            <p className="text-iq-muted text-sm max-w-md mx-auto">
              Try broadening your search keywords or clearing your filters to see more listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const isApplied = appliedIds.has(listing.id);
              const isBookmarked = bookmarkedIds.has(listing.id);
              const score = listing.matchScore || 75;

              return (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-iq-surface rounded-card p-6 shadow-nav border border-iq-sage/30 hover:shadow-cta hover:border-iq-teal/30 transition-all duration-300 flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={listing.companyLogo}
                          alt={listing.companyName}
                          className="w-12 h-12 rounded-panel object-cover border border-iq-sage/20 bg-iq-bg p-1"
                        />
                        <div>
                          <h3 className="font-bold text-iq-navy line-clamp-1 group-hover:text-iq-teal transition-colors">
                            {listing.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <p className="text-xs font-semibold text-iq-muted">{listing.companyName}</p>
                            {/* Trust Indicator Badges */}
                            {(() => {
                              const trust = trustIndicators[listing.companyName];
                              if (!trust) return null;
                              return (
                                <div className="flex items-center space-x-1 text-[11px]">
                                  {trust.reviewCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-iq-butter text-iq-navy border border-iq-butter/50 font-semibold">
                                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-0.5" />
                                      {trust.avgRating.toFixed(1)} ({trust.reviewCount})
                                    </span>
                                  )}
                                  {trust.pendingReportCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-iq-danger/10 text-iq-danger border border-iq-danger/20 font-semibold" title="Pending community scam report under review">
                                      <ShieldAlert className="w-3 h-3 text-iq-danger mr-0.5" />
                                      Caution
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Match Badge */}
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 flex-shrink-0 ${
                        score >= 80 
                          ? 'bg-iq-mint text-iq-green border border-iq-sage/30' 
                          : score >= 60 
                          ? 'bg-iq-blue text-iq-navy border border-iq-sage/30' 
                          : 'bg-iq-butter text-iq-navy border border-iq-sage/30'
                      }`}>
                        <Sparkles className={`w-3.5 h-3.5 ${score >= 80 ? 'text-iq-green' : 'text-iq-teal'}`} />
                        <span>{score}% Match</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-iq-muted bg-iq-bg p-3 rounded-panel border border-iq-sage/20">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-iq-teal" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-iq-teal" />
                        <span className="font-semibold text-iq-navy">{listing.stipend}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-iq-teal" />
                        <span>{listing.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-iq-green inline-block flex-shrink-0" />
                        <span className="capitalize">{listing.type}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-iq-muted line-clamp-2 mb-4 leading-relaxed">
                      {listing.description}
                    </p>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {listing.skills.slice(0, 4).map((sk, idx) => {
                        const bgColors = ['bg-iq-mint text-iq-navy', 'bg-iq-blue text-iq-navy', 'bg-iq-lavender text-iq-navy', 'bg-iq-butter text-iq-navy'];
                        return (
                          <span key={sk} className={`px-2.5 py-1 text-[11px] font-medium rounded-tag ${bgColors[idx % bgColors.length]}`}>
                            {sk}
                          </span>
                        );
                      })}
                      {listing.skills.length > 4 && (
                        <span className="px-2 py-1 bg-iq-bg border border-iq-sage/40 text-iq-faint text-[10px] font-medium rounded-tag">
                          +{listing.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-iq-sage/30">
                    <button
                      onClick={() => handleBookmarkToggle(listing)}
                      className={`p-2.5 rounded-btn border transition-all ${
                        isBookmarked ? 'bg-iq-butter border-iq-butter/60 text-iq-navy shadow-sm' : 'border-iq-sage/50 text-iq-faint hover:text-iq-navy hover:bg-iq-bg'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    
                    <button
                      onClick={() => openApplyModal(listing)}
                      disabled={isApplied}
                      className={`w-full py-2.5 px-4 rounded-btn font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        isApplied
                          ? 'bg-iq-mint text-iq-green border border-iq-green/20 cursor-default shadow-none'
                          : 'bg-iq-teal text-white hover:bg-iq-tealdark hover:shadow-cta'
                      }`}
                    >
                      {isApplied ? (
                        <><CheckCircle2 className="w-4 h-4 text-iq-green" /> <span>Applied</span></>
                      ) : (
                        <span>Apply Now</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Application Modal */}
        <AnimatePresence>
          {showApplyModal && selectedListing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-iq-navy/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-iq-surface rounded-card shadow-cta max-w-xl w-full overflow-hidden border border-iq-sage/30 max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 bg-iq-navy text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedListing.title}</h3>
                    <p className="text-xs text-iq-blue">{selectedListing.companyName} • {selectedListing.location}</p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-iq-faint hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Skill Gap Course Recommendation Banner */}
                  {courseGaps.length > 0 && (
                    <div className="bg-iq-butter/30 border border-iq-butter/50 rounded-panel p-4 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-amber-900">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span>Recommended Learning Courses for Skill Gaps:</span>
                      </div>
                      <p className="text-amber-800">
                        To boost your hiring probability for this role, check out these recommended courses:
                      </p>
                      <div className="space-y-1.5">
                        {courseGaps.slice(0, 2).map((cg, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/80 p-2 rounded-panel border border-iq-butter/30">
                            <div>
                              <span className="font-semibold text-iq-navy">{cg.courseTitle}</span>
                              <span className="text-[10px] text-iq-muted block">{cg.platform} • {cg.estimatedHours}h</span>
                            </div>
                            <a
                              href={cg.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-tag hover:bg-amber-700 transition-colors"
                            >
                              Learn Skill
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Community Reviews & Scam Reporting Section */}
                  <div className="bg-iq-bg border border-iq-sage/30 rounded-panel p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-iq-teal" />
                        <span className="font-bold text-iq-navy">Community Reviews & Trust Score</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowReviewModal(true)}
                          disabled={!applicantEligibility.hasApplied || applicantEligibility.hasReviewed}
                          className={`px-3 py-1.5 rounded-tag font-bold text-[11px] flex items-center space-x-1 transition-colors ${
                            applicantEligibility.hasApplied && !applicantEligibility.hasReviewed
                              ? 'bg-iq-teal text-white hover:bg-iq-tealdark'
                              : 'bg-iq-sage/50 text-iq-muted cursor-not-allowed'
                          }`}
                          title={!applicantEligibility.hasApplied ? 'Only verified applicants can leave a review' : applicantEligibility.hasReviewed ? 'You have already reviewed this listing' : ''}
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{applicantEligibility.hasReviewed ? 'Reviewed' : 'Write Review'}</span>
                        </button>

                        <button
                          onClick={() => setShowReportModal(true)}
                          disabled={!applicantEligibility.hasApplied || applicantEligibility.hasReported}
                          className={`px-3 py-1.5 rounded-tag font-bold text-[11px] flex items-center space-x-1 transition-colors ${
                            applicantEligibility.hasApplied && !applicantEligibility.hasReported
                              ? 'bg-iq-danger/10 text-iq-danger border border-iq-danger/20 hover:bg-iq-danger/20'
                              : 'bg-iq-sage/50 text-iq-muted cursor-not-allowed'
                          }`}
                          title={!applicantEligibility.hasApplied ? 'Only verified applicants can report a listing' : applicantEligibility.hasReported ? 'Report submitted under investigation' : ''}
                        >
                          <ShieldAlert className="w-3 h-3 text-iq-danger" />
                          <span>{applicantEligibility.hasReported ? 'Reported' : 'Report Listing'}</span>
                        </button>
                      </div>
                    </div>

                    {!applicantEligibility.hasApplied && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-amber-700 bg-iq-butter/30 p-2 rounded-panel border border-iq-butter/50">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Reviewing and reporting are restricted to verified applicants who have applied for this listing.</span>
                      </div>
                    )}

                    {/* Review List */}
                    <div className="space-y-2 pt-1">
                      {loadingReviews ? (
                        <p className="text-iq-faint italic text-[11px]">Loading authentic student reviews...</p>
                      ) : listingReviews.length === 0 ? (
                        <p className="text-iq-muted text-[11px]">No student reviews submitted yet for {selectedListing.companyName}. Be the first verified applicant to review after applying!</p>
                      ) : (
                        listingReviews.map((rev) => (
                          <div key={rev.id} className="bg-iq-surface p-3 rounded-panel border border-iq-sage/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-iq-navy">{rev.studentName || 'Verified Student'}</span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-iq-sage'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rev.reviewText && <p className="text-iq-muted text-[11px]">{rev.reviewText}</p>}
                            <p className="text-[10px] text-iq-faint">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-iq-navy mb-2 uppercase tracking-wider">
                      Cover Letter / Why should you be hired?
                    </label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Share your relevant project experience, enthusiasm, or skills for this role..."
                      className="w-full p-3 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-xs text-iq-navy placeholder:text-iq-faint transition-all"
                    />
                  </div>

                  {/* Resume Attachment & Upload Section - Strictly Required */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-iq-navy uppercase tracking-wider flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-iq-teal" />
                        <span>Attached Profile Resume / Upload Resume <span className="text-iq-danger">*</span></span>
                      </label>
                      {resumeDataUrl && (
                        <span className="text-[10px] font-bold text-iq-green bg-iq-mint px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-iq-green" />
                          <span>PDF Attached</span>
                        </span>
                      )}
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={resumeInputRef}
                      accept="application/pdf,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {resumeDataUrl ? (
                      /* Real PDF file attached (either from valid profile or newly selected) */
                      <div className="bg-iq-mint/40 border border-iq-mint rounded-panel p-3.5 flex items-center justify-between transition-all">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-tag bg-iq-mint flex items-center justify-center flex-shrink-0 text-iq-green">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-iq-navy truncate">{resumeFileName || 'Resume.pdf'}</p>
                            <p className="text-[11px] text-iq-green font-medium">
                              {resumeFileSize ? `${resumeFileSize} • ` : ''}Real PDF attached & verified
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => openResume(resumeDataUrl, resumeFileName || 'Resume.pdf')}
                            className="px-2.5 py-1 bg-white border border-iq-green/30 text-iq-green rounded-tag text-[11px] font-semibold hover:bg-iq-mint transition-colors flex items-center space-x-1"
                            title="Preview attached PDF resume"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => resumeInputRef.current?.click()}
                            className="px-2.5 py-1 bg-iq-teal text-white rounded-tag text-[11px] font-semibold hover:bg-iq-tealdark transition-colors flex items-center space-x-1"
                            title="Change to another PDF"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Change PDF</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* No real resume attached yet */
                      <div
                        onClick={() => resumeInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-panel p-4 text-center cursor-pointer transition-all hover:bg-iq-tealsoft/30 hover:border-iq-teal ${
                          resumeError ? 'border-iq-danger/50 bg-iq-danger/5' : 'border-iq-sage/60 bg-iq-bg/70'
                        }`}
                        title="Click to select PDF resume from your computer"
                      >
                        <Upload className="w-7 h-7 text-iq-teal mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-iq-navy">
                          Click to select / Upload PDF Resume
                        </p>
                        <p className="text-[11px] text-iq-muted mt-0.5">
                          PDF document format required (Max 5MB) • Required before submitting
                        </p>
                      </div>
                    )}

                    {resumeError ? (
                      <p className="text-iq-danger text-[11px] flex items-center space-x-1 font-semibold pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{resumeError}</span>
                      </p>
                    ) : (
                      <p className="text-iq-faint text-[10px]">
                        The recruiter will be able to review this actual PDF document through View Resume.
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-iq-bg border-t border-iq-sage/30 flex items-center justify-between">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-iq-muted hover:text-iq-navy transition-colors"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center space-x-3">
                    {!resumeDataUrl && (
                      <span className="text-[11px] text-iq-muted font-medium hidden sm:inline">
                        Attach a resume to submit
                      </span>
                    )}
                    <button
                      onClick={submitApplication}
                      disabled={applying || !resumeDataUrl}
                      className="px-6 py-2.5 bg-iq-teal text-white font-bold text-xs rounded-btn hover:bg-iq-tealdark shadow-cta disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      title={!resumeDataUrl ? 'Please attach or upload a PDF resume before submitting' : ''}
                    >
                      {applying ? 'Submitting Application...' : 'Confirm & Submit Application'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Review & Scam Report Modals */}
        {selectedListing && (
          <>
            <ReviewModal
              isOpen={showReviewModal}
              onClose={() => setShowReviewModal(false)}
              listingId={selectedListing.id}
              companyName={selectedListing.companyName}
              onSuccess={(newReview) => {
                setListingReviews(prev => [newReview, ...prev]);
                setApplicantEligibility(prev => ({ ...prev, hasReviewed: true }));
                loadListings();
              }}
            />
            <ScamReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              listingId={selectedListing.id}
              companyName={selectedListing.companyName}
              onSuccess={() => {
                setApplicantEligibility(prev => ({ ...prev, hasReported: true }));
                loadListings();
              }}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default Internships;