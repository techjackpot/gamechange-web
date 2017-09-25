import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

declare var $:any;

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {

	itemTitles = [];
	itemBackgrounds = [];

	selectedTitle = null;
	selectedBackground = null;

	createTitleMode = false;

	me = null;

	loaded = false;


  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private element: ElementRef, private http: Http) { }

  ngOnInit() {
    this.me = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
    	this.dataService.getMarketItemTitles({}).subscribe( (response) => {
        this.itemTitles = response.ItemTitles;
        resolve();
      })
    })

    let p2 = new Promise((resolve, reject) => {
    	this.dataService.getMarketItemBackgrounds({}).subscribe( (response) => {
        this.itemBackgrounds = response.ItemBackgrounds;
        resolve();
      })
    })

    Promise.all([p1, p2]).then(() => {
    	this.loaded = true;
      this.resetSelectedTitle();
      this.resetSelectedBackground();
    })

  }

  resetSelectedTitle() {
    this.selectedTitle = {
      Name: '',
      Cost: 0
    }
  }
  resetSelectedBackground() {
    this.selectedBackground = null;
  }

  getIndexById(collection, id) {
    let index = -1;
    collection.forEach((item, i) => {
      if(item._id == id) {
        index = i;
      }
    });
    return index;
  }

  calcTitleEstimation() {
    this.selectedTitle.Cost = this.selectedTitle.Name.split(' ').length * 5;
  }

  onClickedAddTitle() {
    if(!this.selectedTitle.Name) {
      return false;
    }
    if(confirm("Do you really want to add this Title?")) {
      this.dataService.addMarketItemTitle(this.selectedTitle).subscribe((response) => {
        this.itemTitles.push(response.ItemTitle);
        this.resetSelectedTitle();
      })
    }
  }

  onClickedRemoveTitle(title) {
    if(confirm("Do you really want to remove this Title?")) {
      this.dataService.removeMarketItemTitle(title).subscribe((response) => {
        this.itemTitles.splice(this.getIndexById(this.itemTitles, title._id), 1);
      })
    }
  }


  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }
  
  fileChange(event) {
    // var reader = new FileReader();
    // var image = this.element.nativeElement.querySelector('.new-background-preview');

    // reader.onload = function(e: any) {
    //   var src = e.target.result;
    //   image.src = src;
    // };

    // reader.readAsDataURL(event.target.files[0]);


    this.selectedBackground = event.target.files[0];
  }

  onClickedAddBackground(form: NgForm) {

    if(!this.selectedBackground) return false;

    if(!confirm("Do you really want to add this Background?")) return false;

    let formData: FormData = new FormData();
    formData.append('Picture', this.selectedBackground, this.selectedBackground.name);

    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));

    let options = { headers: headers };
    this.http.post(this.dataService.url + '/api/marketplace/backgrounds/create', formData, options)
    .map(res => res.json())
    .subscribe((response) => {
      this.itemBackgrounds.push(response.ItemBackground);
      this.resetSelectedBackground();
      // form.reset();
    });
  }

  onClickedRemoveBackground(background) {
    if(confirm("Do you really want to remove this Background?")) {
      this.dataService.removeMarketItemBackground(background).subscribe((response) => {
        this.itemBackgrounds.splice(this.getIndexById(this.itemBackgrounds, background._id), 1);
      })
    }
  }
}
