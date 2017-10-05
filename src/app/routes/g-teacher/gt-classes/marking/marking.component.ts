import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marking',
  templateUrl: './marking.component.html',
  styleUrls: ['./marking.component.scss']
})
export class MarkingComponent implements OnInit {

  currentClass = null;
  me = null;
  cards = [];
  studentList = [];
  marktypes = [];
  studentBook = [];
  week_studentbook = 1;
  markHistory = [];

  loaded = false;

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) { }

  getIndexOfUsers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user._id == user_id) {
        index = i;
      }
    });
    return index;
  }
  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }
  getIndexOfMarkHistory(markhistory, student_id) {
    let index = -1;
    markhistory.forEach((history, i) => {
      if(history.Student == student_id) {
        index = i;
      }
    });
    return index;
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
  getIndexOfMark(marks, marktype) {
    let index = -1;
    marks.forEach((mark, i) => {
      if(mark.MarkType == marktype) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfMarkType(marktypes, marktype) {
    let index = -1;
    marktypes.forEach((_marktype, i) => {
      if(_marktype._id == marktype) {
        index = i;
      }
    });
    return index;
  }

  updateStudentBook() {
    this.dataService.updateStudentBook({ data: this.studentBook }).subscribe((response) => {
      // this.studentBook = response.MarkHistory;
    })
  }
  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.me = this.authService.getUser();
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    this.week_studentbook = this.currentClass.Weeks;

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    });

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        resolve();
      });
    });

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response;

        resolve();
      });
    });

    let p4 = new Promise((resolve, reject) => {
	    this.dataService.getStudentBook({ Class: this.currentClass._id, Week: this.week_studentbook}).subscribe((response) => {
	      this.studentBook = this.currentClass.Students.map((student) => {
	        let index = this.getIndexOfMarkHistory(response.MarkHistory, student);
	        if(index<0) {
	          return {
	            Class: this.currentClass._id,
	            Staff: this.me._id,
	            Week: this.week_studentbook,
	            Student: student,
	            Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
	            Attendance: false,
              Explained: false,
	            Date: new Date().toJSON(),
	            Note: ''
	          };
	        } else {
	          return response.MarkHistory[index];
	        }
	      });
	      resolve();
	    })
    })

    Promise.all([p1, p2, p3, p4]).then(() => {
      this.loaded = true;
    });

  }

  getMyTitle(player_id) {
    let Title;
    if(Title = this.studentList[this.getIndexOfUsers(this.studentList, player_id)].Title) {
      return ' - ' + Title.Name;
    } else {
      return '';
    }
  }
  getMyBackground(player_id) {
    let Background;
    if(Background = this.studentList[this.getIndexOfUsers(this.studentList, player_id)].Background) {
      return this.getServerAssetUrl(Background.Picture);
    } else {
      return '';
    }
  }

  getPlayerByID(player_id) {
    return this.studentList[this.getIndexOfUsers(this.studentList, player_id)];
  }

  onClickedAttend(player_id) {
  	this.studentBook[this.getIndexOfMarkHistory(this.studentBook, player_id)].Attendance = true;
  	this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].hidden = true;
  	this.updateStudentBook();
  }
  onClickedAbsent(player_id) {
  	this.studentBook[this.getIndexOfMarkHistory(this.studentBook, player_id)].Attendance = false;
  	this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].hidden = true;
  	this.updateStudentBook();
  }
  onClickedIncraseMark(player_id, mark_ind) {
  	this.studentBook[this.getIndexOfMarkHistory(this.studentBook, player_id)].Marks[mark_ind].Value++;
  	this.updateStudentBook();
  }
}
