
export interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'active' | 'inactive' | 'filled';
  description: string;
  requirements?: string[];
  salary?: string;
  deadline: Date;
  postedDate: Date;
  applicants?: number;
}