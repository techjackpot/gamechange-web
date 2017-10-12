import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { StaffComponent } from './staff/staff.component';
import { GtConvenorComponent } from './gt-convenor.component';
import { ClassesComponent } from './classes/classes.component';
import { UnitsComponent } from './units/units.component';
import { AnalyticsComponent } from './analytics/analytics.component';

const routes: Routes = [
	{
		path: '', component: GtConvenorComponent,
		children: [
			{ path: '', redirectTo: 'analytics', pathMatch: 'full' },
  		{ path: 'staff', component: StaffComponent },
  		{ path: 'classes', component: ClassesComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'analytics', component: AnalyticsComponent }
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
  declarations: [StaffComponent, GtConvenorComponent, ClassesComponent, UnitsComponent, AnalyticsComponent],
  exports: [
  	RouterModule
  ]
})
export class GtConvenorModule { }
