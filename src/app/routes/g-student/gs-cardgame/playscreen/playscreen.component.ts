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
      let bonus = { Point: 0, Gold: 0 };
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
          break;
        case "Subtract Cards":
          break;
        default:
          resolved = false;
          break;
      }
      targets.forEach((player) => {
        this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Point += bonus.Point;
        this.currentGame.Players[this.getIndexOfPlayers(this.currentGame.Players, this.me._id)].Gold += bonus.Gold;

        if(total_targets.indexOf(player)<0) {
          total_targets.push(player);
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
