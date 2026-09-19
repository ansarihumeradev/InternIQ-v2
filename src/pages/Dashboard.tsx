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
  X,
  Bookmark,
  Trash2,
  BookOpen,
  Edit,
  Upload
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { InternshipService, InternshipListing, Application } from '../services/internshipService';
import { SkillGraphService, StudentSkill } from '../services/skillGraphService';
import { BookmarkService, SavedItem } from '../services/bookmarkService';
import { openResume } from '../utils/resumeViewer';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);

  // Student state
  const [studentApplications, setStudentApplications] = useState<Application[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [studentTab, setStudentTab] = useState<'applications' | 'saved'>('applications');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedFilter, setSavedFilter] = useState<'all' | 'job' | 'internship' | 'company' | 'resource'>('all');

  // Recruiter state
  const [recruiterStats, setRecruiterStats] = useState({
    activeListings: 0,
    totalApplicants: 0,
    shortlistedCandidates: 0,
    positionsFilled: 0
  });
  const [recruiterListings, setRecruiterListings] = useState<InternshipListing[]>([]);
  const [selectedListingForApplicants, setSelectedListingForApplicants] = useState<InternshipListing | null>(null);
  const [applicantsForListing, setApplicantsForListing] = useState<Application[]>([]);
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'applied' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected'>('all');
  
  // Modals & Forms
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingListing, setEditingListing] = useState<InternshipListing | null>(null);
  const [posting, setPosting] = useState(false);

  // Company Profile State
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyName, setCompanyName] = useState(user?.name || '');
  const [companyLogo, setCompanyLogo] = useState(user?.avatar || '');
  const [companyDescription, setCompanyDescription] = useState(user?.summary || '');
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Listing Form Data
  const [newListing, setNewListing] = useState({
    title: '',
    companyName: user?.name || '',
    location: 'Remote',
    stipend: '₹25,000/month',
    stipendAmount: 25000,
    duration: '3 months',
    description: '',
    skills: '',
    requirements: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('tab') === 'saved') {
      setStudentTab('saved');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setCompanyName(user.name || '');
      setCompanyLogo(user.avatar || '');
      setCompanyDescription(user.summary || '');
    }
  }, [user]);

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
        const stats = await InternshipService.fetchRecruiterStats(user.id);
        setRecruiterStats(stats);
        const listings = await InternshipService.fetchRecruiterListings(user.id);
        setRecruiterListings(listings);
        if (listings.length > 0) {
          if (!selectedListingForApplicants) {
            loadApplicantsForListing(listings[0]);
          } else {
            const current = listings.find(l => l.id === selectedListingForApplicants.id) || listings[0];
            loadApplicantsForListing(current);
          }
        }
      } else {
        // Student role
        const apps = await InternshipService.fetchStudentApplications(user.id);
        setStudentApplications(apps);
        const skills = await SkillGraphService.fetchStudentSkills(user.id);
        setStudentSkills(skills);
        const saved = await BookmarkService.fetchSavedItems(user.id);
        setSavedItems(saved);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (itemId: string, itemType: string) => {
    try {
      await BookmarkService.removeSavedItem(user?.id, itemId, itemType);
      setSavedItems(prev => prev.filter(i => !(i.itemId === itemId && i.itemType === itemType)));
      addNotification({
        type: 'info',
        title: 'Removed',
        message: 'Item removed from your saved list.'
      });
    } catch (err) {
      console.error('Failed to remove saved item:', err);
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

  const handleCreateOrUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title.trim() || !newListing.companyName.trim()) {
      addNotification({ type: 'warning', title: 'Missing Info', message: 'Please enter Title and Company Name.' });
      return;
    }

    setPosting(true);
    try {
      if (editingListing) {
        await InternshipService.updateListing(editingListing.id, {
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
          title: 'Listing Updated!',
          message: `Successfully updated ${newListing.title}`
        });
      } else {
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
      }

      setShowPostModal(false);
      setEditingListing(null);
      setNewListing({
        title: '',
        companyName: companyName || user?.name || '',
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
      const msg = err instanceof Error ? err.message : 'Failed to save internship.';
      addNotification({ type: 'error', title: 'Error', message: msg });
    } finally {
      setPosting(false);
    }
  };

  const handleOpenEditModal = (listing: InternshipListing) => {
    setEditingListing(listing);
    setNewListing({
      title: listing.title,
      companyName: listing.companyName,
      location: listing.location,
      stipend: listing.stipend,
      stipendAmount: listing.stipendAmount,
      duration: listing.duration,
      description: listing.description,
      skills: (listing.skills || []).join(', '),
      requirements: (listing.requirements || []).join('\n')
    });
    setShowPostModal(true);
  };

  const handleToggleListingStatus = async (listing: InternshipListing) => {
    const newStatus = listing.status === 'active' ? 'closed' : 'active';
    try {
      await InternshipService.updateListingStatus(listing.id, newStatus);
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Listing status changed to ${newStatus.toUpperCase()}`
      });
      loadDashboardData();
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to update listing status.' });
    }
  };

  const handleUpdateApplicantStatus = async (
    appId: string, 
    newStatus: 'applied' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected'
  ) => {
    try {
      await InternshipService.updateApplicationStatus(appId, newStatus);
      
      setApplicantsForListing(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Applicant status changed to ${newStatus.toUpperCase()}`
      });

      if (user?.id) {
        const stats = await InternshipService.fetchRecruiterStats(user.id);
        setRecruiterStats(stats);
      }
    } catch (err) {
      addNotification({ type: 'error', title: 'Update Error', message: 'Failed to update applicant status.' });
    }
  };

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'Company logo file size must be 2MB or less.'
      });
      if (e.target) e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload a valid image file (PNG, JPG, WEBP, SVG).'
      });
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `logos/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      let publicUrl = '';
      if (uploadErr) {
        console.warn('Storage upload fallback to Data URL:', uploadErr.message);
        publicUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      setCompanyLogo(publicUrl);
      await updateProfile({ avatar: publicUrl });

      addNotification({
        type: 'success',
        title: 'Logo Uploaded!',
        message: 'Company logo has been uploaded and saved.'
      });
    } catch (err) {
      console.error('Company logo upload error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to upload logo.';
      addNotification({
        type: 'error',
        title: 'Upload Error',
        message: msg
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      await updateProfile({
        name: companyName,
        avatar: companyLogo,
        summary: companyDescription
      });
      setShowCompanyModal(false);
      addNotification({
        type: 'success',
        title: 'Company Profile Saved!',
        message: 'Your company profile details have been saved to Supabase.'
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update company profile.';
      addNotification({ type: 'error', title: 'Save Error', message: msg });
    } finally {
      setSavingCompany(false);
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
                ? 'Manage your posted internships, track hiring stats, and review top candidates.'
                : 'Track your submitted applications and monitor hiring status in real time.'}
            </p>
          </div>

          {user?.role === 'recruiter' && (
            <button
              onClick={() => {
                setEditingListing(null);
                setNewListing({
                  title: '',
                  companyName: companyName || user?.name || '',
                  location: 'Remote',
                  stipend: '₹25,000/month',
                  stipendAmount: 25000,
                  duration: '3 months',
                  description: '',
                  skills: '',
                  requirements: ''
                });
                setShowPostModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-xs rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 shadow-indigo-300 flex-shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Internship</span>
            </button>
          )}
        </div>

        {/* RECRUITER DASHBOARD */}
        {user?.role === 'recruiter' ? (
          <div className="space-y-8">
            
            {/* 1. TOP STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Listings</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{recruiterStats.activeListings}</h3>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Live opportunities</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applicants</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{recruiterStats.totalApplicants}</h3>
                  <p className="text-[11px] text-blue-600 font-medium mt-1">Across all postings</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{recruiterStats.shortlistedCandidates}</h3>
                  <p className="text-[11px] text-amber-600 font-medium mt-1">Interview & Review</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Positions Filled</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{recruiterStats.positionsFilled}</h3>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">Selected candidates</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* 2. COMPANY PROFILE CARD */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-indigo-900 text-white font-black text-2xl rounded-2xl flex items-center justify-center shadow-md">
                      {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <label 
                    className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                    title="Upload company logo (2MB max)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                      onChange={handleCompanyLogoUpload} 
                      disabled={uploadingLogo} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-black text-slate-900">{companyName || 'Your Company Name'}</h2>
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-full border border-indigo-100">
                      Verified Recruiter
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {companyDescription || 'No company description added yet. Click edit to add details about your company mission and hiring culture.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCompanyModal(true)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Company Profile</span>
              </button>
            </div>

            {/* 3. MY POSTINGS SECTION */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-black text-slate-900 text-lg flex items-center">
                    <Building className="w-5 h-5 mr-2 text-indigo-600" /> My Internship Postings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage active listings, track applicant counts, edit details, or toggle status.</p>
                </div>

                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {recruiterListings.length} Total Listings
                </span>
              </div>

              {recruiterListings.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-3">
                  <Building className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">You haven't posted any internships yet.</p>
                  <button
                    onClick={() => {
                      setEditingListing(null);
                      setNewListing({
                        title: '',
                        companyName: companyName || user?.name || '',
                        location: 'Remote',
                        stipend: '₹25,000/month',
                        stipendAmount: 25000,
                        duration: '3 months',
                        description: '',
                        skills: '',
                        requirements: ''
                      });
                      setShowPostModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 cursor-pointer"
                  >
                    Create First Posting
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Internship Title</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Applicants</th>
                        <th className="py-3 px-4">Posted Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recruiterListings.map(listing => {
                        const isSelected = selectedListingForApplicants?.id === listing.id;
                        return (
                          <tr
                            key={listing.id}
                            className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40 font-medium' : ''}`}
                          >
                            <td className="py-3.5 px-4">
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{listing.title}</span>
                                <span className="text-[11px] text-slate-500">{listing.location} • {listing.stipend}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-semibold">{listing.companyName}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full ${
                                listing.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {listing.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {listing.applicantCount || 0}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Recently'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditModal(listing)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                  title="Edit posting"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleToggleListingStatus(listing)}
                                  className={`px-2.5 py-1 font-semibold text-[11px] rounded-lg transition-colors cursor-pointer ${
                                    listing.status === 'active'
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {listing.status === 'active' ? 'Close Listing' : 'Reopen'}
                                </button>
                                <button
                                  onClick={() => {
                                    loadApplicantsForListing(listing);
                                    const pipelineEl = document.getElementById('applicant-pipeline-section');
                                    if (pipelineEl) pipelineEl.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className={`px-3 py-1 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white shadow-sm'
                                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                  }`}
                                >
                                  <span>View Applicants</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. APPLICANT PIPELINE SECTION */}
            <div id="applicant-pipeline-section" className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-black text-slate-900 text-lg">
                      Applicant Pipeline {selectedListingForApplicants ? `— ${selectedListingForApplicants.title}` : ''}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review student applications, read cover letters, view resumes, and update hiring pipeline status.
                  </p>
                </div>

                {/* Pipeline Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
                  {(['all', 'applied', 'shortlisted', 'interviewed', 'selected', 'rejected'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setApplicantFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                        applicantFilter === st
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {!selectedListingForApplicants ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">Select an internship posting above to view its applicant pipeline.</p>
                </div>
              ) : applicantsForListing.filter(a => applicantFilter === 'all' || a.status === applicantFilter).length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No applications match the "{applicantFilter}" filter for this listing.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicantsForListing
                    .filter(a => applicantFilter === 'all' || a.status === applicantFilter)
                    .map(app => (
                      <div key={app.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl font-extrabold flex items-center justify-center text-base shadow-sm">
                              {app.student?.name ? app.student.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{app.student?.name || 'Student Candidate'}</h3>
                              <p className="text-xs text-slate-500">{app.student?.email} {app.student?.phone ? `• ${app.student.phone}` : ''}</p>
                            </div>
                          </div>

                          {/* Status Dropdown */}
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-slate-500">Pipeline Status:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value as any)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                                app.status === 'selected'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : app.status === 'shortlisted'
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                  : app.status === 'interviewed'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="applied">Applied</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        {/* Cover Letter / Why-Hire Text */}
                        {app.coverLetter && (
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 text-xs text-slate-700 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Cover Letter / Why Hire:</span>
                            <p className="leading-relaxed">"{app.coverLetter}"</p>
                          </div>
                        )}

                        {/* Student Skills */}
                        {app.student?.skills && app.student.skills.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {app.student.skills.map(sk => (
                                <span key={sk} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Info & Resume Link */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                          <span className="text-slate-400 text-[11px]">
                            Applied on: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                          </span>

                          {app.resumeUrl ? (
                            <button
                              type="button"
                              onClick={() => openResume(app.resumeUrl!, app.student?.name || 'Applicant')}
                              className="text-indigo-600 font-bold hover:underline flex items-center space-x-1.5 hover:text-indigo-800 transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Resume PDF</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No resume attached</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* STUDENT DASHBOARD */
          <div className="space-y-6">
            {/* Student Navigation Tabs */}
            <div className="flex border-b border-slate-200 space-x-4">
              <button
                onClick={() => setStudentTab('applications')}
                className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
                  studentTab === 'applications'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>My Applications</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {studentApplications.length}
                </span>
              </button>

              <button
                onClick={() => setStudentTab('saved')}
                className={`pb-3 text-sm font-bold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
                  studentTab === 'saved'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Items</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {savedItems.length}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {studentTab === 'applications' ? (
                /* Applied Internships */
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
                                : app.status === 'interviewed'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
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
              ) : (
                /* Saved Items Tab */
                <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                        <Bookmark className="w-5 h-5 mr-2 text-indigo-600" /> Saved Items & Bookmarks
                      </h3>
                      <p className="text-xs text-slate-500">Your saved jobs, internships, companies, and career resources.</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
                      {(['all', 'job', 'internship', 'company', 'resource'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setSavedFilter(type)}
                          className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                            savedFilter === type
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {savedItems.filter(i => savedFilter === 'all' || i.itemType === savedFilter).length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                      <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                      <p>No saved items found in this category.</p>
                      <p className="text-[11px] text-slate-400">Browse Jobs, Internships, or Career Guidance to bookmark items!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedItems
                        .filter(i => savedFilter === 'all' || i.itemType === savedFilter)
                        .map(item => {
                          const data = item.itemData || {};
                          const title = data.title || data.name || 'Saved Item';
                          const subtitle = data.company || data.companyName || data.category || data.industry || '';
                          const locationStr = data.location || '';
                          const stipendOrSalary = data.stipend || data.salary || '';

                          return (
                            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:shadow-sm transition-all">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                                      item.itemType === 'job'
                                        ? 'bg-blue-100 text-blue-800'
                                        : item.itemType === 'internship'
                                        ? 'bg-amber-100 text-amber-800'
                                        : item.itemType === 'company'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {item.itemType}
                                    </span>
                                    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                                  </div>

                                  {subtitle && (
                                    <p className="text-xs text-slate-600 font-medium">{subtitle}</p>
                                  )}

                                  {(locationStr || stipendOrSalary) && (
                                    <p className="text-[11px] text-slate-500">
                                      {locationStr && <span>📍 {locationStr} </span>}
                                      {stipendOrSalary && <span>💰 {stipendOrSalary}</span>}
                                    </p>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleRemoveSaved(item.itemId, item.itemType)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove from saved"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                                <span className="text-slate-400">
                                  Saved: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                                </span>

                                <a
                                  href={
                                    item.itemType === 'job'
                                      ? '/internships'
                                      : item.itemType === 'internship'
                                      ? '/internships'
                                      : item.itemType === 'company'
                                      ? '/companies'
                                      : '/career-guidance'
                                  }
                                  className="text-indigo-600 font-bold hover:underline inline-flex items-center space-x-1"
                                >
                                  <span>View Page</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

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
          </div>
        )}

        {/* Edit Company Profile Modal */}
        <AnimatePresence>
          {showCompanyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col"
              >
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="text-lg font-bold">Edit Company Profile</h3>
                  <button onClick={() => setShowCompanyModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCompanyProfile} className="p-6 space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Tech Solutions"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Company Logo</label>
                    <div className="flex items-center space-x-3 mb-2">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm">
                          {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                      <div className="flex-1">
                        <label className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-xs cursor-pointer inline-flex items-center space-x-1.5 border border-indigo-200">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo File (2MB Max)'}</span>
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                            onChange={handleCompanyLogoUpload} 
                            disabled={uploadingLogo} 
                            className="hidden" 
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP, or SVG. Maximum file size: 2MB.</p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={companyLogo}
                      onChange={e => setCompanyLogo(e.target.value)}
                      placeholder="Or enter direct image URL (https://...)"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Company Description & Mission</label>
                    <textarea
                      rows={4}
                      value={companyDescription}
                      onChange={e => setCompanyDescription(e.target.value)}
                      placeholder="Tell students about your company, culture, and key technology stack..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCompanyModal(false)}
                      className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingCompany}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md cursor-pointer"
                    >
                      {savingCompany ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Post / Edit Internship Modal for Recruiters */}
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
                  <h3 className="text-lg font-bold">
                    {editingListing ? 'Edit Internship Listing' : 'Post New Internship Listing'}
                  </h3>
                  <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateOrUpdateListing} className="p-6 overflow-y-auto space-y-4 text-xs">
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

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Requirements (One per line)</label>
                    <textarea
                      rows={3}
                      value={newListing.requirements}
                      onChange={e => setNewListing(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="Solid understanding of React&#10;Familiarity with Tailwind CSS"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={posting}
                      className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md cursor-pointer"
                    >
                      {posting ? 'Saving...' : (editingListing ? 'Update Internship' : 'Publish Internship')}
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