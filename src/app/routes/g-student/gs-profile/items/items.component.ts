import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {

	loaded = false;

	itemTitles = [];
	itemBackgrounds = [];

	myTitles = [];
	myBackgrounds = [];

	attendClasses = [];

	me = null;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.me = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
    	this.dataService.getMarketItemTitles({}).subscribe( (response) => {
        this.itemTitles = response.ItemTitles;
        resolve();
      })
    })

    let p2 = new Promise((resolve, reject) => {
    	this.dataService.getMarketItemBackgrounds({}).subscribe( (response) => {
        this.itemBackgrounds = response.ItemBackgrounds;
        resolve();
      })
    })

    let p4 = new Promise((resolve, reject) => {
    	this.dataService.myMarketItemTitles({Student: this.me._id}).subscribe( (response) => {
    		this.myTitles = response.OwnedTitles;
    		resolve();
    	})
    })
    let p5 = new Promise((resolve, reject) => {
    	this.dataService.myMarketItemBackgrounds({Student: this.me._id}).subscribe( (response) => {
    		this.myBackgrounds = response.OwnedBackgrounds;
    		resolve();
    	})
    })

    Promise.all([p1, p2, p4, p5]).then(() => {
  		this.itemTitles = this.itemTitles.filter((title) => this.myTitles.some((mtitle) => title._id == mtitle.Title));
  		this.itemBackgrounds = this.itemBackgrounds.filter((background) => this.myBackgrounds.some((mbackground) => background._id == mbackground.Background));
    	this.loaded = true;
    })

  }

  getIndexOfPlayers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user.Player == user_id) {
        index = i;
      }
    });
    return index;
  }

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  getIndexOfItems(items, item_id) {
  	let index = -1;
  	items.forEach((item, i) => {
  		if(item._id == item_id) {
  			index = i;
  		}
  	});
  	return index;
  }

  onClickedSelectTitle(title) {
  	this.dataService.updateUser({Title: title._id}).subscribe( (response) => {
  		this.me.Title = title;
  		this.authService.updateUserData();
  	})
  }
  onClickedSelectBackground(background) {
  	this.dataService.updateUser({Background: background._id}).subscribe( (response) => {
  		this.me.Background = background;
  		this.authService.updateUserData();
  	})
  }

}
