import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { StudentAuthGuard } from './services/student.auth.guard';
import { TeacherAuthGuard } from './services/teacher.auth.guard';
import { ConvenorAuthGuard } from './services/convenor.auth.guard';
import { DataService } from './services/data.service';

@NgModule({
  imports: [
  ],
  providers: [
  	AuthService,
  	AuthGuard,
    StudentAuthGuard,
    TeacherAuthGuard,
    ConvenorAuthGuard,
    DataService
  ],
  declarations: [],
  exports: []
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
