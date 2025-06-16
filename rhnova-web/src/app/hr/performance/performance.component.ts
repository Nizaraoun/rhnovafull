import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="performance-page">
      <div class="page-header">
        <h1 class="page-title">Performance Management</h1>
        <p class="page-subtitle">Track and manage employee performance</p>
      </div>
      <div class="coming-soon">
        <div class="icon">
          <i class="icon-trending-up"></i>
        </div>
        <h2>Performance Management</h2>
        <p>This module is coming soon! It will include performance reviews, goal tracking, and analytics.</p>
      </div>
    </div>
  `,
  styles: [`
    .performance-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .coming-soon {
      text-align: center;
      padding: 4rem 2rem;
      .icon {
        font-size: 4rem;
        color: #6366f1;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class PerformanceComponent implements OnInit {
  ngOnInit() {}
}
