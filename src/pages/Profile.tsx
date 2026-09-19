import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit,
  Save,
  User,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Globe,
  Award,
  FileText,
  Upload,
  Github,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Building,
  Briefcase
} from 'lucide-react';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { SkillGraphService, StudentSkill, SkillSuggestion, Skill } from '../services/skillGraphService';
import { openResume } from '../utils/resumeViewer';
import { SkillSuggestionsModal } from '../components/SkillSuggestionsModal';

const Profile: React.FC = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [parsingGithub, setParsingGithub] = useState(false);

  // Resume upload state
  const [uploadingResume, setUploadingResume] = useState(false);
  // Recruiter logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Skill Graph state
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [taxonomySkills, setTaxonomySkills] = useState<Skill[]>([]);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedin: user?.linkedin || '',
    portfolio: user?.portfolio || '',
    education: user?.education || '',
    experience: user?.experience || 'Fresher',
    githubUsername: user?.githubUsername || '',
    resumeUrl: user?.resumeUrl || '',
    summary: user?.summary || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    SkillGraphService.fetchTaxonomySkills().then(setTaxonomySkills).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        education: user.education || '',
        experience: user.experience || 'Fresher',
        githubUsername: user.githubUsername || '',
        resumeUrl: user.resumeUrl || '',
        summary: user.summary || '',
        avatar: user.avatar || ''
      });
      setGithubInput(user.githubUsername || '');
      if (user.role !== 'recruiter') {
        loadStudentSkills();
      }
    }
  }, [user]);

  const loadStudentSkills = async () => {
    if (!user?.id) return;
    try {
      const skills = await SkillGraphService.fetchStudentSkills(user.id);
      setStudentSkills(skills);
    } catch (err) {
      console.error('Error loading student skills:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
        education: formData.education,
        experience: formData.experience,
        githubUsername: formData.githubUsername,
        resumeUrl: formData.resumeUrl,
        summary: formData.summary,
        avatar: formData.avatar
      });

      setIsEditing(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated!',
        message: 'Your profile changes have been saved.'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile details.'
      });
    } finally {
      setLoading(false);
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

      setFormData(prev => ({ ...prev, avatar: publicUrl }));
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

  // GitHub Integration & Skill Extraction
  const handleSyncGitHub = async () => {
    if (!githubInput.trim()) {
      addNotification({ type: 'warning', title: 'Username Required', message: 'Please enter a valid GitHub username.' });
      return;
    }

    setParsingGithub(true);
    try {
      const extracted = await SkillGraphService.parseGitHubProfile(githubInput.trim());
      
      if (extracted.length === 0) {
        addNotification({ type: 'info', title: 'No Skills Found', message: 'No public language statistics found on GitHub profile.' });
        return;
      }

      setSuggestions(extracted);
      setShowConsentModal(true);
      
      // Save GitHub username to profile
      setFormData(prev => ({ ...prev, githubUsername: githubInput.trim() }));
      await updateProfile({ githubUsername: githubInput.trim() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch GitHub statistics.';
      addNotification({ type: 'error', title: 'GitHub Sync Error', message: msg });
    } finally {
      setParsingGithub(false);
    }
  };

  // Resume Upload & Skill Extraction
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      addNotification({ type: 'error', title: 'File Too Large', message: 'Resume file size must be 5MB or less.' });
      if (e.target) e.target.value = '';
      return;
    }

    setUploadingResume(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `resumes/${user.id}_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      let publicUrl = '';
      if (uploadErr) {
        console.warn('Storage upload fallback to Data URL:', uploadErr.message);
        // Encode actual file as Data URL so the real document is preserved and viewable
        publicUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Update resumeUrl on profile
      setFormData(prev => ({ ...prev, resumeUrl: publicUrl }));
      await updateProfile({ resumeUrl: publicUrl });

      // Read text content for skill extraction
      const text = await file.text();
      const taxonomy = await SkillGraphService.fetchTaxonomySkills();
      const resumeExtracted = SkillGraphService.parseResumeSkills(text || file.name, taxonomy);

      addNotification({
        type: 'success',
        title: 'Resume Uploaded!',
        message: 'Resume attached successfully to your student profile.'
      });

      if (resumeExtracted.length > 0) {
        setSuggestions(resumeExtracted);
        setShowConsentModal(true);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      addNotification({ type: 'error', title: 'Upload Failed', message: 'Failed to upload resume file.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAcceptSkills = async (accepted: SkillSuggestion[]) => {
    if (!user?.id) return;
    try {
      await SkillGraphService.acceptStudentSkills(user.id, accepted);
      await loadStudentSkills();
      addNotification({
        type: 'success',
        title: 'Skills Added!',
        message: `Successfully added ${accepted.length} skill(s) to your Skill Graph.`
      });
    } catch (err) {
      console.error('Failed saving skills:', err);
    }
  };

  const handleManualAddSkill = async () => {
    if (!newSkill.trim() || !user?.id) return;
    const skillInput = newSkill.trim();
    if (!skillInput || !user?.id) return;

    // Accept ANY valid skill - support single or comma-separated entries (e.g. "Java, PHP, Excel, SEO")
    const rawSkills = skillInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (rawSkills.length === 0) return;

    // Check for duplicates against already added student skills (case-insensitive)
    const newSuggestions: SkillSuggestion[] = [];
    const duplicates: string[] = [];

    for (const rawSkill of rawSkills) {
      const isDuplicate = studentSkills.some(
        s => (s.skillName && s.skillName.toLowerCase() === rawSkill.toLowerCase()) ||
             (s.skillId && s.skillId.toLowerCase() === rawSkill.toLowerCase())
      );

      if (isDuplicate) {
        duplicates.push(rawSkill);
        continue;
      }

      const matchedTaxonomy = taxonomySkills.find(
        t => t.name.toLowerCase() === rawSkill.toLowerCase() || t.id.toLowerCase() === rawSkill.toLowerCase()
      );

      const skillId = matchedTaxonomy ? matchedTaxonomy.id : rawSkill.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const skillName = matchedTaxonomy ? matchedTaxonomy.name : rawSkill;
      const skillCategory = matchedTaxonomy ? matchedTaxonomy.category : 'Custom';

      newSuggestions.push({
        skillId,
        skillName,
        category: skillCategory,
        source: 'self',
        confidenceScore: 0.8,
        proficiencyLevel: 'intermediate',
        evidence: 'Manually added by student'
      });
    }

    if (newSuggestions.length === 0) {
      if (duplicates.length > 0) {
        addNotification({
          type: 'info',
          title: 'Skill Already Added',
          message: `"${duplicates.join(', ')}" is already in your skills.`
        });
      }
      setNewSkill('');
      return;
    }

    const suggestions = newSuggestions;

    try {
      await SkillGraphService.acceptStudentSkills(user.id, suggestions);
      await loadStudentSkills();
      setNewSkill('');
      addNotification({ 
        type: 'success', 
        title: 'Skill(s) Added', 
        message: `Added ${suggestions.map(s => `"${s.skillName}"`).join(', ')} to your skills.` 
      });
    } catch (err) {
      console.error('Error adding skill:', err);
      await loadStudentSkills();
    }
  };

  const handleDeleteSkill = async (skillId: string, skillName?: string) => {
    if (!user?.id) return;
    try {
      await SkillGraphService.deleteStudentSkill(user.id, skillId, skillName);
      setStudentSkills(prev => prev.filter(s => s.skillId !== skillId && s.skillName !== skillName));
      addNotification({
        type: 'info',
        title: 'Skill Removed',
        message: `Removed "${skillName || skillId}" from your skills.`
      });
    } catch (err) {
      console.error('Error removing skill:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Lock className="w-12 h-12 text-iq-muted mb-4" />
        <h2 className="text-2xl font-bold text-iq-navy">Authentication Required</h2>
        <p className="text-iq-muted text-sm mt-1 max-w-sm">
          Please sign in to access your student profile, upload resume, and manage your Skill Graph.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-iq-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Card Header */}
        <div className="bg-white rounded-panel p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center space-x-5">
            <div className="relative group">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={user?.role === 'recruiter' ? 'Company Logo' : 'Profile Avatar'}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 bg-iq-lavender/30 text-iq-navy border border-iq-lavender/40 rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-sm">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : (user?.role === 'recruiter' ? 'C' : 'S')}
                </div>
              )}
              {user?.role === 'recruiter' && isEditing && (
                <label 
                  className="absolute -bottom-1 -right-1 p-1.5 bg-iq-teal hover:bg-iq-green text-white rounded-full shadow cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
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
              )}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-extrabold text-iq-navy">
                  {formData.name || (user?.role === 'recruiter' ? 'Company Name' : 'Student Name')}
                </h1>
                <span className="px-3 py-1 bg-iq-sage/20 text-iq-navy text-xs font-semibold uppercase rounded-tag border border-iq-sage/30">
                  {user?.role || 'student'}
                </span>
              </div>
              <p className="text-xs text-iq-muted flex items-center space-x-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-iq-muted" />
                <span>{formData.email}</span>
                {formData.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-iq-muted" />
                    <span>{formData.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-5 py-2.5 bg-iq-teal text-white font-semibold text-xs rounded-btn shadow-sm hover:bg-iq-green transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-white text-iq-teal font-semibold text-xs rounded-btn border border-iq-teal/30 hover:bg-iq-teal/10 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* RECRUITER PROFILE VIEW */}
        {user?.role === 'recruiter' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Company Logo & Contact Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-iq-navy text-sm flex items-center">
                  <Building className="w-4 h-4 mr-2 text-iq-teal" /> Company Identity
                </h3>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200/80 rounded-card bg-iq-bg text-center space-y-3">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Company Logo"
                      className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-iq-navy text-white font-extrabold text-3xl rounded-2xl flex items-center justify-center shadow-sm">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-iq-navy">
                      {uploadingLogo ? 'Uploading Logo...' : 'Company Logo'}
                    </p>
                    <p className="text-[10px] text-iq-muted">
                      Max file size: 2MB (PNG, JPG, WEBP, SVG)
                    </p>
                  </div>

                  <label className="px-4 py-2 bg-iq-teal hover:bg-iq-green text-white font-semibold text-xs rounded-btn shadow-sm cursor-pointer transition-all flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo</span>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml" 
                      onChange={handleCompanyLogoUpload} 
                      disabled={uploadingLogo} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="pt-2 text-xs text-iq-muted space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-iq-muted">Verified Role:</span>
                    <span className="font-bold text-iq-teal">Company Recruiter</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-iq-muted">Primary Contact:</span>
                    <span className="font-semibold text-iq-navy">{formData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Company & Recruiter Details Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-panel p-6 shadow-sm border border-slate-200/80 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-iq-navy text-base flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-iq-teal" /> Company & Recruiter Details
                  </h3>
                  <p className="text-xs text-iq-muted mt-0.5">
                    Manage your public company details, hiring position, and contact information.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-iq-muted block font-semibold mb-1">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Acme Technologies Inc."
                        className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                      />
                    ) : (
                      <p className="font-bold text-iq-navy text-sm">{formData.name || <span className="text-iq-muted italic font-normal text-xs">Not provided</span>}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Company Website</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.portfolio}
                          onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                          placeholder="e.g. https://company.com"
                          className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-teal truncate">
                          {formData.portfolio ? (
                            <a href={formData.portfolio.startsWith('http') ? formData.portfolio : `https://${formData.portfolio}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center space-x-1">
                              <Globe className="w-3.5 h-3.5 inline mr-1" />
                              <span>{formData.portfolio}</span>
                            </a>
                          ) : (
                            <span className="text-iq-muted italic font-normal">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Position / Title at Company</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          placeholder="e.g. Head of Talent Acquisition / HR Manager"
                          className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-navy">{formData.experience || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Contact Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          placeholder="e.g. recruiter@company.com"
                          className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-iq-muted cursor-not-allowed text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-navy">{formData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Contact Phone</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-navy">{formData.phone || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Headquarters / Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Mumbai, India / Remote"
                          className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-navy">{formData.location || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-iq-muted block font-semibold mb-1">Company LinkedIn</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          placeholder="e.g. linkedin.com/company/acme"
                          className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-iq-teal truncate">
                          {formData.linkedin ? (
                            <a href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">
                              {formData.linkedin}
                            </a>
                          ) : (
                            <span className="text-iq-muted italic font-normal">Not provided</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-iq-muted block font-semibold mb-1">Company Description / About</label>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={formData.summary}
                        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Tell freshers about your company mission, work environment, and culture..."
                        className="w-full p-2.5 bg-iq-bg border border-slate-200 rounded-xl focus:ring-1 focus:ring-iq-teal text-iq-navy resize-none text-xs"
                      />
                    ) : (
                      <p className="text-iq-navy leading-relaxed">{formData.summary || <span className="text-iq-muted italic font-normal">No company description provided yet.</span>}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STUDENT PROFILE VIEW */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Personal Info & Resume */}
            <div className="space-y-6">
              <div className="bg-white rounded-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-iq-navy text-sm flex items-center">
                  <User className="w-4 h-4 mr-2 text-iq-teal" /> Personal Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-iq-muted block font-medium">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Humera Ansari"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-navy">{formData.name || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        placeholder="e.g. student@example.com"
                        className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-iq-muted cursor-not-allowed"
                      />
                    ) : (
                      <p className="font-semibold text-iq-navy">{formData.email || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Phone</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-navy">{formData.phone || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g. Mumbai, India"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-navy">{formData.location || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Education</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.education}
                        onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                        placeholder="e.g. B.Tech / MCA"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-navy">{formData.education || <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">LinkedIn Profile</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.linkedin}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="e.g. linkedin.com/in/yourprofile"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-teal truncate">{formData.linkedin ? <a href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.linkedin}</a> : <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">GitHub Profile</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.githubUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                        placeholder="e.g. github.com/yourusername"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-teal truncate">{formData.githubUsername ? <a href={formData.githubUsername.includes('github.com') ? (formData.githubUsername.startsWith('http') ? formData.githubUsername : `https://${formData.githubUsername}`) : `https://github.com/${formData.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.githubUsername}</a> : <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Portfolio / Website</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.portfolio}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                        placeholder="e.g. yourportfolio.com"
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy"
                      />
                    ) : (
                      <p className="font-semibold text-iq-teal truncate">{formData.portfolio ? <a href={formData.portfolio.startsWith('http') ? formData.portfolio : `https://${formData.portfolio}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.portfolio}</a> : <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-iq-muted block font-medium">Professional Summary</label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={formData.summary}
                        onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Write a short professional summary..."
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-iq-teal bg-iq-bg text-iq-navy resize-none text-xs"
                      />
                    ) : (
                      <p className="text-iq-navy leading-relaxed">{formData.summary ? formData.summary : <span className="text-iq-muted italic font-normal">Not provided</span>}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Upload Box */}
              <div className="bg-white rounded-panel p-6 shadow-sm border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-iq-navy text-sm flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-iq-teal" /> Resume & CV
                  </span>
                  {formData.resumeUrl && (
                    <span className="text-[10px] font-bold text-iq-navy bg-iq-mint/30 border border-iq-mint/40 px-2.5 py-0.5 rounded-tag">
                      Attached
                    </span>
                  )}
                </h3>

                <div className="border-2 border-dashed border-slate-200/80 rounded-card p-4 text-center hover:border-iq-teal transition-colors bg-iq-bg">
                  <Upload className="w-8 h-8 text-iq-teal mx-auto mb-2" />
                  <p className="text-xs font-semibold text-iq-navy">
                    {uploadingResume ? 'Uploading & Extracting Skills...' : 'Upload Resume PDF/DOCX'}
                  </p>
                  <p className="text-[10px] text-iq-muted mt-1">
                    Auto-extracts skills into your Skill Graph (Subject to student consent)
                  </p>
                  <p className="text-[10px] text-iq-muted mt-0.5">
                    Maximum file size: 5MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="mt-3 block w-full text-xs text-iq-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-btn file:border-0 file:text-xs file:font-semibold file:bg-iq-teal file:text-white hover:file:bg-iq-green cursor-pointer"
                  />
                </div>

                {formData.resumeUrl && (
                  <button
                    type="button"
                    onClick={() => openResume(formData.resumeUrl, `${formData.name || 'Student'}_Resume.pdf`)}
                    className="w-full text-center text-xs font-semibold text-iq-teal hover:underline pt-2 cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Attached Resume File</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Skill Graph System & Integrations */}
            <div className="md:col-span-2 space-y-6">

              {/* GitHub Sync Integration */}
              <div className="bg-iq-navy rounded-panel p-6 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">GitHub Activity Sync</h3>
                      <p className="text-xs text-slate-300">
                        Import repos, languages, and commit stats into your Skill Graph (Weighted highest: 0.6).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="GitHub username (e.g. torvalds)"
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-iq-teal"
                  />
                  <button
                    onClick={handleSyncGitHub}
                    disabled={parsingGithub}
                    className="px-5 py-2.5 bg-iq-teal hover:bg-iq-green text-white font-bold text-xs rounded-btn transition-all shadow-sm flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{parsingGithub ? 'Syncing...' : 'Sync GitHub'}</span>
                  </button>
                </div>
              </div>

              {/* Official Skill Graph System */}
              <div className="bg-white rounded-panel p-6 shadow-sm border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-iq-navy text-base flex items-center">
                      <Award className="w-5 h-5 mr-2 text-iq-teal" /> Official Skill Graph
                    </h3>
                    <p className="text-xs text-iq-muted mt-0.5">
                      Unified multi-source skill model powering internship matching & course recommendations.
                    </p>
                  </div>
                </div>

                {/* Add Skill Manually */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    list="available-skills-list"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleManualAddSkill();
                      }
                    }}
                    placeholder="Add any skill (e.g. Java, PHP, React, Excel, SEO, Communication)"
                    className="w-full px-4 py-2 bg-iq-bg border border-slate-200 rounded-xl text-xs text-iq-navy focus:ring-1 focus:ring-iq-teal"
                  />
                  <datalist id="available-skills-list">
                    {taxonomySkills
                      .filter(t => !studentSkills.some(s => (s.skillId && s.skillId.toLowerCase() === t.id.toLowerCase()) || (s.skillName && s.skillName.toLowerCase() === t.name.toLowerCase())))
                      .map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                      ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={handleManualAddSkill}
                    className="px-4 py-2 bg-iq-navy hover:bg-iq-navy/90 text-white font-semibold text-xs rounded-btn flex items-center space-x-1 flex-shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </div>

                {/* Skill Cards Grid */}
                {studentSkills.length === 0 ? (
                  <div className="py-8 text-center bg-iq-bg rounded-card border border-dashed border-slate-200/80 text-xs text-iq-muted">
                    No skills in your graph yet. Connect GitHub username, upload your resume, or type any skill above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studentSkills.map((sk) => (
                      <div
                        key={sk.id || `${sk.skillId}_${sk.source}`}
                        className="p-3 bg-iq-bg border border-slate-200/80 rounded-card flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-iq-navy">{sk.skillName || sk.skillId}</span>
                            <span className={`px-2 py-0.2 text-[10px] font-semibold rounded-tag ${
                              sk.source === 'github' 
                                ? 'bg-iq-navy text-white' 
                                : sk.source === 'resume'
                                ? 'bg-iq-mint/30 text-iq-navy border border-iq-mint/40'
                                : 'bg-iq-sage/30 text-iq-navy border border-iq-sage/40'
                            }`}>
                              {sk.source}
                            </span>
                          </div>
                          <p className="text-[10px] text-iq-muted capitalize">
                            Proficiency: <strong>{sk.proficiencyLevel}</strong> • Confidence: {(sk.confidenceScore * 100).toFixed(0)}%
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(sk.skillId, sk.skillName)}
                          className="p-1.5 text-iq-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Student Consent Modal */}
        <SkillSuggestionsModal
          isOpen={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          suggestions={suggestions}
          onAcceptSelected={handleAcceptSkills}
        />

      </div>
    </div>
  );
};

export default Profile;