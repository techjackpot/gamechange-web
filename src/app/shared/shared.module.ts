import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';
//import { MaterialModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  exports: [
  	RouterModule,
    //MaterialModule,
    DragulaModule
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
