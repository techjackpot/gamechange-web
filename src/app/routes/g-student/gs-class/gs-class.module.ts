import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GsClassComponent } from './gs-class.component';
import { TasksComponent } from './tasks/tasks.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { ListComponent } from './list/list.component';
import { MembersComponent } from './members/members.component';

const routes: Routes = [
  {
    path: '', component: GsClassComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ListComponent },
      { path: ':class_id/members', component: MembersComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'feedback', component: FeedbackComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GsClassComponent, TasksComponent, FeedbackComponent, ListComponent, MembersComponent],
  exports: [
  	RouterModule
  ]
})
export class GsClassModule { }
