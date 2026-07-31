import { Company, CompanyScrapingResult, CompanyFilters } from '../types/company';

// Company data generation for demonstration and fallback
const generateCompanies = (): Company[] => {
  const companies: Company[] = [
    {
      id: 'google_1',
      name: 'Google',
      description: 'Google is a multinational technology company specializing in Internet-related services and products, including online advertising technologies, search engine, cloud computing, software, and hardware.',
      industry: 'Technology',
      size: '100,000+ employees',
      founded: '1998',
      headquarters: 'Mountain View, California, United States',
      website: 'https://www.google.com',
      logo: 'https://logo.clearbit.com/google.com',
      employees: 156500,
      revenue: '$307.4B',
      type: 'Public',
      specialties: ['Search Engine', 'Cloud Computing', 'AI/ML', 'Mobile OS', 'Advertising'],
      benefits: ['Health insurance', 'Stock options', 'Free meals', 'Gym membership', 'Learning budget'],
      culture: ['Innovation-focused', 'Data-driven', 'Collaborative', 'Fast-paced'],
      technologies: ['Python', 'Java', 'Go', 'Kubernetes', 'TensorFlow', 'Android'],
      locations: [
        {
          city: 'Mountain View',
          state: 'California',
          country: 'United States',
          type: 'Headquarters'
        },
        {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          type: 'Office'
        }
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/google',
        twitter: 'https://twitter.com/google',
        youtube: 'https://youtube.com/google'
      },
      ratings: {
        overall: 4.3,
        culture: 4.2,
        workLifeBalance: 4.1,
        careerGrowth: 4.4,
        compensation: 4.5,
        management: 4.0,
        totalReviews: 15420
      },
      contactInfo: {
        email: 'careers@google.com',
        phone: '+1-650-253-0000'
      },
      scrapedAt: new Date().toISOString(),
      source: 'Generated'
    },
    {
      id: 'microsoft_1',
      name: 'Microsoft',
      description: 'Microsoft Corporation is an American multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.',
      industry: 'Technology',
      size: '100,000+ employees',
      founded: '1975',
      headquarters: 'Redmond, Washington, United States',
      website: 'https://www.microsoft.com',
      logo: 'https://logo.clearbit.com/microsoft.com',
      employees: 221000,
      revenue: '$198.3B',
      type: 'Public',
      specialties: ['Operating Systems', 'Cloud Computing', 'Productivity Software', 'Gaming', 'AI'],
      benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Learning budget'],
      culture: ['Innovation', 'Collaboration', 'Diversity', 'Growth mindset'],
      technologies: ['C#', '.NET', 'Azure', 'TypeScript', 'React', 'Power BI'],
      locations: [
        {
          city: 'Redmond',
          state: 'Washington',
          country: 'United States',
          type: 'Headquarters'
        },
        {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          type: 'Office'
        }
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/microsoft',
        twitter: 'https://twitter.com/microsoft',
        youtube: 'https://youtube.com/microsoft'
      },
      ratings: {
        overall: 4.2,
        culture: 4.1,
        workLifeBalance: 4.0,
        careerGrowth: 4.3,
        compensation: 4.2,
        management: 4.1,
        totalReviews: 12350
      },
      contactInfo: {
        email: 'careers@microsoft.com',
        phone: '+1-425-882-8080'
      },
      scrapedAt: new Date().toISOString(),
      source: 'Generated'
    },
    {
      id: 'amazon_1',
      name: 'Amazon',
      description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
      industry: 'E-commerce & Technology',
      size: '100,000+ employees',
      founded: '1994',
      headquarters: 'Seattle, Washington, United States',
      website: 'https://www.amazon.com',
      logo: 'https://logo.clearbit.com/amazon.com',
      employees: 1608000,
      revenue: '$514.0B',
      type: 'Public',
      specialties: ['E-commerce', 'Cloud Computing', 'AI/ML', 'Logistics', 'Digital Media'],
      benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Career development'],
      culture: ['Customer-focused', 'Innovation', 'Ownership', 'High standards'],
      technologies: ['Java', 'Python', 'AWS', 'React', 'DynamoDB', 'Lambda'],
      locations: [
        {
          city: 'Seattle',
          state: 'Washington',
          country: 'United States',
          type: 'Headquarters'
        },
        {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          type: 'Office'
        }
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/amazon',
        twitter: 'https://twitter.com/amazon',
        youtube: 'https://youtube.com/amazon'
      },
      ratings: {
        overall: 3.8,
        culture: 3.5,
        workLifeBalance: 3.2,
        careerGrowth: 4.0,
        compensation: 4.2,
        management: 3.6,
        totalReviews: 18750
      },
      contactInfo: {
        email: 'jobs@amazon.com',
        phone: '+1-206-266-1000'
      },
      scrapedAt: new Date().toISOString(),
      source: 'Generated'
    },
    {
      id: 'flipkart_1',
      name: 'Flipkart',
      description: 'Flipkart is an Indian e-commerce company, headquartered in Bangalore, Karnataka, India, and incorporated in Singapore as a private limited company.',
      industry: 'E-commerce',
      size: '10,000+ employees',
      founded: '2007',
      headquarters: 'Bangalore, Karnataka, India',
      website: 'https://www.flipkart.com',
      logo: 'https://logo.clearbit.com/flipkart.com',
      employees: 15000,
      revenue: '$23.5B',
      type: 'Private',
      specialties: ['E-commerce', 'Digital Payments', 'Logistics', 'Fashion', 'Electronics'],
      benefits: ['Health insurance', 'Stock options', 'Flexible hours', 'Learning budget', 'Team events'],
      culture: ['Innovation', 'Customer-first', 'Collaboration', 'Fast-paced'],
      technologies: ['Java', 'React', 'Node.js', 'MongoDB', 'AWS', 'Kubernetes'],
      locations: [
        {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          type: 'Headquarters'
        },
        {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          type: 'Office'
        }
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/flipkart',
        twitter: 'https://twitter.com/flipkart',
        youtube: 'https://youtube.com/flipkart'
      },
      ratings: {
        overall: 4.0,
        culture: 3.9,
        workLifeBalance: 3.8,
        careerGrowth: 4.2,
        compensation: 4.1,
        management: 3.9,
        totalReviews: 3250
      },
      contactInfo: {
        email: 'careers@flipkart.com',
        phone: '+91-80-6160-6160'
      },
      scrapedAt: new Date().toISOString(),
      source: 'Generated'
    },
    {
      id: 'freshworks_1',
      name: 'Freshworks',
      description: 'Freshworks Inc. is a software company headquartered in San Mateo, California, that develops customer experience software for businesses.',
      industry: 'Software & SaaS',
      size: '5,000+ employees',
      founded: '2010',
      headquarters: 'San Mateo, California, United States',
      website: 'https://www.freshworks.com',
      logo: 'https://logo.clearbit.com/freshworks.com',
      employees: 5500,
      revenue: '$400M',
      type: 'Public',
      specialties: ['CRM', 'Customer Support', 'IT Service Management', 'Marketing Automation'],
      benefits: ['Health insurance', 'Stock options', 'Remote work', 'Learning budget', 'Flexible hours'],
      culture: ['Customer-focused', 'Innovation', 'Collaboration', 'Growth mindset'],
      technologies: ['Ruby', 'JavaScript', 'React', 'PostgreSQL', 'Redis', 'AWS'],
      locations: [
        {
          city: 'San Mateo',
          state: 'California',
          country: 'United States',
          type: 'Headquarters'
        },
        {
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          type: 'Office'
        }
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/company/freshworks',
        twitter: 'https://twitter.com/freshworks',
        youtube: 'https://youtube.com/freshworks'
      },
      ratings: {
        overall: 4.1,
        culture: 4.2,
        workLifeBalance: 4.0,
        careerGrowth: 4.1,
        compensation: 4.0,
        management: 4.1,
        totalReviews: 1850
      },
      contactInfo: {
        email: 'careers@freshworks.com',
        phone: '+1-650-481-8000'
      },
      scrapedAt: new Date().toISOString(),
      source: 'Generated'
    }
  ];

  return companies;
};

// Simulated web scraping functions
const scrapeLinkedInCompanies = async (query: string, limit: number = 10): Promise<Company[]> => {
  // Simulate LinkedIn scraping with delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const companies = generateCompanies().slice(0, limit);
  return companies.map(company => ({
    ...company,
    source: 'LinkedIn',
    scrapedAt: new Date().toISOString()
  }));
};

const scrapeGlassdoorCompanies = async (query: string, limit: number = 10): Promise<Company[]> => {
  // Simulate Glassdoor scraping with delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const companies = generateCompanies().slice(0, limit);
  return companies.map(company => ({
    ...company,
    source: 'Glassdoor',
    scrapedAt: new Date().toISOString()
  }));
};

const scrapeCrunchbaseCompanies = async (query: string, limit: number = 10): Promise<Company[]> => {
  // Simulate Crunchbase scraping with delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const companies = generateCompanies().slice(0, limit);
  return companies.map(company => ({
    ...company,
    source: 'Crunchbase',
    scrapedAt: new Date().toISOString()
  }));
};

class CompanyScraperService {
  private static instance: CompanyScraperService;
  private lastScrape: Date | null = null;
  private scrapeInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private cachedCompanies: Company[] = [];
  private isScraping: boolean = false;

  private constructor() {
    this.loadLastScrape();
    this.loadCachedData();
  }

  public static getInstance(): CompanyScraperService {
    if (!CompanyScraperService.instance) {
      CompanyScraperService.instance = new CompanyScraperService();
    }
    return CompanyScraperService.instance;
  }

  private loadLastScrape(): void {
    try {
      const stored = localStorage.getItem('companyLastScrape');
      if (stored) {
        this.lastScrape = new Date(stored);
      }
    } catch (error) {
      console.error('Error loading last scrape time:', error);
    }
  }

  private saveLastScrape(): void {
    try {
      localStorage.setItem('companyLastScrape', new Date().toISOString());
      this.lastScrape = new Date();
    } catch (error) {
      console.error('Error saving last scrape time:', error);
    }
  }

  private loadCachedData(): void {
    try {
      const stored = localStorage.getItem('cachedCompanies');
      if (stored) {
        this.cachedCompanies = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cached companies:', error);
      this.cachedCompanies = [];
    }
  }

  private saveCachedData(): void {
    try {
      localStorage.setItem('cachedCompanies', JSON.stringify(this.cachedCompanies));
    } catch (error) {
      console.error('Error saving cached companies:', error);
    }
  }

  public async scrapeCompanies(
    query: string = '',
    filters: CompanyFilters = {} as CompanyFilters,
    limit: number = 50
  ): Promise<CompanyScrapingResult> {
    if (this.isScraping) {
      throw new Error('Scraping already in progress');
    }

    this.isScraping = true;
    const errors: string[] = [];
    const sources: string[] = [];
    let allCompanies: Company[] = [];

    try {
      // Scrape from multiple sources
      const scrapingPromises = [
        scrapeLinkedInCompanies(query, Math.ceil(limit / 3)).then(companies => {
          sources.push('LinkedIn');
          return companies;
        }).catch(error => {
          errors.push(`LinkedIn: ${error.message}`);
          return [];
        }),
        scrapeGlassdoorCompanies(query, Math.ceil(limit / 3)).then(companies => {
          sources.push('Glassdoor');
          return companies;
        }).catch(error => {
          errors.push(`Glassdoor: ${error.message}`);
          return [];
        }),
        scrapeCrunchbaseCompanies(query, Math.ceil(limit / 3)).then(companies => {
          sources.push('Crunchbase');
          return companies;
        }).catch(error => {
          errors.push(`Crunchbase: ${error.message}`);
          return [];
        })
      ];

      const results = await Promise.all(scrapingPromises);
      
      // Combine and deduplicate companies
      const companyMap = new Map<string, Company>();
      results.flat().forEach(company => {
        if (!companyMap.has(company.name.toLowerCase())) {
          companyMap.set(company.name.toLowerCase(), company);
        }
      });

      allCompanies = Array.from(companyMap.values()).slice(0, limit);

      // Apply filters
      allCompanies = this.applyFilters(allCompanies, filters);

      // Update cache
      this.cachedCompanies = allCompanies;
      this.saveCachedData();
      this.saveLastScrape();

    } catch (error) {
      errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isScraping = false;
    }

    return {
      companies: allCompanies,
      totalFound: allCompanies.length,
      scrapedAt: new Date().toISOString(),
      sources,
      errors
    };
  }

  private applyFilters(companies: Company[], filters: CompanyFilters): Company[] {
    return companies.filter(company => {
      // Search filter
      if (filters.search && !company.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !company.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Industry filter
      if (filters.industry && filters.industry !== 'All' && 
          company.industry.toLowerCase() !== filters.industry.toLowerCase()) {
        return false;
      }

      // Size filter
      if (filters.size && filters.size !== 'All' && 
          company.size.toLowerCase() !== filters.size.toLowerCase()) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location !== 'All') {
        const hasLocation = company.locations.some(loc => 
          loc.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          loc.state.toLowerCase().includes(filters.location.toLowerCase()) ||
          loc.country.toLowerCase().includes(filters.location.toLowerCase())
        );
        if (!hasLocation) return false;
      }

      // Type filter
      if (filters.type && filters.type !== 'All' && 
          company.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }

      // Rating filter
      if (filters.minRating && company.ratings.overall < filters.minRating) {
        return false;
      }

      // Remote filter
      if (filters.hasRemote) {
        const hasRemote = company.locations.some(loc => loc.type === 'Remote');
        if (!hasRemote) return false;
      }

      return true;
    });
  }

  public getCachedCompanies(filters?: CompanyFilters): Company[] {
    if (!filters) {
      return this.cachedCompanies;
    }
    return this.applyFilters(this.cachedCompanies, filters);
  }

  public shouldScrape(): boolean {
    if (!this.lastScrape) return true;
    return Date.now() - this.lastScrape.getTime() > this.scrapeInterval;
  }

  public getLastScrapeTime(): Date | null {
    return this.lastScrape;
  }

  public getNextScrapeTime(): Date | null {
    if (!this.lastScrape) return null;
    return new Date(this.lastScrape.getTime() + this.scrapeInterval);
  }

  public forceScrape(): void {
    this.lastScrape = null;
  }

  public setScrapeInterval(hours: number): void {
    this.scrapeInterval = hours * 60 * 60 * 1000;
  }

  public getCompanyCount(): number {
    return this.cachedCompanies.length;
  }

  public clearCache(): void {
    this.cachedCompanies = [];
    this.saveCachedData();
  }

  public isCurrentlyScraping(): boolean {
    return this.isScraping;
  }

  public async getCompanyDetails(companyId: string): Promise<Company | null> {
    // Find company in cache first
    const cached = this.cachedCompanies.find(c => c.id === companyId);
    if (cached) return cached;

    // If not in cache, try to scrape specific company
    try {
      const result = await this.scrapeCompanies(companyId, {} as CompanyFilters, 1);
      return result.companies[0] || null;
    } catch (error) {
      console.error('Error getting company details:', error);
      return null;
    }
  }

  public getIndustries(): string[] {
    const industries = new Set(this.cachedCompanies.map(c => c.industry));
    return Array.from(industries).sort();
  }

  public getCompanySizes(): string[] {
    const sizes = new Set(this.cachedCompanies.map(c => c.size));
    return Array.from(sizes).sort();
  }

  public getCompanyTypes(): string[] {
    const types = new Set(this.cachedCompanies.map(c => c.type));
    return Array.from(types).sort();
  }
}

export default CompanyScraperService; 