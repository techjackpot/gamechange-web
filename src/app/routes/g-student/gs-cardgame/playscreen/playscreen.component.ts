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
  selectedCardMarkTypeTargets = ['','','','',''];

  timer = null;

  currentPlayer = null;

  historyCardsAgainstMe = [];
  historyCardsByMe = [];

  markHistory = [];
  marktypes = [];
  Groups = [];

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

    let p4 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({_id: this.GameID}).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      })
    })
    let p5 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.GameID }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    })

    Promise.all([p1, p2, p3, p4, p5]).then(() => {
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

        this.dataService.getStudentFriends({ student_id: this.me._id }).subscribe( (response) => {
          this.list_friends = response.Friends.filter((friend_connection) => {
            return friend_connection.Approved;
          }).map((fc) => {
            return fc.From._id==this.me._id?fc.To._id:fc.From._id;
          }).filter((friend) => {
            return this.currentGame.Students.indexOf(friend)>=0;
          });
        });

        this.updateCardHistory();
      });
    }, 1000*10);

  }

  loadCurrentGameStatus() {
    let p1 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentGame._id}).subscribe(response => {
        this.currentGame = response.Class;
        resolve();
      });
    });

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({ Class: this.currentGame._id }).subscribe( response => {
        this.markHistory = response.MarkHistory;
        resolve();
      });
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({_id: this.currentGame._id}).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      })
    })

    return Promise.all([p1, p2, p3]);
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

  getMultiplierValue(multipliers) {
    return multipliers.reduce((sum, multiplier) => sum+multiplier.Value, 0);
  }

  getGroupTotalPoints(group) {
    if(this.currentGame.Players.length == 0) return 0;
    return group.Students.reduce((sum, student) => sum+this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Point, 0);
  }
  getGroupTotalGold(group) {
    if(this.currentGame.Players.length == 0) return 0;
    return group.Students.reduce((sum, student) => sum+this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Gold, 0);
  }
  getGroupTotalMarks(group) {
    if(this.currentGame.Players.length == 0) return 0;
    return group.Students.reduce((total, student) => total+this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0), 0);
  }

  getHighestMarkPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.markHistory.filter((markhistory) => markhistory.Student==r).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) > this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) ? r : student, this.me._id)
  }
  getLowestMarkPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.markHistory.filter((markhistory) => markhistory.Student==r).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) < this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) ? r : student, this.me._id)
  }
  getHighestGoldPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Gold > this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Gold ? r : student, this.me._id)
  }
  getLowestGoldPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Gold < this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Gold ? r : student, this.me._id)
  }
  getHighestPointsPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Point > this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Point ? r : student, this.me._id)
  }
  getLowestPointsPlayer() {
    return this.currentGame.Students.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Point < this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Point ? r : student, this.me._id)
  }
  getHighestMarkGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalMarks(r) > this.getGroupTotalMarks(group) ? r : group, this.Groups[0])
  }
  getLowestMarkGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalMarks(r) < this.getGroupTotalMarks(group) ? r : group, this.Groups[0])
  }
  getHighestGoldGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalGold(r) > this.getGroupTotalGold(group) ? r : group, this.Groups[0])
  }
  getLowestGoldGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalGold(r) < this.getGroupTotalGold(group) ? r : group, this.Groups[0])
  }
  getHighestPointsGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalPoints(r) > this.getGroupTotalPoints(group) ? r : group, this.Groups[0])
  }
  getLowestPointsGroup() {
    return this.Groups.reduce((r, group) => this.getGroupTotalPoints(r) < this.getGroupTotalPoints(group) ? r : group, this.Groups[0])
  }
  getHighestMarkFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.markHistory.filter((markhistory) => markhistory.Student==r).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) > this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) ? r : student, this.list_friends[0])
  }
  getLowestMarkFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.markHistory.filter((markhistory) => markhistory.Student==r).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) < this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0) ? r : student, this.me._id)
  }
  getHighestGoldFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Gold > this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Gold ? r : student, this.me._id)
  }
  getLowestGoldFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Gold < this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Gold ? r : student, this.me._id)
  }
  getHighestPointsFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Point > this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Point ? r : student, this.me._id)
  }
  getLowestPointsFriend() {
    if(this.list_friends.length == 0) return null;
    return this.list_friends.reduce((r, student) => this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, r)].Point < this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, student)].Point ? r : student, this.me._id)
  }

  resetSelectedCardTargets() {
    this.selectedCardTargets = [[],[],[],[],[]];
    this.selectedCardMarkTypeTargets = ['','','','',''];
    if(this.selectedCard) {
      this.selectedCard.Actions.forEach((action, i) => {
        let friend = null;
        switch(action.Target) {
          case 'Self':
            this.selectedCardTargets[i].push(this.me._id);
            break;
          case 'Highest Mark Player':
            this.selectedCardTargets[i].push(this.getHighestMarkPlayer());
            break;
          case 'Lowest Mark Player':
            this.selectedCardTargets[i].push(this.getLowestMarkPlayer());
            break;
          case 'Highest Gold Player':
            this.selectedCardTargets[i].push(this.getHighestGoldPlayer());
            break;
          case 'Lowest Gold Player':
            this.selectedCardTargets[i].push(this.getLowestGoldPlayer());
            break;
          case 'Highest Points Player':
            this.selectedCardTargets[i].push(this.getHighestPointsPlayer());
            break;
          case 'Lowest Points Player':
            this.selectedCardTargets[i].push(this.getLowestPointsPlayer());
            break;
          case 'Highest Mark Group':
            this.selectedCardTargets[i].push(...this.getHighestMarkGroup().Students);
            break;
          case 'Lowest Mark Group':
            this.selectedCardTargets[i].push(...this.getLowestMarkGroup().Students);
            break;
          case 'Highest Gold Group':
            this.selectedCardTargets[i].push(...this.getHighestGoldGroup().Students);
            break;
          case 'Lowest Gold Group':
            this.selectedCardTargets[i].push(...this.getLowestGoldGroup().Students);
            break;
          case 'Highest Points Group':
            this.selectedCardTargets[i].push(...this.getHighestPointsGroup().Students);
            break;
          case 'Lowest Points Group':
            this.selectedCardTargets[i].push(...this.getLowestPointsGroup().Students);
            break;
          case 'Highest Mark Friend':
            if(friend = this.getHighestMarkFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Lowest Mark Friend':
            if(friend = this.getLowestMarkFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Highest Gold Friend':
            if(friend = this.getHighestGoldFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Lowest Gold Friend':
            if(friend = this.getLowestGoldFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Highest Points Friend':
            if(friend = this.getHighestPointsFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Lowest Points Friend':
            if(friend = this.getLowestPointsFriend()) {
              this.selectedCardTargets[i].push(friend);
            }
            break;
          case 'Previous':
            this.selectedCardTargets[i].push(...this.selectedCardTargets[i-1]);
            break;
          default:
            break;
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



    this.loadCurrentGameStatus().then(() => {
      console.log(this.currentGame);
      this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.splice(this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.indexOf(card_id), 1);

      let total_targets = [], total_targets_left = [];
      let unresolved = card.Actions.length, auto_progress = true, delay = 0, repeat = 0, start_at = 0;

      let applied = [];

      card.Actions.forEach((action, i) => {
        console.log(i, action);
        //"Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"

        switch(action.Keyword) {
          case "Add Points":
          case "Subtract Points":
          case "Add Gold":
          case "Subtract Gold":
          case "Add Cards":
          case "Subtract Cards":
          case "Defend Negative":
          case "Add Friend":
            break;
          case "Persist":
            repeat = action.KeywordValue-1;
            start_at = i;
            break;
          case "Activation Time":
            delay = action.KeywordValue;
            auto_progress = false;
            break;
          default:
            auto_progress = false;
            break;
        }

        // console.log(this.selectedCardTargets[i].slice()); ['a','b'] => [{Player:'a', confirm:true}, {Player:'b' ]}]
        let targets = this.selectedCardTargets[i].slice();//.map((player_id) => { return { Player: player_id, Confirmed: auto_progress }; });
        let targets_left = this.selectedCardTargets[i].slice();
        // console.log(targets);


        if(targets.length==0) {
          auto_progress = true;
        }

        let applied_value = 0;

        if(auto_progress) {
          unresolved--;

          targets.forEach((target) => {

            let player_id = target;//target.Player;
            let player = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)];

            let bonus = { Point: 0, Gold: 0, Cards: 0, Defence: 0, AddFriend: false };

            let rValue = 0;
            switch(action.Keyword) {
              case "Add Points":
              case "Subtract Points":
                rValue = player.Point;
                break;
              case "Add Gold":
              case "Subtract Gold":
                rValue = player.Gold;
                break;
              default:
                rValue = action.KeywordValue;
                break;
            }
            console.log(player, rValue);
            switch(action.ValueType) {
              case 'All':
                // rValue *= action.ValueMultiple / action.ValueDivide;
                break;
              case 'Percentage':
                rValue *= action.KeywordValue / 100;
                break;
              case 'Any':
                rValue = action.KeywordValue;
                break;
              case 'Previous':
                rValue = applied[i-1].Value;
                break;
            }
            rValue *= action.ValueMultiple / action.ValueDivide;
            console.log(player, rValue);

            switch(action.Keyword) {
              case "Add Points":
                bonus.Point = rValue;
                break;
              case "Subtract Points":
                bonus.Point = -rValue;
                break;
              case "Add Gold":
                bonus.Gold = rValue;
                break;
              case "Subtract Gold":
                bonus.Gold = -rValue;
                break;
              case "Add Cards":
                bonus.Cards = rValue = action.KeywordValue;
                break;
              case "Subtract Cards":
                bonus.Cards = rValue = -action.KeywordValue;
                break;
              case "Defend Negative":
                bonus.Defence = rValue = action.KeywordValue;
                break;
              case "Add Friend":
                bonus.AddFriend = true;
                break;
              default:
                break;
            }

            console.log(bonus);

            applied_value = rValue;

            if(bonus.AddFriend) {
              this.dataService.buildFriendConnection({ from: this.me._id, to: player_id }).subscribe((response) => {
                this.list_friends.push(player_id);
              });
            }

            if(player.Defence>0 && (bonus.Point<0 || bonus.Gold<0 || bonus.Cards<0)) {
              player.Defence --;
              bonus.Point = 0;
              bonus.Gold = 0;
              bonus.Cards = 0;
            }
            player.Point += bonus.Point>0?(bonus.Point + bonus.Point * player.Multiplier.reduce((sum, multiplier) => sum+multiplier.Value, 0)):bonus.Point;
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
            
            targets_left.splice(targets_left.indexOf(target),1);
            this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)] = player;
          })
        }

        total_targets.push(targets);
        total_targets_left.push(targets_left);
        applied.push({Targets: targets, Value: applied_value});
      });

      this.currentGame.CardHistory.push({
        Source: this.me._id,
        Target: total_targets,
        TargetLeft: total_targets_left,
        Applied: applied,
        SpecificMarkTypes: this.selectedCardMarkTypeTargets,
        Card: card_id,
        UnResolved: unresolved,
        Delay: delay,
        Repeat: repeat,
        StartAt: start_at,
        Week: this.currentGame.Weeks
      });

      this.dataService.updateClassInfo({_id: this.currentGame._id, Players: this.currentGame.Players, CardHistory: this.currentGame.CardHistory}).subscribe((response) => {
        // this.currentGame = response.Class;
      });

      this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];

      this.updateCardHistory();
    });
  }
  onClickedPickUp(card_id) {
    let card = this.getCardByCardId(card_id);

    if(this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Gold < card.GoldCost) {
      alert(`You don't have enough gold to buy this card`);
      return false;
    }

    if(!confirm("Do you really want to buy this card? It costs Gold " + card.GoldCost + ".")) return ;


    this.loadCurrentGameStatus().then(() => {
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
    });
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

  
  getCondition_Target(action) {
    return action.Keyword!='' && action.Keyword!='Persist' && action.Keyword!='Activation Time'  && action.Keyword!='Defend Negative' && action.Keyword!='Add Friend';
  }
  getCondition_TargetValue(action) {
    if(action.Keyword=='Add Friend') return true;
    return action.Keyword!='' && action.Target!='' && (action.Target=='Friends' || action.Target=='Others');
  }
  getCondition_ValueType(action) {
    if(action.Keyword=='Any Mark' || action.Keyword=='Specific Mark' || action.Keyword=='Any Title' || action.Keyword=='Any Background' || action.Keyword=='Any Points Value Over' || action.Keyword=='Any Points Value Under' || action.Keyword=='Any Gold Value Over' || action.Keyword=='Any Gold Value Under') return false;
    return action.Keyword!='' && action.Keyword!='Persist' && action.Keyword!='Activation Time' && action.Keyword!='Defend Negative' && action.Keyword!='Perform Action' && action.Keyword!='Add Cards' && action.Keyword!='Subtract Cards' && action.Target!='';
  }
  getCondition_KeywordValue(action) {
    if(action.Keyword=='Any Title' || action.Keyword=='Any Background') return false;
    return action.Keyword!='' && ((action.Target!='' && (action.ValueType=='Any' || action.ValueType=='Percentage')) || (action.Keyword=='Defend Negative' || action.Keyword=='Persist' || action.Keyword=='Activation Time'));
  }
  getCondition_Description(action) {
    return action.Keyword=='Perform Action';
  }
  getCondition_ValueMultiple(action) {
    return action.ValueType=='All' || action.ValueType=='Previous';
  }
  getCondition_ValueDivide(action) {
    return action.ValueType=='All' || action.ValueType=='Previous';
  }
}
