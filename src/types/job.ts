export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  isBookmarked: boolean;
  isApplied: boolean;
  tags: string[];
  experience: string;
  education: string;
  skills: string[];
  companyLogo: string;
  remote: boolean;
  urgent: boolean;
}

export interface Internship extends Omit<Job, 'experience'> {
  duration: string;
  stipend: string;
  experience?: string;
}

export interface JobFilters {
  location: string;
  type: string;
  experience: string;
  remote: boolean;
  urgent: boolean;
  search: string;
}

export interface InternshipFilters {
  location: string;
  duration: string;
  remote: boolean;
  urgent: boolean;
  search: string;
} 