import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import {
  Search,
  Video,
  FileText,
  Star,
  Heart,
  Share2,
  Play,
  Download,
  Bookmark,
  Clock,
  Users,
  Award,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  X,
  CheckCircle2,
  UserCheck,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { BookmarkService } from '../services/bookmarkService';

interface InterviewResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'practice' | 'guide';
  category: string;
  description: string;
  duration: string;
  rating: number;
  reviews: number;
  author: string;
  image: string;
  route?: string;
  url?: string;
  isBookmarked?: boolean;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const InterviewPrep: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // Mock interview prep resources
  const resources: InterviewResource[] = [
    {
      id: '1',
      title: 'Common Behavioral Interview Questions',
      type: 'video',
      category: 'Behavioral',
      description: 'Learn how to answer the most common behavioral questions with confidence and structure.',
      duration: '45 min',
      rating: 4.8,
      reviews: 234,
      author: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.youtube.com/watch?v=zoGZQatkqKg',
      tags: ['Behavioral', 'STAR Method', 'Confidence'],
      difficulty: 'beginner'
    },
    {
      id: '2',
      title: 'Technical Interview Preparation Guide',
      type: 'guide',
      category: 'Technical',
      description: 'Comprehensive guide covering data structures, algorithms, and system design concepts.',
      duration: '2 hours',
      rating: 4.9,
      reviews: 156,
      author: 'Michael Chen',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.freecodecamp.org/news/how-to-prep-for-technical-interviews-guide-for-web-devs',
      tags: ['Algorithms', 'Data Structures', 'System Design'],
      difficulty: 'advanced'
    },
    {
      id: '3',
      title: 'Mock Interview Practice Session',
      type: 'practice',
      category: 'Practice',
      description: 'Interactive mock interview with real-time feedback and performance analysis.',
      duration: '60 min',
      rating: 4.7,
      reviews: 89,
      author: 'Emily Rodriguez',
      image: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.pramp.com',
      tags: ['Practice', 'Feedback', 'Real-time'],
      difficulty: 'intermediate'
    },
    {
      id: '4',
      title: 'Body Language and Communication Tips',
      type: 'article',
      category: 'Communication',
      description: 'Master the art of confident body language and effective communication during interviews.',
      duration: '15 min read',
      rating: 4.6,
      reviews: 78,
      author: 'David Wilson',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.cake.me/resources/interview-guide/interview-body-language-tips',
      tags: ['Communication', 'Body Language', 'Confidence'],
      difficulty: 'beginner'
    },
    {
      id: '5',
      title: 'Salary Negotiation Strategies',
      type: 'video',
      category: 'Negotiation',
      description: 'Learn effective strategies for negotiating your salary and benefits package.',
      duration: '30 min',
      rating: 4.5,
      reviews: 112,
      author: 'Lisa Thompson',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.youtube.com/watch?v=jDCxSKUeo6U',
      tags: ['Salary', 'Negotiation', 'Benefits'],
      difficulty: 'intermediate'
    },
    {
      id: '6',
      title: 'Company Research and Culture Fit',
      type: 'article',
      category: 'Research',
      description: 'How to research companies effectively and demonstrate cultural fit during interviews.',
      duration: '20 min read',
      rating: 4.8,
      reviews: 167,
      author: 'Alex Kumar',
      image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      url: 'https://www.8x8.com/blog/8-ways-to-properly-research-a-company-before-your-interview',
      tags: ['Research', 'Culture', 'Company Knowledge'],
      difficulty: 'beginner'
    }
  ];

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !categoryFilter || resource.category === categoryFilter;
      const matchesType = !typeFilter || resource.type === typeFilter;
      const matchesDifficulty = !difficultyFilter || resource.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    });
  }, [searchTerm, categoryFilter, typeFilter, difficultyFilter, resources]);

  useEffect(() => {
    loadSavedResources();
  }, [user?.id]);

  const loadSavedResources = async () => {
    try {
      const savedSet = await BookmarkService.fetchSavedItemIds(user?.id);
      setBookmarkedResources(savedSet);
    } catch (err) {
      console.error('Error loading saved resources:', err);
    }
  };

  const handleBookmark = async (resourceId: string) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign in required',
        message: 'Please sign in to bookmark resources'
      });
      return;
    }
    const targetResource = resources.find(r => r.id === resourceId);
    const isSavedNow = await BookmarkService.toggleSavedItem(
      user.id,
      resourceId,
      'resource',
      targetResource || { id: resourceId, title: 'Interview Prep Resource' }
    );
    setBookmarkedResources(prev => {
      const newSet = new Set(prev);
      if (isSavedNow) newSet.add(resourceId);
      else newSet.delete(resourceId);
      return newSet;
    });
    addNotification({
      type: isSavedNow ? 'success' : 'info',
      title: isSavedNow ? 'Resource bookmarked' : 'Resource removed',
      message: isSavedNow ? 'Resource added to your bookmarks' : 'Resource removed from bookmarks'
    });
  };

  const handleShare = (resource: InterviewResource) => {
    const shareText = `Check out this interview prep resource: ${resource.title}`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      addNotification({
        type: 'success',
        title: 'Link copied!',
        message: 'Resource link copied to clipboard'
      });
    }
  };

  const handleViewResource = (resource: InterviewResource) => {
    addNotification({
      type: 'info',
      title: 'Opening ' + resource.title,
      message: `Navigating to ${resource.title}`
    });
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const [showMockModal, setShowMockModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Technical (React / Full Stack)');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');

  const handleScheduleMockInterview = () => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Sign In Required',
        message: 'Please sign in to schedule a mock interview session.'
      });
      return;
    }
    setShowMockModal(true);
  };

  const handleConfirmMockBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMockModal(false);
    addNotification({
      type: 'success',
      title: 'Mock Interview Booked!',
      message: `Successfully scheduled ${selectedCategory} mock interview for ${selectedDate} at ${selectedSlot}. Check your email for meeting link!`
    });
  };

  const handleDownloadGuide = () => {
    addNotification({
      type: 'info',
      title: 'Preparing Download',
      message: 'Generating InternIQ Complete Interview Preparation & Career Guide PDF...'
    });

    try {
      const doc = new jsPDF();
      doc.setFillColor(0, 137, 123); // #00897b
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('InternIQ Complete Interview Preparation Guide', 15, 20);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('1. The STAR Method Framework', 15, 45);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Situation: Set the scene and provide necessary background context.', 20, 55);
      doc.text('• Task: Describe your specific responsibility in that situation.', 20, 63);
      doc.text('• Action: Explain the step-by-step actions you took to address the challenge.', 20, 71);
      doc.text('• Result: Share the measurable outcomes and achievements of your action.', 20, 79);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Fresher Technical Interview Checklist', 15, 95);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Master core Data Structures: Arrays, HashMaps, Trees, Graphs.', 20, 105);
      doc.text('• Practice clean code & modular architecture principles.', 20, 113);
      doc.text('• Understand Big-O Time & Space Complexity analysis.', 20, 121);
      doc.text('• Review system design fundamentals (APIs, DB Indexing, Caching).', 20, 129);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Salary & Offer Negotiation Strategies', 15, 145);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('• Research industry benchmarks for your role and location.', 20, 155);
      doc.text('• Highlight unique skills and internship achievements.', 20, 163);
      doc.text('• Evaluate full compensation packages including stipend, ESOPs, & perks.', 20, 171);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('© InternIQ Advanced Hiring Platform - Empowering Freshers with Smarter Discovery.', 15, 280);

      doc.save('InternIQ_Complete_Interview_Preparation_Guide.pdf');

      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: 'InternIQ Complete Interview Guide PDF downloaded successfully!'
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not generate PDF guide. Please try again.'
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setDifficultyFilter('');
    addNotification({
      type: 'info',
      title: 'Filters cleared',
      message: 'All search filters have been reset'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      case 'practice': return <MessageCircle className="h-5 w-5" />;
      case 'guide': return <Bookmark className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-teal-50 text-teal-700 border border-teal-100';
      case 'intermediate': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'advanced': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const categories = [...new Set(resources.map(resource => resource.category))];
  const types = [...new Set(resources.map(resource => resource.type))];
  const difficulties = [...new Set(resources.map(resource => resource.difficulty))];

  return (
    <div className="min-h-screen py-8 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Interview Preparation
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Master your interview skills with expert resources and practice materials
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            variant="ghost"
            onClick={handleScheduleMockInterview}
            icon={<Calendar className="h-5 w-5" />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-btn transition-colors"
          >
            Schedule Mock Interview
          </Button>
          <Button
            variant="ghost"
            onClick={handleDownloadGuide}
            icon={<Download className="h-5 w-5" />}
            className="bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 font-medium rounded-btn transition-colors"
          >
            Download Complete Guide
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 mb-8 border border-slate-100"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search interview topics, questions, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700 bg-slate-50/50"
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Award className="h-5 w-5" />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700 bg-slate-50/50"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700 bg-slate-50/50"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-700 bg-slate-50/50"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </motion.div>
          )}
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600">
            Found <span className="font-semibold text-teal-600">{filteredResources.length}</span> resources
          </p>
          {(searchTerm || categoryFilter || typeFilter || difficultyFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.13)] border border-slate-100 transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <div className="flex items-center space-x-2 bg-teal-50 backdrop-blur-sm rounded-tag px-3 py-1 shadow-sm">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm font-medium capitalize text-slate-700">{resource.type}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-2 bg-teal-50 backdrop-blur-sm rounded-tag px-3 py-1 shadow-sm">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium text-slate-700">{resource.duration}</span>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                  <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-tag text-xs font-medium">
                    {resource.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                  {resource.title}
                </h3>

                <p className="text-slate-500 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>{resource.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-slate-700 font-medium">{resource.rating}</span>
                    <span className="text-slate-400">({resource.reviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-tag"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-xs rounded-tag">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(resource.id)}
                    icon={bookmarkedResources.has(resource.id) ? <Heart className="h-5 w-5 fill-current text-red-500" /> : <Heart className="h-5 w-5" />}
                    className="text-teal-600 hover:bg-teal-50"
                  >
                    {bookmarkedResources.has(resource.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(resource)}
                    icon={<Share2 className="h-5 w-5" />}
                    className="text-teal-600 hover:bg-teal-50"
                  >
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewResource(resource)}
                    icon={<Play className="h-4 w-4" />}
                    iconPosition="right"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-btn transition-colors"
                  >
                    {resource.type === 'video' ? 'Watch' : 'View'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">No resources found</h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-btn transition-colors"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Mock Interview Booking Modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-card shadow-[0_8px_40px_rgb(0,0,0,0.12)] max-w-md w-full overflow-hidden border border-slate-100"
          >
            <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-teal-100" />
                <h3 className="text-xl font-bold text-white">Schedule 1-on-1 Mock Interview</h3>
              </div>
              <button
                onClick={() => setShowMockModal(false)}
                className="text-white hover:text-teal-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleConfirmMockBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Interview Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-700 bg-slate-50/50"
                >
                  <option value="Technical (React / Full Stack)">Technical (React / Full Stack)</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Behavioral & HR Round">Behavioral & HR Round</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-700 bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-slate-700 bg-slate-50/50"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM</option>
                </select>
              </div>

              <div className="bg-teal-50 rounded-lg p-3 text-xs text-teal-800 space-y-1">
                <div className="flex items-center space-x-1 font-semibold">
                  <UserCheck className="h-4 w-4 text-teal-600" />
                  <span>Includes expert mentor assessment & feedback</span>
                </div>
                <p>Google Meet invite link will be sent to your registered email.</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-btn transition-colors"
                  onClick={() => setShowMockModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-btn transition-colors"
                >
                  Confirm Slot
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;