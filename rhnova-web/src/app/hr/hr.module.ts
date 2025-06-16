import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { EmployeesComponent } from './employees/employees.component';
import { PayrollComponent } from './payroll/payroll.component';
import { RecruitmentComponent } from './recruitment/recruitment.component';
import { PerformanceComponent } from './performance/performance.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { HR_ROUTES } from './hr.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(HR_ROUTES),
    EmployeesComponent,
    PayrollComponent,
    RecruitmentComponent,
    PerformanceComponent,
    LeaveManagementComponent
  ],
  exports: [
    EmployeesComponent,
    PayrollComponent,
    RecruitmentComponent,
    PerformanceComponent,
    LeaveManagementComponent
  ]
})
export class HrModule { }
