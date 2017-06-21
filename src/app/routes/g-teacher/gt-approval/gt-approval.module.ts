import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GtApprovalComponent } from './gt-approval.component';

const routes: Routes = [
	{
		path: '', component: GtApprovalComponent, pathMatch: 'full' }
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
  declarations: [GtApprovalComponent],
  exports: [
  	RouterModule
  ]
})
export class GtApprovalModule { }
