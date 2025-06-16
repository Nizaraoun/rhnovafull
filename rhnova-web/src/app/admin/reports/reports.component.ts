import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportData {
  totalUsers: number;
  activeUsers: number;
  totalJobOffers: number;
  activeJobOffers: number;
  totalCandidates: number;
  acceptedCandidates: number;
  totalInterviews: number;
  completedInterviews: number;
  totalTeams: number;
  totalTasks: number;
  completedTasks: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportData: ReportData = {
    totalUsers: 0,
    activeUsers: 0,
    totalJobOffers: 0,
    activeJobOffers: 0,
    totalCandidates: 0,
    acceptedCandidates: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    totalTeams: 0,
    totalTasks: 0,
    completedTasks: 0
  };

  selectedDateRange = '30';
  isLoading = false;

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.reportData = {
        totalUsers: 156,
        activeUsers: 142,
        totalJobOffers: 23,
        activeJobOffers: 18,
        totalCandidates: 89,
        acceptedCandidates: 34,
        totalInterviews: 67,
        completedInterviews: 52,
        totalTeams: 12,
        totalTasks: 156,
        completedTasks: 123
      };
      this.isLoading = false;
    }, 1000);
  }

  onDateRangeChange(): void {
    this.loadReportData();
  }

  exportReport(format: string): void {
    console.log(`Exporting report in ${format} format for ${this.selectedDateRange} days`);
    // TODO: Implement actual export logic
  }

  getCompletionRate(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getSuccessRate(success: number, total: number): number {
    return total > 0 ? Math.round((success / total) * 100) : 0;
  }
}
