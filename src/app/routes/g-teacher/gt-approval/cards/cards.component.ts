import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

	cardList = [];
	me;
	selectedCard = null;
	previewMode = false;

  constructor(private router: Router, private authService: AuthService, private dataService: DataService) { }

  ngOnInit() {
    this.me = this.authService.getUser();
    this.dataService.getCards({ Approved: false }).subscribe( (response) => {
    	this.cardList = response.Cards;
    })
  }

  getServerAssetUrl(url) {
  	return this.dataService.getServerAssetUrl(url);
  }

  onClickedPreviewCard(card) {
  	this.selectedCard = card;
  	this.previewMode = true;
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

  onClickedApproveCard(card) {
  	this.selectedCard = null;
  	this.previewMode = false;

  	this.dataService.approveCard({ card_id: card._id }).subscribe((response) => {
			this.cardList.splice(this.getIndexOfCards(this.cardList, card._id), 1);
  	})
  }

  onClickedDenyCard(card) {
  	this.selectedCard = null;
  	this.previewMode = false;
  	
		this.dataService.deleteCard({ card_id: card._id }).subscribe((response) => {
			this.cardList.splice(this.getIndexOfCards(this.cardList, card._id), 1);
		})
  }

}
