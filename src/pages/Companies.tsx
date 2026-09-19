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
import { BookmarkService } from '../services/bookmarkService';

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
  }, [user?.id]);

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

  const loadBookmarks = async () => {
    try {
      const savedSet = await BookmarkService.fetchSavedItemIds(user?.id);
      setBookmarkedCompanies(savedSet);
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

  const handleBookmark = async (companyId: string) => {
    const targetCompany = companies.find(c => c.id === companyId);
    const isSavedNow = await BookmarkService.toggleSavedItem(
      user?.id,
      companyId,
      'company',
      targetCompany || { id: companyId, name: companyId }
    );
    setBookmarkedCompanies(prev => {
      const next = new Set(prev);
      if (isSavedNow) next.add(companyId);
      else next.delete(companyId);
      return next;
    });
    addNotification(
      isSavedNow ? 'Company added to bookmarks' : 'Company removed from bookmarks',
      isSavedNow ? 'success' : 'info'
    );
  };

  const handleViewJobs = (company: Company) => {
    if (user?.role === 'recruiter') {
      alert('Access Restricted: Recruiter accounts cannot apply to jobs or internships. Please switch to or register a student account to apply.');
      return;
    }
    // Navigate to internships page with company filter
    window.location.href = `/internships?search=${encodeURIComponent(company.name)}`;
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
    <div className="min-h-screen bg-iq-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-iq-surface rounded-card p-8 sm:p-10 border border-iq-sage/40 shadow-nav text-center mb-12 relative overflow-hidden iq-watercolor">
          <h1 className="text-3xl md:text-5xl font-bold text-iq-navy mb-4">
            Discover Amazing Companies
          </h1>
          <p className="text-lg md:text-xl text-iq-muted max-w-2xl mx-auto mb-8">
            Find companies that match your values and career goals
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-iq-mint/60 border border-iq-sage/40 rounded-panel p-4 shadow-sm"
            >
              <div className="text-2xl font-bold text-iq-teal">{companies.length}</div>
              <div className="text-xs font-semibold text-iq-muted">Total Companies</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-iq-lavender/60 border border-iq-sage/40 rounded-panel p-4 shadow-sm"
            >
              <div className="text-2xl font-bold text-iq-teal">{getIndustries().length}</div>
              <div className="text-xs font-semibold text-iq-muted">Industries</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-iq-blue/60 border border-iq-sage/40 rounded-panel p-4 shadow-sm"
            >
              <div className="text-2xl font-bold text-iq-teal">{sortedCompanies.reduce((sum, c) => sum + c.employees, 0)}</div>
              <div className="text-xs font-semibold text-iq-muted">Open Positions</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-iq-butter/60 border border-iq-sage/40 rounded-panel p-4 shadow-sm"
            >
              <div className="text-2xl font-bold text-iq-teal">{getTrendingCompanies().length}</div>
              <div className="text-xs font-semibold text-iq-muted">Trending</div>
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
                <TrendingUp className="h-6 w-6 text-iq-green" />
                <h2 className="text-2xl font-bold text-iq-navy">Trending Companies</h2>
                <span className="bg-iq-butter text-iq-navy border border-iq-butter/50 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  Hot
                </span>
              </div>
              <button
                onClick={() => setShowTrending(false)}
                className="text-iq-faint hover:text-iq-navy p-1 transition-colors"
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
                  className="bg-iq-surface border border-iq-sage/30 rounded-card p-4 hover:shadow-nav hover:border-iq-teal/30 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewCompany(company)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-panel object-cover border border-iq-sage/20 bg-iq-bg p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0e8a85&color=fff&size=48&font-size=0.4&bold=true`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-iq-navy truncate">{company.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-iq-muted">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-iq-navy">{company.ratings.overall}</span>
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
              <Clock className="h-5 w-5 text-iq-teal" />
              <h3 className="text-lg font-bold text-iq-navy">Recently Viewed</h3>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {getRecentlyViewedCompanies().map((company) => (
                <div
                  key={company.id}
                  className="flex-shrink-0 bg-iq-surface border border-iq-sage/30 rounded-panel p-3 cursor-pointer hover:border-iq-teal/40 transition-all"
                  onClick={() => handleViewCompany(company)}
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-10 h-10 rounded-panel object-cover mb-2 border border-iq-sage/20 bg-iq-bg p-0.5"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0e8a85&color=fff&size=40&font-size=0.4&bold=true`;
                    }}
                  />
                  <div className="text-xs font-semibold text-iq-navy truncate w-20">{company.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-iq-surface rounded-card shadow-nav border border-iq-sage/30 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-iq-faint" />
              <input
                type="text"
                placeholder="Search companies, industries, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy placeholder:text-iq-faint transition-all"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy transition-all"
              >
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="employees">Sort by Open Positions</option>
                <option value="founded">Sort by Founded Year</option>
              </select>

              <div className="flex border border-iq-sage/60 rounded-panel overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-iq-teal text-white' 
                      : 'bg-iq-bg text-iq-navy hover:bg-iq-tealsoft/30'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-iq-teal text-white' 
                      : 'bg-iq-bg text-iq-navy hover:bg-iq-tealsoft/30'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-iq-bg border border-iq-sage/60 rounded-btn font-semibold text-sm text-iq-navy hover:bg-iq-tealsoft/30 transition-all flex items-center space-x-2"
              >
                <Building className="h-5 w-5 text-iq-teal" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-iq-sage/30 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-4 py-2 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy transition-all"
              >
                <option value="">All Industries</option>
                {getIndustries().map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>

              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="px-4 py-2 bg-iq-bg border border-iq-sage/60 rounded-panel focus:ring-2 focus:ring-iq-teal focus:border-iq-teal focus:bg-white text-sm text-iq-navy transition-all"
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
          <p className="text-iq-muted text-sm font-medium">
            Found <span className="font-bold text-iq-teal">{filteredCompanies.length}</span> companies
          </p>
          {(searchTerm || industryFilter || sizeFilter) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 bg-iq-bg border border-iq-sage/60 text-iq-navy hover:bg-iq-tealsoft/30 text-xs font-semibold rounded-btn transition-colors"
            >
              Clear Filters
            </button>
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
              className={`bg-iq-surface rounded-card border border-iq-sage/30 shadow-nav hover:shadow-cta hover:border-iq-teal/30 transition-all duration-300 overflow-hidden group cursor-pointer ${
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
                      className="w-16 h-16 rounded-panel object-cover border border-iq-sage/20 bg-iq-bg p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0e8a85&color=fff&size=64&font-size=0.4&bold=true`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-iq-navy group-hover:text-iq-teal transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-iq-muted mb-1 font-medium">
                        <Building className="h-4 w-4 text-iq-teal" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-iq-muted">
                        <MapPin className="h-4 w-4 text-iq-teal" />
                        <span>{company.headquarters}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 bg-iq-bg p-3 rounded-panel border border-iq-sage/20">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 font-semibold text-iq-navy">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span>{company.ratings.overall}</span>
                        <span className="text-iq-muted font-normal">({company.ratings.totalReviews})</span>
                      </div>
                      <span className="text-iq-muted">Founded {company.founded}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-iq-muted">{company.size}</span>
                      <span className="text-iq-green font-bold">{company.employees} open positions</span>
                    </div>
                  </div>

                  <p className="text-iq-muted text-xs line-clamp-2 mb-4 leading-relaxed">
                    {company.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {company.benefits.slice(0, 3).map((benefit, idx) => {
                      const bgColors = ['bg-iq-mint text-iq-navy', 'bg-iq-blue text-iq-navy', 'bg-iq-lavender text-iq-navy', 'bg-iq-butter text-iq-navy'];
                      return (
                        <span
                          key={benefit}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-tag ${bgColors[idx % bgColors.length]}`}
                        >
                          {benefit}
                        </span>
                      );
                    })}
                    {company.benefits.length > 3 && (
                      <span className="px-2 py-1 bg-iq-bg border border-iq-sage/40 text-iq-faint text-[10px] font-medium rounded-tag">
                        +{company.benefits.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-iq-sage/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(company.id);
                      }}
                      className={`px-3 py-2 rounded-btn font-semibold text-xs transition-all flex items-center ${
                        bookmarkedCompanies.has(company.id)
                          ? 'bg-iq-butter border border-iq-butter/60 text-iq-navy shadow-sm'
                          : 'bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30'
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-1.5" fill={bookmarkedCompanies.has(company.id) ? 'currentColor' : 'none'} />
                      {bookmarkedCompanies.has(company.id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobs(company);
                      }}
                      className="px-4 py-2 bg-iq-teal text-white hover:bg-iq-tealdark shadow-cta rounded-btn font-bold text-xs flex items-center transition-all"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      View Jobs
                    </button>
                  </div>
                </div>
              ) : (
                // List view
                <>
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-16 h-16 rounded-panel object-cover border border-iq-sage/20 bg-iq-bg p-1 mr-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0e8a85&color=fff&size=64&font-size=0.4&bold=true`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-iq-navy group-hover:text-iq-teal transition-colors">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1 font-semibold text-iq-navy">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span>{company.ratings.overall}</span>
                          <span className="text-iq-muted font-normal">({company.ratings.totalReviews})</span>
                        </div>
                        <span className="text-iq-green font-bold">{company.employees} positions</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-iq-muted mb-2 font-medium">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4 text-iq-teal" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-iq-teal" />
                        <span>{company.headquarters}</span>
                      </div>
                      <span>{company.size}</span>
                      <span>Founded {company.founded}</span>
                    </div>
                    <p className="text-iq-muted text-xs line-clamp-1 mb-3">
                      {company.description}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-wrap gap-1">
                        {company.benefits.slice(0, 2).map((benefit, idx) => {
                          const bgColors = ['bg-iq-mint text-iq-navy', 'bg-iq-blue text-iq-navy'];
                          return (
                            <span
                              key={benefit}
                              className={`px-2 py-0.5 text-[11px] font-medium rounded-tag ${bgColors[idx % bgColors.length]}`}
                            >
                              {benefit}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(company.id);
                      }}
                      className={`px-3 py-2 rounded-btn font-semibold text-xs transition-all flex items-center ${
                        bookmarkedCompanies.has(company.id)
                          ? 'bg-iq-butter border border-iq-butter/60 text-iq-navy shadow-sm'
                          : 'bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30'
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-1.5" fill={bookmarkedCompanies.has(company.id) ? 'currentColor' : 'none'} />
                      {bookmarkedCompanies.has(company.id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobs(company);
                      }}
                      className="px-4 py-2 bg-iq-teal text-white hover:bg-iq-tealdark shadow-cta rounded-btn font-bold text-xs flex items-center transition-all"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      View Jobs
                    </button>
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
            className="text-center py-16 bg-iq-surface rounded-card border border-iq-sage/30 shadow-nav mt-6"
          >
            <div className="w-20 h-20 bg-iq-bg border border-iq-sage/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="h-10 w-10 text-iq-faint" />
            </div>
            <h3 className="text-xl font-bold text-iq-navy mb-2">No companies found</h3>
            <p className="text-iq-muted text-sm mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-iq-teal text-white font-bold text-sm rounded-btn hover:bg-iq-tealdark shadow-cta transition-all"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Company Details Modal */}
      {showCompanyModal && selectedCompany && (
        <div className="fixed inset-0 bg-iq-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-iq-surface rounded-card shadow-cta max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-iq-sage/30"
          >
            <div className="p-6 border-b border-iq-sage/30 bg-iq-surface">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedCompany.logo}
                    alt={selectedCompany.name}
                    className="w-20 h-20 rounded-panel object-cover bg-iq-bg border border-iq-sage/20 p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCompany.name)}&background=0e8a85&color=fff&size=80&font-size=0.4&bold=true`;
                    }}
                  />
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-iq-navy mb-1">
                      {selectedCompany.name}
                    </h2>
                    <p className="text-lg font-semibold text-iq-muted mb-2">{selectedCompany.industry}</p>
                    <div className="flex items-center space-x-6 text-xs text-iq-muted font-medium">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-iq-teal" />
                        {selectedCompany.headquarters}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-iq-teal" />
                        {selectedCompany.size}
                      </span>
                      <span className="flex items-center">
                        <Award className="h-4 w-4 mr-1 text-iq-teal" />
                        Founded {selectedCompany.founded}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeCompanyModal}
                  className="p-2 text-iq-faint hover:text-iq-navy hover:bg-iq-bg rounded-panel transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-iq-navy mb-2">Company Overview</h3>
                    <p className="text-iq-muted text-sm leading-relaxed">
                      {selectedCompany.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-iq-navy mb-2">Company Rating</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-bold text-iq-navy ml-2">{selectedCompany.ratings.overall}</span>
                      </div>
                      <div className="text-iq-muted text-xs">
                        <div className="font-bold text-iq-navy">{selectedCompany.ratings.totalReviews} reviews</div>
                        <div>Based on employee feedback</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-iq-navy mb-2">Career Opportunities</h3>
                    <div className="bg-iq-tealsoft/50 border border-iq-sage/40 rounded-panel p-4">
                      <div className="text-2xl font-bold text-iq-teal mb-1">
                        {selectedCompany.employees}
                      </div>
                      <div className="text-iq-navy font-semibold text-sm">Open Positions</div>
                      <div className="text-xs text-iq-muted mt-1">
                        Great time to join this growing company!
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-iq-navy mb-2">Employee Benefits</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedCompany.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center space-x-2.5 p-3 bg-iq-mint/50 border border-iq-mint rounded-panel"
                      >
                        <div className="w-2 h-2 bg-iq-green rounded-full flex-shrink-0"></div>
                        <span className="text-iq-navy text-xs font-semibold">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-bold text-iq-navy mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleBookmark(selectedCompany.id)}
                    className={`px-4 py-2 rounded-btn font-semibold text-xs transition-all flex items-center ${
                      bookmarkedCompanies.has(selectedCompany.id)
                        ? 'bg-iq-butter border border-iq-butter/60 text-iq-navy shadow-sm'
                        : 'bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30'
                    }`}
                  >
                    <Heart className="h-4 w-4 mr-2" fill={bookmarkedCompanies.has(selectedCompany.id) ? 'currentColor' : 'none'} />
                    {bookmarkedCompanies.has(selectedCompany.id) ? 'Saved' : 'Save Company'}
                  </button>
                  <button
                    onClick={() => handleShare(selectedCompany)}
                    className="px-4 py-2 bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30 rounded-btn font-semibold text-xs flex items-center transition-all"
                  >
                    <Share2 className="h-4 w-4 mr-2 text-iq-teal" />
                    Share
                  </button>
                  <button
                    onClick={() => handleViewJobs(selectedCompany)}
                    className="px-4 py-2 bg-iq-teal text-white hover:bg-iq-tealdark shadow-cta rounded-btn font-bold text-xs flex items-center transition-all"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Jobs
                  </button>
                  <button
                    onClick={() => window.open(selectedCompany.website, '_blank')}
                    className="px-4 py-2 bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30 rounded-btn font-semibold text-xs flex items-center transition-all"
                  >
                    <Globe className="h-4 w-4 mr-2 text-iq-teal" />
                    Visit Website
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-iq-sage/30">
                <div className="text-xs text-iq-faint">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={closeCompanyModal}
                    className="px-4 py-2 bg-iq-bg border border-iq-sage/50 text-iq-navy hover:bg-iq-tealsoft/30 rounded-btn font-semibold text-xs transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleViewJobs(selectedCompany)}
                    className="px-6 py-2 bg-iq-teal text-white hover:bg-iq-tealdark shadow-cta rounded-btn font-bold text-xs flex items-center transition-all"
                  >
                    Apply Now
                  </button>
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