import { Component, OnInit, ElementRef } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

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
		keywords: { "Auto": ["Add Points", "Subtract Points", "Add Gold", "Subtract Gold", "Add Cards", "Subtract Cards"], "Manual": ["Defend Cards", "Perform Action", "Complete Task", "Persist", "Activation Time", "Add Friend"] },
		targets: ["Self", "Friends", "Others"],
		goldcosts: [1,2,3,4,5,6,7,8,9,10], 
	}

	numberList = [1,2,3,4,5,6,7,8,9,10];

  constructor(private dataService: DataService, private authService: AuthService, private element: ElementRef, private http: Http, private router: Router) {
    this.me = this.authService.getUser();
  	// this.selectedCard = {
  	// 	Title: '',
  	// 	Description: '',
  	// 	Type: '',
  	// 	Rarity: '',
  	// 	GoldCost: '0',
  	// 	Picture: '',
  	// 	Actions: [],
   //    Creator: this.me._id
  	// }
    console.log(this.me);
  	this.selectedCard = {
  		Title: 'test',
  		Description: 'test',
  		Type: 'Common',
  		Rarity: '',
  		GoldCost: '5',
      Picture: '',
  		Actions: [],
      Creator: this.me._id
  	}
    console.log(this.selectedCard);
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

	onSubmitCreateCard(form: NgForm) {

    let formData: FormData = new FormData();
    formData.append('Picture', this.selectedFile, this.selectedFile.name);
    formData.append('cardData', JSON.stringify(this.selectedCard));

    let headers = new Headers();
    headers.set('Accept', 'application/json');
  	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));

    // let options = new RequestOptions({ headers: headers });
    let options = { headers: headers };
    this.http.post(this.dataService.url + '/api/cards/create', /*{
        imageData: imageData,
        formData: this.selectedCard
      }*/ formData, options)
    .map(res => res.json())
    .subscribe((data) => {
      this.router.navigate(['/cardgame/viewcollection']);
    });
	}

	getCardActions() {
		let actionCount = this.valueList.rarity.indexOf(this.selectedCard.Rarity)+1;
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
}
