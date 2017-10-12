import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

	assignedClasses = [];
	units = [];
	currentClass = null;
	currentUnit = null;

	loaded = false;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
  	let p1 = new Promise((resolve, reject) => {
	    this.dataService.getClassesList().subscribe(response => {
      	let teacherId = this.dataService.getTeacherID();
        this.assignedClasses = (response.Classes || []).filter((classInfo) => {
        	return classInfo.Teachers.indexOf(teacherId)>-1 || this.authService.getUserRole()=='Convenor';
        });
        resolve();
      });
  	});

  	let p2 = new Promise((resolve, reject) => {
  		if(this.authService.getUserRole()=='Convenor') {
	  		this.dataService.getUnitsList({}).subscribe(response => {
	  			this.units = response.Units;
	  			resolve();
	  		})
	  	} else {
	  		resolve();
	  	}
  	})

  	Promise.all([p1, p2]).then(() => {
  		console.log(this.assignedClasses);
  		this.loaded = true;
  	});
  }

  chooseClass(classInfo) {
  	this.currentClass = classInfo;
  }
  chooseUnit(unitInfo) {
  	this.currentUnit = unitInfo;
  }
}
