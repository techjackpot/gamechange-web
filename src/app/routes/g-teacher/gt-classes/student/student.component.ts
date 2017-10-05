import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { Location } from "@angular/common";

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {

	StudentID;
	Student = null;
  loaded = false;
  currentClass = null;
  week_numbers = [];
  marktypes = [];
  markHistory = [];


  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService, private location: Location) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
  	this.StudentID = this.route.params["_value"].student_id;
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
  	
    let p1 = new Promise((resolve, reject) => {
      this.dataService.getUser({ UserID: this.StudentID }).subscribe(response => {
    		this.Student = response.UserInfo;
        resolve();
    	});
    });

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;

        this.markHistory = [];

        this.dataService.getStudentBook({ Class: this.currentClass._id, Student: this.StudentID }).subscribe((response) => {

          for(let i=1;i<=this.currentClass.Weeks;i++) {
            let index = this.getIndexOfWeeks(response.MarkHistory, i);
            let obj = null;
            if(index<0) {
              obj = {
                Class: this.StudentID,
                Staff: null,
                Week: i,
                Student: this.Student._id,
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
        resolve();
      });
    });
    let p3 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        for(let i=1;i<=this.currentClass.Weeks;i++) {
          this.week_numbers.push(i);
        }
        resolve();
      });
    })
    Promise.all([p1, p2, p3]).then(() => {
      this.loaded = true;
    });
  }

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
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


  goBack() {
    this.location.back();
  }
}
