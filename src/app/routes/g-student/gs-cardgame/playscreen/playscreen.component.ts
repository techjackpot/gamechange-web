import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-playscreen',
  templateUrl: './playscreen.component.html',
  styleUrls: ['./playscreen.component.scss']
})
export class PlayscreenComponent implements OnInit {

	GameID = null;
  currentGame = null;
  cards = null;
  me = null;

  list_friends = [];
  list_others = [];

  studentList = [];

  selectedCard = null;
  selectedCardTargets = [[],[],[],[],[]];

  timer = null;

  currentPlayer = null;

  historyCardsAgainstMe = [];
  historyCardsByMe = [];

  loaded = false;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
  	this.GameID = this.route.params["_value"].game_id;
    this.me = this.authService.getUser();


    let p1 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.GameID}).subscribe(response => {
        this.currentGame = response.Class;
        this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];

        this.list_others = this.currentGame.Students.slice();
        this.list_others.splice(this.list_others.indexOf(this.me._id), 1);
        resolve();
      });
    });
    let p2 = new Promise((resolve, reject) => {
      this.dataService.getAllCards({Approved: true}).subscribe(response => {
        this.cards = response.Cards;
        resolve();
      })
    });

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response;
        resolve();
      });
    });

    Promise.all([p1, p2, p3]).then(() => {
      this.updateCardHistory();

      this.dataService.getStudentFriends({ student_id: this.me._id }).subscribe( (response) => {
        this.list_friends = response.Friends.filter((friend_connection) => {
          return friend_connection.Approved;
        }).map((fc) => {
          return fc.From._id==this.me._id?fc.To._id:fc.From._id;
        }).filter((friend) => {
          return this.currentGame.Students.indexOf(friend)>=0;
        });

        this.loaded = true;
      });
        // console.log(this.cards, this.currentGame, this.currentPlayer);
    })

    this.timer = setInterval(() => {
      this.dataService.getGameInfo({_id: this.GameID}).subscribe(response => {
        this.currentGame = response.Class;
        this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];

        this.updateCardHistory();
      });
    }, 1000*10);

  }

  array_diff(a, b) {
      return a.filter(function(i) {return b.indexOf(i) < 0;});
  }

  updateCardHistory() {
    this.historyCardsByMe = this.currentGame.CardHistory.filter((history) => {
      return history.Source == this.me._id;
    }).map((history) => {
      return history.Card;
    });

    this.historyCardsAgainstMe = this.currentGame.CardHistory.filter((history) => {
      for(let i=0;i<this.cards[this.getIndexOfCards(this.cards,history.Card)].Actions.length-history.UnResolved;i++) {
        if(history.Target[i].indexOf(this.me._id)>=0 && this.cards[this.getIndexOfCards(this.cards,history.Card)].Actions[i].Target!='Self') {
          return true;
        }
      }
      return false;
    }).map((history) => {
      return history.Card;
    })
  }

  ngOnDestroy() {
    if(this.timer) {
      clearInterval(this.timer);
    }
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

  getIndexOfCards(cards,card_id) {
    let index = -1;
    cards.forEach((card, i) => {
      if(card._id == card_id) {
        index = i;
      }
    });
    return index;
  }

  getCardByCardId(card_id) {
    return this.cards[this.getIndexOfCards(this.cards, card_id)];
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

  getIndexOfStudents(students, student_id) {
    let index = -1;
    students.forEach((student, i) => {
      if(student._id == student_id) {
        index = i;
      }
    });
    return index;
  }

  getPlayerByID(player_id) {
    return this.studentList[this.getIndexOfStudents(this.studentList, player_id)];
  }

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

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

  resetSelectedCardTargets() {
    this.selectedCardTargets = [[],[],[],[],[]];
    if(this.selectedCard) {
      this.selectedCard.Actions.forEach((action, i) => {
        if(action.Target=='Self') {
          this.selectedCardTargets[i].push(this.me._id);
        }
      })
    }
  }

  onClickedHand(card_id) {
    this.selectedCard = this.getCardByCardId(card_id);
    this.resetSelectedCardTargets();
  }

  onClickedCardCancel() {
    this.selectedCard = null;
    this.resetSelectedCardTargets();
  }

  onClickedCardPlay() {
    let card = this.selectedCard;
    this.selectedCard = null;
    let card_id = card._id;
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.splice(this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.indexOf(card_id), 1);

    let total_targets = [];
    let unresolved = card.Actions.length, auto_progress = true;
    card.Actions.forEach((action, i) => {
      //"Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"
      let bonus = { Point: 0, Gold: 0, Cards: 0, Defence: 0 };
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
        case "Defend Negative":
          bonus.Defence = action.KeywordValue;
          break;
        case "Add Friend":
          break;
        default:
          auto_progress = false;
          break;
      }

      let targets = this.selectedCardTargets[i].slice();

      total_targets.push(targets);

      if(auto_progress) {
        unresolved--;

        targets.forEach((player_id) => {

          this.dataService.buildFriendConnection({ from: this.me._id, to: player_id }).subscribe((response) => {
            this.list_friends.push(player_id);
          });

          let player = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)];
          if(player.Defence>0 && (bonus.Point<0 || bonus.Gold<0 || bonus.Cards<0)) {
            player.Defence --;
            bonus.Point = 0;
            bonus.Gold = 0;
            bonus.Cards = 0;
          }
          player.Point += bonus.Point;
          player.Gold += bonus.Gold;
          player.Defence += bonus.Defence;

          if(bonus.Cards>0) {
            player.Stack.splice(0,bonus.Cards).forEach((card_id) => {
              player.Hand.push(card_id);
            })
            if(player.Collection.length>0) {
              while(player.Stack.length<this.currentGame.Player_StackSize) {
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

          this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)] = player;
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
    this.currentGame.CardHistory.push({
      Source: this.me._id,
      Target: total_targets,
      Card: card_id,
      UnResolved: unresolved,
      Week: this.currentGame.Weeks
    });

    this.dataService.updateClassInfo({_id: this.currentGame._id, Players: this.currentGame.Players, CardHistory: this.currentGame.CardHistory}).subscribe((response) => {
      // console.log(response.Class);
    });

    this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];

    this.updateCardHistory();
  }
  onClickedPickUp(card_id) {
    let card = this.getCardByCardId(card_id);

    if(this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Gold < card.GoldCost) {
      alert(`You don't have enough gold to buy this card`);
      return false;
    }

    if(!confirm("Do you really want to buy this card? It costs Gold " + card.GoldCost + ".")) return ;
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Stack.push(card_id);
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.push(card_id);
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Gold -= card.GoldCost;
    let exist = false;
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Collection.forEach((card) => {
      if(card==card_id) exist = true;
    });
    if(!exist) {
      this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Collection.push(card_id);
    }
    this.currentGame.PickUp.splice(this.currentGame.PickUp.indexOf(card_id),1,this.currentGame.Collection[Math.floor(Math.random()*this.currentGame.Collection.length)]);

    this.dataService.updateClassInfo({_id: this.currentGame._id, PickUp: this.currentGame.PickUp, Players: this.currentGame.Players}).subscribe((response) => {
      // console.log(response.Class);
    });
    
    this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];
  }

  chooseTargetsPerAction(action_index, player_id) {
    let exist = this.selectedCardTargets[action_index].indexOf(player_id);
    if(exist>=0) {
      this.selectedCardTargets[action_index].splice(exist, 1);
    } else {
      if(this.selectedCardTargets[action_index].length<this.selectedCard.Actions[action_index].TargetValue) {
        this.selectedCardTargets[action_index].push(player_id);
      }
    }
  }
  isTargetPerAction(action_index, player_id) {
    return this.selectedCardTargets[action_index].indexOf(player_id)>=0?true:false;
  }
}
