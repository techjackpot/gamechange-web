import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

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
  loaded = false;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) {
  }

  
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

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.attendClasses = response.Classes;
        resolve();
      });
    })
    let p2 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe( (students) => {
        this.studentList = students;
        resolve();
      });
    })

    Promise.all([p1, p2]).then(() => {
      this.loaded = true;
    })
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

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  getPlayerTitle(player) {
    let Title;
    if(Title = this.studentList[this.getIndexOfUsers(this.studentList, player.Player)].Title) {
      return ' - ' + Title.Name;
    } else {
      return '';
    }
  }
  getPlayerBackground(player) {
    let Background;
    if(Background = this.studentList[this.getIndexOfUsers(this.studentList, player.Player)].Background) {
      return this.getServerAssetUrl(Background.Picture);
    } else {
      return '';
    }
  }

}
