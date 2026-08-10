import { Company, CompanyScrapingResult, CompanyFilters } from '../types/company';
import { generateExpandedCompanies } from './expandedCompanyData';

// Company data generation for demonstration and fallback
const generateCompanies = (): Company[] => {
  return generateExpandedCompanies();
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

class CompanyService {
  private static instance: CompanyService;
  private lastScrape: Date | null = null;
  private scrapeInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private cachedCompanies: Company[] = [];
  private isScraping: boolean = false;

  private constructor() {
    this.loadLastScrape();
    this.loadCachedData();
  }

  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
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

export default CompanyService; 