import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roll-call',
  templateUrl: './roll-call.component.html',
  styleUrls: ['./roll-call.component.scss']
})


export class RollCallComponent implements OnInit {

  currentClass = null;
  me = null;
  cards = [];
  studentList = [];
  marktypes = [];
  studentBook = [];
  loading = '';
  selectedBonusPlayer = null;
  playerBonusSet = { Card: null, Point: 0, Gold: 0 };
  week_numbers = [];
  week_studentbook = 1;

  loaded_cnt = 0;
  loaded() {
    if(this.loaded_cnt>=3) {
      return true;
    }
    return false;
  }

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) { }


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

  getIndexOfMarkHistory(markhistory, student_id) {
    let index = -1;
    markhistory.forEach((history, i) => {
      if(history.Student == student_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfMark(marks, marktype) {
    let index = -1;
    marks.forEach((mark, i) => {
      if(mark.MarkType == marktype) {
        index = i;
      }
    });
    return index;
  }

  updateCurrentStudentBook() {
    this.dataService.getStudentBook({ Class: this.currentClass._id, Week: this.week_studentbook}).subscribe((response) => {
      this.studentBook = this.currentClass.Students.map((student) => {
        let index = this.getIndexOfMarkHistory(response.MarkHistory, student);
        if(index<0) {
          return {
            Class: this.currentClass._id,
            Staff: this.me._id,
            Week: this.week_studentbook,
            Student: student,
            Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
            Attendance: false,
            Date: new Date().toJSON(),
            Note: ''
          };
        } else {
          return response.MarkHistory[index];
        }
      });
    })
  }
  updateStudentBook() {
    this.loading = '...';
    this.dataService.updateStudentBook({ data: this.studentBook }).subscribe((response) => {
      this.studentBook = response.MarkHistory;
      this.loading = '';
    })
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
    this.me = this.authService.getUser();
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
      this.marktypes = response.MarkTypes;

      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;

        for(let i=1;i<=this.currentClass.Weeks;i++) {
          this.week_numbers.push(i);
        }
        this.week_studentbook = this.currentClass.Weeks;
        // this.week_numbers = Array(this.currentClass.Weeks).fill().map((x,i)=>i+1);

        // console.log(this.currentClass);

        this.updateCurrentStudentBook();
        this.loaded_cnt++;
      });
    });

    this.dataService.getAllCards({Approved: true}).subscribe((response) => {
      this.cards = response.Cards;
      this.loaded_cnt++;
    });

    this.dataService.getStudentList().subscribe(response => {
      this.studentList = response;
      this.loaded_cnt++;
    });

  }

  chooseCard(collection, target) {
    if(collection.length == 0) return null;

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
        this.currentClass.Collection = this.cards.map((card) => card._id);
        let max = this.currentClass.Collection.length;
        let cnt = 20;
        let pickup = [];
        if(this.currentClass.Collection.length>0) {
          while(cnt>0) {
            pickup.push(this.chooseCard(this.currentClass.Collection, pickup));
            cnt--;
          }
        }
        this.currentClass.PickUp = pickup;
        this.currentClass.Players = this.currentClass.Students.map((player) => {

          let collection = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(this.currentClass.Player_CollectionSize, max)).map((card) => card);

          //let stack = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(10, max)).map((card) => card);
          let cnt = this.currentClass.Player_StackSize + this.currentClass.Player_HandSize;
          let stack = [];
          while(cnt>0) {
            let t_card = this.chooseCard(collection, stack);
            if(t_card) {
              stack.push(t_card);
            }
            cnt--;
          }

          //let hand = (this.shuffle(this.currentClass.Collection)).slice(0,this.min(5, max)).map((card) => card);
          let hand = stack.splice(0,this.currentClass.Player_HandSize);

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
        // console.log(this.currentClass);
      }
	  	this.dataService.updateClassInfo({_id: this.currentClass._id, Status: 'Started', Players: this.currentClass.Players, PickUp: this.currentClass.PickUp, Collection: this.currentClass.Collection, Player_CollectionSize: this.currentClass.Player_CollectionSize, Player_StackSize: this.currentClass.Player_StackSize, Player_HandSize: this.currentClass.Player_HandSize}).subscribe((response) => {
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
        this.currentClass.Weeks ++;
        this.week_numbers.push(this.currentClass.Weeks);
        this.week_studentbook = this.currentClass.Weeks;
        this.currentClass.Status = 'RollCall';

        this.currentClass.Players.forEach((Player, i) => {
          if(Player.Hand.length<this.currentClass.Player_HandSize) {
            let cnt = 1;//5-Player.Hand.length;
            Player.Hand = Player.Hand.concat(Player.Stack.splice(0,cnt));
            if(Player.Collection.length>0) {
              while(Player.Stack.length<this.currentClass.Player_StackSize) {
                Player.Stack.push(this.chooseCard(Player.Collection, Player.Stack));
              }
            }
            this.currentClass.Players[i]=Player;
          }
        });
        
        this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players, Status: this.currentClass.Status, Weeks: this.currentClass.Weeks}).subscribe((response) => {
          this.currentClass = response.Class;
          this.dataService.setCurrentClass(this.currentClass);

          this.updateCurrentStudentBook();
        });
      });
  	}
  }


  getIndexOfPlayers(players, player_id) {
    let index = -1;
    players.forEach((player, i) => {
      if(player.Player == player_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfHistory(historys, history_id) {
    let index = -1;
    historys.forEach((history, i) => {
      if(history._id == history_id) {
        index = i;
      }
    });
    return index;
  }

  confirmCardAction(history) {
    if(confirm('Do you confirm this action?')) {
      let card = this.cards[this.getIndexOfCards(this.cards, history.Card)];

      let auto_progress = true, unresolved = history.UnResolved;
      
      card.Actions.forEach((action, i) => {
        if(i<card.Actions.length-unresolved) {
          return true;
        }
        //"Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"
        let bonus = { Point: 0, Gold: 0, Cards: 0 };
        switch(action.Keyword) {
          case "Add Points":
            bonus.Point = action.KeywordValue;
            break;
          case "Subtract Points":
            bonus.Point = -action.KeywordValue;
            break;
          case "Add Gold":
            bonus.Gold = action.KeywordValue;
            break;
          case "Subtract Gold":
            bonus.Gold = -action.KeywordValue;
            break;
          case "Add Cards":
            bonus.Cards = action.KeywordValue;
            break;
          case "Subtract Cards":
            bonus.Cards = -action.KeywordValue;
            break;
          default:
            auto_progress = false;
            break;
        }
        if(i==card.Actions.length-unresolved) {
          auto_progress = true;
        }
        if(auto_progress) {
          let targets = history.Target[history.Target.length-history.UnResolved];

          history.UnResolved--;

          // let targets = [];
          // switch(action.Target) {
          //   case "Self":
          //     targets.push(history.Source);
          //     break;
          //   case "Friends":
          //   case "Others":
          //     targets = (this.shuffle(this.currentClass.Students.filter((student) => student!=history.Source))).slice(0,action.TargetValue);
          //     break;
          //   default:
          //     break;
          // }

          // history.Target.push(targets);


          targets.forEach((player_id) => {
            let player = this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)];
            player.Point += bonus.Point;
            player.Gold += bonus.Gold;

            if(bonus.Cards>0) {
              player.Stack.splice(0,bonus.Cards).forEach((card_id) => {
                player.Hand.push(card_id);
              })
              if(player.Collection.length>0) {
                while(player.Stack.length<this.currentClass.Player_StackSize) {
                  player.Stack.push(this.chooseCard(player.Collection, player.Stack));
                }
              }
            } else if(bonus.Cards<0) {
              let cnt = bonus.Cards;
              while(player.Hand.length>=0 && cnt>0) {
                player.Hand.splice(Math.floor(Math.random()*player.Hand.length),1);
                cnt--;
              }
            }

            this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)] = player;
          })
        }
      });

      // total_targets.forEach((target) => {
      //   this.currentGame.CardHistory.push({
      //     Source: this.me._id,
      //     Target: target,
      //     Card: card_id,
      //     Resolved: false
      //   })
      // })
      this.currentClass.CardHistory[this.getIndexOfHistory(this.currentClass.CardHistory, history._id)] = history;

      this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players, CardHistory: this.currentClass.CardHistory}).subscribe((response) => {
        // console.log(response.Class);
      });
    }
  }
  denyCardAction(history) {
    if(confirm('Do you decline this action?')) {
      history.UnResolved = 0;
      this.currentClass.CardHistory[this.getIndexOfHistory(this.currentClass.CardHistory, history._id)] = history;
      this.dataService.updateClassInfo({_id: this.currentClass._id, CardHistory: this.currentClass.CardHistory}).subscribe((response) => {
        // console.log(response.Class);
      });
    }
  }

  resetBonusSet() {
    this.playerBonusSet = { Card: null, Point: 0, Gold: 0 };
  }
  choosePlayerToGiveBonus(student_id) {
    if(this.selectedBonusPlayer == student_id) {
      this.selectedBonusPlayer = null;
    } else {
      this.selectedBonusPlayer = student_id;
    }
    this.resetBonusSet();
  }
  selectedPlayerBonusCard(card_id) {
    this.playerBonusSet.Card = card_id;
  }
  givePlayerBonusSet() {
    if(this.playerBonusSet.Card) {
      this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Hand.push(this.playerBonusSet.Card);
    }
    this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Point += this.playerBonusSet.Point;
    this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Gold += this.playerBonusSet.Gold;

    this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players}).subscribe((response) => {
    });

    this.selectedBonusPlayer = null;
    this.resetBonusSet();
  }
}
