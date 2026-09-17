import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Video,
  FileText,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Play,
  Download,
  Bookmark,
  TrendingUp,
  Users,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import { BookmarkService } from '../services/bookmarkService';

interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'guide';
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
}

const CareerGuidance: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // Mock career guidance resources
  const resources: Resource[] = [
    {
      id: '1',
      title: 'How to Write a Killer Resume for Freshers',
      type: 'article',
      category: 'Resume Writing',
      description: 'Learn the essential tips and tricks to create a resume that stands out and gets you noticed by recruiters.',
      duration: '10 min read',
      rating: 4.8,
      reviews: 156,
      author: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/resume-builder',
      tags: ['Resume', 'Career Tips', 'Freshers']
    },
    {
      id: '2',
      title: 'Ace Your First Job Interview',
      type: 'video',
      category: 'Interview Prep',
      description: 'Comprehensive video guide covering common interview questions, body language, and confidence building.',
      duration: '25 min',
      rating: 4.9,
      reviews: 234,
      author: 'Michael Chen',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/interview-prep',
      tags: ['Interview', 'Confidence', 'Communication']
    },
    {
      id: '3',
      title: 'Career Path Planning for Tech Graduates',
      type: 'course',
      category: 'Career Planning',
      description: 'Interactive course helping you understand different career paths in technology and how to choose the right one.',
      duration: '2 hours',
      rating: 4.7,
      reviews: 89,
      author: 'Emily Rodriguez',
      image: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/skill-development',
      tags: ['Career Planning', 'Technology', 'Graduates']
    },
    {
      id: '4',
      title: 'Networking Strategies for Freshers',
      type: 'guide',
      category: 'Networking',
      description: 'Step-by-step guide to building professional relationships and expanding your network as a fresher.',
      duration: '15 min read',
      rating: 4.6,
      reviews: 78,
      author: 'David Wilson',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/companies',
      tags: ['Networking', 'Professional', 'Relationships']
    },
    {
      id: '5',
      title: 'Salary Negotiation for Entry-Level Positions',
      type: 'article',
      category: 'Salary & Benefits',
      description: 'Learn how to negotiate your first salary and understand your worth in the job market.',
      duration: '12 min read',
      rating: 4.5,
      reviews: 112,
      author: 'Lisa Thompson',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/interview-prep',
      tags: ['Salary', 'Negotiation', 'Entry Level']
    },
    {
      id: '6',
      title: 'Building a Personal Brand Online',
      type: 'video',
      category: 'Personal Branding',
      description: 'Create a strong online presence and personal brand that attracts opportunities.',
      duration: '30 min',
      rating: 4.8,
      reviews: 167,
      author: 'Alex Kumar',
      image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      route: '/profile',
      tags: ['Personal Brand', 'Online Presence', 'Social Media']
    }
  ];

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !categoryFilter || resource.category === categoryFilter;
      const matchesType = !typeFilter || resource.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchTerm, categoryFilter, typeFilter, resources]);

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
      targetResource || { id: resourceId, title: 'Career Guidance Resource' }
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

  const handleShare = (resource: Resource) => {
    const shareText = `Check out this amazing career resource: ${resource.title}`;
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

  const handleViewResource = (resource: Resource) => {
    addNotification({
      type: 'info',
      title: 'Opening ' + resource.title,
      message: `Navigating to ${resource.title}`
    });
    if (resource.route) {
      navigate(resource.route);
    } else if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const handleDownload = (resource: Resource) => {
    addNotification({
      type: 'info',
      title: 'Download started',
      message: `Preparing ${resource.title} for download...`
    });
    // Simulate download
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Download complete',
        message: `${resource.title} downloaded successfully`
      });
    }, 2000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    addNotification({
      type: 'info',
      title: 'Filters cleared',
      message: 'All search filters have been reset'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'course': return <BookOpen className="h-5 w-5" />;
      case 'guide': return <Bookmark className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const categories = [...new Set(resources.map(resource => resource.category))];
  const types = [...new Set(resources.map(resource => resource.type))];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Career Guidance Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert advice, tips, and resources to help you build a successful career
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<BookOpen className="h-5 w-5" />}
            >
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </motion.div>
          )}
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-primary-600">{filteredResources.length}</span> resources
          </p>
          {(searchTerm || categoryFilter || typeFilter) && (
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
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    {getTypeIcon(resource.type)}
                    <span className="text-sm font-medium capitalize">{resource.type}</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{resource.duration}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                    {resource.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {resource.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{resource.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{resource.rating}</span>
                    <span className="text-gray-400">({resource.reviews})</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
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
                  >
                    {bookmarkedResources.has(resource.id) ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(resource)}
                    icon={<Share2 className="h-5 w-5" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewResource(resource)}
                    icon={<ExternalLink className="h-4 w-4" />}
                    iconPosition="right"
                  >
                    View
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
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="primary"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CareerGuidance;