import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {

	assignedClasses = [];
	currentClass = null;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
  	this.currentClass = Object.assign( { _id: ''}, this.dataService.getCurrentClass() );
    this.dataService.getClassesList().subscribe(
      response => {
      	let teacherId = this.dataService.getTeacherID();
        this.assignedClasses = (response.Classes || []).filter(function (classInfo) {
        	return classInfo.Teachers.indexOf(teacherId)>-1;
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
    this.router.navigate(['/classes/students']);
  }
}
