// Web Scraping Utility for Job Sites
// This utility provides methods to scrape job data from popular job sites
// Note: In a production environment, you would need to handle CORS, rate limiting, and respect robots.txt

export interface ScrapedJobData {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedDate: string;
  jobUrl: string;
  source: string;
}

export interface ScrapedInternshipData {
  title: string;
  company: string;
  location: string;
  stipend?: string;
  description: string;
  requirements: string[];
  duration: string;
  postedDate: string;
  internshipUrl: string;
  source: string;
}

class WebScraper {
  private static instance: WebScraper;
  private userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  private constructor() {}

  public static getInstance(): WebScraper {
    if (!WebScraper.instance) {
      WebScraper.instance = new WebScraper();
    }
    return WebScraper.instance;
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async fetchWithRetry(url: string, retries: number = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          timeout: 10000
        });

        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error);
        if (i === retries - 1) throw error;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  }

  public async scrapeLinkedInJobs(keywords: string[] = ['software engineer', 'developer', 'data scientist']): Promise<ScrapedJobData[]> {
    const jobs: ScrapedJobData[] = [];
    
    try {
      // Note: LinkedIn has strict anti-scraping measures
      // In a real implementation, you would need to:
      // 1. Use a proxy service
      // 2. Implement proper session management
      // 3. Handle CAPTCHAs
      // 4. Respect rate limits
      
      for (const keyword of keywords) {
        const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=India`;
        
        // This is a placeholder - actual implementation would parse the HTML
        console.log(`Would scrape LinkedIn for: ${keyword}`);
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('LinkedIn scraping failed:', error);
    }
    
    return jobs;
  }

  public async scrapeIndeedJobs(keywords: string[] = ['software engineer', 'developer', 'data scientist']): Promise<ScrapedJobData[]> {
    const jobs: ScrapedJobData[] = [];
    
    try {
      for (const keyword of keywords) {
        const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=India`;
        
        // This is a placeholder - actual implementation would parse the HTML
        console.log(`Would scrape Indeed for: ${keyword}`);
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error('Indeed scraping failed:', error);
    }
    
    return jobs;
  }

  public async scrapeNaukriJobs(keywords: string[] = ['software engineer', 'developer', 'data scientist']): Promise<ScrapedJobData[]> {
    const jobs: ScrapedJobData[] = [];
    
    try {
      for (const keyword of keywords) {
        const searchUrl = `https://www.naukri.com/${encodeURIComponent(keyword)}-jobs-in-india`;
        
        // This is a placeholder - actual implementation would parse the HTML
        console.log(`Would scrape Naukri for: ${keyword}`);
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Naukri scraping failed:', error);
    }
    
    return jobs;
  }

  public async scrapeInternshalaInternships(keywords: string[] = ['software', 'data science', 'web development']): Promise<ScrapedInternshipData[]> {
    const internships: ScrapedInternshipData[] = [];
    
    try {
      for (const keyword of keywords) {
        const searchUrl = `https://internshala.com/internships/${encodeURIComponent(keyword)}-internship`;
        
        // This is a placeholder - actual implementation would parse the HTML
        console.log(`Would scrape Internshala for: ${keyword}`);
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (error) {
      console.error('Internshala scraping failed:', error);
    }
    
    return internships;
  }

  public async scrapeLetsInternInternships(keywords: string[] = ['software', 'data science', 'web development']): Promise<ScrapedInternshipData[]> {
    const internships: ScrapedInternshipData[] = [];
    
    try {
      for (const keyword of keywords) {
        const searchUrl = `https://letsintern.in/internships/${encodeURIComponent(keyword)}`;
        
        // This is a placeholder - actual implementation would parse the HTML
        console.log(`Would scrape LetsIntern for: ${keyword}`);
        
        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('LetsIntern scraping failed:', error);
    }
    
    return internships;
  }

  // Helper method to parse HTML and extract job data
  private parseJobHTML(html: string, source: string): ScrapedJobData[] {
    const jobs: ScrapedJobData[] = [];
    
    // This is a placeholder - actual implementation would use DOM parsing
    // You would use libraries like cheerio or jsdom to parse the HTML
    // and extract job information using CSS selectors or XPath
    
    return jobs;
  }

  // Helper method to parse HTML and extract internship data
  private parseInternshipHTML(html: string, source: string): ScrapedInternshipData[] {
    const internships: ScrapedInternshipData[] = [];
    
    // This is a placeholder - actual implementation would use DOM parsing
    
    return internships;
  }

  // Method to check if scraping is allowed (robots.txt)
  public async checkRobotsTxt(domain: string): Promise<boolean> {
    try {
      const robotsUrl = `https://${domain}/robots.txt`;
      const response = await this.fetchWithRetry(robotsUrl);
      const robotsText = await response.text();
      
      // Check if scraping is disallowed
      const disallowPatterns = robotsText.match(/Disallow:\s*(.+)/g);
      if (disallowPatterns) {
        console.warn(`Scraping restrictions found for ${domain}:`, disallowPatterns);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn(`Could not check robots.txt for ${domain}:`, error);
      return true; // Assume allowed if we can't check
    }
  }

  // Method to respect rate limits
  public async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default WebScraper; 