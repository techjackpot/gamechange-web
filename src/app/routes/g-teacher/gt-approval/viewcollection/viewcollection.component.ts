import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

declare var $:any;

@Component({
  selector: 'app-viewcollection',
  templateUrl: './viewcollection.component.html',
  styleUrls: ['./viewcollection.component.scss']
})
export class ViewcollectionComponent implements OnInit {

	cardList = [];
  loaded = false;
  me;
  selectedCard = null;
  selectedFile = null;
  editMode = false;
  createMode = false;

	valueList = {
		types: ["Special", "Common", "Defence", "Offence"],
		rarity: ["Common", "Uncommon", "Rare"],
		keywords: {
      "Conditional": ["Any Mark", "Any Mark Over", "Any Mark Under", "Specific Mark1", "Specific Mark1 Over", "Specific Mark1 Under", "Specific Mark2", "Specific Mark2 Over", "Specific Mark2 Under", "Specific Mark3", "Specific Mark3 Over", "Specific Mark3 Under", "Any Title", "Any Background", "Any Point", "Any Points Value Over", "Any Points Value Under", "Any Gold", "Any Gold Value Over", "Any Gold Value Under"],
      "Auto": ["Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"],
      "Manual": ["Defend Negative", "Perform Action", "Persist", "Activation Time", "Add Friend"]
    },
		targets: ["Self", "Friends", "Others", "Previous", "Highest Mark Player", "Lowest Mark Player", "Highest Gold Player", "Lowest Gold Player", "Highest Points Player", "Lowest Points Player", "Highest Mark Group", "Lowest Mark Group", "Highest Gold Group", "Lowest Gold Group", "Highest Points Group", "Lowest Points Group", "Highest Mark Friend", "Lowest Mark Friend", "Highest Gold Friend", "Lowest Gold Friend", "Highest Points Friend", "Lowest Points Friend"],
    valuetypes: ['Any', 'Percentage', 'All', 'Previous'],
		goldcosts: [1,2,3,4,5,6,7,8,9,10], 
	}

	numberList = [1,2,3,4,5,6,7,8,9,10];


  data:any;
  cropperSettings:CropperSettings;
  @ViewChild('cropper', undefined) cropper:ImageCropperComponent;
  cropping = false;


  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private element: ElementRef, private http: Http) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 200;
    this.cropperSettings.height = 140;
    this.cropperSettings.croppedWidth = 200;
    this.cropperSettings.croppedHeight = 140;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 280;
    this.cropperSettings.minWidth = 40;
    this.cropperSettings.minHeight = 28;
    this.cropperSettings.rounded = false;
    this.cropperSettings.keepAspect = true;
    this.cropperSettings.noFileInput = true;

    this.data = {};
  }

  fileChangeListener($event) {
    this.selectedFile = $event.target.files[0];
    this.cropping = false;
    if(this.selectedFile) {
      let image:any = new Image();
      let myReader:FileReader = new FileReader();
      let that = this;
      myReader.onloadend = function (loadEvent:any) {
          image.src = loadEvent.target.result;
          that.cropper.setImage(image);

      };

      myReader.readAsDataURL(this.selectedFile);
      this.cropping = true;
    }
  }

  ngOnInit() {
    this.me = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getCards({ Creator: this.me._id }).subscribe( (response) => {
        this.cardList = response.Cards;
        resolve();
      })
    })

    Promise.all([p1]).then(() => {
      this.loaded = true;
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

  onClickedCreateCard() {
    if(this.editMode && !confirm("Do you want to abort current edit?")) return false;

    this.selectedCard = {
      Title: '',
      Description: '',
      Type: '',
      Rarity: '',
      GoldCost: '0',
      Picture: '',
      Actions: [],
      Creator: this.me._id
    };
    this.editMode = true;
    this.createMode = true;
    this.cropping = false;
    this.getCardActions();
  }

  onClickedEditCard(card) {
  	if(this.editMode && !confirm("Do you want to abort current edit?")) return false;

  	this.selectedCard = Object.assign({}, card);
  	this.editMode = true;
    this.createMode = false;
    this.cropping = false;
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
  	if(confirm(`Do you want to cancel ${this.createMode?'creating':'updating'} the card?`)) {
	  	this.selectedCard = null;
	  	this.selectedFile = null;
	  	this.editMode = false;
      this.cropping = false;
      this.createMode = false;
	  }
  }

  onSubmitUpdateCard(form: NgForm) {
    if(this.createMode && !this.selectedFile) {
      alert("Please select Picture to create the card.");
      return false;
    }
  	if(confirm(`Do you want to ${this.createMode?'create':'update'} this card?`)) {

    	this.selectedCard.Actions = this.selectedCard.Actions.filter((action) => action.Keyword!='');

	    // let formData: FormData = new FormData();
	    // if(this.selectedFile) {
	    // 	formData.append('Picture', this.selectedFile, this.selectedFile.name);
	    // }
	    // formData.append('cardData', JSON.stringify(this.selectedCard));

	    let headers = new Headers();
	    headers.set('Accept', 'application/json');
	  	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));

	    let options = { headers: headers };
      let endpoint_url = this.dataService.url + '/api/cards/' + (this.createMode?'create':'update');

      let formData = { 'cardData': JSON.stringify(this.selectedCard) };
      if(this.selectedFile) {
        formData['Picture'] = this.data.image;
      }
	    this.http.post(endpoint_url, formData, options)
	    .map(res => res.json())
	    .subscribe((response) => {
        let returnCard = response.Card;
        if(this.createMode) {
          this.cardList.push(returnCard);
        } else {
          this.cardList[this.getIndexOfCards(this.cardList, returnCard._id)] = returnCard;
        }
	    	this.editMode = false;
        this.createMode = false;
	    	this.selectedCard = null;
        this.cropping = false;
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
					Target: 'Self',
					TargetValue: 1,
          ValueType: 'Any',
					KeywordValue: 1,
          ValueMultiple: 1,
          ValueDivide: 1
				});
			}
		}
	}
  checkCardActions() {
    let validActions = 0;
    this.selectedCard.Actions.forEach((action) => {
      if(action.Keyword!='' && action.Target!='') {
        validActions ++;
      }
    });
    return validActions>0;
  }

	onClickedDeleteCard(card) {
    if(confirm("Do you really want to remove this card?")) {
  		this.dataService.deleteCard({ card_id: card._id }).subscribe((response) => {
  			this.cardList.splice(this.getIndexOfCards(this.cardList, card._id), 1);
  		})
    }
	}


  getParams_Target(idx, action) {
    let targets = this.valueList.targets.concat();
    if(idx == 0) {
      targets.splice(targets.indexOf('Previous'),1);
    }
    return targets;
  }
  getParams_TargetValue(idx, action) {
    let numberList = this.numberList.concat();
    return numberList;
  }
  getParams_ValueType(idx, action) {
    let valuetypes = this.valueList.valuetypes.concat();
    if(idx == 0) {
      valuetypes.splice(valuetypes.indexOf('Previous'),1);
    }
    return valuetypes;
  }
  getParams_KeywordValue(idx, action) {
    let numberList = this.numberList.concat();
    return numberList;
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
