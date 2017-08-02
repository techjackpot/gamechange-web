import { Component, OnInit } from '@angular/core';
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

  currentPlayer = null;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
  	this.GameID = this.route.params["_value"].game_id;
    this.me = this.authService.getUser();
  	this.dataService.getGameInfo({_id: this.GameID}).subscribe(response => {
      this.currentGame = response.Class;
      this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];
  	});
    this.dataService.getAllCards({Approved: true}).subscribe(response => {
      this.cards = response.Cards;
    });

    setInterval(() => {
      this.dataService.getGameInfo({_id: this.GameID}).subscribe(response => {
        this.currentGame = response.Class;
        this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];
      });
    }, 1000*10);
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


  onClickedHand(card_id) {
    if(!confirm("Do you really want to play this card?")) return ;
    let card = this.getCardByCardId(card_id);

    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.splice(this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Hand.indexOf(card_id), 1);

    let total_targets = [];
    let resolved = true;
    card.Actions.forEach((action) => {
      //"Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"
      let targets = [];
      switch(action.Target) {
        case "Self":
          targets.push(this.me._id);
          break;
        case "Friends":
        case "Others":
          targets = (this.shuffle(this.currentGame.Students)).slice(0,action.TargetValue);
          break;
        default:
          break;
      }
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
          resolved = false;
          break;
      }
      targets.forEach((player_id) => {
        let player = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)];
        player.Point += bonus.Point;
        player.Gold += bonus.Gold;

        if(bonus.Cards>0) {
          player.Stack.splice(0,bonus.Cards).forEach((card_id) => {
            player.Hand.push(card_id);
          })
          while(player.Stack.length<10) {
            player.Stack.push(this.chooseCard(player.Collection, player.Stack));
          }
        } else if(bonus.Cards<0) {
          let cnt = bonus.Cards;
          while(player.Hand.length>=0 && cnt>0) {
            player.Hand.splice(Math.floor(Math.random()*player.Hand.length),1);
            cnt--;
          }
        }

        this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, player_id)] = player;

        if(total_targets.indexOf(player_id)<0) {
          total_targets.push(player_id);
        }
      })
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
      Resolved: resolved
    });

    this.dataService.updateClassInfo({_id: this.currentGame._id, Players: this.currentGame.Players, CardHistory: this.currentGame.CardHistory}).subscribe((response) => {
      console.log(response.Class);
    });

    this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];
  }
  onClickedPickUp(card_id) {
    let card = this.getCardByCardId(card_id);
    if(!confirm("Do you really want to buy this card? It costs Gold " + card.GoldCost + ".")) return ;
    this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Stack.push(card_id);
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
      console.log(response.Class);
    });
    
    this.currentPlayer = this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)];
  }
}
