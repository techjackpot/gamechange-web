import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gamescreen',
  templateUrl: './gamescreen.component.html',
  styleUrls: ['./gamescreen.component.scss']
})
export class GamescreenComponent implements OnInit {

  currentClass = null;
  studentList = [];
  cards = [];
  cardHistory = null;

  loaded = false;

  pos = 0;

  timer = null;

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        resolve();
      });
    });

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response;
        resolve();
      })
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getAllCards({Approved: true}).subscribe((response) => {
        this.cards = response.Cards;
        resolve();
      });
    })


    Promise.all([p1, p2]).then(() => {
    	this.cardHistory = this.currentClass.CardHistory;
    	this.pos = 0;
    	if(this.cardHistory.length>0) {
    		this.timer = setInterval(() => {
    			this.pos++;
    			if(this.pos>=this.cardHistory.length) this.pos=0;
    		}, 5000);
	    	this.loaded = true;
	    }
    })

  }

  ngOnDestroy() {
    if(this.timer) {
      clearInterval(this.timer);
    }
  }

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  getIndexOfUsers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user._id == user_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfCards(cards,card_id) {
    let index = -1;
    cards.forEach((card, i) => {
      if(card._id == card_id) {
        index = i;
      }
    });
    return index;
  }
  getTargetPlayers(pos) {
  	let targetPlayers = [];
  	console.log(this.cardHistory);
  	this.cardHistory[pos].Target.forEach((kTarget) => {
  		kTarget.forEach((target) => {
  			if(targetPlayers.indexOf(target)==-1) targetPlayers.push(target);
  		});
  	});
  	return targetPlayers.map((target) => {
  		return this.studentList[this.getIndexOfUsers(this.studentList, target)].DisplayName;
  	})
  }
}
