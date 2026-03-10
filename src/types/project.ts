// Project Types
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  techStack: string[];
  features: string[];
  
  // Pricing tiers
  tier1Price: number;
  tier1Features: string[];
  tier1Files: any;
  
  tier2Price: number;
  tier2Features: string[];
  tier2Files: any;
  
  tier3Price: number;
  tier3Features: string[];
  tier3Files: any;
  
  // Media
  images: string[];
  thumbnailUrl?: string;
  
  // Details
  architectureDiagram?: string;
  modulesBreakdown: string[];
  vivaQA?: string;
  
  // Meta
  isPublished: boolean;
  views: number;
  popularity: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export type Category =
  | 'AI'
  | 'WEB'
  | 'ML'
  | 'IOT'
  | 'DBMS'
  | 'MOBILE'
  | 'BLOCKCHAIN'
  | 'CYBERSECURITY';

export const CATEGORIES: Category[] = [
  'AI',
  'WEB',
  'ML',
  'IOT',
  'DBMS',
  'MOBILE',
  'BLOCKCHAIN',
  'CYBERSECURITY',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  AI: 'Artificial Intelligence',
  WEB: 'Web Development',
  ML: 'Machine Learning',
  IOT: 'Internet of Things',
  DBMS: 'Database Management',
  MOBILE: 'Mobile Development',
  BLOCKCHAIN: 'Blockchain',
  CYBERSECURITY: 'Cybersecurity',
};

// API Response Types
export interface ProjectListResponse {
  success: boolean;
  data: {
    projects: Partial<Project>[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProjectDetailResponse {
  success: boolean;
  data: Project;
}

// Filter Options
export interface ProjectFilters {
  search?: string;
  category?: Category | 'ALL';
  techStack?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'popularity' | 'views' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
