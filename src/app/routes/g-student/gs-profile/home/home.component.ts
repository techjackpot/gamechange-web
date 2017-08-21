import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  me = null;
  currentStudent = null;
  attendClasses = [];
  selectedClass = null;
  marktypes = [];
  markHistory = [];

  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private http: Http) { }

  ngOnInit() {
    this.me = this.authService.getUser();
    this.currentStudent = this.authService.getUser();
    this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
      this.attendClasses = response.Classes;
    });
  }

  getServerAssetUrl(url) {
  	return this.dataService.getServerAssetUrl(url);
  }

  overlayClicked() {
  	this.router.navigate(['/profile/avatar']);
  }

	fileChange(event) {
	  let files = event.target.files;
	  if (files.length > 0) {
	    let formData: FormData = new FormData();
	    //for (let file of files) {
	    	let file = files[0];
	      formData.append('Profile', file, file.name);
	    //}
	    //let headers = this.dataService.getHeaders();
      let headers = new Headers();
      headers.set('Accept', 'application/json');
    	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
	    //headers.set('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post(this.dataService.url + '/api/user/uploadprofilepicture', formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
        data => {
        	let url = data.URL;
        	this.me.DisplayPicture = url;
        	this.authService.updateUserData();
        },
        error => console.log(error),
        () => {
            //this.sleep(1000).then(() =>
                // .. Post Upload Delayed Action
            //)
        });
	    // this.dataService.uploadProfilePicture(formData).subscribe((response) => {
	    // 	console.log(response);
	    // });
	  }
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
}
