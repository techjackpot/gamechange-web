import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ConvenorAuthGuard } from '../../core/services/convenor.auth.guard';
import { TeacherAuthGuard } from '../../core/services/teacher.auth.guard';
import { GTeacherComponent } from './g-teacher.component';

const routes: Routes = [
  {
    path: '', component: GTeacherComponent,
    children: [
      { path: '', redirectTo: 'classes', pathMatch: 'full' },
      { path: 'classes', loadChildren: './gt-classes/gt-classes.module#GtClassesModule' },
      { path: 'staff', loadChildren: './gt-convenor/gt-convenor.module#GtConvenorModule' },
      { path: 'admin', loadChildren: './gt-admin/gt-admin.module#GtAdminModule' },
      { path: 'approvals', loadChildren: './gt-approval/gt-approval.module#GtApprovalModule' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
  	RouterModule
  ],
  declarations: [GTeacherComponent]
})
export class GTeacherModule { }
