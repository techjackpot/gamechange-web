import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassesComponent } from './classes/classes.component';
import { Routes, RouterModule } from '@angular/router';
import { StudentComponent } from './student/student.component';
import { StudentsComponent } from './students/students.component';
import { TasksComponent } from './tasks/tasks.component';
import { GroupsComponent } from './groups/groups.component';
import { RollCallComponent } from './roll-call/roll-call.component';

const routes: Routes = [
  { path: '', redirectTo: 'classes', pathMatch: 'full' },
  { path: 'classes', children: [
      { path: '', redirectTo: 'classes', pathMatch: 'full' },
      { path: 'classes', component: ClassesComponent },
      { path: 'students', component: StudentsComponent }
    ]
  },
  { path: 'student', component: StudentComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'rollcall', component: RollCallComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ClassesComponent, StudentComponent, StudentsComponent, TasksComponent, GroupsComponent, RollCallComponent],
  exports: [
  	RouterModule
  ]
})
export class GtClassesModule { }
