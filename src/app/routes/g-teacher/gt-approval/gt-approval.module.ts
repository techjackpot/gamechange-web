import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GtApprovalComponent } from './gt-approval.component';
import { CardsComponent } from './cards/cards.component';
import { CreatecardComponent } from './createcard/createcard.component';

const routes: Routes = [
	{
		path: '', component: GtApprovalComponent,
		children: [
			{ path: '', redirectTo: 'cards', pathMatch: 'full' },
      { path: 'createcard', component: CreatecardComponent },
  		{ path: 'cards', component: CardsComponent }
  	]
	}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [GtApprovalComponent, CardsComponent, CreatecardComponent],
  exports: [
  	RouterModule
  ]
})
export class GtApprovalModule { }
