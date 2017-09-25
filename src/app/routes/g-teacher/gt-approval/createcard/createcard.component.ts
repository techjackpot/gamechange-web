import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

@Component({
  selector: 'app-createcard',
  templateUrl: './createcard.component.html',
  styleUrls: ['./createcard.component.scss']
})
export class CreatecardComponent implements OnInit {

	selectedCard;
	selectedFile = null;
  me;

	valueList = {
		types: ["Special", "Common", "Defence", "Offence"],
		rarity: ["Common", "Uncommon", "Rare"],
		keywords: { "Conditional": ["Any Mark", "Specific Mark", "Any Title", "Any Background", "Any Points Value Over", "Any Points Value Under", "Any Gold Value Over", "Any Gold Value Under"], "Auto": ["Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"], "Manual": ["Defend Negative", "Perform Action", "Persist", "Activation Time", "Add Friend"] },
		targets: ["Self", "Friends", "Others", "Previous", "Highest Mark Player", "Lowest Mark Player", "Highest Gold Player", "Lowest Gold Player", "Highest Points Player", "Lowest Points Player", "Highest Mark Group", "Lowest Mark Group", "Highest Gold Group", "Lowest Gold Group", "Highest Points Group", "Lowest Points Group", "Highest Mark Friend", "Lowest Mark Friend", "Highest Gold Friend", "Lowest Gold Friend", "Highest Points Friend", "Lowest Points Friend"],
    valuetypes: ['Any', 'Percentage', 'All', 'Previous'],
		goldcosts: [1,2,3,4,5,6,7,8,9,10], 
	}

	numberList : any = [1,2,3,4,5,6,7,8,9,10];

  data:any;
  cropperSettings:CropperSettings;
  @ViewChild('cropper', undefined) cropper:ImageCropperComponent;
  cropping = false;

  constructor(private dataService: DataService, private authService: AuthService, private element: ElementRef, private http: Http, private router: Router) {
    this.me = this.authService.getUser();
  	this.selectedCard = {
  		Title: '',
  		Description: '',
  		Type: '',
  		Rarity: '',
  		GoldCost: '0',
  		Picture: '',
  		Actions: [],
      Creator: this.me._id
  	}

    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 200;
    this.cropperSettings.height = 200;
    this.cropperSettings.croppedWidth = 200;
    this.cropperSettings.croppedHeight = 200;
    this.cropperSettings.canvasWidth = 700;
    this.cropperSettings.canvasHeight = 500;
    this.cropperSettings.minWidth = 40;
    this.cropperSettings.minHeight = 40;
    this.cropperSettings.rounded = false;
    this.cropperSettings.keepAspect = true;
    this.cropperSettings.noFileInput = true;

    this.data = {};
  }

  ngOnInit() {
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

  fileChangeListener($event) {
    let file:File = $event.target.files[0];
    if(file) {
      let image:any = new Image();
      let myReader:FileReader = new FileReader();
      let that = this;
      myReader.onloadend = function (loadEvent:any) {
          image.src = loadEvent.target.result;
          that.cropper.setImage(image);

      };

      myReader.readAsDataURL(file);
      this.cropping = true;
    }
  }

	onSubmitCreateCard(form: NgForm) {

    this.selectedCard.Actions = this.selectedCard.Actions.filter((action) => action.Keyword!='');

    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
    //headers.set('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post(this.dataService.url + '/api/cards/create', {
        'Picture': this.data.image,
        'cardData': JSON.stringify(this.selectedCard)
      }, options)
      .map(res => res.json())
      .catch(error => Observable.throw(error))
      .subscribe(
        response => {
          this.cropping = false;
          this.router.navigate(['/approvals/cards']);
        },
        error => console.log(error),
        () => {}
      );



   //  let formData: FormData = new FormData();
   //  formData.append('Picture', this.selectedFile, this.selectedFile.name);
   //  formData.append('cardData', JSON.stringify(this.selectedCard));

   //  let headers = new Headers();
   //  headers.set('Accept', 'application/json');
  	// headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));

   //  // let options = new RequestOptions({ headers: headers });
   //  let options = { headers: headers };
   //  this.http.post(this.dataService.url + '/api/cards/create', /*{
   //      imageData: imageData,
   //      formData: this.selectedCard
   //    }*/ formData, options)
   //  .map(res => res.json())
   //  .subscribe((data) => {
   //    this.router.navigate(['/approvals/cards']);
   //  });
	}

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
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
