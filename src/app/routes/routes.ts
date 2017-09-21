import { AuthGuard } from '../core/services/auth.guard';
import { StudentAuthGuard } from '../core/services/student.auth.guard';
import { TeacherAuthGuard } from '../core/services/teacher.auth.guard';
import { ConvenorAuthGuard } from '../core/services/convenor.auth.guard';

import { LayoutComponent } from '../layout/layout.component';

export const routes = [

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', canActivate: [TeacherAuthGuard], loadChildren: './g-teacher/g-teacher.module#GTeacherModule' },
      { path: '', canActivate: [StudentAuthGuard], loadChildren: './g-student/g-student.module#GStudentModule' },
    ]
  },

  { path: '', loadChildren: './auth/auth.module#AuthModule' },

  { path: '**', redirectTo: 'login' }

];
