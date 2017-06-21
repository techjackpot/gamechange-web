import { AuthGuard } from '../core/services/auth.guard';
import { StudentAuthGuard } from '../core/services/student.auth.guard';
import { TeacherAuthGuard } from '../core/services/teacher.auth.guard';
import { ConvenorAuthGuard } from '../core/services/convenor.auth.guard';

import { LayoutComponent } from '../layout/layout.component';

export const routes = [

  //{ path: '', redirectTo: '/login', pathMatch: 'full' },

  // {
  //   path: '',
  //   component: LayoutComponent,
  //   canActivate: [StudentAuthGuard],
  //   children: [
  //     { path: '', loadChildren: './g-student/g-student.module#GStudentModule' }
  //   ]
  // },
  
  // {
  //   path: '',
  //   component: LayoutComponent,
  //   canActivate: [TeacherAuthGuard],
  //   children: [
  //     { path: '', loadChildren: './g-teacher/g-teacher.module#GTeacherModule' }
  //   ]
  // },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      //{ path: '', redirectTo: 'gs', pathMatch: 'full' },
      { path: '', canActivate: [TeacherAuthGuard], loadChildren: './g-teacher/g-teacher.module#GTeacherModule' },
      { path: '', canActivate: [StudentAuthGuard], loadChildren: './g-student/g-student.module#GStudentModule' },
    ]
  },

  { path: '', loadChildren: './auth/auth.module#AuthModule' },


  // Not found
  { path: '**', redirectTo: 'login' }

];
