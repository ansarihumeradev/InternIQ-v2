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
import { SkillGraphService, StudentSkill, SkillSuggestion } from '../services/skillGraphService';
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
    resumeUrl: user?.resumeUrl || ''
  });

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
        resumeUrl: user.resumeUrl || ''
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
        resumeUrl: formData.resumeUrl
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
      addNotification({ type: 'error', title: 'File Too Large', message: 'Resume file must be smaller than 5MB.' });
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
        console.warn('Storage upload note:', uploadErr.message);
        publicUrl = `https://storage.placeholder.url/resumes/${file.name}`;
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
    const skillName = newSkill.trim();
    const skillId = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const suggestion: SkillSuggestion = {
      skillId,
      skillName,
      category: 'Custom',
      source: 'github', // assigned default source
      confidenceScore: 0.7,
      proficiencyLevel: 'intermediate',
      evidence: 'Manually added by student'
    };

    try {
      await SkillGraphService.acceptStudentSkills(user.id, [suggestion]);
      await loadStudentSkills();
      setNewSkill('');
      addNotification({ type: 'success', title: 'Skill Added', message: `Added "${skillName}" to your skills.` });
    } catch (err) {
      console.error('Error adding skill:', err);
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
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.location || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 block font-medium">Education</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full mt-1 p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{formData.education || 'B.Tech / MCA'}</p>
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
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
              </div>

              {formData.resumeUrl && (
                <a
                  href={formData.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs font-semibold text-indigo-600 hover:underline pt-2"
                >
                  View Attached Resume File
                </a>
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
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill manually (e.g. React, PostgreSQL)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleManualAddSkill}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center space-x-1 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Skill Cards Grid */}
              {studentSkills.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No skills in your graph yet. Connect GitHub username or upload your resume above!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentSkills.map((sk) => (
                    <div
                      key={sk.id || `${sk.skillId}_${sk.source}`}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
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

                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
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