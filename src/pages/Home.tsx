import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Building,
  MessageCircle,
  FileText,
  Video,
  Award,
  Globe,
  BookOpen,
  Zap,
  Bell,
  Clock,
  TrendingUp as TrendingIcon,
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Rocket,
  Target as TargetIcon,
  Lightbulb,
  Shield,
  Users2,
  BarChart3,
  Bookmark,
  Play,
  Mic,
  Camera,
  Code,
  Palette,
  Database,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  const features = [
    {
      icon: Target,
      title: 'Smart Skill Matching',
      description: 'AI-powered matching that connects your skills with specific company needs and requirements'
    },
    {
      icon: Users,
      title: 'Personalized Career Guidance',
      description: 'One-on-one mentorship and career coaching tailored to your goals and aspirations'
    },
    {
      icon: TrendingUp,
      title: 'Career Progress Tracking',
      description: 'Monitor your applications, skill development, and career growth in real-time'
    },
    {
      icon: Building,
      title: 'Targeted Company Outreach',
      description: 'Direct connections with companies actively seeking fresh talent in your field'
    },
    {
      icon: FileText,
      title: 'Resume & Profile Optimization',
      description: 'Professional resume building tools and profile enhancement guidance'
    },
    {
      icon: Video,
      title: 'Interview Preparation',
      description: 'Mock interviews, coaching sessions, and industry-specific preparation resources'
    },
    {
      icon: Globe,
      title: 'Online Presence Building',
      description: 'LinkedIn optimization, portfolio creation, and digital branding support'
    },
    {
      icon: Award,
      title: 'Skill Assessment & Certification',
      description: 'Validate your skills with industry-recognized assessments and certifications'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Job Opportunities' },
    { number: '15K+', label: 'Happy Freshers' },
    { number: '2K+', label: 'Partner Companies' },
    { number: '95%', label: 'Success Rate' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Developer at TechCorp',
      content: 'The personalized career guidance and resume coaching helped me land my dream job within 2 weeks of graduation!',
      rating: 5
    },
    {
      name: 'Arjun Patel',
      role: 'Marketing Intern at StartupXYZ',
      content: 'The skill matching system connected me with the perfect internship. The interview preparation was invaluable.',
      rating: 5
    },
    {
      name: 'Sneha Reddy',
      role: 'Data Analyst at Analytics Pro',
      content: 'Building my online presence through their guidance transformed my career prospects completely.',
      rating: 5
    }
  ];

  const services = [
    {
      icon: MessageCircle,
      title: 'Career Mentorship',
      description: 'Connect with industry professionals for personalized guidance',
      link: '/mentorship'
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create ATS-friendly resumes with professional templates',
      link: '/resume-builder'
    },
    {
      icon: Video,
      title: 'Interview Coaching',
      description: 'Practice with mock interviews and expert feedback',
      link: '/interview-prep'
    },
    {
      icon: BookOpen,
      title: 'Skill Development',
      description: 'Access courses and resources to enhance your skills',
      link: '/skill-development'
    },
    {
      icon: Globe,
      title: 'Online Branding',
      description: 'Build a strong digital presence and professional network',
      link: '/online-branding'
    },
    {
      icon: Zap,
      title: 'Quick Apply',
      description: 'Apply to multiple relevant positions with one click',
      link: '/quick-apply'
    }
  ];

  // Trending jobs data
  const trendingJobs = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechStartup Inc.',
      location: 'Mumbai, India',
      salary: '₹6-12 LPA',
      type: 'Full-time',
      posted: '2 hours ago',
      logo: 'https://logo.clearbit.com/techstartup.com',
      skills: ['React', 'TypeScript', 'UI/UX'],
      urgent: true
    },
    {
      id: '2',
      title: 'Data Science Intern',
      company: 'Analytics Pro',
      location: 'Bangalore, India',
      salary: '₹25-35K/month',
      type: 'Internship',
      posted: '4 hours ago',
      logo: 'https://logo.clearbit.com/analyticspro.com',
      skills: ['Python', 'Machine Learning', 'SQL'],
      urgent: false
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignLab Studio',
      location: 'Delhi, India',
      salary: '₹8-15 LPA',
      type: 'Full-time',
      posted: '6 hours ago',
      logo: 'https://logo.clearbit.com/designlab.studio',
      skills: ['Figma', 'Prototyping', 'User Research'],
      urgent: true
    },
    {
      id: '4',
      title: 'Backend Developer',
      company: 'CloudTech Systems',
      location: 'Hyderabad, India',
      salary: '₹10-18 LPA',
      type: 'Full-time',
      posted: '8 hours ago',
      logo: 'https://logo.clearbit.com/cloudtech.com',
      skills: ['Node.js', 'MongoDB', 'AWS'],
      urgent: false
    }
  ];

  // Recent activities
  const recentActivities = [
    {
      type: 'job_applied',
      title: 'Applied to Frontend Developer at TechStartup',
      time: '2 hours ago',
      icon: Briefcase,
      color: 'text-green-600'
    },
    {
      type: 'profile_updated',
      title: 'Updated your profile with new skills',
      time: '1 day ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      type: 'interview_scheduled',
      title: 'Interview scheduled with Analytics Pro',
      time: '2 days ago',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      type: 'skill_certified',
      title: 'Earned React.js certification',
      time: '3 days ago',
      icon: Award,
      color: 'text-orange-600'
    }
  ];

  // Skill categories for quick access
  const skillCategories = [
    {
      name: 'Programming',
      icon: Code,
      color: 'bg-blue-500',
      skills: ['JavaScript', 'Python', 'Java', 'C++']
    },
    {
      name: 'Design',
      icon: Palette,
      color: 'bg-purple-500',
      skills: ['UI/UX', 'Figma', 'Photoshop', 'Illustrator']
    },
    {
      name: 'Data',
      icon: Database,
      color: 'bg-green-500',
      skills: ['SQL', 'MongoDB', 'Data Analysis', 'ML']
    },
    {
      name: 'Mobile',
      icon: Smartphone,
      color: 'bg-orange-500',
      skills: ['React Native', 'Flutter', 'iOS', 'Android']
    }
  ];

  // Recruiter specific stats
  const recruiterStats = [
    { number: '15K+', label: 'Verified Freshers' },
    { number: '92%', label: 'Hiring Match Rate' },
    { number: '< 48h', label: 'Average Time to Shortlist' },
    { number: '2.5K+', label: 'Active Openings Filled' }
  ];

  // Recruiter specific hiring features
  const recruiterFeatures = [
    {
      icon: Users2,
      title: 'Verified Fresher Talent Pool',
      description: 'Access pre-assessed candidates with verified skills, GitHub projects, and authenticated resumes.'
    },
    {
      icon: Zap,
      title: 'Instant Internship Posting',
      description: 'Publish internships and entry-level positions in minutes and reach top students nationwide.'
    },
    {
      icon: BarChart3,
      title: 'End-to-End Pipeline Tracking',
      description: 'Filter applicants, review cover letters, view resumes, and update candidate stages in real time.'
    },
    {
      icon: Target,
      title: 'Skill Graph Matching',
      description: 'Let our intelligent Skill Graph algorithm surface candidates matching your specific tech stack.'
    }
  ];

  if (user?.role === 'recruiter') {
    return (
      <div className="overflow-hidden bg-iq-bg">
        {/* Recruiter Hero Section */}
        <section className="relative min-h-[85vh] flex items-center iq-watercolor">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-iq-tealsoft border border-iq-sage rounded-full text-xs font-bold text-iq-teal mb-6">
                  <Shield className="w-3.5 h-3.5 text-iq-teal" />
                  <span>Recruiter Portal • Hire Pre-Screened Fresher Talent</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-iq-navy mb-6">
                  Hire the Next Generation of{' '}
                  <span className="font-brush text-iq-teal">
                    Top Talent
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-iq-muted mb-8 max-w-4xl mx-auto leading-relaxed">
                  Post internships, review pre-screened applications with verified Skill Graphs,
                  and fast-track entry-level hiring with zero friction.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Link
                  to="/dashboard?action=post"
                  className="bg-iq-teal text-white px-8 py-4 rounded-btn font-bold text-lg hover:bg-iq-tealdark hover:shadow-cta hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Post an Internship
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-iq-surface text-iq-navy px-8 py-4 rounded-btn font-bold text-lg border-2 border-iq-sage hover:border-iq-teal hover:shadow-nav transition-all duration-200 flex items-center justify-center"
                >
                  <Users className="mr-2 h-5 w-5 text-iq-teal" />
                  View Applicant Pipeline
                </Link>
              </motion.div>

              {/* Recruiter Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8"
              >
                {recruiterStats.map((stat, index) => (
                  <div key={index} className="text-center p-6 bg-iq-surface/80 backdrop-blur-sm rounded-card border border-iq-sage/40 shadow-nav">
                    <div className="text-3xl md:text-4xl font-extrabold text-iq-teal mb-2">
                      {stat.number}
                    </div>
                    <div className="text-iq-muted font-medium text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Recruiter Features Section */}
        <section className="py-20 bg-iq-surface border-t border-iq-sage/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-iq-navy mb-4">
                Built to Streamline Fresher Hiring
              </h2>
              <p className="text-xl text-iq-muted max-w-3xl mx-auto">
                Everything you need to source, evaluate, and hire ambitious early-career talent with confidence
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recruiterFeatures.map((feat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-card bg-iq-bg border border-iq-sage/30 hover:shadow-nav hover:scale-105 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-iq-teal rounded-panel flex items-center justify-center mx-auto mb-4 text-white">
                    <feat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-iq-navy mb-2">{feat.title}</h3>
                  <p className="text-iq-muted text-sm leading-relaxed">{feat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recruiter Quick Management Row */}
        <section className="py-20 bg-iq-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-iq-surface p-8 rounded-card border border-iq-sage/30 shadow-nav space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-iq-mint text-iq-teal rounded-panel flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-iq-navy">Manage Your Listings</h3>
                  <p className="text-iq-muted text-sm mt-2">
                    Review your currently open and closed internship postings, edit requirements, and track applicant volume.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-sm font-bold text-iq-teal hover:text-iq-tealdark"
                >
                  Go to Listings <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-iq-surface p-8 rounded-card border border-iq-sage/30 shadow-nav space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-iq-lavender text-iq-teal rounded-panel flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-iq-navy">Candidate Pipeline</h3>
                  <p className="text-iq-muted text-sm mt-2">
                    Screen applicants by stage (Applied, Shortlisted, Interviewed, Selected) and view submitted resumes directly.
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-sm font-bold text-iq-teal hover:text-iq-tealdark"
                >
                  Review Candidates <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="bg-iq-surface p-8 rounded-card border border-iq-sage/30 shadow-nav space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-iq-blue text-iq-teal rounded-panel flex items-center justify-center mb-4">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-iq-navy">Company Brand & Profile</h3>
                  <p className="text-iq-muted text-sm mt-2">
                    Update your company description, website URL, and logo to attract high-intent candidates.
                  </p>
                </div>
                <Link
                  to="/profile"
                  className="inline-flex items-center text-sm font-bold text-iq-green hover:text-iq-tealdark"
                >
                  Edit Company Profile <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recruiter CTA Section */}
        <section className="py-20 bg-iq-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black">
              Ready to Build Your High-Performing Team?
            </h2>
            <p className="text-lg text-iq-faint max-w-2xl mx-auto">
              Post an internship in under 2 minutes and connect with qualified freshers who match your skill criteria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/dashboard?action=post"
                className="bg-iq-teal hover:bg-iq-tealdark text-white px-8 py-4 rounded-btn font-bold text-lg shadow-cta hover:scale-105 transition-all inline-flex items-center justify-center"
              >
                Post an Internship Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/dashboard"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-btn font-bold text-lg transition-all inline-flex items-center justify-center"
              >
                Open Recruiter Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // STUDENT VIEW (UNCHANGED)
  return (
    <div className="overflow-hidden bg-iq-bg">
      <style>{`
        /* Override old navbar logo gradients with IQ colors since we cannot modify Header.tsx */
        header .from-indigo-600.via-purple-600.to-pink-600 {
          background: #0f1b3d !important; /* iq-navy */
        }
        header .bg-clip-text.from-indigo-600.via-purple-600.to-pink-600 {
          background: none !important;
          color: #0f1b3d !important;
          -webkit-text-fill-color: #0f1b3d !important;
        }
        header .from-indigo-600.via-purple-600.to-pink-600 svg {
          color: #0e8a85 !important; /* iq-teal */
        }
      `}</style>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center iq-watercolor">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-iq-navy mb-6">
                Empowering{' '}
                <span className="font-hand text-iq-green">
                  Freshers
                </span>
                <br />
                Smarter Discovery
              </h1>
              <p className="text-xl md:text-2xl text-iq-muted mb-8 max-w-4xl mx-auto">
                Connect with relevant opportunities through AI-powered matching, personalized career guidance,
                and comprehensive support for building your professional presence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link
                to="/internships"
                className="bg-iq-teal text-white px-8 py-4 rounded-btn font-semibold text-lg hover:bg-iq-tealdark hover:shadow-cta hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <Search className="mr-2 h-5 w-5" />
                Explore Internships
              </Link>
              <Link
                to="/career-guidance"
                className="bg-iq-surface text-iq-teal px-8 py-4 rounded-btn font-semibold text-lg border-2 border-iq-teal/30 hover:border-iq-teal hover:shadow-nav transition-all duration-200 flex items-center justify-center"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Get Career Guidance
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
            >
              {stats.map((stat, index) => (
                <div key={index} className={`text-center p-5 rounded-card border border-iq-sage/40 shadow-nav backdrop-blur-sm ${index === 0 ? 'bg-iq-mint/60' : index === 1 ? 'bg-iq-lavender/50' : index === 2 ? 'bg-iq-blue/50' : 'bg-iq-butter/50'
                  }`}>
                  <div className="text-3xl md:text-4xl font-bold text-iq-teal mb-2">
                    {stat.number}
                  </div>
                  <div className="text-iq-muted font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce-subtle">
          <div className="w-16 h-16 bg-iq-sage rounded-full opacity-30"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce-subtle" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-iq-blue rounded-full opacity-40"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce-subtle" style={{ animationDelay: '2s' }}>
          <div className="w-20 h-20 bg-iq-lavender rounded-full opacity-30"></div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 bg-iq-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-iq-navy mb-4">
              Complete Career Support Ecosystem
            </h2>
            <p className="text-xl text-iq-muted max-w-3xl mx-auto">
              From skill matching to interview preparation, we provide everything you need to launch your career successfully
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(service.link)}
                className="bg-iq-surface p-6 rounded-card border border-iq-sage/30 hover:shadow-nav hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-iq-teal rounded-panel flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-iq-navy mb-2">{service.title}</h3>
                <p className="text-iq-muted mb-4">{service.description}</p>
                <div className="flex items-center text-iq-teal font-medium group-hover:text-iq-green transition-colors">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-iq-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-iq-navy mb-4">
              Why Choose InternIQ?
            </h2>
            <p className="text-xl text-iq-muted max-w-3xl mx-auto">
              We understand the unique challenges freshers face and provide comprehensive solutions for career success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-card bg-iq-surface border border-iq-sage/30 hover:shadow-nav hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-iq-teal rounded-panel flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-iq-navy mb-2">{feature.title}</h3>
                <p className="text-iq-muted text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Jobs Section */}
      <section className="py-20 bg-iq-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <TrendingIcon className="h-8 w-8 text-iq-green" />
              <h2 className="text-3xl md:text-4xl font-bold text-iq-navy">
                Trending Opportunities
              </h2>
              <span className="bg-iq-butter text-iq-navy px-3 py-1 rounded-full text-sm font-medium">
                Hot
              </span>
            </div>
            <p className="text-xl text-iq-muted max-w-3xl mx-auto">
              Discover the most popular and urgent job opportunities right now
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate('/internships')}
                className="bg-iq-surface border border-iq-sage/30 rounded-card p-6 hover:shadow-nav hover:border-iq-teal/30 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="w-12 h-12 rounded-panel object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=4285F4&color=fff&size=48&font-size=0.4&bold=true`;
                    }}
                  />
                  {job.urgent && (
                    <span className="bg-iq-danger/10 text-iq-danger px-2 py-1 rounded-tag text-xs font-medium">
                      Urgent
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-iq-navy mb-2 group-hover:text-iq-teal transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-iq-muted mb-3">{job.company}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-iq-faint">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-iq-faint">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-iq-faint">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.posted}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-iq-mint text-iq-navy text-xs rounded-tag"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 2 && (
                    <span className="px-2 py-1 bg-iq-blue text-iq-faint text-xs rounded-tag">
                      +{job.skills.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-iq-faint">{job.type}</span>
                  <button
                    type="button"
                    className="flex items-center px-3 py-2 text-sm font-medium bg-iq-navy text-white hover:bg-iq-teal rounded-tag transition-all duration-200"
                    onClick={() => navigate('/internships')}
                  >
                    Apply Now
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/internships"
              className="inline-flex items-center px-6 py-3 bg-iq-teal text-white rounded-btn font-medium hover:bg-iq-tealdark hover:shadow-cta hover:scale-105 transition-all duration-200"
            >
              View All Internships
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skill Categories Section */}
      <section className="py-20 bg-iq-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-iq-navy mb-4">
              Explore Skills & Technologies
            </h2>
            <p className="text-xl text-iq-muted max-w-3xl mx-auto">
              Discover in-demand skills and technologies that can boost your career
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-iq-surface border border-iq-sage/30 rounded-card p-6 hover:shadow-nav hover:border-iq-teal/30 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-14 h-14 ${category.color} rounded-panel flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-iq-navy mb-3">{category.name}</h3>
                <div className="space-y-2">
                  {category.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center text-sm text-iq-muted hover:text-iq-teal transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-iq-green" />
                      {skill}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-iq-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-iq-navy mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-iq-muted max-w-2xl mx-auto">
              Hear from freshers who transformed their careers with our comprehensive support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-iq-surface p-8 rounded-card border border-iq-sage/30 hover:shadow-nav transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-iq-muted mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <h4 className="font-semibold text-iq-navy">{testimonial.name}</h4>
                  <p className="text-sm text-iq-faint">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-iq-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-xl text-iq-faint mb-8">
              Join thousands of freshers who found success with personalized guidance and smart matching
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/internships"
                className="bg-iq-teal text-white px-8 py-4 rounded-btn font-semibold text-lg hover:bg-iq-tealdark hover:shadow-cta hover:scale-105 transition-all duration-200 inline-flex items-center justify-center"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/career-guidance"
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-btn font-semibold text-lg hover:bg-white hover:text-iq-navy transition-all duration-200 inline-flex items-center justify-center"
              >
                Get Free Consultation
                <MessageCircle className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;