import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { GsCardgameComponent } from './gs-cardgame.component';
import { PlaygameComponent } from './playgame/playgame.component';
import { ViewcollectionComponent } from './viewcollection/viewcollection.component';
import { CreatecardComponent } from './createcard/createcard.component';
import { PlayscreenComponent } from './playscreen/playscreen.component';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({name: 'safe'})
export class Safe {
  constructor(private sanitizer:DomSanitizer){
    this.sanitizer = sanitizer;
  }

  transform(style) {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}

const routes: Routes = [
  {
    path: '', component: GsCardgameComponent,
    children: [
      { path: '', redirectTo: 'playgame', pathMatch: 'full' },
      { path: 'createcard', component: CreatecardComponent },
      { path: 'playgame', component: PlaygameComponent },
      { path: 'playgame/:game_id', component: PlayscreenComponent },
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
  declarations: [GsCardgameComponent, PlaygameComponent, ViewcollectionComponent, CreatecardComponent, PlayscreenComponent, Safe],
  exports: [
  	RouterModule
	]
})
export class GsCardgameModule { }
