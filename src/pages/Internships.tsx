import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  Filter,
  Bookmark,
  ExternalLink,
  Building,
  Users,
  Calendar,
  Heart,
  Share2,
  GraduationCap,
  DollarSign,
  RefreshCw,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import ScraperService from '../services/scraperService';
import { Internship, InternshipFilters } from '../types/job';

const Internships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InternshipFilters>({
    location: '',
    duration: '',
    remote: false,
    urgent: false,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [showInternshipModal, setShowInternshipModal] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [scraperService] = useState(() => ScraperService.getInstance());

  useEffect(() => {
    loadInternships();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [internships, filters]);

  const loadInternships = async () => {
    setLoading(true);
    try {
      console.log('Loading internships using scraper service...');
      
      // Use scraper service for faster loading
      const scrapedInternships = await scraperService.scrapeInternships();
      setInternships(scrapedInternships);
      setFilteredInternships(scrapedInternships);
      setLastUpdate(scraperService.getLastScrapeTime());
      setNextUpdate(scraperService.getNextScrapeTime());
      
      console.log(`Loaded ${scrapedInternships.length} internships from scraper service`);
      
      if (scrapedInternships.length > 0) {
        addNotification({
          type: 'success',
          title: 'Internships Updated',
          message: `Loaded ${scrapedInternships.length} internship opportunities`
        });
      }
    } catch (error) {
      console.error('Error loading internships:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load internships. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    scraperService.forceScrape();
    await loadInternships();
    addNotification({
      type: 'info',
      title: 'Refresh Complete',
      message: 'Internships have been refreshed with latest data'
    });
  };

  const applyFilters = () => {
    let filtered = [...internships];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchLower) ||
        internship.company.toLowerCase().includes(searchLower) ||
        internship.description.toLowerCase().includes(searchLower) ||
        internship.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(internship =>
        internship.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.duration) {
      filtered = filtered.filter(internship => internship.duration === filters.duration);
    }

    if (filters.remote) {
      filtered = filtered.filter(internship => internship.remote);
    }

    if (filters.urgent) {
      filtered = filtered.filter(internship => internship.urgent);
    }

    setFilteredInternships(filtered);
  };

  const handleBookmark = (internshipId: string) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to bookmark internships'
      });
      return;
    }

    setInternships(prev => prev.map(internship =>
      internship.id === internshipId ? { ...internship, isBookmarked: !internship.isBookmarked } : internship
    ));

    const internship = internships.find(i => i.id === internshipId);
    addNotification({
      type: 'success',
      title: internship?.isBookmarked ? 'Removed from Bookmarks' : 'Added to Bookmarks',
      message: `${internship?.title} ${internship?.isBookmarked ? 'removed from' : 'added to'} your bookmarks`
    });
  };

  const handleApply = (internshipId: string) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to apply for internships'
      });
      return;
    }

    setInternships(prev => prev.map(internship =>
      internship.id === internshipId ? { ...internship, isApplied: true } : internship
    ));

    const internship = internships.find(i => i.id === internshipId);
    addNotification({
      type: 'success',
      title: 'Application Submitted',
      message: `Successfully applied for ${internship?.title} at ${internship?.company}`
    });
  };

  const handleShare = async (internship: Internship) => {
    try {
      const shareData = {
        title: internship.title,
        text: `Check out this internship opportunity: ${internship.title} at ${internship.company}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.text}`);
        addNotification({
          type: 'success',
          title: 'Link Copied',
          message: 'Internship link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewInternship = (internship: Internship) => {
    setSelectedInternship(internship);
    setShowInternshipModal(true);
  };

  const closeInternshipModal = () => {
    setShowInternshipModal(false);
    setSelectedInternship(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getTimeUntilUpdate = () => {
    if (!nextUpdate) return '';
    const now = new Date();
    const diff = nextUpdate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Internship
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover opportunities tailored for fresh graduates
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
                placeholder="Search internships, companies, or skills..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full lg:w-48 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="h-5 w-5" />}
            >
              Filters
            </Button>
          </div>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Durations</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
              </select>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.remote}
                    onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remote Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.urgent}
                    onChange={(e) => setFilters(prev => ({ ...prev, urgent: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Urgent</span>
                </label>
              </div>
            </motion.div>
          )}
        </motion.div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-primary-600">{filteredInternships.length}</span> internships
          </p>
          {(filters.search || filters.location || filters.duration || filters.remote || filters.urgent) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({
                location: '',
                duration: '',
                remote: false,
                urgent: false,
                search: ''
              })}
            >
              Clear Filters
            </Button>
          )}
        </div>
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading internships...</span>
            </div>
          ) : filteredInternships.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No internships found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button
                variant="primary"
                onClick={() => setFilters({
                  location: '',
                  duration: '',
                  remote: false,
                  urgent: false,
                  search: ''
                })}
              >
                Clear All Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredInternships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={internship.companyLogo}
                      alt={internship.company}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(internship.company)}&background=4285F4&color=fff&size=50&font-size=0.4&bold=true`;
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {internship.title}
                        </h3>
                            <p className="text-sm text-gray-600">{internship.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleBookmark(internship.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              internship.isBookmarked
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'
                            }`}
                          >
                            <Bookmark className="h-5 w-5" fill={internship.isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => handleShare(internship)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{internship.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          <span>{internship.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>{internship.stipend}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{formatDate(internship.postedDate)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {internship.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {internship.urgent && (
                          <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                        {internship.remote && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            Remote
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          Internship
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {internship.description}
                      </p>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {internship.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {internship.skills.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                              +{internship.skills.length - 4} more
                            </span>
                          )}
                    </div>
                  </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {internship.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary-600 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => handleApply(internship.id)}
                          disabled={internship.isApplied}
                          variant={internship.isApplied ? "outline" : "primary"}
                          size="sm"
                          className="flex-1 mr-2"
                        >
                          {internship.isApplied ? 'Applied' : 'Apply Now'}
                        </Button>
                        <Button
                          onClick={() => handleViewInternship(internship)}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
                      </div>
                    </div>
                    
      {/* Internship Details Modal */}
      {showInternshipModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedInternship.companyLogo}
                    alt={selectedInternship.company}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedInternship.company)}&background=4285F4&color=fff&size=64&font-size=0.4&bold=true`;
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedInternship.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-2">{selectedInternship.company}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedInternship.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Posted {formatDate(selectedInternship.postedDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeInternshipModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Internship Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedInternship.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stipend:</span>
                        <span className="font-medium">{selectedInternship.stipend}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">
                          {selectedInternship.remote ? 'Remote' : 'On-site'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">
                          {selectedInternship.urgent ? 'Urgent Hiring' : 'Regular'}
                        </span>
                      </div>
                      </div>
                    </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedInternship.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedInternship.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedInternship.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInternship.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {selectedInternship.urgent && (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full">
                      Urgent
                    </span>
                  )}
                  {selectedInternship.remote && (
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                      Remote
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    Internship
                  </span>
                </div>
        </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => handleBookmark(selectedInternship.id)}
                    variant={selectedInternship.isBookmarked ? "outline" : "secondary"}
                    size="sm"
                    className="flex items-center"
                  >
                    <Bookmark className="h-4 w-4 mr-2" fill={selectedInternship.isBookmarked ? 'currentColor' : 'none'} />
                    {selectedInternship.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  <Button
                    onClick={() => handleShare(selectedInternship)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={closeInternshipModal}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleApply(selectedInternship.id)}
                    disabled={selectedInternship.isApplied}
                    variant={selectedInternship.isApplied ? "outline" : "primary"}
                    size="sm"
                    className="flex items-center"
                  >
                    {selectedInternship.isApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
    </div>
  );
};

export default Internships;