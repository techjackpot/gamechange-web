import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { GsProfileComponent } from './gs-profile.component';
import { BordersComponent } from './borders/borders.component';
import { TitlesComponent } from './titles/titles.component';
import { HomeComponent } from './home/home.component';
import { AvatarComponent } from './avatar/avatar.component';

const routes: Routes = [
  {
    path: '', component: GsProfileComponent, 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'avatar', component: AvatarComponent },
      { path: 'borders', component: BordersComponent },
      { path: 'titles', component: TitlesComponent }
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
  declarations: [GsProfileComponent, BordersComponent, TitlesComponent, HomeComponent, AvatarComponent],
  exports: [
  	RouterModule
  ]
})
export class GsProfileModule { }