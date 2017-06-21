import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { GStudentComponent } from './g-student.component';

const routes: Routes = [
  {
    path: '', component: GStudentComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full'  },
      { path: 'profile', component: ProfileComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProfileComponent, GStudentComponent],
  exports: [
  	RouterModule
  ]
})
export class GStudentModule { }
