import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GtAdminComponent } from './gt-admin.component';

const routes: Routes = [
	{
		path: '', component: GtAdminComponent, pathMatch: 'full' }
	// 	children: [
	// 		{ path: '', redirectTo: 'classes', pathMatch: 'full' },
 //  		{ path: 'staff', component: StaffComponent },
 //  		{ path: 'classes', component: ClassesComponent }
 //  	]
	// }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GtAdminComponent],
  exports: [
  	RouterModule
  ]
})
export class GtAdminModule { }
