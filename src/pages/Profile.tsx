import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit,
  Save,
  X,
  Plus,
  User,
  Mail,
  MapPin,
  Phone,
  Linkedin,
  Globe,
  Award,
  FileText,
  Upload,
  Download,
  Camera,
  Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
    linkedin: 'linkedin.com/in/johndoe',
    portfolio: 'johndoe.dev',
    education: 'B.Tech Computer Science',
    experience: 'Fresher',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
    bio: 'Passionate software developer with a strong foundation in modern web technologies. Always eager to learn and contribute to innovative projects.'
  });

  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();

  const handleSave = async () => {
    if (!user) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'You must be logged in to update your profile'
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateProfile(formData);
      
      setIsEditing(false);
      addNotification({
        type: 'success',
        title: 'Profile Updated!',
        message: 'Your profile has been successfully updated'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      addNotification({
        type: 'warning',
        title: 'Empty Skill',
        message: 'Please enter a skill name'
      });
      return;
    }

    if (formData.skills.includes(newSkill.trim())) {
      addNotification({
        type: 'warning',
        title: 'Skill Already Exists',
        message: 'This skill is already in your list'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
    addNotification({
      type: 'success',
      title: 'Skill Added',
      message: `${newSkill.trim()} has been added to your skills`
    });
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    addNotification({
      type: 'info',
      title: 'Skill Removed',
      message: `${skillToRemove} has been removed from your skills`
    });
  };

  const handleDownloadResume = () => {
    addNotification({
      type: 'info',
      title: 'Download Started',
      message: 'Your resume is being prepared for download...'
    });
    // Simulate download
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: 'Your resume has been downloaded successfully'
      });
    }, 2000);
  };

  const handleUploadResume = () => {
    addNotification({
      type: 'info',
      title: 'Upload Feature',
      message: 'Resume upload feature coming soon!'
    });
  };

  const handleSkillAssessment = () => {
    addNotification({
      type: 'info',
      title: 'Skill Assessment',
      message: 'Redirecting to skill assessment...'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button
            variant="primary"
            loading={loading}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            icon={isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      icon={<Camera className="h-4 w-4" />}
                    >
                      Change
                    </Button>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{formData.name}</h2>
                <p className="text-gray-600 mb-4">{formData.experience}</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleDownloadResume}
                  icon={<Download className="h-5 w-5" />}
                >
                  Download Resume
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleUploadResume}
                  icon={<Upload className="h-5 w-5" />}
                >
                  Upload Resume
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={handleSkillAssessment}
                  icon={<Award className="h-5 w-5" />}
                >
                  Skill Assessment
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              
              {isEditing && (
                <div className="mb-4 flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a skill"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addSkill}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                  >
                    {skill}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill)}
                        icon={<X className="h-3 w-3" />}
                        className="ml-2 p-0 h-auto"
                      >
                        {""}
                      </Button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Bio</h3>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;