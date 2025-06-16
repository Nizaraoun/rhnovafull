import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';

interface DashboardCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.stat-card', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger('100ms', [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  statsCards = signal<DashboardCard[]>([
    {
      title: 'Total Employees',
      value: 1247,
      change: '+12%',
      changeType: 'increase',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
      color: 'blue'
    },
    {
      title: 'New Hires',
      value: 23,
      change: '+8%',
      changeType: 'increase',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
      color: 'green'
    },
    {
      title: 'Job Applications',
      value: 89,
      change: '+15%',
      changeType: 'increase',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>',
      color: 'purple'
    },
    {
      title: 'Pending Reviews',
      value: 12,
      change: '-5%',
      changeType: 'decrease',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
      color: 'amber'
    }
  ]);

  recentActivities = signal([
    {
      id: 1,
      user: 'Sarah maryemson',
      action: 'submitted application for Senior Developer position',
      time: '2 hours ago',
      status: 'pending',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'completed onboarding process',
      time: '4 hours ago',
      status: 'completed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'scheduled interview for UX Designer role',
      time: '6 hours ago',
      status: 'scheduled',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  pendingTasks = signal([
    {
      id: 1,
      title: 'Review Sarah maryemson\'s Application',
      description: 'Senior Developer position - Technical interview pending',
      priority: 'high',
      dueDate: 'Today'
    },
    {
      id: 2,
      title: 'Prepare Onboarding Materials',
      description: 'For new marketing team members starting next week',
      priority: 'medium',
      dueDate: 'Tomorrow'
    },
    {
      id: 3,
      title: 'Update Job Descriptions',
      description: 'Quarterly review of all active job postings',
      priority: 'low',
      dueDate: 'This week'
    }
  ]);

  teamMembers = signal([
    {
      id: 1,
      name: 'Alex Thompson',
      role: 'HR Manager',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Lisa Wang',
      role: 'Recruiter',
      status: 'busy',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'David Miller',
      role: 'Team Lead',
      status: 'away',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f8d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Rachel Green',
      role: 'HR Specialist',
      status: 'online',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  ngOnInit() {
    // Initialize dashboard data
  }
}
