import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MANAGER_ROUTES } from './manager.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MANAGER_ROUTES)
  ]
})
export class ManagerModule { }
