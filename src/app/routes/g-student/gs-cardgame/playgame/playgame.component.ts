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

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.currentStudent = this.authService.getUser();
  	this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
  		this.attendClasses = response.Classes;
  	});
  }
	playGame(classInfo) {
		this.router.navigate(['/cardgame/playgame/', classInfo._id]);
	}
}
