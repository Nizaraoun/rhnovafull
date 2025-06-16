import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  taxes: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  payDate: Date;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  payrollRecords: PayrollRecord[] = [];
  filteredRecords: PayrollRecord[] = [];
  searchForm: FormGroup;
  payrollForm: FormGroup;
  showProcessModal = false;
  selectedPeriod = '';
  
  currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: [''],
      period: ['']
    });

    this.payrollForm = this.fb.group({
      period: [this.currentPeriod, Validators.required],
      employees: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.loadPayrollRecords();
    this.setupSearchSubscription();
  }

  loadPayrollRecords() {
    // Mock data - replace with actual API call
    this.payrollRecords = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'maryem',
        department: 'Engineering',
        period: '2024-01',
        baseSalary: 6250,
        overtime: 500,
        bonuses: 1000,
        deductions: 200,
        grossPay: 7550,
        taxes: 1510,
        netPay: 6040,
        status: 'paid',
        payDate: new Date('2024-01-31')
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Alice maryemson',
        department: 'HR',
        period: '2024-01',
        baseSalary: 5417,
        overtime: 0,
        bonuses: 500,
        deductions: 150,
        grossPay: 5767,
        taxes: 1153,
        netPay: 4614,
        status: 'paid',
        payDate: new Date('2024-01-31')
      },
      {
        id: '3',
        employeeId: '3',
        employeeName: 'Mike Brown',
        department: 'Marketing',
        period: '2024-02',
        baseSalary: 4583,
        overtime: 200,
        bonuses: 0,
        deductions: 100,
        grossPay: 4683,
        taxes: 937,
        netPay: 3746,
        status: 'processed',
        payDate: new Date('2024-02-29')
      }
    ];
    this.filteredRecords = [...this.payrollRecords];
  }

  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      this.filterRecords(filters);
    });
  }

  filterRecords(filters: any) {
    this.filteredRecords = this.payrollRecords.filter(record => {
      const matchesSearch = !filters.searchTerm || 
        record.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.department.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = !filters.status || record.status === filters.status;
      const matchesPeriod = !filters.period || record.period === filters.period;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }

  openProcessModal() {
    this.showProcessModal = true;
  }

  closeModal() {
    this.showProcessModal = false;
    this.payrollForm.reset();
  }

  processPayroll() {
    if (this.payrollForm.valid) {
      // Implementation for processing payroll
      console.log('Processing payroll for period:', this.payrollForm.value.period);
      this.closeModal();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'processed': return 'status-processed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  exportPayroll() {
    console.log('Exporting payroll data...');
  }

  generateReports() {
    console.log('Generating payroll reports...');
  }

  getTotalGrossPay(): number {
    return this.filteredRecords.reduce((total, record) => total + record.grossPay, 0);
  }

  getTotalNetPay(): number {
    return this.filteredRecords.reduce((total, record) => total + record.netPay, 0);
  }

  getTotalTaxes(): number {
    return this.filteredRecords.reduce((total, record) => total + record.taxes, 0);
  }
}
