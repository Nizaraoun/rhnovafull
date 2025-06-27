import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TEAM_MEMBER_ROUTES } from './team-member.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TEAM_MEMBER_ROUTES)
  ]
})
export class TeamMemberModule { }
