import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboarddComponent } from './dashboardd.component';

describe('DashboarddComponent', () => {
  let component: DashboarddComponent;
  let fixture: ComponentFixture<DashboarddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboarddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboarddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
