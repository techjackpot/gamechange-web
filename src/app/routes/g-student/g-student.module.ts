import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GStudentComponent } from './g-student.component';

const routes: Routes = [
  {
    path: '', component: GStudentComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full'  },
      { path: 'profile', loadChildren: './gs-profile/gs-profile.module#GsProfileModule' },
      { path: 'class', loadChildren: './gs-class/gs-class.module#GsClassModule' },
      { path: 'social', loadChildren: './gs-social/gs-social.module#GsSocialModule' },
      { path: 'cardgame', loadChildren: './gs-cardgame/gs-cardgame.module#GsCardgameModule' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GStudentComponent],
  exports: [
  	RouterModule
  ]
})
export class GStudentModule { }
