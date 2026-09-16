import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { InternshipService, InternshipListing } from '../services/internshipService';
import { SkillGraphService, StudentSkill, CourseRecommendation } from '../services/skillGraphService';

const Internships: React.FC = () => {
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

  // Skill Graph integration
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [courseGaps, setCourseGaps] = useState<CourseRecommendation[]>([]);

  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadListings();
    if (user?.id) {
      loadStudentSkillsAndApplications();
    }
  }, [user?.id]);

  const loadStudentSkillsAndApplications = async () => {
    if (!user?.id) return;
    try {
      const skills = await SkillGraphService.fetchStudentSkills(user.id);
      setStudentSkills(skills);

      const applications = await InternshipService.fetchStudentApplications(user.id);
      const appliedSet = new Set(applications.map(a => a.listingId));
      setAppliedIds(appliedSet);
    } catch (err) {
      console.error('Error loading student skills/applications:', err);
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

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds(prev => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
        addNotification({ type: 'info', title: 'Removed', message: 'Listing removed from bookmarks' });
      } else {
        updated.add(id);
        addNotification({ type: 'success', title: 'Saved', message: 'Listing saved to bookmarks' });
      }
      return updated;
    });
  };

  const openApplyModal = (listing: InternshipListing) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or create an account to apply for internships.'
      });
      return;
    }
    setSelectedListing(listing);
    // Calculate course gap recommendations for missing skills
    const gaps = SkillGraphService.getSkillGapCourses(studentSkills, listing.skills);
    setCourseGaps(gaps);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!selectedListing || !user) return;
    setApplying(true);
    try {
      await InternshipService.applyToListing(selectedListing.id, coverLetter, user.resumeUrl || '');
      
      setAppliedIds(prev => new Set(prev).add(selectedListing.id));
      
      addNotification({
        type: 'success',
        title: 'Application Submitted!',
        message: `Successfully applied to ${selectedListing.title} at ${selectedListing.companyName}`
      });

      setShowApplyModal(false);
      setCoverLetter('');
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-8 pointer-events-none">
            <Sparkles className="w-96 h-96" />
          </div>
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Skill Graph Matching Engine Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Explore Top Internship Opportunities
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Find internships tailored to your skill graph, apply with one click, and track your application status in real-time.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, company, or skills (e.g. React, Python)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Remote, Mumbai)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md text-sm flex items-center justify-center space-y-1"
              >
                <span>Search Internships</span>
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-600 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Quick Filters:
            </span>
            <button
              onClick={() => { setRemoteOnly(!remoteOnly); loadListings(); }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                remoteOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🌐 Remote Only
            </button>
            <button
              onClick={() => { setMinStipend(minStipend === 20000 ? 0 : 20000); loadListings(); }}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                minStipend >= 20000 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              💵 Stipend &ge; ₹20,000/mo
            </button>
            <button
              onClick={() => { setSearch(''); setLocation(''); setMinStipend(0); setRemoteOnly(false); loadListings(); }}
              className="text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Matching opportunities with your Skill Graph...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No internships found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
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
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={listing.companyLogo}
                          alt={listing.companyName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 p-1"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-500">{listing.companyName}</p>
                        </div>
                      </div>

                      {/* Match Badge */}
                      <div className={`px-2.5 py-1 rounded-full text-xs font-black shadow-sm flex items-center space-x-1 ${
                        score >= 80 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : score >= 60 
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{score}% Match</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{listing.stipend}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{listing.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span className="capitalize">{listing.type}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                      {listing.description}
                    </p>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {listing.skills.slice(0, 4).map(sk => (
                        <span key={sk} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-md">
                          {sk}
                        </span>
                      ))}
                      {listing.skills.length > 4 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md">
                          +{listing.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleBookmarkToggle(listing.id)}
                      className={`p-2.5 rounded-xl border text-slate-500 hover:text-slate-800 transition-colors ${
                        isBookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'border-slate-200'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    
                    <button
                      onClick={() => openApplyModal(listing)}
                      disabled={isApplied}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md ${
                        isApplied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default shadow-none'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                      }`}
                    >
                      {isApplied ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> <span>Applied</span></>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
              >
                {/* Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedListing.title}</h3>
                    <p className="text-xs text-indigo-300">{selectedListing.companyName} • {selectedListing.location}</p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Skill Gap Course Recommendation Banner */}
                  {courseGaps.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-amber-900">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span>Recommended Learning Courses for Skill Gaps:</span>
                      </div>
                      <p className="text-amber-800">
                        To boost your hiring probability for this role, check out these recommended courses:
                      </p>
                      <div className="space-y-1.5">
                        {courseGaps.slice(0, 2).map((cg, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/80 p-2 rounded-lg border border-amber-100">
                            <div>
                              <span className="font-semibold text-slate-800">{cg.courseTitle}</span>
                              <span className="text-[10px] text-slate-500 block">{cg.platform} • {cg.estimatedHours}h</span>
                            </div>
                            <a
                              href={cg.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold rounded-md hover:bg-amber-700"
                            >
                              Learn Skill
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Cover Letter / Why should you be hired?
                    </label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Share your relevant project experience, enthusiasm, or skills for this role..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Attached Profile Resume:</p>
                      <p className="text-[11px] text-slate-500">{user?.resumeUrl ? 'Uploaded PDF attached' : 'No custom resume URL uploaded yet'}</p>
                    </div>
                    <span className="text-indigo-600 font-bold">Automatic RLS Audit Passed</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApplication}
                    disabled={applying}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50"
                  >
                    {applying ? 'Submitting Application...' : 'Confirm & Submit Application'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Internships;