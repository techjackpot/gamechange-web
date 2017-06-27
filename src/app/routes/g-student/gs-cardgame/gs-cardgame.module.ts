import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GsCardgameComponent } from './gs-cardgame.component';
import { PlaygameComponent } from './playgame/playgame.component';
import { ViewcollectionComponent } from './viewcollection/viewcollection.component';

const routes: Routes = [
  {
    path: '', component: GsCardgameComponent,
    children: [
      { path: '', redirectTo: 'playgame', pathMatch: 'full' },
      { path: 'playgame', component: PlaygameComponent },
      { path: 'viewcollection', component: ViewcollectionComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GsCardgameComponent, PlaygameComponent, ViewcollectionComponent],
  exports: [
  	RouterModule
	]
})
export class GsCardgameModule { }
