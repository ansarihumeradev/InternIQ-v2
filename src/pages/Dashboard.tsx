import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase,
  BookOpen,
  TrendingUp, 
  Users,
  Calendar,
  Bell,
  Settings,
  Eye,
  Download,
  Share2,
  Plus,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Building,
  DollarSign,
  Target,
  Award,
  X,
  Trophy,
  Flag,
  BarChart3,
  TrendingUp as TrendingIcon,
  Zap,
  Lightbulb,
  Rocket,
  Heart,
  ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';

interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedDate: string;
  lastUpdated: string;
}

interface RecentJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  isBookmarked: boolean;
}

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '' });

  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Mock data loading
    setApplications([
      {
        id: '1',
        jobTitle: 'Frontend Developer',
        company: 'TechCorp Solutions',
        status: 'interviewing',
        appliedDate: '2024-01-15',
        lastUpdated: '2024-01-20'
      },
      {
        id: '2',
        jobTitle: 'Software Engineer',
        company: 'InnovateLab',
        status: 'applied',
        appliedDate: '2024-01-18',
        lastUpdated: '2024-01-18'
      },
      {
        id: '3',
        jobTitle: 'UI/UX Designer',
        company: 'DesignStudio Pro',
        status: 'offered',
        appliedDate: '2024-01-10',
        lastUpdated: '2024-01-22'
      }
    ]);

    setRecentJobs([
      {
        id: '1',
        title: 'React Developer',
        company: 'TechStartup Inc.',
        location: 'Mumbai, India',
        salary: '₹6-8 LPA',
        type: 'Full-time',
        postedDate: '2 hours ago',
        isBookmarked: false
      },
      {
        id: '2',
        title: 'Python Developer',
        company: 'DataMinds Analytics',
        location: 'Bangalore, India',
        salary: '₹5-7 LPA',
        type: 'Full-time',
        postedDate: '4 hours ago',
        isBookmarked: true
      },
      {
        id: '3',
        title: 'Product Manager',
        company: 'Growth Masters',
        location: 'Delhi, India',
        salary: '₹8-12 LPA',
        type: 'Full-time',
        postedDate: '6 hours ago',
        isBookmarked: false
      }
    ]);

    setSkills([
      { name: 'JavaScript', level: 'advanced', progress: 90 },
      { name: 'React', level: 'intermediate', progress: 75 },
      { name: 'Node.js', level: 'intermediate', progress: 70 },
      { name: 'Python', level: 'beginner', progress: 45 },
      { name: 'UI/UX Design', level: 'beginner', progress: 30 }
    ]);

    // Mock achievements data
    setAchievements([
      {
        id: '1',
        title: 'First Application',
        description: 'Submitted your first job application',
        icon: '🎯',
        earned: true,
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Skill Master',
        description: 'Reached advanced level in JavaScript',
        icon: '🏆',
        earned: true,
        date: '2024-01-18'
      },
      {
        id: '3',
        title: 'Interview Ready',
        description: 'Completed 5 mock interviews',
        icon: '🎤',
        earned: false,
        progress: 3
      },
      {
        id: '4',
        title: 'Network Builder',
        description: 'Connected with 10+ professionals',
        icon: '🤝',
        earned: false,
        progress: 7
      }
    ]);

    // Mock goals data
    setGoals([
      {
        id: '1',
        title: 'Apply to 20 jobs',
        target: 20,
        current: 8,
        deadline: '2024-02-15',
        type: 'applications'
      },
      {
        id: '2',
        title: 'Complete React certification',
        target: 100,
        current: 75,
        deadline: '2024-01-30',
        type: 'certification'
      },
      {
        id: '3',
        title: 'Build portfolio website',
        target: 100,
        current: 30,
        deadline: '2024-02-01',
        type: 'project'
      }
    ]);

    // Mock analytics data
    setAnalytics({
      applicationsThisMonth: 12,
      interviewsScheduled: 3,
      profileViews: 45,
      skillsCompleted: 8,
      averageResponseTime: '2.3 days',
      successRate: 85,
      topSkills: ['JavaScript', 'React', 'Node.js'],
      trendingCompanies: ['TechCorp', 'InnovateLab', 'DesignStudio']
    });
  }, []);

  const handleBookmarkJob = (jobId: string) => {
    setRecentJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
    
    const job = recentJobs.find(j => j.id === jobId);
    if (job) {
      addNotification({
        type: job.isBookmarked ? 'info' : 'success',
        title: job.isBookmarked ? 'Job removed' : 'Job bookmarked',
        message: job.isBookmarked ? 'Job removed from bookmarks' : 'Job added to bookmarks'
      });
    }
  };

  const handleApplyJob = (jobId: string) => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      addNotification({
        type: 'success',
        title: 'Application Submitted!',
        message: 'Your job application has been submitted successfully'
      });
    }, 1500);
  };

  const handleShareJob = (job: RecentJob) => {
    const shareText = `Check out this job opportunity: ${job.title} at ${job.company}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      addNotification({
        type: 'success',
        title: 'Link copied!',
        message: 'Job link copied to clipboard'
      });
    }
  };

  const handleDownloadResume = () => {
    addNotification({
      type: 'info',
      title: 'Download Started',
      message: 'Preparing your resume for download...'
    });
    
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: 'Your resume has been downloaded successfully'
      });
    }, 2000);
  };

  const handleUpdateProfile = () => {
    addNotification({
      type: 'info',
      title: 'Profile Update',
      message: 'Redirecting to profile settings...'
    });
  };

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.deadline) {
      const goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        target: parseInt(newGoal.target),
        current: 0,
        deadline: newGoal.deadline,
        type: 'custom'
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal({ title: '', target: '', deadline: '' });
      setShowGoalModal(false);
      addNotification({
        type: 'success',
        title: 'Goal Added!',
        message: 'New goal has been added to your dashboard'
      });
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    addNotification({
      type: 'info',
      title: 'Goal Removed',
      message: 'Goal has been removed from your dashboard'
    });
  };

  const handleUpdateGoalProgress = (goalId: string, increment: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(goal.current + increment, goal.target) }
        : goal
    ));
  };

  const getGoalProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getGoalProgressText = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'Completed!';
    if (percentage >= 80) return 'Almost there!';
    if (percentage >= 50) return 'Halfway there!';
    return 'Getting started...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4" />;
      case 'interviewing': return <Users className="h-4 w-4" />;
      case 'offered': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const stats = [
    { label: 'Applications', value: applications.length, icon: <Briefcase className="h-6 w-6" />, color: 'text-blue-600' },
    { label: 'Interviews', value: applications.filter(app => app.status === 'interviewing').length, icon: <Users className="h-6 w-6" />, color: 'text-yellow-600' },
    { label: 'Offers', value: applications.filter(app => app.status === 'offered').length, icon: <Award className="h-6 w-6" />, color: 'text-green-600' },
    { label: 'Skills', value: skills.length, icon: <Target className="h-6 w-6" />, color: 'text-purple-600' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please sign in to view your dashboard</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your job search</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleDownloadResume}
              icon={<Download className="h-4 w-4" />}
            >
              Download Resume
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateProfile}
              icon={<Settings className="h-4 w-4" />}
            >
              Update Profile
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['overview', 'applications', 'skills', 'recommendations'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                onClick={() => setActiveTab(tab)}
                className="flex-1 capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Applications */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                        <p className="text-sm text-gray-600">{application.company}</p>
                        <p className="text-xs text-gray-500">Applied: {application.appliedDate}</p>
                      </div>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills Progress</h3>
                <div className="space-y-4">
                  {skills.slice(0, 4).map((skill, index) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                        <span className="text-sm text-gray-600 capitalize">{skill.level}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.earned && (
                          <p className="text-xs text-green-600 mt-1">Earned {achievement.date}</p>
                        )}
                        {!achievement.earned && achievement.progress && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-yellow-500 h-1 rounded-full"
                                style={{ width: `${(achievement.progress / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Career Goals</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGoalModal(true)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Goal
                  </Button>
                </div>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateGoalProgress(goal.id, 1)}
                            icon={<Plus className="h-3 w-3" />}
                          >
                            {""}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            icon={<X className="h-3 w-3" />}
                          >
                            {""}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {goal.current} / {goal.target}
                        </span>
                        <span className="text-sm text-gray-500">
                          Due: {goal.deadline}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getGoalProgressColor(goal.current, goal.target)}`}
                          style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {getGoalProgressText(goal.current, goal.target)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.applicationsThisMonth}</div>
                    <div className="text-sm text-gray-600">Applications This Month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.interviewsScheduled}</div>
                    <div className="text-sm text-gray-600">Interviews Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analytics.profileViews}</div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analytics.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Top Skills</h4>
                    <div className="space-y-2">
                      {analytics.topSkills?.map((skill: string, index: number) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{skill}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Trending Companies</h4>
                    <div className="space-y-2">
                      {analytics.trendingCompanies?.map((company: string) => (
                        <div key={company} className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{company}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">All Applications</h3>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Applied: {application.appliedDate}</span>
                        <span>Updated: {application.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </div>
                      <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills Development</h3>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <div key={skill.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{skill.level} level</p>
                      </div>
                      <span className="text-sm font-medium text-primary-600">{skill.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommended Jobs</h3>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{job.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">{job.type}</span>
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmarkJob(job.id)}
                          icon={job.isBookmarked ? <Star className="h-4 w-4 fill-current text-yellow-500" /> : <Star className="h-4 w-4" />}
                        >
                          {""}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareJob(job)}
                          icon={<Share2 className="h-4 w-4" />}
                        >
                          {""}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={loading}
                          onClick={() => handleApplyJob(job.id)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 