import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  me = null;
  attendClasses = [];
  selectedClass = null;
  marktypes = [];
  markHistory = [];

  itemTitles = [];
  itemBackgrounds = [];

  myTitles = [];
  myBackgrounds = [];

  totalPointSpent = 0;
  totalPoints = 0;

  loaded = false;


  selectedClassRank = 0;
  pointsBehind = 0;

  data:any;
  cropperSettings:CropperSettings;
  @ViewChild('cropper', undefined) cropper:ImageCropperComponent;
  cropping = false;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private http: Http) {

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

  onAvatarAcceptClicked() {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
    //headers.set('Accept', 'application/json');
    let options = new RequestOptions({ headers: headers });
    this.http.post(this.dataService.url + '/api/user/uploadprofilepicture', { 'Profile': this.data.image }, options)
      .map(res => res.json())
      .catch(error => Observable.throw(error))
      .subscribe(
      response => {
        console.log(response);
        if(response.ERR_CODE == 'ERR_NONE') {
          let url = response.URL;
          this.me.DisplayPicture = url;
          this.authService.updateUserData();
        } else {
          alert("An error occured while uploading new avatar!");
        }
        this.cropping = false;
      },
      error => console.log(error),
      () => {
      });
  }

  onAvatarCancelClicked() {
    this.cropping = false;
  }

  ngOnInit() {
    this.me = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.attendClasses = response.Classes;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getMarketItemTitles({}).subscribe( (response) => {
        this.itemTitles = response.ItemTitles;
        resolve();
      })
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getMarketItemBackgrounds({}).subscribe( (response) => {
        this.itemBackgrounds = response.ItemBackgrounds;
        resolve();
      })
    })

    let p4 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemTitles({Student: this.me._id}).subscribe( (response) => {
        this.myTitles = response.OwnedTitles;
        resolve();
      })
    })
    let p5 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemBackgrounds({Student: this.me._id}).subscribe( (response) => {
        this.myBackgrounds = response.OwnedBackgrounds;
        resolve();
      })
    })

    Promise.all([p1, p2, p3, p4, p5]).then(() => {
      this.itemTitles = this.itemTitles.filter((title) => this.myTitles.some((mtitle) => title._id == mtitle.Title));
      this.itemBackgrounds = this.itemBackgrounds.filter((background) => this.myBackgrounds.some((mbackground) => background._id == mbackground.Background));

      this.totalPointSpent += this.itemTitles.reduce((s, item) => s+item.Cost, 0);
      this.totalPointSpent += this.itemBackgrounds.reduce((s, item) => s+item.Cost, 0);

      this.totalPoints = this.attendClasses.reduce((s, cls) => s + cls.Players.reduce((ss, player) => ss + (player.Player==this.me._id?player.Point:0), 0), 0);

      console.log(this.attendClasses);
      this.loaded = true;
    })
  }

  getServerAssetUrl(url) {
  	return this.dataService.getServerAssetUrl(url);
  }

  overlayClicked() {
  	this.router.navigate(['/profile/avatar']);
  }

  getIndexOfWeeks(markhistory, week) {
    let index = -1;
    markhistory.forEach((history, i) => {
      if(history.Week == week) {
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

  viewStatistics(classInfo) {
    this.selectedClass = Object.assign({},classInfo);
    this.selectedClass.Players.sort(function(a, b) {
      return parseFloat(b.Point) - parseFloat(a.Point);
    });
    this.selectedClass.Players.every((player, ii) => {
      if(player.Player==this.me._id) {
        this.selectedClassRank = ii+1;
        this.pointsBehind = this.selectedClass.Players[0].Point - player.Point;
        return false;
      }
      return true;
    })
    this.dataService.getClassMarkTypes({ Class: this.selectedClass._id }).subscribe(response => {
      this.marktypes = response.MarkTypes;

      // console.log(this.marktypes);
      this.markHistory = [];

      this.dataService.getStudentBook({ Class: this.selectedClass._id, Student: this.dataService.getStudentID() }).subscribe((response) => {

        for(let i=1;i<=this.selectedClass.Weeks;i++) {
          let index = this.getIndexOfWeeks(response.MarkHistory, i);
          let obj = null;
          if(index<0) {
            obj = {
              Class: this.selectedClass._id,
              Staff: null,
              Week: i,
              Student: this.me._id,
              Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
              Attendance: false,
              Explained: false,
              Date: new Date().toJSON(),
              Note: ''
            };
          } else {
            obj = response.MarkHistory[index];
          }
          this.markHistory.push(obj);
        }
        // console.log(this.markHistory);
      });
    });
    // console.log(this.selectedClass);
  }

  resetPassword() {
    if(!confirm("Do you really want to reset your password?")) return false;
    this.authService.resetPassword({}).subscribe((response) => {
      this.authService.logout();
      location.href="/";
    })
  }


  togglePrivateInfo() {
    if(!confirm("Do you really want to change your privacy option?")) return false;
    this.dataService.updateUser({IsPrivate: !this.me.IsPrivate}).subscribe((response) => {
      this.authService.updateUserData();
      this.me.IsPrivate = !this.me.IsPrivate;
    })
  }

}
