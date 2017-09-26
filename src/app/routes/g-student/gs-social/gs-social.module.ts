import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { GsSocialComponent } from './gs-social.component';
import { GroupsComponent } from './groups/groups.component';
import { FriendsComponent } from './friends/friends.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';

const routes: Routes = [
  {
    path: '', component: GsSocialComponent,
    children: [
      { path: '', redirectTo: 'friends', pathMatch: 'full' },
      { path: 'groups', component: GroupsComponent },
      { path: 'friends', component: FriendsComponent },
      { path: 'marketplace', component: MarketplaceComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GsSocialComponent, GroupsComponent, FriendsComponent, MarketplaceComponent],
  exports: [
  	RouterModule
  ]
})
export class GsSocialModule { }
