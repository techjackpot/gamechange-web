import { LayoutComponent } from '../layout/layout.component';
import { LoginComponent } from './login/login.component';

export const routes = [

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'classes', pathMatch: 'full' },
      { path: 'classes', loadChildren: './gt-classes/gt-classes.module#GtClassesModule' }
    ]
  },
  //{ path: 'login', component: LoginComponent },

  // Not found
  { path: '**', redirectTo: 'classes' }

];
