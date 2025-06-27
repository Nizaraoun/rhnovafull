// TypeScript interfaces for Dashboard API responses

export interface DashboardStats {
  totalEmployees: number;
  newHires: number;
  jobApplications: number;
  pendingReviews: number;
  totalTeams: number;
  totalActiveJobOffers: number;
  totalCandidates: number;
  interviewsThisWeek: number;
  completedTasksThisWeek: number;
  pendingTasksCount: number;
  employeeGrowthData: EmployeeGrowthData[];
  recentActivities: RecentActivity[];
}

export interface EmployeeGrowthData {
  day: string;
  count: number;
}

export interface RecentActivity {
  id?: string;
  user: string;
  action: string;
  time: string;
  status: string;
  avatar?: string;
  timestamp?: string;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

export interface PendingTask {
  id: string;
  titre: string;
  description: string;
  priorite: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  progression: number;
  evaluation: number;
  membreId: string;
}
