import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-playgame',
  templateUrl: './playgame.component.html',
  styleUrls: ['./playgame.component.scss']
})
export class PlaygameComponent implements OnInit {

	attendClasses = [];
	selectedClass = null;
  currentStudent;
  studentList = [];

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  
  getIndexOfUsers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user._id == user_id) {
        index = i;
      }
    });
    return index;
  }

  ngOnInit() {
    this.currentStudent = this.authService.getUser();
  	this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
  		this.attendClasses = response.Classes;
  	});
    this.dataService.getStudentList().subscribe( (students) => {
      this.studentList = students;
    });
  }

	playGame(classInfo) {
		this.router.navigate(['/cardgame/playgame/', classInfo._id]);
	}
  viewLeaderboard(classInfo) {
    // console.log(classInfo);
    this.selectedClass = classInfo;
    this.selectedClass.Players.sort(function(a, b) {
      return parseFloat(b.Point) - parseFloat(a.Point);
    });
  }
  cancelLeaderboard() {
    this.selectedClass = null;
  }
}
