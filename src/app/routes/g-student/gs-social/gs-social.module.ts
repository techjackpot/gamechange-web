import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GsSocialComponent } from './gs-social.component';
import { GroupsComponent } from './groups/groups.component';
import { FriendsComponent } from './friends/friends.component';

const routes: Routes = [
  {
    path: '', component: GsSocialComponent,
    children: [
      { path: '', redirectTo: 'groups', pathMatch: 'full' },
      { path: 'groups', component: GroupsComponent },
      { path: 'friends', component: FriendsComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GsSocialComponent, GroupsComponent, FriendsComponent],
  exports: [
  	RouterModule
  ]
})
export class GsSocialModule { }
