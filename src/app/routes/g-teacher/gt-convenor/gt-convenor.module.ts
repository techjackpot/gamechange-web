import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { StaffComponent } from './staff/staff.component';
import { GtConvenorComponent } from './gt-convenor.component';
import { ClassesComponent } from './classes/classes.component';

const routes: Routes = [
	{
		path: '', component: GtConvenorComponent,
		children: [
			{ path: '', redirectTo: 'classes', pathMatch: 'full' },
  		{ path: 'staff', component: StaffComponent },
  		{ path: 'classes', component: ClassesComponent }
  	]
	}
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [StaffComponent, GtConvenorComponent, ClassesComponent],
  exports: [
  	RouterModule
  ]
})
export class GtConvenorModule { }
