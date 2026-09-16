import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Building, 
  MapPin, 
  DollarSign, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  Award,
  ExternalLink,
  X
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { InternshipService, InternshipListing, Application } from '../services/internshipService';
import { SkillGraphService, StudentSkill } from '../services/skillGraphService';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);

  // Student state
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);

  // Recruiter state
  const [recruiterListings, setRecruiterListings] = useState<InternshipListing[]>([]);
  const [selectedListingForApplicants, setSelectedListingForApplicants] = useState<InternshipListing | null>(null);
  const [applicantsForListing, setApplicantsForListing] = useState<Application[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);

  // New Listing Form Data
  const [newListing, setNewListing] = useState({
    title: '',
    companyName: '',
    location: 'Remote',
    stipend: '₹25,000/month',
    stipendAmount: 25000,
    duration: '3 months',
    description: '',
    skills: '',
    requirements: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id, user?.role]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (user.role === 'recruiter') {
        const listings = await InternshipService.fetchRecruiterListings(user.id);
        setRecruiterListings(listings);
        if (listings.length > 0) {
          loadApplicantsForListing(listings[0]);
        }
      } else {
        // Student role
        const apps = await InternshipService.fetchStudentApplications(user.id);
        setStudentApplications(apps);
        const skills = await SkillGraphService.fetchStudentSkills(user.id);
        setStudentSkills(skills);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicantsForListing = async (listing: InternshipListing) => {
    setSelectedListingForApplicants(listing);
    try {
      const apps = await InternshipService.fetchApplicationsForListing(listing.id);
      setApplicantsForListing(apps);
    } catch (err) {
      console.error('Error loading applicants:', err);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title.trim() || !newListing.companyName.trim()) {
      addNotification({ type: 'warning', title: 'Missing Info', message: 'Please enter Title and Company Name.' });
      return;
    }

    setPosting(true);
    try {
      const created = await InternshipService.createListing({
        title: newListing.title.trim(),
        companyName: newListing.companyName.trim(),
        location: newListing.location,
        stipend: newListing.stipend,
        stipendAmount: Number(newListing.stipendAmount),
        duration: newListing.duration,
        description: newListing.description,
        skills: newListing.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: newListing.requirements.split('\n').map(s => s.trim()).filter(Boolean)
      });

      addNotification({
        type: 'success',
        title: 'Internship Posted!',
        message: `Successfully posted ${created.title}`
      });

      setShowPostModal(false);
      setNewListing({
        title: '',
        companyName: '',
        location: 'Remote',
        stipend: '₹25,000/month',
        stipendAmount: 25000,
        duration: '3 months',
        description: '',
        skills: '',
        requirements: ''
      });

      loadDashboardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to post internship.';
      addNotification({ type: 'error', title: 'Error', message: msg });
    } finally {
      setPosting(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: 'applied' | 'shortlisted' | 'rejected' | 'selected') => {
    try {
      await InternshipService.updateApplicationStatus(appId, newStatus);
      
      setApplicantsForListing(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Applicant status changed to ${newStatus.toUpperCase()}`
      });
    } catch (err) {
      addNotification({ type: 'error', title: 'Update Error', message: 'Failed to update applicant status.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Sign In Required</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          Please log in to view your application status or recruiter dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Role: {user?.role?.toUpperCase() || 'STUDENT'}</span>
            </div>
            <h1 className="text-3xl font-black">Welcome back, {user?.name}!</h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              {user?.role === 'recruiter' 
                ? 'Manage your posted internships and review top student candidates.'
                : 'Track your submitted applications and monitor hiring status in real time.'}
            </p>
          </div>

          {user?.role === 'recruiter' && (
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-xs rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 shadow-indigo-300 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Internship</span>
            </button>
          )}
        </div>

        {/* RECRUITER DASHBOARD */}
        {user?.role === 'recruiter' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Posted Listings */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>My Internship Postings</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  {recruiterListings.length} Active
                </span>
              </h3>

              {recruiterListings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Building className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>You haven't posted any internships yet.</p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Create First Posting
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {recruiterListings.map(listing => {
                    const isSelected = selectedListingForApplicants?.id === listing.id;
                    return (
                      <div
                        key={listing.id}
                        onClick={() => loadApplicantsForListing(listing)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected ? 'bg-indigo-50/70 border-indigo-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{listing.title}</h4>
                            <p className="text-[11px] text-slate-500">{listing.location} • {listing.stipend}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Applicant Review List */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Applicants for: {selectedListingForApplicants?.title || 'Select a posting'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review student profiles, cover letters, and manage hiring status.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  {applicantsForListing.length} Candidates
                </span>
              </div>

              {applicantsForListing.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No student applications received for this posting yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicantsForListing.map(app => (
                    <div key={app.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center text-sm">
                            {app.student?.name.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{app.student?.name}</h4>
                            <p className="text-[11px] text-slate-500">{app.student?.email} • {app.student?.phone || 'No phone'}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                          app.status === 'selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'shortlisted'
                            ? 'bg-indigo-100 text-indigo-800'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {app.coverLetter && (
                        <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                          "{app.coverLetter}"
                        </p>
                      )}

                      {/* Student Skill Badges */}
                      {app.student?.skills && app.student.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.student.skills.map(sk => (
                            <span key={sk} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-medium rounded-md">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200/60">
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 font-bold hover:underline flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> <span>View Resume</span>
                          </a>
                        ) : <span className="text-slate-400 text-[10px]">No resume link</span>}

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleUpdateApplicantStatus(app.id, 'shortlisted')}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded-md text-[11px] font-semibold hover:bg-indigo-700"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateApplicantStatus(app.id, 'selected')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-semibold hover:bg-emerald-700"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleUpdateApplicantStatus(app.id, 'rejected')}
                            className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-md text-[11px] font-semibold hover:bg-rose-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* STUDENT DASHBOARD */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Applied Internships */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">My Submitted Applications</h3>
                  <p className="text-xs text-slate-500">Track application status and responses from recruiters.</p>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                  {studentApplications.length} Applications
                </span>
              </div>

              {studentApplications.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>You haven't submitted any internship applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentApplications.map(app => (
                    <div key={app.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {app.listing?.title || 'Internship Title'}
                          </h4>
                          <p className="text-xs text-slate-500">{app.listing?.companyName} • {app.listing?.location}</p>
                        </div>

                        <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${
                          app.status === 'selected'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : app.status === 'shortlisted'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        <span className="font-semibold text-slate-700">Stipend: {app.listing?.stipend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Skill Graph Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <Award className="w-4 h-4 mr-2 text-indigo-600" /> Skill Graph Summary
              </h3>

              {studentSkills.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No skills in your graph yet. Go to Profile to connect GitHub or upload resume.
                </p>
              ) : (
                <div className="space-y-2">
                  {studentSkills.map(sk => (
                    <div key={sk.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{sk.skillName || sk.skillId}</span>
                        <span className="text-[10px] text-slate-400 block capitalize">{sk.source} source</span>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md capitalize">
                        {sk.proficiencyLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Post Internship Modal for Recruiters */}
        <AnimatePresence>
          {showPostModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-lg font-bold">Post New Internship Listing</h3>
                  <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateListing} className="p-6 overflow-y-auto space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Internship Title</label>
                    <input
                      type="text"
                      required
                      value={newListing.title}
                      onChange={e => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Frontend Developer Intern"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={newListing.companyName}
                      onChange={e => setNewListing(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. TechCorp Systems"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newListing.location}
                        onChange={e => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Remote / City"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Stipend Text</label>
                      <input
                        type="text"
                        value={newListing.stipend}
                        onChange={e => setNewListing(prev => ({ ...prev, stipend: e.target.value }))}
                        placeholder="₹25,000/month"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={newListing.skills}
                      onChange={e => setNewListing(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="React, JavaScript, TypeScript, Tailwind CSS"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Role Description</label>
                    <textarea
                      rows={3}
                      value={newListing.description}
                      onChange={e => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed responsibilities and project description..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md"
                    >
                      {posting ? 'Posting...' : 'Publish Internship'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;