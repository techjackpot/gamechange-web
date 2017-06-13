import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login/login.component';

import { routes } from './routes';

@NgModule({
  imports: [
		SharedModule,
		RouterModule.forRoot(routes)
  ],
  declarations: [LoginComponent],
  exports: [
  	RouterModule
  ]
})
export class RoutesModule {
	constructor() {}
}
