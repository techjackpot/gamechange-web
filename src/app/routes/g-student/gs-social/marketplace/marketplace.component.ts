import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {

	loaded = false;

	itemTitles = [];
	itemBackgrounds = [];

	myTitles = [];
	myBackgrounds = [];

	attendClasses = [];

	totalPoint = 0;

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

    let p3 = new Promise((resolve, reject) => {
	    this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
	      this.attendClasses = response.Classes.filter((t_class) => this.getIndexOfPlayers(t_class.Players, this.me._id)>=0 );
	      this.attendClasses.sort((a, b) => {
			    return parseFloat(b.Players[this.getIndexOfPlayers(b.Players, this.me._id)].Point) - parseFloat(a.Players[this.getIndexOfPlayers(a.Players, this.me._id)].Point);
				});
	      resolve();
	    });
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

    Promise.all([p1, p2, p3, p4, p5]).then(() => {
  		this.totalPoint = this.attendClasses.reduce((sum, t_class) => {
  			return sum + t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point;
  		}, 0)

  		this.itemTitles = this.itemTitles.filter((title) => !this.myTitles.some((mtitle) => title._id == mtitle.Title));
  		this.itemBackgrounds = this.itemBackgrounds.filter((background) => !this.myBackgrounds.some((mbackground) => background._id == mbackground.Background));
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

  onClickedBuyTitle(title) {
  	if(!confirm("Do you really want to buy this Title?")) return false;
  	let cost = title.Cost;
  	let ps = [];
  	this.attendClasses.every((t_class, ii) => {
  		let point = t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point;
  		let next = false;
  		if(cost > t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point) {
  			t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point = 0;
  			cost -= point;
  			next = true;
  		} else {
  			t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point -= cost;;
  			cost = 0;
  			next = false;
  		}
  		let p = new Promise((resolve, reject) => {
	  		this.dataService.updateClassInfo({_id: t_class._id, Players: t_class.Players}).subscribe((response) => {
	  			resolve();
	  		})
	  	});
	  	ps.push(p);
  		return next;
  	})
  	Promise.all(ps).then(() => {
  		this.dataService.buyMarketItemTitle({Student: this.me._id, Title: title._id}).subscribe( (response) => {
  			this.itemTitles.splice(this.getIndexOfItems(this.itemTitles,title._id), 1);
  		})
  		this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
	      this.attendClasses = response.Classes.filter((t_class) => this.getIndexOfPlayers(t_class.Players, this.me._id)>=0 );
	      this.attendClasses.sort((a, b) => {
			    return parseFloat(b.Players[this.getIndexOfPlayers(b.Players, this.me._id)].Point) - parseFloat(a.Players[this.getIndexOfPlayers(a.Players, this.me._id)].Point);
				});
	  		this.totalPoint = this.attendClasses.reduce((sum, t_class) => {
	  			return sum + t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point;
	  		}, 0)
	    });
  	})
  }

  onClickedBuyBackground(background) {
  	if(!confirm("Do you really want to buy this Background?")) return false;
  	let cost = background.Cost;
  	let ps = [];
  	this.attendClasses.every((t_class, ii) => {
  		let point = t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point;
  		let next = false;
  		if(cost > t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point) {
  			t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point = 0;
  			cost -= point;
  			next = true;
  		} else {
  			t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point -= cost;;
  			cost = 0;
  			next = false;
  		}
  		let p = new Promise((resolve, reject) => {
	  		this.dataService.updateClassInfo({_id: t_class._id, Players: t_class.Players}).subscribe((response) => {
	  			resolve();
	  		})
	  	});
	  	ps.push(p);
  		return next;
  	})
  	Promise.all(ps).then(() => {
  		this.dataService.buyMarketItemBackground({Student: this.me._id, Background: background._id}).subscribe( (response) => {
  			this.itemBackgrounds.splice(this.getIndexOfItems(this.itemBackgrounds,background._id), 1);
  		})
  		this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
	      this.attendClasses = response.Classes.filter((t_class) => this.getIndexOfPlayers(t_class.Players, this.me._id)>=0 );
	      this.attendClasses.sort((a, b) => {
			    return parseFloat(b.Players[this.getIndexOfPlayers(b.Players, this.me._id)].Point) - parseFloat(a.Players[this.getIndexOfPlayers(a.Players, this.me._id)].Point);
				});
	  		this.totalPoint = this.attendClasses.reduce((sum, t_class) => {
	  			return sum + t_class.Players[this.getIndexOfPlayers(t_class.Players, this.me._id)].Point;
	  		}, 0)
	    });
  	})
  }
}
