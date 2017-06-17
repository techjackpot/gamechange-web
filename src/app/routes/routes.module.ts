import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { routes } from './routes';


@NgModule({
  imports: [
		SharedModule,
		RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [
  	RouterModule
  ]
})
export class RoutesModule {
	constructor() {}
}
