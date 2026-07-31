import { Job, Internship } from '../types/job';

// Enhanced job data with more realistic and diverse opportunities
const generateJobs = (): Job[] => {
  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Adobe', 'Salesforce', 'Oracle', 'IBM',
    'Intel', 'NVIDIA', 'AMD', 'Cisco', 'VMware', 'SAP', 'Siemens', 'Accenture', 'TCS', 'Infosys',
    'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Capgemini', 'Deloitte', 'EY', 'PwC', 'KPMG',
    'Flipkart', 'Myntra', 'Swiggy', 'Zomato', 'Ola', 'Uber', 'Paytm', 'PhonePe', 'Razorpay', 'CRED',
    'BYJU\'s', 'Unacademy', 'Vedantu', 'WhiteHat Jr', 'Coding Ninjas', 'GeeksforGeeks', 'LeetCode',
    'Razorpay', 'Groww', 'Upstox', 'Zerodha', 'Angel One', 'Coinbase', 'Binance', 'WazirX',
    'Freshworks', 'Zoho', 'BrowserStack', 'Postman', 'Razorpay', 'Chargebee', 'Kissflow', 'Zapier'
  ];

  const jobTitles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'Data Engineer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Infrastructure Engineer',
    'Product Manager', 'Product Owner', 'Business Analyst', 'Project Manager',
    'UI/UX Designer', 'Graphic Designer', 'Visual Designer', 'Interaction Designer',
    'QA Engineer', 'Test Engineer', 'Automation Engineer', 'Performance Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
    'Flutter Developer', 'Unity Developer', 'Game Developer', 'AR/VR Developer',
    'Cybersecurity Engineer', 'Security Engineer', 'Network Engineer', 'System Administrator',
    'Database Administrator', 'Data Analyst', 'Business Intelligence Developer', 'ETL Developer',
    'Blockchain Developer', 'Web3 Developer', 'Smart Contract Developer', 'Cryptocurrency Analyst',
    'NLP Engineer', 'Computer Vision Engineer', 'Robotics Engineer', 'IoT Developer'
  ];

  const locations = [
    'Bangalore, India', 'Mumbai, India', 'Delhi, India', 'Hyderabad, India', 'Chennai, India',
    'Pune, India', 'Noida, India', 'Gurgaon, India', 'Ahmedabad, India', 'Kolkata, India',
    'Remote', 'Work from Home', 'Hybrid', 'Gurugram, India', 'Indore, India', 'Jaipur, India',
    'Chandigarh, India', 'Bhopal, India', 'Lucknow, India', 'Kanpur, India', 'Nagpur, India',
    'Vadodara, India', 'Surat, India', 'Patna, India', 'Bhubaneswar, India', 'Coimbatore, India',
    'Vishakhapatnam, India', 'Thiruvananthapuram, India', 'Kochi, India', 'Mysore, India'
  ];

  const skills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'GraphQL', 'REST API', 'Microservices', 'Serverless', 'Event-Driven Architecture',
    'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Big Data', 'Hadoop', 'Spark',
    'Blockchain', 'Ethereum', 'Solidity', 'Web3.js', 'IPFS', 'Cryptocurrency', 'DeFi',
    'Cybersecurity', 'Penetration Testing', 'Network Security', 'Application Security',
    'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin'
  ];

  const benefits = [
    'Health insurance', 'Stock options', 'Flexible hours', 'Remote work', 'Learning budget',
    'Team events', 'Competitive salary', 'Performance bonus', 'Annual leave', 'Sick leave',
    'Maternity/Paternity leave', 'Gym membership', 'Free meals', 'Transport allowance',
    'Internet allowance', 'Home office setup', 'Professional development', 'Conference attendance',
    'Mentorship program', 'Career growth', 'Work-life balance', 'Employee assistance program',
    'Retirement benefits', 'Life insurance', 'Disability insurance', 'Pet-friendly office',
    'Game room', 'Free snacks', 'Coffee bar', 'On-site parking', 'Shuttle service'
  ];

  const jobs: Job[] = [];
  const baseDate = new Date();
  
  // Generate 50-100 jobs with realistic distribution
  const numJobs = Math.floor(Math.random() * 51) + 50; // 50-100 jobs
  
  for (let i = 0; i < numJobs; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const isRemote = location === 'Remote' || location === 'Work from Home';
    
    // Generate realistic salary based on role and experience
    const experienceLevels = ['0-2 years', '1-3 years', '2-4 years', '3-5 years', '4-6 years', '5-8 years', '8+ years'];
    const experience = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    
    let salary = '';
    if (title.includes('Senior') || title.includes('Lead') || title.includes('Manager')) {
      salary = `₹${Math.floor(Math.random() * 30) + 20}-${Math.floor(Math.random() * 40) + 50} LPA`;
    } else if (title.includes('Data') || title.includes('ML') || title.includes('AI')) {
      salary = `₹${Math.floor(Math.random() * 25) + 15}-${Math.floor(Math.random() * 35) + 40} LPA`;
    } else {
      salary = `₹${Math.floor(Math.random() * 20) + 8}-${Math.floor(Math.random() * 30) + 25} LPA`;
    }

    // Generate posted date (more recent jobs are more likely)
    const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
    const postedDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Generate deadline (7-30 days from posted date)
    const deadlineDays = Math.floor(Math.random() * 23) + 7;
    const deadline = new Date(postedDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000);

    // Generate skills (3-8 skills per job)
    const numSkills = Math.floor(Math.random() * 6) + 3;
    const jobSkills: string[] = [];
    for (let j = 0; j < numSkills; j++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!jobSkills.includes(skill)) {
        jobSkills.push(skill);
      }
    }

    // Generate benefits (2-5 benefits per job)
    const numBenefits = Math.floor(Math.random() * 4) + 2;
    const jobBenefits: string[] = [];
    for (let j = 0; j < numBenefits; j++) {
      const benefit = benefits[Math.floor(Math.random() * benefits.length)];
      if (!jobBenefits.includes(benefit)) {
        jobBenefits.push(benefit);
      }
    }

    // Generate requirements
    const requirements = [
      `${experience} experience`,
      `Strong knowledge of ${jobSkills.slice(0, 2).join(', ')}`,
      'Excellent problem-solving skills',
      'Good communication skills',
      'Team player with collaborative mindset'
    ];

    // Generate tags
    const tags = [title.split(' ')[0], company, isRemote ? 'Remote' : 'On-site'];
    if (title.includes('Data') || title.includes('ML') || title.includes('AI')) {
      tags.push('AI/ML');
    }
    if (title.includes('Frontend') || title.includes('React') || title.includes('Angular')) {
      tags.push('Frontend');
    }
    if (title.includes('Backend') || title.includes('Node') || title.includes('Python')) {
      tags.push('Backend');
    }

    const job: Job = {
      id: `job_${Date.now()}_${i}`,
      title,
      company,
      location,
      type: 'Full-time',
      salary,
      description: `Join ${company} as a ${title} and work on exciting projects that impact millions of users. We are looking for someone with ${experience} experience in ${jobSkills.slice(0, 3).join(', ')}. This is a great opportunity to grow your career in a dynamic and innovative environment.`,
      requirements,
      benefits: jobBenefits,
      postedDate: postedDate.toISOString(),
      deadline: deadline.toISOString(),
      isBookmarked: false,
      isApplied: false,
      tags,
      experience,
      education: 'B.Tech/BE/MCA',
      skills: jobSkills,
      companyLogo: getCompanyLogo(company),
      remote: isRemote,
      urgent: Math.random() < 0.2 // 20% chance of being urgent
    };

    jobs.push(job);
  }

  return jobs;
};

// Enhanced internship data with more realistic opportunities
const generateInternships = (): Internship[] => {
  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Adobe', 'Salesforce', 'Oracle', 'IBM',
    'Intel', 'NVIDIA', 'AMD', 'Cisco', 'VMware', 'SAP', 'Siemens', 'Accenture', 'TCS', 'Infosys',
    'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Capgemini', 'Deloitte', 'EY', 'PwC', 'KPMG',
    'Flipkart', 'Myntra', 'Swiggy', 'Zomato', 'Ola', 'Uber', 'Paytm', 'PhonePe', 'Razorpay', 'CRED',
    'BYJU\'s', 'Unacademy', 'Vedantu', 'WhiteHat Jr', 'Coding Ninjas', 'GeeksforGeeks', 'LeetCode',
    'Razorpay', 'Groww', 'Upstox', 'Zerodha', 'Angel One', 'Coinbase', 'Binance', 'WazirX',
    'Freshworks', 'Zoho', 'BrowserStack', 'Postman', 'Razorpay', 'Chargebee', 'Kissflow', 'Zapier'
  ];

  const internshipTitles = [
    'Software Engineering Intern', 'Frontend Development Intern', 'Backend Development Intern',
    'Data Science Intern', 'Machine Learning Intern', 'AI Research Intern', 'Data Analytics Intern',
    'DevOps Intern', 'Cloud Computing Intern', 'Infrastructure Intern', 'Security Intern',
    'Product Management Intern', 'Business Analyst Intern', 'Project Management Intern',
    'UI/UX Design Intern', 'Graphic Design Intern', 'Content Writing Intern', 'Marketing Intern',
    'Sales Intern', 'HR Intern', 'Finance Intern', 'Operations Intern', 'Quality Assurance Intern',
    'Mobile Development Intern', 'iOS Development Intern', 'Android Development Intern',
    'React Native Intern', 'Flutter Intern', 'Game Development Intern', 'AR/VR Intern',
    'Blockchain Intern', 'Web3 Intern', 'Cybersecurity Intern', 'Network Security Intern',
    'Database Intern', 'Business Intelligence Intern', 'ETL Intern', 'NLP Intern',
    'Computer Vision Intern', 'Robotics Intern', 'IoT Intern', 'Embedded Systems Intern'
  ];

  const locations = [
    'Bangalore, India', 'Mumbai, India', 'Delhi, India', 'Hyderabad, India', 'Chennai, India',
    'Pune, India', 'Noida, India', 'Gurgaon, India', 'Ahmedabad, India', 'Kolkata, India',
    'Remote', 'Work from Home', 'Hybrid', 'Gurugram, India', 'Indore, India', 'Jaipur, India',
    'Chandigarh, India', 'Bhopal, India', 'Lucknow, India', 'Kanpur, India', 'Nagpur, India',
    'Vadodara, India', 'Surat, India', 'Patna, India', 'Bhubaneswar, India', 'Coimbatore, India',
    'Vishakhapatnam, India', 'Thiruvananthapuram, India', 'Kochi, India', 'Mysore, India'
  ];

  const skills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
    'GraphQL', 'REST API', 'Microservices', 'Serverless', 'Event-Driven Architecture',
    'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Big Data', 'Hadoop', 'Spark',
    'Blockchain', 'Ethereum', 'Solidity', 'Web3.js', 'IPFS', 'Cryptocurrency', 'DeFi',
    'Cybersecurity', 'Penetration Testing', 'Network Security', 'Application Security',
    'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin'
  ];

  const benefits = [
    'Certificate', 'Mentorship', 'Potential full-time offer', 'Stipend', 'Learning experience',
    'Industry exposure', 'Project portfolio', 'Networking opportunities', 'Free meals',
    'Transport allowance', 'Internet allowance', 'Home office setup', 'Flexible hours',
    'Remote work options', 'Team events', 'Professional development', 'Conference attendance'
  ];

  const internships: Internship[] = [];
  const baseDate = new Date();
  
  // Generate 30-60 internships with realistic distribution
  const numInternships = Math.floor(Math.random() * 31) + 30; // 30-60 internships
  
  for (let i = 0; i < numInternships; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = internshipTitles[Math.floor(Math.random() * internshipTitles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const isRemote = location === 'Remote' || location === 'Work from Home';
    
    // Generate realistic stipend based on role and company
    let stipend = '';
    if (company === 'Google' || company === 'Microsoft' || company === 'Amazon' || company === 'Apple') {
      stipend = `₹${Math.floor(Math.random() * 30) + 50},000/month`; // 50k-80k for top companies
    } else if (company === 'Meta' || company === 'Netflix' || company === 'Adobe') {
      stipend = `₹${Math.floor(Math.random() * 25) + 40},000/month`; // 40k-65k for tech giants
    } else {
      stipend = `₹${Math.floor(Math.random() * 20) + 15},000/month`; // 15k-35k for others
    }

    // Generate duration
    const durations = ['3 months', '6 months', '3-6 months', '6-12 months'];
    const duration = durations[Math.floor(Math.random() * durations.length)];

    // Generate posted date (more recent internships are more likely)
    const daysAgo = Math.floor(Math.random() * 15); // 0-15 days ago
    const postedDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Generate deadline (5-20 days from posted date)
    const deadlineDays = Math.floor(Math.random() * 15) + 5;
    const deadline = new Date(postedDate.getTime() + deadlineDays * 24 * 60 * 60 * 1000);

    // Generate skills (2-6 skills per internship)
    const numSkills = Math.floor(Math.random() * 5) + 2;
    const internshipSkills: string[] = [];
    for (let j = 0; j < numSkills; j++) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!internshipSkills.includes(skill)) {
        internshipSkills.push(skill);
      }
    }

    // Generate benefits (2-4 benefits per internship)
    const numBenefits = Math.floor(Math.random() * 3) + 2;
    const internshipBenefits: string[] = [];
    for (let j = 0; j < numBenefits; j++) {
      const benefit = benefits[Math.floor(Math.random() * benefits.length)];
      if (!internshipBenefits.includes(benefit)) {
        internshipBenefits.push(benefit);
      }
    }

    // Generate requirements
    const requirements = [
      'Currently enrolled student',
      `Basic knowledge of ${internshipSkills.slice(0, 2).join(', ')}`,
      'Strong academic record',
      'Good communication skills',
      'Eager to learn and grow'
    ];

    // Generate tags
    const tags = [title.split(' ')[0], company, 'Internship'];
    if (title.includes('Data') || title.includes('ML') || title.includes('AI')) {
      tags.push('AI/ML');
    }
    if (title.includes('Frontend') || title.includes('React') || title.includes('Angular')) {
      tags.push('Frontend');
    }
    if (title.includes('Backend') || title.includes('Node') || title.includes('Python')) {
      tags.push('Backend');
    }

    const internship: Internship = {
      id: `internship_${Date.now()}_${i}`,
      title,
      company,
      location,
      type: 'Internship',
      salary: stipend,
      description: `Join ${company} as a ${title} and gain hands-on experience in ${internshipSkills.slice(0, 3).join(', ')}. This ${duration} internship will provide you with real-world project experience and mentorship from industry experts.`,
      requirements,
      benefits: internshipBenefits,
      postedDate: postedDate.toISOString(),
      deadline: deadline.toISOString(),
      isBookmarked: false,
      isApplied: false,
      tags,
      duration,
      education: 'B.Tech/BE/MCA (3rd/4th year)',
      skills: internshipSkills,
      companyLogo: getCompanyLogo(company),
      remote: isRemote,
      urgent: Math.random() < 0.3, // 30% chance of being urgent
      stipend
    };

    internships.push(internship);
  }

  return internships;
};

class ScraperService {
  private static instance: ScraperService;
  private lastScrape: Date | null = null;
  private scrapeInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private cachedJobs: Job[] = [];
  private cachedInternships: Internship[] = [];

  private constructor() {
    this.loadLastScrape();
    this.loadCachedData();
  }

  public static getInstance(): ScraperService {
    if (!ScraperService.instance) {
      ScraperService.instance = new ScraperService();
    }
    return ScraperService.instance;
  }

  private loadLastScrape(): void {
    try {
      const saved = localStorage.getItem('fresherJobs_lastScrape');
      if (saved) {
        this.lastScrape = new Date(saved);
      }
    } catch (error) {
      console.error('Error loading last scrape time:', error);
    }
  }

  private saveLastScrape(): void {
    this.lastScrape = new Date();
    localStorage.setItem('fresherJobs_lastScrape', this.lastScrape.toISOString());
  }

  private loadCachedData(): void {
    try {
      const savedJobs = localStorage.getItem('fresherJobs_cachedJobs');
      const savedInternships = localStorage.getItem('fresherJobs_cachedInternships');
      
      if (savedJobs) {
        this.cachedJobs = JSON.parse(savedJobs);
      }
      if (savedInternships) {
        this.cachedInternships = JSON.parse(savedInternships);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  private saveCachedData(): void {
    try {
      localStorage.setItem('fresherJobs_cachedJobs', JSON.stringify(this.cachedJobs));
      localStorage.setItem('fresherJobs_cachedInternships', JSON.stringify(this.cachedInternships));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }

  public async scrapeJobs(): Promise<Job[]> {
    console.log('Starting job scraping...');
    
    try {
      // Simulate web scraping delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate new jobs
      const newJobs = generateJobs();
      
      // If we have cached jobs, merge them with new ones (simulating growing job market)
      if (this.cachedJobs.length > 0) {
        // Keep 70% of old jobs and add new ones
        const keepCount = Math.floor(this.cachedJobs.length * 0.7);
        const keptJobs = this.cachedJobs.slice(0, keepCount);
        this.cachedJobs = [...keptJobs, ...newJobs];
      } else {
        this.cachedJobs = newJobs;
      }
      
      this.saveLastScrape();
      this.saveCachedData();
      
      console.log(`Scraped ${newJobs.length} new jobs, total: ${this.cachedJobs.length}`);
      return this.cachedJobs;
    } catch (error) {
      console.error('Job scraping failed:', error);
      return this.cachedJobs.length > 0 ? this.cachedJobs : generateJobs();
    }
  }

  public async scrapeInternships(): Promise<Internship[]> {
    console.log('Starting internship scraping...');
    
    try {
      // Simulate web scraping delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate new internships
      const newInternships = generateInternships();
      
      // If we have cached internships, merge them with new ones
      if (this.cachedInternships.length > 0) {
        // Keep 60% of old internships and add new ones
        const keepCount = Math.floor(this.cachedInternships.length * 0.6);
        const keptInternships = this.cachedInternships.slice(0, keepCount);
        this.cachedInternships = [...keptInternships, ...newInternships];
      } else {
        this.cachedInternships = newInternships;
      }
      
      this.saveLastScrape();
      this.saveCachedData();
      
      console.log(`Scraped ${newInternships.length} new internships, total: ${this.cachedInternships.length}`);
      return this.cachedInternships;
    } catch (error) {
      console.error('Internship scraping failed:', error);
      return this.cachedInternships.length > 0 ? this.cachedInternships : generateInternships();
    }
  }

  public shouldScrape(): boolean {
    if (!this.lastScrape) return true;
    const now = new Date();
    const timeDiff = now.getTime() - this.lastScrape.getTime();
    return timeDiff >= this.scrapeInterval;
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
    localStorage.removeItem('fresherJobs_lastScrape');
  }

  public setScrapeInterval(hours: number): void {
    this.scrapeInterval = hours * 60 * 60 * 1000;
    console.log(`Scrape interval set to ${hours} hours`);
  }

  public getJobCount(): number {
    return this.cachedJobs.length;
  }

  public getInternshipCount(): number {
    return this.cachedInternships.length;
  }

  public clearCache(): void {
    this.cachedJobs = [];
    this.cachedInternships = [];
    localStorage.removeItem('fresherJobs_cachedJobs');
    localStorage.removeItem('fresherJobs_cachedInternships');
    console.log('Cache cleared');
  }
}

// Company logo mapping with real logos or better placeholders
const companyLogos: { [key: string]: string } = {
  'Google': 'https://logo.clearbit.com/google.com',
  'Microsoft': 'https://logo.clearbit.com/microsoft.com',
  'Amazon': 'https://logo.clearbit.com/amazon.com',
  'Apple': 'https://logo.clearbit.com/apple.com',
  'Meta': 'https://logo.clearbit.com/meta.com',
  'Netflix': 'https://logo.clearbit.com/netflix.com',
  'Adobe': 'https://logo.clearbit.com/adobe.com',
  'Salesforce': 'https://logo.clearbit.com/salesforce.com',
  'Oracle': 'https://logo.clearbit.com/oracle.com',
  'IBM': 'https://logo.clearbit.com/ibm.com',
  'Intel': 'https://logo.clearbit.com/intel.com',
  'NVIDIA': 'https://logo.clearbit.com/nvidia.com',
  'AMD': 'https://logo.clearbit.com/amd.com',
  'Cisco': 'https://logo.clearbit.com/cisco.com',
  'VMware': 'https://logo.clearbit.com/vmware.com',
  'SAP': 'https://logo.clearbit.com/sap.com',
  'Siemens': 'https://logo.clearbit.com/siemens.com',
  'Accenture': 'https://logo.clearbit.com/accenture.com',
  'TCS': 'https://logo.clearbit.com/tcs.com',
  'Infosys': 'https://logo.clearbit.com/infosys.com',
  'Wipro': 'https://logo.clearbit.com/wipro.com',
  'HCL': 'https://logo.clearbit.com/hcl.com',
  'Tech Mahindra': 'https://logo.clearbit.com/techmahindra.com',
  'Cognizant': 'https://logo.clearbit.com/cognizant.com',
  'Capgemini': 'https://logo.clearbit.com/capgemini.com',
  'Deloitte': 'https://logo.clearbit.com/deloitte.com',
  'EY': 'https://logo.clearbit.com/ey.com',
  'PwC': 'https://logo.clearbit.com/pwc.com',
  'KPMG': 'https://logo.clearbit.com/kpmg.com',
  'Flipkart': 'https://logo.clearbit.com/flipkart.com',
  'Myntra': 'https://logo.clearbit.com/myntra.com',
  'Swiggy': 'https://logo.clearbit.com/swiggy.com',
  'Zomato': 'https://logo.clearbit.com/zomato.com',
  'Ola': 'https://logo.clearbit.com/olacabs.com',
  'Uber': 'https://logo.clearbit.com/uber.com',
  'Paytm': 'https://logo.clearbit.com/paytm.com',
  'PhonePe': 'https://logo.clearbit.com/phonepe.com',
  'Razorpay': 'https://logo.clearbit.com/razorpay.com',
  'CRED': 'https://logo.clearbit.com/cred.club',
  'BYJU\'s': 'https://logo.clearbit.com/byjus.com',
  'Unacademy': 'https://logo.clearbit.com/unacademy.com',
  'Vedantu': 'https://logo.clearbit.com/vedantu.com',
  'WhiteHat Jr': 'https://logo.clearbit.com/whitehatjr.com',
  'Coding Ninjas': 'https://logo.clearbit.com/codingninjas.com',
  'GeeksforGeeks': 'https://logo.clearbit.com/geeksforgeeks.org',
  'LeetCode': 'https://logo.clearbit.com/leetcode.com',
  'Groww': 'https://logo.clearbit.com/groww.in',
  'Upstox': 'https://logo.clearbit.com/upstox.com',
  'Zerodha': 'https://logo.clearbit.com/zerodha.com',
  'Angel One': 'https://logo.clearbit.com/angelone.in',
  'Coinbase': 'https://logo.clearbit.com/coinbase.com',
  'Binance': 'https://logo.clearbit.com/binance.com',
  'WazirX': 'https://logo.clearbit.com/wazirx.com',
  'Freshworks': 'https://logo.clearbit.com/freshworks.com',
  'Zoho': 'https://logo.clearbit.com/zoho.com',
  'BrowserStack': 'https://logo.clearbit.com/browserstack.com',
  'Postman': 'https://logo.clearbit.com/postman.com',
  'Chargebee': 'https://logo.clearbit.com/chargebee.com',
  'Kissflow': 'https://logo.clearbit.com/kissflow.com',
  'Zapier': 'https://logo.clearbit.com/zapier.com'
};

// Function to get company logo with fallback
const getCompanyLogo = (company: string): string => {
  if (companyLogos[company]) {
    return companyLogos[company];
  }
  // Fallback to a better placeholder with company initial
  const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=${color.replace('#', '')}&color=fff&size=50&font-size=0.4&bold=true`;
};

export default ScraperService; 