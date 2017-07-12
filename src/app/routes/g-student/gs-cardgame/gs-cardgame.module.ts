import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { GsCardgameComponent } from './gs-cardgame.component';
import { PlaygameComponent } from './playgame/playgame.component';
import { ViewcollectionComponent } from './viewcollection/viewcollection.component';
import { CreatecardComponent } from './createcard/createcard.component';

const routes: Routes = [
  {
    path: '', component: GsCardgameComponent,
    children: [
      { path: '', redirectTo: 'playgame', pathMatch: 'full' },
      { path: 'createcard', component: CreatecardComponent },
      { path: 'playgame', component: PlaygameComponent },
      { path: 'viewcollection', component: ViewcollectionComponent }
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
  declarations: [GsCardgameComponent, PlaygameComponent, ViewcollectionComponent, CreatecardComponent],
  exports: [
  	RouterModule
	]
})
export class GsCardgameModule { }
