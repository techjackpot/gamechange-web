import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';
import * as Chartist from 'chartist';
import 'chartist-plugin-zoom';
import 'chartist-plugin-legend';

declare var $:any;

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
  studentBook = [];
  cards = [];

  itemTitles = [];
  itemBackgrounds = [];
  currentGame = null;
  currentPlayer = null;

  myTitles = [];
  myBackgrounds = [];

  totalPointSpent = 0;
  totalPoints = 0;

  loaded = false;
  loaded_class = false;


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

  getIndexOfPlayers(players, player_id) {
    let index = -1;
    players.forEach((player, i) => {
      if(player.Player == player_id) {
        index = i;
      }
    });
    return index;
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
    let p6 = new Promise((resolve, reject) => {
      this.dataService.getAllCards({Approved: true}).subscribe(response => {
        this.cards = response.Cards;
        resolve();
      })
    });


    Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
      this.itemTitles = this.itemTitles.filter((title) => this.myTitles.some((mtitle) => title._id == mtitle.Title));
      this.itemBackgrounds = this.itemBackgrounds.filter((background) => this.myBackgrounds.some((mbackground) => background._id == mbackground.Background));

      this.totalPointSpent += this.itemTitles.reduce((s, item) => s+item.Cost, 0);
      this.totalPointSpent += this.itemBackgrounds.reduce((s, item) => s+item.Cost, 0);

      this.totalPoints = this.attendClasses.reduce((s, cls) => s + cls.Players.reduce((ss, player) => ss + (player.Player==this.me._id?player.Point:0), 0), 0);

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
    this.loaded_class = false;
    this.selectedClass.Players.sort((a, b) => {
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

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.selectedClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({ Class: this.selectedClass._id }).subscribe((response) => {
        this.studentBook = response.MarkHistory;
        resolve();
      });
    })

    Promise.all([p1, p3]).then(() => {
      
      this.currentPlayer = this.selectedClass.Players[this.getIndexOfPlayers(this.selectedClass.Players, this.me._id)];

      this.markHistory = [];

      let studentHistory = this.studentBook.filter((history) => history.Student == this.me._id);

      for(let i=1;i<=this.selectedClass.Weeks;i++) {
        let index = this.getIndexOfWeeks(studentHistory, i);
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
          obj = studentHistory[index];
        }
        this.markHistory.push(obj);
      }

      this.loaded_class = true;
      setTimeout(() => {
        this.resetChartist();
      }, 100)
    });
    // console.log(this.selectedClass);
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

  getCurrentClassStudentMarkTypeValues(student_id, marktype_id) {
    return this.studentBook.filter((history) => history.Student == student_id ).reduce((s, history) => s+=history.Marks[this.getIndexOfMark(history.Marks, marktype_id)].Value, 0);
  }

  resetChartist() {

    this.marktypes.forEach((marktype) => {


      let marktype_sorted = this.selectedClass.Players.concat().sort((a, b) => {
        return parseFloat(this.getCurrentClassStudentMarkTypeValues(b.Player, marktype._id)) - parseFloat(this.getCurrentClassStudentMarkTypeValues(a.Player, marktype._id));
      });

      let my_rank = marktype_sorted.length;
      marktype_sorted.every((player, ii) => {
        if(player.Player==this.me._id) {
          my_rank = ii+1;
          return false;
        }
        return true;
      });

      let marktype_dataPreferences = {
        series: [my_rank, marktype_sorted.length-my_rank]
      };
      let marktype_optionsPreferences = {
        donut: true,
        donutWidth: 30,
        donutSolid: true,
        showLabel: false
      };
      $('.marktype_rank_'+marktype._id).text(my_rank);
      new Chartist.Pie('.marktype_'+marktype._id, marktype_dataPreferences, marktype_optionsPreferences);
    })


    let week_labels = [];
    for(let i=0; i<this.selectedClass.Weeks; i++) {
      week_labels.push(i+1);
    }

    let series_data = this.marktypes.map((marktype, ii) => {
      return this.markHistory.map((history) => history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value)
    }).concat([this.markHistory.map((history) => history.Marks.reduce((s, mark) => s+mark.Value, 0)/history.Marks.length)]);

    let week_by_week_chart_data = {
      labels: week_labels,
      series: series_data
    };

    let week_by_week_chart_options: any = {
      lineSmooth: false,
      axisY: {
          showGrid: true,
          offset: 40
      },
      axisX: {
          showGrid: false,
      },
      low: 0,
      showPoint: true,
      height: '300px',
      plugins: [
        Chartist.plugins.legend({
          legendNames: this.marktypes.map((marktype) => marktype.Name).concat('Average')
        })
      ]
    };

    let week_by_week_chart = new Chartist.Line('#week_by_week_graph', week_by_week_chart_data, week_by_week_chart_options);
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

  getMax(a,b) {
    return a>b?a:b;
  }

  getStrongestCategory() {
    let myBook = this.studentBook.filter((history) => history.Student == this.me._id);
    let attendedWeeks = myBook.reduce((w, history) => history.Attendance==true?w+1:w, 0);
    
    let marktypes = this.marktypes.map((marktype) => {

      let max_week_value = myBook.reduce((m, history) => this.getMax(history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value, m), 0);

      let totalMarks = myBook.reduce((t, history) => t+history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value, 0);

      if(attendedWeeks==0) return { ...marktype, ratio: 0};
      return { ...marktype, ratio: totalMarks/(max_week_value * attendedWeeks) };
    })
    marktypes.sort((a,b) => parseFloat(b.ratio) - parseFloat(a.ratio));

    return marktypes[0].Name;
  }

  getWeakestCategory() {
    let myBook = this.studentBook.filter((history) => history.Student == this.me._id);
    let attendedWeeks = myBook.reduce((w, history) => history.Attendance==true?w+1:w, 0);
    
    let marktypes = this.marktypes.map((marktype) => {

      let max_week_value = myBook.reduce((m, history) => this.getMax(history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value, m), 0);

      let totalMarks = myBook.reduce((t, history) => t+history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value, 0);

      if(attendedWeeks==0) return { ...marktype, ratio: 0};
      return { ...marktype, ratio: totalMarks/(max_week_value * attendedWeeks) };
    })
    marktypes.sort((a,b) => parseFloat(a.ratio) - parseFloat(b.ratio));

    return marktypes[0].Name;
  }

  getOverallMarkRatio() {
    let myBook = this.studentBook.filter((history) => history.Student == this.me._id);
    let attendedWeeks = myBook.reduce((w, history) => history.Attendance==true?w+1:w, 0);

    let totalMarks = myBook.reduce((t, history) => t+history.Marks.reduce((st, mark) => st+mark.Value, 0), 0);

    let total_max_week_value = 0;
    let marktypes = this.marktypes.map((marktype) => {
      let max_week_value = myBook.reduce((m, history) => this.getMax(history.Marks[this.getIndexOfMark(history.Marks, marktype._id)].Value, m), 0);

      total_max_week_value += max_week_value;
      return { ...marktype, max: max_week_value };
    });

    return totalMarks + ' out of ' + (attendedWeeks * total_max_week_value);

  }


}
