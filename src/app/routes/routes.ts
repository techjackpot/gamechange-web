import { AuthGuard } from '../core/services/index';

import { LayoutComponent } from '../layout/layout.component';

export const routes = [

  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'classes', pathMatch: 'full' },
      { path: 'classes', loadChildren: './gt-classes/gt-classes.module#GtClassesModule' }
    ]
  },

  { path: '', loadChildren: './auth/auth.module#AuthModule' },

  // Not found
  { path: '**', redirectTo: 'classes' }

];
