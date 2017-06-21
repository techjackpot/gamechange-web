import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassesComponent } from './classes/classes.component';
import { StudentComponent } from './student/student.component';
import { StudentsComponent } from './students/students.component';
import { TasksComponent } from './tasks/tasks.component';
import { GroupsComponent } from './groups/groups.component';
import { RollCallComponent } from './roll-call/roll-call.component';
import { GtClassesComponent } from './gt-classes.component';

const routes: Routes = [
  {
    path: '', component: GtClassesComponent,
    children: [
      { path: '', redirectTo: 'choose', pathMatch: 'full' },
      { path: 'choose', component: ClassesComponent },
      { path: 'students', component: StudentsComponent },
      { path: 'student/:student_id', component: StudentComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'rollcall', component: RollCallComponent },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ClassesComponent, StudentComponent, StudentsComponent, TasksComponent, GroupsComponent, RollCallComponent, GtClassesComponent],
  exports: [
  	RouterModule
  ]
})
export class GtClassesModule { }
