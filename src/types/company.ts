export interface Company {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  founded: string;
  headquarters: string;
  website: string;
  logo: string;
  employees: number;
  revenue: string;
  type: 'Public' | 'Private' | 'Startup' | 'Non-profit';
  specialties: string[];
  benefits: string[];
  culture: string[];
  technologies: string[];
  locations: CompanyLocation[];
  socialMedia: SocialMedia;
  ratings: CompanyRatings;
  contactInfo: ContactInfo;
  scrapedAt: string;
  source: string;
}

export interface CompanyLocation {
  city: string;
  state: string;
  country: string;
  type: 'Headquarters' | 'Office' | 'Remote';
  address?: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface CompanyRatings {
  overall: number;
  culture: number;
  workLifeBalance: number;
  careerGrowth: number;
  compensation: number;
  management: number;
  totalReviews: number;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface CompanyFilters {
  industry: string;
  size: string;
  location: string;
  type: string;
  search: string;
  minRating: number;
  hasRemote: boolean;
}

export interface CompanyScrapingResult {
  companies: Company[];
  totalFound: number;
  scrapedAt: string;
  sources: string[];
  errors: string[];
} 