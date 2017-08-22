import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-viewcollection',
  templateUrl: './viewcollection.component.html',
  styleUrls: ['./viewcollection.component.scss']
})
export class ViewcollectionComponent implements OnInit {

	cardList = [];
  me;
  selectedCard = null;
  selectedFile = null;
  editMode = false;

	valueList = {
		types: ["Special", "Common", "Defence", "Offence"],
		rarity: ["Common", "Uncommon", "Rare"],
		keywords: { "Auto": ["Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"], "Manual": ["Defend Cards", "Perform Action", "Complete Task", "Persist", "Activation Time", "Add Friend"] },
		targets: ["Self", "Friends", "Others"],
		goldcosts: [1,2,3,4,5,6,7,8,9,10], 
	}

	numberList = [1,2,3,4,5,6,7,8,9,10];


  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private element: ElementRef, private http: Http) {
  }

  ngOnInit() {
    this.me = this.authService.getUser();
    this.dataService.getCards({ Creator: this.me._id }).subscribe( (response) => {
    	this.cardList = response.Cards;
    })
  }

  getServerAssetUrl(url) {
  	return this.dataService.getServerAssetUrl(url);
  }

	fileChange(event) {
	  var reader = new FileReader();
	  var image = this.element.nativeElement.querySelector('.card-picture-preview');

	  reader.onload = function(e: any) {
      var src = e.target.result;
      image.src = src;
	  };

	  reader.readAsDataURL(event.target.files[0]);


	  this.selectedFile = event.target.files[0];
	}

  onClickedEditCard(card) {
  	if(this.editMode) {
  		if(confirm("Do you want to abort current edit?")) {
		  	this.selectedCard = Object.assign({}, card);
		  	this.editMode = true;
	  	}
  	} else {
		  this.selectedCard = Object.assign({}, card);
	  	this.editMode = true;
  	}
  	this.getCardActions();
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

  onCancelUpdateCard() {
  	if(confirm("Do you want to cancel the update?")) {
	  	this.selectedCard = null;
	  	this.selectedFile = null;
	  	this.editMode = false;
	  }
  }

  onSubmitUpdateCard(form: NgForm) {
  	if(confirm("Do you want to update the card?")) {
	    let formData: FormData = new FormData();
	    if(this.selectedFile) {
	    	formData.append('Picture', this.selectedFile, this.selectedFile.name);
	    }
	    formData.append('cardData', JSON.stringify(this.selectedCard));

	    let headers = new Headers();
	    headers.set('Accept', 'application/json');
	  	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));

	    // let options = new RequestOptions({ headers: headers });
	    let options = { headers: headers };
	    this.http.post(this.dataService.url + '/api/cards/update', /*{
	        imageData: imageData,
	        formData: this.selectedCard
	      }*/ formData, options)
	    .map(res => res.json())
	    .subscribe((response) => {
	    	let updatedCard = response.Card;
	    	//this.selectedCarddata.Card;
	    	this.cardList[this.getIndexOfCards(this.cardList, updatedCard._id)] = updatedCard;
	    	this.editMode = false;
	    	this.selectedCard = null;
	    	this.selectedFile = null;
	    });
  	}
  }

	getCardActions() {

    let actionCount = 0, limitValue = 0;

    switch(this.selectedCard.Rarity) {
      case 'Rare':
        actionCount = 5;
        limitValue = 10;
        break;
      case 'Uncommon':
        actionCount = 3;
        limitValue = 5;
        break;
      case 'Common':
        actionCount = 2;
        limitValue = 3;
        break;
      default:
        break;
    }
    this.numberList = [];
    for(let i=0;i<limitValue;i++) {
      this.numberList.push(i+1);
    }

		// let actionCount = this.valueList.rarity.indexOf(this.selectedCard.Rarity)+1;
		let currentSize = this.selectedCard.Actions.length;
		if(currentSize > actionCount) {
			for(let i=0; i<currentSize-actionCount; i++) {
				this.selectedCard.Actions.pop();
			}
		} else {
			for(let i=0; i<actionCount-currentSize; i++) {
				this.selectedCard.Actions.push({
					Keyword: '',
					Target: '',
					TargetValue: 0,
					KeywordValue: 0
				});
			}
		}
	}

	onClickedDeleteCard(card) {
		this.dataService.deleteCard({ card_id: card._id }).subscribe((response) => {
			this.cardList.splice(this.getIndexOfCards(this.cardList, card._id), 1);
		})
	}
}
