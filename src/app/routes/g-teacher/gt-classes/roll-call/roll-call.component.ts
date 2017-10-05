import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';

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
  markHistory = [];
  Groups = [];

  ownedTitles = [];
  ownedBackgrounds = [];

  leftCollectionCardList = [];
  selectedLeftCards = [];

  loaded = false;

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

  leftCollectionCards() {
    return this.cards.filter((card) => this.currentClass.Collection.indexOf(card._id)<0 ).map( card => card._id );
  }
  selectLeftCard(card_id) {
    let exist = this.selectedLeftCards.indexOf(card_id);
    if(exist>=0) {
      this.selectedLeftCards.splice(exist, 1);
    } else {
      this.selectedLeftCards.push(card_id);
    }
  }
  addCardsToCollection() {

    this.loadCurrentGameStatus().then(() => {
      this.currentClass.Collection = this.currentClass.Collection.concat(this.selectedLeftCards);
      this.leftCollectionCardList = this.leftCollectionCards();
      this.selectedLeftCards = [];
      this.dataService.updateClassInfo({_id: this.currentClass._id, Collection: this.currentClass.Collection}).subscribe((response) => {
        this.currentClass = response.Class;
      })
    });

  }
  array_diff(a, b) {
      return a.filter(function(i) {return b.indexOf(i) < 0;});
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
  getIndexOfMarkType(marktypes, marktype) {
    let index = -1;
    marktypes.forEach((_marktype, i) => {
      if(_marktype._id == marktype) {
        index = i;
      }
    });
    return index;
  }

  updateCurrentStudentBook() {
    this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe((response) => {
      this.markHistory = response.MarkHistory;
      let currentWeekHistory = this.markHistory.filter((history) => history.Week==this.week_studentbook);
      this.studentBook = this.currentClass.Students.map((student) => {
        let index = this.getIndexOfMarkHistory(currentWeekHistory, student);
        if(index<0) {
          return {
            Class: this.currentClass._id,
            Staff: this.me._id,
            Week: this.week_studentbook,
            Student: student,
            Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
            Attendance: false,
            Explained: false,
            Date: new Date().toJSON(),
            Note: ''
          };
        } else {
          return currentWeekHistory[index];
        }
      });
    })
  }
  updateStudentBook() {
    this.loading = '...';
    this.dataService.updateStudentBook({ data: this.studentBook }).subscribe((response) => {
      this.studentBook = response.MarkHistory;
      this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe((response) => {
        this.markHistory = response.MarkHistory;
      });
      this.loading = '';
    })
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.me = this.authService.getUser();
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    let p1 = new Promise((resolve, reject) => {
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

          resolve();
        });
      });
    });
    let p2 = new Promise((resolve, reject) => {
      this.dataService.getAllCards({Approved: true}).subscribe((response) => {
        this.cards = response.Cards;

        resolve();
      });
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response;
        // console.log(this.studentList);

        resolve();
      });
    });

    let p4 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({_id: this.currentClass._id}).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      })
    })

    let p5 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemTitles({}).subscribe((response) => {
        this.ownedTitles = response.OwnedTitles;
        resolve();
      });
    })

    let p6 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemBackgrounds({}).subscribe((response) => {
        this.ownedBackgrounds = response.OwnedBackgrounds;
        resolve();
      });
    })

    let p7 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe( response => {
        this.markHistory = response.MarkHistory;
        resolve();
      });
    })


    Promise.all([p1, p2, p3, p4, p5, p6, p7]).then(() => {
      this.leftCollectionCardList = this.leftCollectionCards();
      this.loaded = true;
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
        let cnt = this.currentClass.Player_PickupPileSize;
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
            Player: player,
            Multiplier: this.marktypes.map((marktype) => {
              return {
                MarkType: marktype._id,
                Continuous: 0,
                Value: 0
              }
            })
          };
        });

        this.leftCollectionCardList = this.leftCollectionCards();

      } else {
        this.currentClass.CardHistory.forEach((history, i) => {
          if(history.UnResolved==0) {
            if(history.Repeat>0) {
              history.UnResolved = history.Target.length - history.StartAt;
              history.Repeat --;
            } else {
              return;
            }
          }
          let card = this.cards[this.getIndexOfCards(this.cards,history.Card)];

          let action_index = history.Target.length-history.UnResolved;

          if(card.Actions[action_index].Keyword=='Activation Time') {
            history.Delay --;
          }

          if(history.Delay==0) {
            history.UnResolved --;
            this.currentClass.CardHistory[this.getIndexOfHistory(this.currentClass.CardHistory, history._id)] = history;
            this.currentClass.CardHistory[i].TargetLeft[action_index] = [];
            this.currentClass.CardHistory[i].TargetLeft[action_index].length = 0;
            this._performCardActions(i, action_index);
          }
        });
      }
	  	this.dataService.updateClassInfo({_id: this.currentClass._id, Status: 'Started', CardHistory: this.currentClass.CardHistory, Players: this.currentClass.Players, PickUp: this.currentClass.PickUp, Collection: this.currentClass.Collection, Player_PickupPileSize: this.currentClass.Player_PickupPileSize, Player_CollectionSize: this.currentClass.Player_CollectionSize, Player_StackSize: this.currentClass.Player_StackSize, Player_HandSize: this.currentClass.Player_HandSize}).subscribe((response) => {
	  		// this.currentClass.Status = response.Class.Status;
        this.currentClass = response.Class;

        this.dataService.setCurrentClass(this.currentClass);
	  		if(this.currentClass.Weeks == 1) {
	  			//this.dataService.createGame({game_id: this.currentClass._id}).subscribe((response) => '');
	  		}
  		});
	  }
  }
  stopGameClicked() {
  	if(confirm('Do you really want to stop this game? It cannot be resumed!')) {
      // this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        // this.currentClass = response.Class;
        
      this.loadCurrentGameStatus().then(() => {
        this.dataService.updateClassInfo({_id: this.currentClass._id, Status: 'Stopped'}).subscribe((response) => {
          this.currentClass = response.Class;
          this.dataService.setCurrentClass(this.currentClass);
        });
      });
	  }
  }
  rollCallClicked() {
  	if(confirm('Did you check everything before going to next week?')) {
      this.dataService.getStudentBook({ Class: this.currentClass._id, Week: this.currentClass.Weeks }).subscribe((m_response) => {
        let markHistory = m_response.MarkHistory;
        this.loadCurrentGameStatus().then(() => {
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
            }
            while(Player.Hand.length > this.currentClass.Player_HandSize) {
              Player.Hand.splice(Math.floor(Math.random()*Player.Hand.length),1);
            }
            if(this.getIndexOfMarkHistory(markHistory, Player.Player)>=0) {
              markHistory[this.getIndexOfMarkHistory(markHistory, Player.Player)].Marks.forEach((mark, ii) => {
                Player.Gold += mark.Value;
                if(mark.Value < this.marktypes[this.getIndexOfMarkType(this.marktypes, mark.MarkType)].MinValue) {
                  Player.Multiplier[this.getIndexOfMark(Player.Multiplier, mark.MarkType)].Continuous = 0;
                  Player.Multiplier[this.getIndexOfMark(Player.Multiplier, mark.MarkType)].Value = 0;
                } else {
                  if(++Player.Multiplier[this.getIndexOfMark(Player.Multiplier, mark.MarkType)].Continuous >= this.marktypes[this.getIndexOfMarkType(this.marktypes, mark.MarkType)].Weeks) {
                    Player.Multiplier[this.getIndexOfMark(Player.Multiplier, mark.MarkType)].Value = this.marktypes[this.getIndexOfMarkType(this.marktypes, mark.MarkType)].Multiplier;
                  }
                }
              });
            }
            this.currentClass.Players[i]=Player;
          });


          this.currentClass.CardHistory.forEach((history, i) => {

            if(history.UnResolved==0) {
              if(history.Repeat>0) {
              } else {
                return;
              }
            }

            while(this.currentClass.CardHistory[i].UnResolved > 0) {
              // console.log(this.currentClass.CardHistory[i].UnResolved);
              let history = this.currentClass.CardHistory[i];
              let card = this.cards[this.getIndexOfCards(this.cards,history.Card)];
              let action_index = history.Target.length-history.UnResolved;
              let action = card.Actions[action_index];
              let auto_progress = true;

              if(this.checkCondition_ConditionKeywords(action.Keyword)) {

                let confirmed = false;
                switch(action.Keyword) {
                  case "Any Mark":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks.some((mark) => mark.Value==action.KeywordValue))
                    break;
                  // case "Specific Mark":
                    // if(history.SpecificMarkTypes[action_index]=='') {
                    //   confirmed = false;
                    // } else {
                    //   confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks.filter((mark) => mark.MarkType==history.SpecificMarkTypes[action_index]).every((mark) => mark.Value==action.KeywordValue))
                    // }
                    // break;
                  case "Any Mark Over":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks.some((mark) => mark.Value>=action.KeywordValue))
                    break;
                  case "Any Mark Under":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks.some((mark) => mark.Value<=action.KeywordValue))
                    break;
                  case "Specific Mark1":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[0].Value==action.KeywordValue)
                    break;
                  case "Specific Mark1 Over":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[0].Value>=action.KeywordValue)
                    break;
                  case "Specific Mark1 Under":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[0].Value<=action.KeywordValue)
                    break;
                  case "Specific Mark2":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[1].Value==action.KeywordValue)
                    break;
                  case "Specific Mark2 Over":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[1].Value>=action.KeywordValue)
                    break;
                  case "Specific Mark2 Under":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[1].Value<=action.KeywordValue)
                    break;
                  case "Specific Mark3":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[2].Value==action.KeywordValue)
                    break;
                  case "Specific Mark3 Over":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[2].Value>=action.KeywordValue)
                    break;
                  case "Specific Mark3 Under":
                    confirmed = history.Target[action_index].every((player_id) => markHistory[this.getIndexOfMarkHistory(markHistory, player_id)].Marks[2].Value<=action.KeywordValue)
                    break;
                  case "Any Title":
                    confirmed = history.Target[action_index].every((player_id) => this.ownedTitles.some((title) => title.Student==player_id))
                    break;
                  case "Any Background":
                    confirmed = history.Target[action_index].every((player_id) => this.ownedBackgrounds.some((background) => background.Student==player_id))
                    break;
                  case "Any Point":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Point == action.KeywordValue)
                    break;
                  case "Any Points Value Over":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Point >= action.KeywordValue)
                    break;
                  case "Any Points Value Under":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Point <= action.KeywordValue)
                    break;
                  case "Any Gold":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Gold == action.KeywordValue)
                    break;
                  case "Any Gold Value Over":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Gold >= action.KeywordValue)
                    break;
                  case "Any Gold Value Under":
                    confirmed = history.Target[action_index].every((player_id) => this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Gold <= action.KeywordValue)
                    break;
                  default:
                    break;
                }
                if(confirmed) {
                  this.currentClass.CardHistory[i].TargetLeft[action_index] = [];
                  this.currentClass.CardHistory[i].TargetLeft[action_index].length = 0;
                  // console.log('this is conditional keyword', action_index, this.currentClass.CardHistory[i].UnResolved );
                  this._performCardActions(i, action_index);
                  this.currentClass.CardHistory[i].TargetLeft[action_index] = this.currentClass.CardHistory[i].Target[action_index].concat();
                  // console.log('done: this is conditional keyword', action_index, this.currentClass.CardHistory[i].UnResolved );
                } else {
                  // console.log('finding next action_index', action_index, this.currentClass.CardHistory[i].UnResolved );
                  while(++action_index<card.Actions.length && !this.checkCondition_ConditionKeywords(card.Actions[action_index].Keyword));
                  this.currentClass.CardHistory[i].UnResolved = history.Target.length - action_index;
                  // console.log('found next action_index', action_index, this.currentClass.CardHistory[i].UnResolved );
                }
              } else {
                // console.log('found next action_index', action_index, this.currentClass.CardHistory[i].UnResolved );
                break;
              }
            }

          });
          
          this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players, Status: this.currentClass.Status, CardHistory: this.currentClass.CardHistory, Weeks: this.currentClass.Weeks}).subscribe((response) => {
            this.currentClass = response.Class;
            this.dataService.setCurrentClass(this.currentClass);

            this.updateCurrentStudentBook();
          });
        });
      });
  	}
  }

  checkCondition_AnyMark(historyIndex, markHistory) {
    let history = this.currentClass.CardHistory[historyIndex];
    let card = this.cards[this.getIndexOfCards(this.cards,history.Card)];
    let action_index = history.Target.length-history.UnResolved;
    let action = card.Actions[action_index];



    return false;
  }

  viewPlayerProfile(student) {
    this.router.navigate(['/classes/spreadsheet', student]);
  }
  
  loadCurrentGameStatus() {
    let p1 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        resolve();
      });
    });


    let p3 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({_id: this.currentClass._id}).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      })
    })

    return Promise.all([p1, p3]);
    // return new Promise((resolve, reject) => {
    //   this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
    //     this.currentClass = response.Class;
    //     resolve();
    //   });
    // })
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
  getIndexOfPlayersID(players, player_id) {
    let index = -1;
    players.forEach((player, i) => {
      if(player._id == player_id) {
        index = i;
      }
    });
    return index;
  }
  getPlayerByID(player_id) {
    return this.studentList[this.getIndexOfPlayersID(this.studentList, player_id)];
  }

  exportStudentBookToCSV() {

    let data = this.currentClass.Students.map((student_id) => {

      return [
        this.studentList[this.getIndexOfUsers(this.studentList, student_id)].DisplayName,
        ...[
          ...this.markHistory.filter((history) => history.Student == student_id).sort((a,b) => a.Week-b.Week).map((history) => {
            return [
              history.Attendance==true?'√':'',
              ...history.Marks.map((mark) => mark.Value)
            ]
          })
        ]
      ]
    })


    data.unshift([
      '',
      ...[
        ...this.week_numbers.map((week) => {
          return [
            'Week ' + week,
            ...this.marktypes.map((marktype) => marktype.Name)
          ]
        })
      ]
    ])

    // console.log(data);

    let options = { 
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalseparator: '.',
        showLabels: false, 
        showTitle: false,
        useBom: true
      };

    let today = new Date();

    let title = this.currentClass.Name + '-' + (today.getFullYear() + '.' + (today.getMonth()+1) + '.' + today.getDay());

    new Angular2Csv(data, title, options);

  }


  _performCardActions(historyIndex, ActionTargetIndex) {

    let history = this.currentClass.CardHistory[historyIndex];

    if(history.TargetLeft[ActionTargetIndex].length==0) {

    /* do the rest action */
      let card = this.cards[this.getIndexOfCards(this.cards, history.Card)];

      let auto_progress = true, unresolved = history.UnResolved, delay = history.Delay, repeat = history.Repeat, start_at = history.StartAt;

      // console.log(history,ActionTargetIndex);

      card.Actions.every((action, i) => {
        if(i<card.Actions.length-unresolved) {
          return true;
        }

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
            // repeat = action.KeywordValue-1;
            // history.Repeat --;
            // start_at = i+1;
            break;
          case "Activation Time":
            auto_progress = false;
            break;
          default:
            auto_progress = false;
            break;
        }
        // console.log(i, auto_progress, action);

        // let applied_value = 0;

        if(i==card.Actions.length-unresolved && history.TargetLeft[i].length==0) {
          auto_progress = true;
        }

        if(auto_progress) {
          let targets = history.Target[history.Target.length-history.UnResolved];
          let targets_left = history.TargetLeft[history.Target.length-history.UnResolved];
          let applied = history.Applied;

          history.UnResolved--;
          unresolved = history.UnResolved;

          // console.log(targets, targets_left);
          // console.log(unresolved);

          targets.forEach((player_id) => {

            let player = this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)];

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
            // console.log(player, rValue);
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
            // console.log(player, rValue);

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

            // applied_value = rValue;
            history.Applied[i].Value = rValue;

            if(bonus.AddFriend) {
              this.dataService.buildFriendConnection({ from: this.me._id, to: player_id }).subscribe((response) => {});
            }

            if(player.Defence>0 && (bonus.Point<0 || bonus.Gold<0 || bonus.Cards<0)) {
              player.Defence --;
              bonus.Point = 0;
              bonus.Gold = 0;
              bonus.Cards = 0;
            }
            player.Point += bonus.Point>0?(bonus.Point + bonus.Point * player.Multiplier.reduce((sum, multiplier) => sum+multiplier.Value, 0)):bonus.Point;;
            player.Gold += bonus.Gold;
            player.Defence += bonus.Defence;

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
        return auto_progress;
      });
      this.currentClass.CardHistory[this.getIndexOfHistory(this.currentClass.CardHistory, history._id)] = history;
    }
  }

  confirmCardActionTarget(historyIndex, ActionTargetIndex, player_id) {
    if(!confirm('Are you sure do this action?')) {
      return ;
    }
    this.loadCurrentGameStatus().then(() => {
      this.currentClass.CardHistory[historyIndex].TargetLeft[ActionTargetIndex].splice(this.currentClass.CardHistory[historyIndex].TargetLeft[ActionTargetIndex].indexOf(player_id), 1);

      this._performCardActions(historyIndex, ActionTargetIndex);

      this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players, CardHistory: this.currentClass.CardHistory}).subscribe((response) => {
        this.currentClass = response.Class;
        // console.log(response.Class);
      });
      // this.dataService.updateClassInfo({_id: this.currentClass._id, CardHistory: this.currentClass.CardHistory}).subscribe((response) => {
      //   this.currentClass = response.Class;
      //   // console.log(response.Class);
      // });
    });
  }
  denyCardActionTarget(historyIndex, ActionTargetIndex, player_id) {
    this.confirmCardActionTarget(historyIndex, ActionTargetIndex, player_id);
  }
  denyCardAction(history) {
    if(confirm('Do you decline this action?')) {

      this.loadCurrentGameStatus().then(() => {
        history.UnResolved = 0;
        this.currentClass.CardHistory[this.getIndexOfHistory(this.currentClass.CardHistory, history._id)] = history;
        this.dataService.updateClassInfo({_id: this.currentClass._id, CardHistory: this.currentClass.CardHistory}).subscribe((response) => {
          // console.log(response.Class);
        });
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
  selectPlayerBonusCard(card_id) {
    this.playerBonusSet.Card = card_id;
  }
  givePlayerBonusSet() {
    this.loadCurrentGameStatus().then(() => {
      if(this.playerBonusSet.Card) {
        this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Hand.push(this.playerBonusSet.Card);
      }
      this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Point += this.playerBonusSet.Point;
      this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, this.selectedBonusPlayer)].Gold += this.playerBonusSet.Gold;

      this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players}).subscribe((response) => {
        this.currentClass = response.Class;
      });

      this.selectedBonusPlayer = null;
      this.resetBonusSet();
    });
  }

  getCondition_Target(action) {
    return action.Keyword!='' && action.Keyword!='Persist' && action.Keyword!='Activation Time'  && action.Keyword!='Defend Negative' && action.Keyword!='Add Friend';
  }
  getCondition_TargetValue(action) {
    if(action.Keyword=='Add Friend') return true;
    return action.Keyword!='' && action.Target!='' && (action.Target=='Friends' || action.Target=='Others');
  }
  getCondition_ValueType(action) {
    if(this.checkCondition_ConditionKeywords(action.Keyword)) return false;
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

  checkCondition_ConditionKeywords(keyword) {
    return ["Any Mark", "Any Mark Over", "Any Mark Under", "Specific Mark1", "Specific Mark1 Over", "Specific Mark1 Under", "Specific Mark2", "Specific Mark2 Over", "Specific Mark2 Under", "Specific Mark3", "Specific Mark3 Over", "Specific Mark3 Under", "Any Title", "Any Background", "Any Point", "Any Points Value Over", "Any Points Value Under", "Any Gold", "Any Gold Value Over", "Any Gold Value Under"].indexOf(keyword)>=0;
  }
}
