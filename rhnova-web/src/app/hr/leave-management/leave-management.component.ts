import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="leave-page">
      <div class="page-header">
        <h1 class="page-title">Leave Management</h1>
        <p class="page-subtitle">Manage employee leave requests and balances</p>
      </div>
      <div class="coming-soon">
        <div class="icon">
          <i class="icon-calendar"></i>
        </div>
        <h2>Leave Management</h2>
        <p>This module is coming soon! It will include leave requests, approvals, and balance tracking.</p>
      </div>
    </div>
  `,
  styles: [`
    .leave-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .coming-soon {
      text-align: center;
      padding: 4rem 2rem;
      .icon {
        font-size: 4rem;
        color: #06b6d4;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class LeaveManagementComponent implements OnInit {
  ngOnInit() {}
}
