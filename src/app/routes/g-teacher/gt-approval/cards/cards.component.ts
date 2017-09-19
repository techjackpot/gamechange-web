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
	pendingList = [];
	approvedList = [];
	me;
	selectedCard = null;
	previewMode = false;

  constructor(private router: Router, private authService: AuthService, private dataService: DataService) { }

  ngOnInit() {
    this.me = this.authService.getUser();
    this.dataService.getCards({ Approved: false}).subscribe( (response) => {
    	this.pendingList = response.Cards;
    })
    this.dataService.getCards({ Approved: true}).subscribe( (response) => {
    	this.approvedList = response.Cards;
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

  	this.dataService.approveCard({ card_id: card._id, Approved: true }).subscribe((response) => {
			// this.cardList[this.getIndexOfCards(this.cardList, card._id)] = response.Card;
			this.pendingList.splice(this.getIndexOfCards(this.pendingList, card._id), 1);
			this.approvedList.push(response.Card);
  	})
  }

  onClickedDenyCard(card) {
  	this.selectedCard = null;
  	this.previewMode = false;
  	
		this.dataService.deleteCard({ card_id: card._id }).subscribe((response) => {
			this.pendingList.splice(this.getIndexOfCards(this.pendingList, card._id), 1);
		})
  }

  onClickedUnapproveCard(card) {
  	this.selectedCard = null;
  	this.previewMode = false;

  	this.dataService.approveCard({ card_id: card._id, Approved: false }).subscribe((response) => {
			// this.cardList[this.getIndexOfCards(this.cardList, card._id)] = response.Card;
			this.approvedList.splice(this.getIndexOfCards(this.approvedList, card._id), 1);
			this.pendingList.push(response.Card);
  	})
  }

  closeCardPreview() {
    this.previewMode = false;
    this.selectedCard = null;
  }

  
  getCondition_Target(action) {
    return action.Keyword!='' && action.Keyword!='Persist' && action.Keyword!='Activation Time'  && action.Keyword!='Defend Negative' && action.Keyword!='Add Friend';
  }
  getCondition_TargetValue(action) {
    if(action.Keyword=='Add Friend') return true;
    return action.Keyword!='' && action.Target!='' && (action.Target=='Friends' || action.Target=='Others');
  }
  getCondition_ValueType(action) {
    if(action.Keyword=='Any Title' || action.Keyword=='Any Background' || action.Keyword=='Any Points Value Over' || action.Keyword=='Any Points Value Under' || action.Keyword=='Any Gold Value Over' || action.Keyword=='Any Gold Value Under') return false;
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
