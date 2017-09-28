import { NgModule, Pipe, PipeTransform } from '@angular/core';
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
import { DragulaModule } from 'ng2-dragula';
import { GamescreenComponent } from './gamescreen/gamescreen.component';
import { MarkingComponent } from './marking/marking.component';
import { DomSanitizer } from '@angular/platform-browser';

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
      { path: 'gamescreen', component: GamescreenComponent },
      { path: 'marking', component: MarkingComponent }
    ]
  }
];

@Pipe({name: 'safe'})
export class Safe {
  constructor(private sanitizer:DomSanitizer){
    this.sanitizer = sanitizer;
  }

  transform(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    DragulaModule
  ],
  declarations: [ClassesComponent, StudentComponent, StudentsComponent, TasksComponent, GroupsComponent, RollCallComponent, GtClassesComponent, GamescreenComponent, MarkingComponent, Safe],
  exports: [
  	RouterModule
  ]
})
export class GtClassesModule { }
