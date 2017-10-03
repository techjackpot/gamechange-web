import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {

	assignedClasses = [];
	currentClass = null;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
  	this.currentClass = Object.assign( { _id: ''}, this.dataService.getCurrentClass() );
    this.dataService.getClassesList().subscribe(
      response => {
      	let teacherId = this.dataService.getTeacherID();
        this.assignedClasses = (response.Classes || []).filter((classInfo) => {
        	return classInfo.Teachers.indexOf(teacherId)>-1 || this.authService.getUserRole()=='Convenor';
        });
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  chooseClass(classInfo) {
  	this.dataService.setCurrentClass(classInfo);
  	this.currentClass = classInfo;
    this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
      this.currentClass = response.Class;
      this.dataService.setCurrentClass(this.currentClass);
      this.router.navigate(['/classes/students']);
    });
  }
}
