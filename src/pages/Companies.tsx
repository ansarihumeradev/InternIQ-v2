import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Users,
  Building,
  Star,
  ExternalLink,
  Heart,
  Share2,
  Globe,
  TrendingUp,
  Award,
  X,
  Clock,
  Grid,
  List,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';
import { useAuth } from '../context/AuthContext';
import CompanyService from '../services/companyService';
import { Company, CompanyFilters } from '../types/company';

const Companies: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'employees' | 'founded'>('rating');
  const [showTrending, setShowTrending] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lastScrapeTime, setLastScrapeTime] = useState<Date | null>(null);
  const [nextScrapeTime, setNextScrapeTime] = useState<Date | null>(null);
  const [scrapingSources, setScrapingSources] = useState<string[]>([]);
  const [scrapingErrors, setScrapingErrors] = useState<string[]>([]);

  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const companyService = CompanyService.getInstance();

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
    loadBookmarks();
    loadRecentlyViewed();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      // Check if we should scrape or use cached data
      if (companyService.shouldScrape()) {
        await scrapeCompanies();
      } else {
        const cachedCompanies = companyService.getCachedCompanies();
        setCompanies(cachedCompanies);
        setLastScrapeTime(companyService.getLastScrapeTime());
        setNextScrapeTime(companyService.getNextScrapeTime());
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      addNotification('Error loading companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const scrapeCompanies = async () => {
    setScraping(true);
    try {
      const filters: CompanyFilters = {
        search: searchTerm,
        industry: industryFilter,
        size: sizeFilter,
        location: '',
        type: '',
        minRating: 0,
        hasRemote: false
      };

      const result = await companyService.scrapeCompanies(searchTerm, filters, 50);
      setCompanies(result.companies);
      setLastScrapeTime(companyService.getLastScrapeTime());
      setNextScrapeTime(companyService.getNextScrapeTime());
      setScrapingSources(result.sources);
      setScrapingErrors(result.errors);

      if (result.errors.length > 0) {
        addNotification(`Scraped ${result.companies.length} companies with ${result.errors.length} errors`, 'warning');
      } else {
        addNotification(`Successfully scraped ${result.companies.length} companies from ${result.sources.join(', ')}`, 'success');
      }
    } catch (error) {
      console.error('Error scraping companies:', error);
      addNotification('Error scraping companies', 'error');
    } finally {
      setScraping(false);
    }
  };

  const loadBookmarks = () => {
    try {
      const stored = localStorage.getItem('bookmarkedCompanies');
      if (stored) {
        setBookmarkedCompanies(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem('recentlyViewedCompanies');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

  const saveBookmarks = (bookmarks: Set<string>) => {
    try {
      localStorage.setItem('bookmarkedCompanies', JSON.stringify(Array.from(bookmarks)));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const saveRecentlyViewed = (recent: string[]) => {
    try {
      localStorage.setItem('recentlyViewedCompanies', JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  };

  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = !searchTerm || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry = !industryFilter || industryFilter === 'All' || 
        company.industry === industryFilter;

      const matchesSize = !sizeFilter || sizeFilter === 'All' || 
        company.size === sizeFilter;

      return matchesSearch && matchesIndustry && matchesSize;
    });
  }, [companies, searchTerm, industryFilter, sizeFilter]);

  // Sort companies
  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.ratings.overall - a.ratings.overall;
        case 'reviews':
          return b.ratings.totalReviews - a.ratings.totalReviews;
        case 'employees':
          return b.employees - a.employees;
        case 'founded':
          return parseInt(a.founded) - parseInt(b.founded);
        default:
          return 0;
      }
    });
  }, [filteredCompanies, sortBy]);

  const handleBookmark = (companyId: string) => {
    const newBookmarks = new Set(bookmarkedCompanies);
    if (newBookmarks.has(companyId)) {
      newBookmarks.delete(companyId);
      addNotification('Company removed from bookmarks', 'info');
    } else {
      newBookmarks.add(companyId);
      addNotification('Company added to bookmarks', 'success');
    }
    setBookmarkedCompanies(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  const handleViewJobs = (company: Company) => {
    // Navigate to jobs page with company filter
    window.location.href = `/jobs?company=${encodeURIComponent(company.name)}`;
  };

  const handleShare = (company: Company) => {
    if (navigator.share) {
      navigator.share({
        title: company.name,
        text: `Check out ${company.name} - ${company.description}`,
        url: company.website
      });
    } else {
      navigator.clipboard.writeText(`${company.name} - ${company.website}`);
      addNotification('Company link copied to clipboard', 'success');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('');
    setSizeFilter('');
    addNotification('Filters cleared', 'info');
  };

  const getTrendingCompanies = () => {
    return sortedCompanies
      .filter(company => company.ratings.overall >= 4.0)
      .slice(0, 5);
  };

  const getRecentlyViewedCompanies = () => {
    return companies.filter(company => recentlyViewed.includes(company.id)).slice(0, 5);
  };

  const addToRecentlyViewed = (companyId: string) => {
    const newRecent = [companyId, ...recentlyViewed.filter(id => id !== companyId)].slice(0, 10);
    setRecentlyViewed(newRecent);
    saveRecentlyViewed(newRecent);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
    addToRecentlyViewed(company.id);
  };

  const closeCompanyModal = () => {
    setShowCompanyModal(false);
    setSelectedCompany(null);
  };

  const exportCompanies = () => {
    const csvContent = [
      ['Name', 'Industry', 'Size', 'Location', 'Rating', 'Website', 'Description'],
      ...sortedCompanies.map(company => [
        company.name,
        company.industry,
        company.size,
        company.headquarters,
        company.ratings.overall.toString(),
        company.website,
        company.description
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    addNotification('Companies exported to CSV', 'success');
  };

  const getIndustries = () => {
    const industries = new Set(companies.map(c => c.industry));
    return Array.from(industries).sort();
  };

  const getSizes = () => {
    const sizes = new Set(companies.map(c => c.size));
    return Array.from(sizes).sort();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const formatTimeUntil = (date: Date | null) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Companies
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find companies that match your values and career goals
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4"
            >
              <div className="text-2xl font-bold">{companies.length}</div>
              <div className="text-sm opacity-90">Total Companies</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4"
            >
              <div className="text-2xl font-bold">{getIndustries().length}</div>
              <div className="text-sm opacity-90">Industries</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4"
            >
              <div className="text-2xl font-bold">{sortedCompanies.reduce((sum, c) => sum + c.employees, 0)}</div>
              <div className="text-sm opacity-90">Open Positions</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4"
            >
              <div className="text-2xl font-bold">{getTrendingCompanies().length}</div>
              <div className="text-sm opacity-90">Trending</div>
            </motion.div>
          </div>
        </div>

        {/* Trending Companies Section */}
        {showTrending && getTrendingCompanies().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Companies</h2>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-medium">
                  Hot
                </span>
              </div>
              <button
                onClick={() => setShowTrending(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTrendingCompanies().map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewCompany(company)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=FF6B35&color=fff&size=48&font-size=0.4&bold=true`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{company.ratings.overall}</span>
                        <span>({company.ratings.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Recently Viewed</h3>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {getRecentlyViewedCompanies().map((company) => (
                <div
                  key={company.id}
                  className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleViewCompany(company)}
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-10 h-10 rounded-lg object-cover mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=3B82F6&color=fff&size=40&font-size=0.4&bold=true`;
                    }}
                  />
                  <div className="text-sm font-medium text-gray-900 truncate w-20">{company.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
                placeholder="Search companies, industries, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="employees">Sort by Open Positions</option>
                <option value="founded">Sort by Founded Year</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                icon={<Building className="h-5 w-5" />}
              >
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Industries</option>
                {getIndustries().map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Company Sizes</option>
                {getSizes().map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </motion.div>
          )}
        </motion.div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-primary-600">{filteredCompanies.length}</span> companies
          </p>
          {(searchTerm || industryFilter || sizeFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                viewMode === 'list' ? 'flex items-center p-6' : ''
              }`}
              onClick={() => handleViewCompany(company)}
            >
              {viewMode === 'grid' ? (
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=4285F4&color=fff&size=64&font-size=0.4&bold=true`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <Building className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{company.headquarters}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{company.ratings.overall}</span>
                        <span className="text-gray-500">({company.ratings.totalReviews})</span>
                      </div>
                      <span className="text-sm text-gray-500">Founded {company.founded}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{company.size}</span>
                      <span className="text-primary-600 font-medium">{company.employees} open positions</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {company.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.benefits.slice(0, 3).map((benefit) => (
                      <span
                        key={benefit}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                    {company.benefits.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{company.benefits.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(company.id);
                      }}
                      variant={bookmarkedCompanies.has(company.id) ? "outline" : "secondary"}
                      size="sm"
                      className="flex items-center"
                    >
                      <Heart className="h-4 w-4 mr-2" fill={bookmarkedCompanies.has(company.id) ? 'currentColor' : 'none'} />
                      {bookmarkedCompanies.has(company.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobs(company);
                      }}
                      variant="primary"
                      size="sm"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Jobs
                    </Button>
                  </div>
                </div>
              ) : (
                // List view
                <>
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 mr-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=4285F4&color=fff&size=64&font-size=0.4&bold=true`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{company.ratings.overall}</span>
                          <span className="text-gray-500">({company.ratings.totalReviews})</span>
                        </div>
                        <span className="text-primary-600 font-medium">{company.employees} positions</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{company.headquarters}</span>
                      </div>
                      <span>{company.size}</span>
                      <span>Founded {company.founded}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-1 mb-3">
                      {company.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-wrap gap-1">
                        {company.benefits.slice(0, 2).map((benefit) => (
                          <span
                            key={benefit}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(company.id);
                      }}
                      variant={bookmarkedCompanies.has(company.id) ? "outline" : "secondary"}
                      size="sm"
                      className="flex items-center"
                    >
                      <Heart className="h-4 w-4 mr-2" fill={bookmarkedCompanies.has(company.id) ? 'currentColor' : 'none'} />
                      {bookmarkedCompanies.has(company.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobs(company);
                      }}
                      variant="primary"
                      size="sm"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Jobs
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No companies found</h3>
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

      {/* Company Details Modal */}
      {showCompanyModal && selectedCompany && (
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
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=4285F4&color=fff&size=80&font-size=0.4&bold=true`;
                    }}
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">
                      {selectedCompany.name}
                    </h2>
                    <p className="text-xl text-gray-600 mb-2">{selectedCompany.industry}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedCompany.headquarters}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {selectedCompany.size}
                      </span>
                      <span className="flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Founded {selectedCompany.founded}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeCompanyModal}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Overview</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedCompany.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Rating</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Star className="h-6 w-6 text-yellow-500 fill-current" />
                        <span className="text-2xl font-bold ml-2">{selectedCompany.ratings.overall}</span>
                      </div>
                      <div className="text-gray-600">
                        <div className="font-medium">{selectedCompany.ratings.totalReviews} reviews</div>
                        <div className="text-sm">Based on employee feedback</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Opportunities</h3>
                    <div className="bg-primary-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        {selectedCompany.employees}
                      </div>
                      <div className="text-primary-700 font-medium">Open Positions</div>
                      <div className="text-sm text-primary-600 mt-2">
                        Great time to join this growing company!
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Benefits</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCompany.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleBookmark(selectedCompany.id)}
                    variant={bookmarkedCompanies.has(selectedCompany.id) ? "outline" : "secondary"}
                    size="sm"
                    className="flex items-center"
                  >
                    <Heart className="h-4 w-4 mr-2" fill={bookmarkedCompanies.has(selectedCompany.id) ? 'currentColor' : 'none'} />
                    {bookmarkedCompanies.has(selectedCompany.id) ? 'Saved' : 'Save Company'}
                  </Button>
                  <Button
                    onClick={() => handleShare(selectedCompany)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={() => handleViewJobs(selectedCompany)}
                    variant="primary"
                    size="sm"
                    className="flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Jobs
                  </Button>
                  <Button
                    onClick={() => window.open(selectedCompany.website, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={closeCompanyModal}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleViewJobs(selectedCompany)}
                    variant="primary"
                    size="sm"
                    className="flex items-center"
                  >
                    Apply Now
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

export default Companies;