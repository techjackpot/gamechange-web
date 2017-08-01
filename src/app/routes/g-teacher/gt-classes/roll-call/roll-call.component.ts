import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roll-call',
  templateUrl: './roll-call.component.html',
  styleUrls: ['./roll-call.component.scss']
})


export class RollCallComponent implements OnInit {

  currentClass = null;
  cards = [];
  studentList = [];

  constructor(private dataService: DataService, private router: Router) { }


  shuffle(source) {
    let array = source.concat();
    var copy = [], n = array.length, i;

    // While there remain elements to shuffle…
    while (n) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * array.length);

      // If not already shuffled, move it to the new array.
      if (i in array) {
        copy.push(array[i]);
        delete array[i];
        n--;
      }
    }

    return copy;
  }

  min(a, b) {
    return a>b?b:a;
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

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
      this.currentClass = response.Class;
    });

    this.dataService.getAllCards({Approved: true}).subscribe((response) => {
      this.cards = response.Cards;
    });

    this.dataService.getStudentList().subscribe(response => {
      this.studentList = response;
    })
  }

  chooseCard(collection, target) {
    //rarity

    let candidate = [];
    let rand, rarity;
    let candidate_card, pass=false;

    while(candidate.length==0) {
      rand = Math.floor(Math.random()*10);
      rarity = rand<2?'Rare':(rand<5?'Uncommon':'Common');


      collection.forEach((card_id) => {
        if(this.cards[this.getIndexOfCards(this.cards,card_id)].Rarity == rarity) candidate.push(card_id);
      });
    }


    while(!pass) {
      candidate_card = candidate[Math.floor(Math.random()*candidate.length)];

      if(target.indexOf(candidate_card)<0) {
        pass = true;
      } else {
        rand = Math.floor(Math.random()*5);
        if(rand < 2) {
          pass = true;
        } else if(rand < 4) {
          pass = false;
        } else {
          candidate = [];
          while(candidate.length==0) {
            rand = Math.floor(Math.random()*10);
            rarity = rand<2?'Rare':(rand<5?'Uncommon':'Common');


            collection.forEach((card_id) => {
              if(this.cards[this.getIndexOfCards(this.cards,card_id)].Rarity == rarity) candidate.push(card_id);
            });
          }

        }
      }
    }

    return candidate_card;

  }

  startGameClicked() {
  	if(confirm('Do you really want to start this game? It cannot be undone.')) {
      if(this.currentClass.Weeks == 1) {
        console.log(this.cards);
        this.currentClass.Collection = this.cards.map((card) => card._id);
        let max = this.currentClass.Collection.length;
        let cnt = 20;
        let pickup = [];
        while(cnt>0) {
          pickup.push(this.chooseCard(this.currentClass.Collection, pickup));
          cnt--;
        }
        this.currentClass.PickUp = pickup;
        this.currentClass.Players = this.currentClass.Students.map((player) => {

          let collection = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(20, max)).map((card) => card);

          //let stack = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(10, max)).map((card) => card);
          let cnt = 15;
          let stack = [];
          while(cnt>0) {
            stack.push(this.chooseCard(collection, stack));
            cnt--;
          }

          //let hand = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(5, max)).map((card) => card);
          let hand = stack.splice(0,5);

          return {
            Collection: collection,
            Stack: stack,
            Hand: hand,
            Gold: 0,
            Point: 0,
            Player: player
          };
        });
        // this.currentClass.Players = this.currentClass.Students.map((player) => {
          // let collection = this.shuffle(this.currentClass.Collection).slice(0,20).map((card) => card);
          // let stack = this.shuffle(this.currentClass.Collection).slice(0,10).map((card) => card);
          // let hand = this.shuffle(this.currentClass.collection).slice(0,5).map((card) => card);
        //   return {
        //     Collection: [], //collection,
        //     Stack: [], //stack,
        //     Hand: [], //hand,
        //     Gold: 0,
        //     Point: 0,
        //     Player: player
        //   };
        // });
        console.log(this.currentClass);
      }
	  	this.dataService.updateClassInfo({_id: this.currentClass._id, Status: 'Started', Players: this.currentClass.Players, PickUp: this.currentClass.PickUp, Collection: this.currentClass.Collection}).subscribe((response) => {
	  		this.currentClass.Status = response.Class.Status;

        this.dataService.setCurrentClass(this.currentClass);
	  		if(this.currentClass.Weeks == 1) {
	  			//this.dataService.createGame({game_id: this.currentClass._id}).subscribe((response) => '');
	  		}
  		});
	  }
  }
  stopGameClicked() {
  	if(confirm('Do you really want to stop this game? It cannot be resumed!')) {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        
        this.dataService.updateClassInfo({_id: this.currentClass._id, Status: 'Stopped'}).subscribe((response) => {
          this.currentClass = response.Class;
          this.dataService.setCurrentClass(this.currentClass);
        });
      });
	  }
  }
  rollCallClicked() {
  	if(confirm('Did you check everything before going to next week?')) {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        this.currentClass.Weeks += 1;
        this.currentClass.Status = 'RollCall';

        this.currentClass.Players.forEach((Player, i) => {
          if(Player.Hand.length<5) {
            let cnt = 5-Player.Hand.length;
            Player.Hand = Player.Hand.concat(Player.Stack.splice(0,cnt));
            while(cnt>0) {
              Player.Stack.push(this.chooseCard(Player.Collection, Player.Stack));
              cnt--;
            }
            this.currentClass.Players[i]=Player;
          }
        });
        
        this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players, Status: this.currentClass.Status, Weeks: this.currentClass.Weeks}).subscribe((response) => {
          this.currentClass = response.Class;
          this.dataService.setCurrentClass(this.currentClass);
        });
      });
  	}
  }
}
