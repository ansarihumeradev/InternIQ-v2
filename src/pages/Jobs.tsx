import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, DollarSign, Bookmark, Share2, ExternalLink, Filter, RefreshCw, X, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/NotificationSystem';
import Button from '../components/ui/Button';
import ScraperService from '../services/scraperService';
import { Job, JobFilters } from '../types/job';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    type: '',
    experience: '',
    remote: false,
    urgent: false,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [scraperService] = useState(() => ScraperService.getInstance());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    loadJobs();
    loadUserData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('Loading jobs using scraper service...');
      
      // Use scraper service for faster loading
      const scrapedJobs = await scraperService.scrapeJobs();
      setJobs(scrapedJobs);
      setFilteredJobs(scrapedJobs);
      setLastUpdate(scraperService.getLastScrapeTime());
      setNextUpdate(scraperService.getNextScrapeTime());
      
      console.log(`Loaded ${scrapedJobs.length} jobs from scraper service`);
    } catch (error) {
      console.error('Error loading jobs:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load jobs. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    await loadJobs();
    addNotification({
      type: 'info',
      title: 'Refresh Complete',
      message: 'Jobs have been refreshed with latest data'
    });
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(job => job.type === filters.type);
    }

    if (filters.experience) {
      filtered = filtered.filter(job => job.experience === filters.experience);
    }

    if (filters.remote) {
      filtered = filtered.filter(job => job.remote);
    }

    if (filters.urgent) {
      filtered = filtered.filter(job => job.urgent);
    }

    setFilteredJobs(filtered);
  };

  const handleBookmark = (jobId: string) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please sign in to bookmark jobs'
      });
      return;
    }

    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));

    const job = jobs.find(j => j.id === jobId);
    addNotification({
      type: 'success',
      title: `${job?.title}`,
      message: `${job?.isBookmarked ? 'removed from' : 'added to'} your bookmarks`
    });
  };

  const handleApply = (jobId: string) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Warning',
        message: 'Please sign in to apply for jobs'
      });
      return;
    }

    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, isApplied: true } : job
    ));

    const job = jobs.find(j => j.id === jobId);
    addNotification({
      type: 'success',
      title: `Successfully applied for ${job?.title} at ${job?.company}`,
      message: ''
    });
  };

  const handleShare = async (job: Job) => {
    try {
      const shareData = {
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.text}`);
        addNotification({
          type: 'success',
          title: 'Job link copied to clipboard',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
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

  const loadUserData = () => {
    // Implementation of loadUserData
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover thousands of job opportunities with all the information you need
          </p>
          
          {/* Update Status */}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {lastUpdate ? formatDate(lastUpdate.toISOString()) : 'Never'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>
                Next update: {getTimeUntilUpdate()}
              </span>
            </div>
            <Button
              onClick={forceRefresh}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
            </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filters
            </h2>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Any location"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
              </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
              <select
                      value={filters.experience}
                      onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Levels</option>
                <option value="Fresher">Fresher</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5+ years">5+ years</option>
              </select>
                  </div>

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
                </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredJobs.length} Jobs Found
            </h3>
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading jobs...</span>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  {/* Job Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={job.companyLogo}
                      alt={job.company}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=4285F4&color=fff&size=50&font-size=0.4&bold=true`;
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {job.title}
                        </h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleBookmark(job.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            job.isBookmarked
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        >
                          <Bookmark className="h-5 w-5" fill={job.isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => handleShare(job)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Job Meta */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(job.postedDate)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.urgent && (
                        <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                          Urgent
                        </span>
                      )}
                        {job.remote && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                        </div>

                  {/* Job Description */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => handleApply(job.id)}
                        disabled={job.isApplied}
                        variant={job.isApplied ? "outline" : "primary"}
                        size="sm"
                        className="flex-1 mr-2"
                      >
                        {job.isApplied ? 'Applied' : 'Apply Now'}
                      </Button>
                      <Button
                        onClick={() => handleViewJob(job)}
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

        {/* No Results */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              onClick={() => setFilters({
                location: '',
                type: '',
                experience: '',
                remote: false,
                urgent: false,
                search: ''
              })}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
                  </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeJobModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.company}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedJob.company)}&background=4285F4&color=fff&size=64&font-size=0.5&bold=true`;
                      }}
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedJob.title}
                      </h2>
                      <p className="text-lg text-gray-600 mb-1">{selectedJob.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedJob.location}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {selectedJob.type}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Posted {formatDate(selectedJob.postedDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeJobModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Job Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill) => (
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

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Job Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Salary</span>
                          <span className="font-medium text-gray-900">{selectedJob.salary}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Experience</span>
                          <span className="font-medium text-gray-900">{selectedJob.experience}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Education</span>
                          <span className="font-medium text-gray-900">{selectedJob.education}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Posted</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedJob.postedDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Deadline</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedJob.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                      <ul className="space-y-2">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <Award className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border"
                          >
                            {tag}
                          </span>
                        ))}
                        {selectedJob.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                        {selectedJob.remote && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleApply(selectedJob.id)}
                        disabled={selectedJob.isApplied}
                        variant={selectedJob.isApplied ? "outline" : "primary"}
                        className="w-full"
                      >
                        {selectedJob.isApplied ? 'Applied' : 'Apply Now'}
                      </Button>
                      <Button
                        onClick={() => handleBookmark(selectedJob.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <Bookmark className="h-4 w-4 mr-2" fill={selectedJob.isBookmarked ? 'currentColor' : 'none'} />
                        {selectedJob.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                      </Button>
                      <Button
                        onClick={() => handleShare(selectedJob)}
                        variant="outline"
                        className="w-full"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Job
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Jobs;