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
  Lock
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
    summary: user?.summary || ''
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
        summary: user.summary || ''
      });
      setGithubInput(user.githubUsername || '');
      loadStudentSkills();
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
        summary: formData.summary
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
        <Lock className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Authentication Required</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm">
          Please sign in to access your student profile, upload resume, and manage your Skill Graph.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-extrabold text-slate-900">{formData.name || 'Student Name'}</h1>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-full border border-indigo-100">
                  {user?.role || 'student'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.email}</span>
                {formData.location && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
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
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 hover:bg-slate-200 transition-all flex items-center space-x-1.5"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Personal Info & Resume */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-600" /> Personal Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block font-medium">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Humera Ansari"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.name || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      placeholder="e.g. student@example.com"
                      className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.email || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.phone || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Mumbai, India"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.location || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Education</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      placeholder="e.g. B.Tech / MCA"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.education || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">LinkedIn Profile</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="e.g. linkedin.com/in/yourprofile"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-indigo-600 truncate">{formData.linkedin ? <a href={formData.linkedin.startsWith('http') ? formData.linkedin : `https://${formData.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.linkedin}</a> : <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">GitHub Profile</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.githubUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                      placeholder="e.g. github.com/yourusername"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-indigo-600 truncate">{formData.githubUsername ? <a href={formData.githubUsername.includes('github.com') ? (formData.githubUsername.startsWith('http') ? formData.githubUsername : `https://${formData.githubUsername}`) : `https://github.com/${formData.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.githubUsername}</a> : <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Portfolio / Website</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.portfolio}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                      placeholder="e.g. yourportfolio.com"
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  ) : (
                    <p className="font-semibold text-indigo-600 truncate">{formData.portfolio ? <a href={formData.portfolio.startsWith('http') ? formData.portfolio : `https://${formData.portfolio}`} target="_blank" rel="noreferrer" className="hover:underline">{formData.portfolio}</a> : <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Professional Summary</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.summary}
                      onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a short professional summary..."
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800 resize-none text-xs"
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed">{formData.summary ? formData.summary : <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Resume Upload Box */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-indigo-600" /> Resume & CV
                </span>
                {formData.resumeUrl && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Attached
                  </span>
                )}
              </h3>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploadingResume ? 'Uploading & Extracting Skills...' : 'Upload Resume PDF/DOCX'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-extracts skills into your Skill Graph (Subject to student consent)
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Maximum file size: 5MB
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              {formData.resumeUrl && (
                <button
                  type="button"
                  onClick={() => openResume(formData.resumeUrl, `${formData.name || 'Student'}_Resume.pdf`)}
                  className="w-full text-center text-xs font-semibold text-indigo-600 hover:underline pt-2 cursor-pointer flex items-center justify-center space-x-1"
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
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
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
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSyncGitHub}
                  disabled={parsingGithub}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{parsingGithub ? 'Syncing...' : 'Sync GitHub'}</span>
                </button>
              </div>
            </div>

            {/* Official Skill Graph System */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center">
                    <Award className="w-5 h-5 mr-2 text-indigo-600" /> Official Skill Graph
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
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
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
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
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center space-x-1 flex-shrink-0 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Skill Cards Grid */}
              {studentSkills.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No skills in your graph yet. Connect GitHub username, upload your resume, or type any skill above!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentSkills.map((sk) => (
                    <div
                      key={sk.id || `${sk.skillId}_${sk.source}`}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{sk.skillName || sk.skillId}</span>
                          <span className={`px-2 py-0.2 text-[10px] font-medium rounded-full ${
                            sk.source === 'github' 
                              ? 'bg-slate-800 text-white' 
                              : sk.source === 'resume'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {sk.source}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 capitalize">
                          Proficiency: <strong>{sk.proficiencyLevel}</strong> • Confidence: {(sk.confidenceScore * 100).toFixed(0)}%
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(sk.skillId, sk.skillName)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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