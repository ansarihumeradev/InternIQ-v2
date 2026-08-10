import { Job, Internship } from '../types/job';

// API endpoints for job data
const JOB_APIS = {
  // Free job APIs
  ADZUNA: 'https://api.adzuna.com/v1/api/jobs/gb/search/1',
  GITHUB_JOBS: 'https://jobs.github.com/positions.json',
  // You can add more APIs here
};

// Fallback data when APIs are not available
const FALLBACK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Mumbai, India',
    type: 'Full-time',
    salary: '₹6-12 LPA',
    description: 'We are looking for a skilled Frontend Developer with React experience.',
    requirements: ['React', 'JavaScript', 'TypeScript', '2+ years experience'],
    benefits: ['Health insurance', 'Flexible hours', 'Remote work'],
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isApplied: false,
    tags: ['React', 'Frontend', 'JavaScript'],
    experience: '2-4 years',
    education: 'B.Tech/BE',
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
    companyLogo: 'https://via.placeholder.com/50x50/3B82F6/FFFFFF?text=TC',
    remote: true,
    urgent: false
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'DataFlow Systems',
    location: 'Bangalore, India',
    type: 'Full-time',
    salary: '₹8-15 LPA',
    description: 'Join our backend team to build scalable microservices.',
    requirements: ['Node.js', 'Python', 'MongoDB', '3+ years experience'],
    benefits: ['Stock options', 'Learning budget', 'Team events'],
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isApplied: false,
    tags: ['Backend', 'Node.js', 'Python'],
    experience: '3-5 years',
    education: 'B.Tech/BE',
    skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker'],
    companyLogo: 'https://via.placeholder.com/50x50/10B981/FFFFFF?text=DF',
    remote: true,
    urgent: true
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'Creative Studios',
    location: 'Delhi, India',
    type: 'Full-time',
    salary: '₹5-10 LPA',
    description: 'Create beautiful and intuitive user experiences.',
    requirements: ['Figma', 'Adobe XD', 'User research', '1+ years experience'],
    benefits: ['Creative freedom', 'Latest tools', 'Portfolio building'],
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isApplied: false,
    tags: ['UI/UX', 'Design', 'Figma'],
    experience: '1-3 years',
    education: 'Any degree',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping'],
    companyLogo: 'https://via.placeholder.com/50x50/A855F7/FFFFFF?text=CS',
    remote: false,
    urgent: false
  }
];

const FALLBACK_INTERNSHIPS: Internship[] = [
  {
    id: 'int1',
    title: 'Software Development Intern',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'Internship',
    salary: '₹25,000/month',
    description: 'Learn real-world development in a fast-paced startup environment.',
    requirements: ['Basic programming knowledge', 'Eager to learn', 'Currently enrolled'],
    benefits: ['Certificate', 'Mentorship', 'Potential full-time offer'],
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isApplied: false,
    tags: ['Internship', 'Remote', 'Startup'],
    duration: '3-6 months',
    education: 'B.Tech/BE (3rd/4th year)',
    skills: ['JavaScript', 'React', 'Git'],
    companyLogo: 'https://via.placeholder.com/50x50/F59E0B/FFFFFF?text=SX',
    remote: true,
    urgent: true,
    stipend: '₹25,000/month'
  },
  {
    id: 'int2',
    title: 'Data Science Intern',
    company: 'Analytics Pro',
    location: 'Hyderabad, India',
    type: 'Internship',
    salary: '₹30,000/month',
    description: 'Work on real data science projects and learn ML/AI.',
    requirements: ['Python', 'Statistics', 'Machine Learning basics'],
    benefits: ['Project portfolio', 'Industry exposure', 'Stipend'],
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    isBookmarked: false,
    isApplied: false,
    tags: ['Data Science', 'ML', 'Python'],
    duration: '6 months',
    education: 'B.Tech/BE/MCA',
    skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
    companyLogo: 'https://via.placeholder.com/50x50/EF4444/FFFFFF?text=AP',
    remote: false,
    urgent: false,
    stipend: '₹30,000/month'
  }
];

class JobService {
  private static instance: JobService;
  private lastUpdate: Date | null = null;
  private updateInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.loadLastUpdate();
  }

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  private loadLastUpdate(): void {
    const saved = localStorage.getItem('fresherJobs_lastUpdate');
    if (saved) {
      this.lastUpdate = new Date(saved);
    }
  }

  public saveLastUpdate(): void {
    this.lastUpdate = new Date();
    localStorage.setItem('fresherJobs_lastUpdate', this.lastUpdate.toISOString());
  }

  public async fetchJobs(): Promise<Job[]> {
    try {
      // Check if we need to update
      if (this.shouldUpdate()) {
        console.log('Fetching fresh job data...');
        const jobs = await this.fetchFromAPIs();
        if (jobs.length > 0) {
          this.saveJobs(jobs);
          this.saveLastUpdate();
          return jobs;
        }
      }

      // Return cached data
      const cached = this.getCachedJobs();
      if (cached.length > 0) {
        return cached;
      }

      // Return fallback data
      return FALLBACK_JOBS;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return FALLBACK_JOBS;
    }
  }

  public async fetchInternships(): Promise<Internship[]> {
    try {
      // Check if we need to update
      if (this.shouldUpdate()) {
        console.log('Fetching fresh internship data...');
        const internships = await this.fetchInternshipsFromAPIs();
        if (internships.length > 0) {
          this.saveInternships(internships);
          this.saveLastUpdate();
          return internships;
        }
      }

      // Return cached data
      const cached = this.getCachedInternships();
      if (cached.length > 0) {
        return cached;
      }

      // Return fallback data
      return FALLBACK_INTERNSHIPS;
    } catch (error) {
      console.error('Error fetching internships:', error);
      return FALLBACK_INTERNSHIPS;
    }
  }

  private shouldUpdate(): boolean {
    if (!this.lastUpdate) return true;
    const now = new Date();
    const timeDiff = now.getTime() - this.lastUpdate.getTime();
    return timeDiff >= this.updateInterval;
  }

  private async fetchFromAPIs(): Promise<Job[]> {
    const jobs: Job[] = [];

    try {
      // Try GitHub Jobs API
      const githubResponse = await fetch('https://jobs.github.com/positions.json?location=india&full_time=true');
      if (githubResponse.ok) {
        const githubJobs = await githubResponse.json();
        jobs.push(...this.transformGitHubJobs(githubJobs));
      }
    } catch (error) {
      console.warn('GitHub Jobs API failed:', error);
    }

    // Add more API calls here as needed

    return jobs;
  }

  private async fetchInternshipsFromAPIs(): Promise<Internship[]> {
    const internships: Internship[] = [];

    try {
      // Try GitHub Jobs API for internships
      const githubResponse = await fetch('https://jobs.github.com/positions.json?location=india&type=internship');
      if (githubResponse.ok) {
        const githubJobs = await githubResponse.json();
        internships.push(...this.transformGitHubInternships(githubJobs));
      }
    } catch (error) {
      console.warn('GitHub Internships API failed:', error);
    }

    return internships;
  }

  private transformGitHubJobs(githubJobs: any[]): Job[] {
    return githubJobs.slice(0, 10).map((job, index) => ({
      id: `github_${job.id || index}`,
      title: job.title,
      company: job.company,
      location: job.location,
      type: 'Full-time',
      salary: 'Competitive',
      description: job.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      requirements: ['Experience with modern web technologies'],
      benefits: ['Remote work', 'Flexible hours'],
      postedDate: job.created_at,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isBookmarked: false,
      isApplied: false,
      tags: ['Remote', 'Tech'],
      experience: '1-3 years',
      education: 'B.Tech/BE',
      skills: ['JavaScript', 'React', 'Node.js'],
      companyLogo: job.company_logo || `https://via.placeholder.com/50x50/3B82F6/FFFFFF?text=${job.company?.charAt(0) || 'C'}`,
      remote: job.type === 'Full Time',
      urgent: false
    }));
  }

  private transformGitHubInternships(githubJobs: any[]): Internship[] {
    return githubJobs.slice(0, 5).map((job, index) => ({
      id: `github_int_${job.id || index}`,
      title: job.title,
      company: job.company,
      location: job.location,
      type: 'Internship',
      salary: 'Stipend provided',
      description: job.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      requirements: ['Currently enrolled student', 'Basic programming knowledge'],
      benefits: ['Certificate', 'Mentorship'],
      postedDate: job.created_at,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isBookmarked: false,
      isApplied: false,
      tags: ['Internship', 'Remote'],
      duration: '3-6 months',
      education: 'B.Tech/BE (3rd/4th year)',
      skills: ['JavaScript', 'React', 'Git'],
      companyLogo: job.company_logo || `https://via.placeholder.com/50x50/F59E0B/FFFFFF?text=${job.company?.charAt(0) || 'I'}`,
      remote: job.type === 'Full Time',
      urgent: false,
      stipend: '₹25,000/month'
    }));
  }

  private saveJobs(jobs: Job[]): void {
    localStorage.setItem('fresherJobs_cachedJobs', JSON.stringify(jobs));
  }

  private saveInternships(internships: Internship[]): void {
    localStorage.setItem('fresherJobs_cachedInternships', JSON.stringify(internships));
  }

  private getCachedJobs(): Job[] {
    try {
      const cached = localStorage.getItem('fresherJobs_cachedJobs');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private getCachedInternships(): Internship[] {
    try {
      const cached = localStorage.getItem('fresherJobs_cachedInternships');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  public forceUpdate(): void {
    this.lastUpdate = null;
    localStorage.removeItem('fresherJobs_lastUpdate');
  }

  public getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  public getNextUpdateTime(): Date | null {
    if (!this.lastUpdate) return null;
    return new Date(this.lastUpdate.getTime() + this.updateInterval);
  }
}

export default JobService; 