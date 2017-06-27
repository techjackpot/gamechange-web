import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GsProfileComponent } from './gs-profile.component';
import { BordersComponent } from './borders/borders.component';
import { TitlesComponent } from './titles/titles.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '', component: GsProfileComponent, 
    children: [
      { path: '', component: HomeComponent },
      { path: 'borders', component: BordersComponent },
      { path: 'titles', component: TitlesComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GsProfileComponent, BordersComponent, TitlesComponent, HomeComponent],
  exports: [
  	RouterModule
  ]
})
export class GsProfileModule { }
