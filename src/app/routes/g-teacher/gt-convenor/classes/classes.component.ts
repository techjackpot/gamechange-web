import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
//import { ClassInfo } from '../../../../core/models/class-info'
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {

	classesList = [];
  teachersList = [];

	selectedClass;

	opened = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getTeacherList().subscribe(
      response => {
        this.teachersList = response;
      },
      (error) => {
        console.log(error);
      }
    );
    this.dataService.getClassesList().subscribe(
      response => {
        this.classesList = response.Classes;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectClass(classInfo) {
    this.selectedClass = classInfo;
  }
  private getIndexOfClasses = (classId) => {
    return this.classesList.findIndex((classInfo) => {
      return classInfo._id === classId;
    });
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

  createNewClass() {
  	this.opened = true;
  	let newClass = {
  		Name: '',
  		DateTime: '',
  		Teachers: []
  	};

    this.teachersList.forEach((teacher) => {
      newClass.Teachers.push({ _id: teacher._id, use: false});
    });
  	this.selectClass(newClass);
  }

  removeClass(classInfo) {
  	this.dataService.deleteClass(classInfo).subscribe(
  		response => {
		    let idx = this.getIndexOfClasses(classInfo._id);
		    if (idx !== -1) {
		      this.classesList.splice(idx, 1);
		      this.selectClass(null);
		    }
		    return this.selectedClass;
  		},
  		(error) => {
  			console.log(error);
  		}
  	);
  }

  onSubmitClass(form: NgForm) {
    let data = {
      Name: this.selectedClass.Name,
      DateTime: new Date(this.selectedClass.DateTime).toString(),
      Teachers: []
		};
    this.selectedClass.Teachers.forEach(function (user) {
      if(user.use) {
        data.Teachers.push(user._id);
      }
    });

  	if(!this.selectedClass._id) {
	    this.dataService.createNewClass(data).subscribe(
	      response => {
	      	this.classesList.push(response.Classes);
	      	this.opened = false;
	      },
	      (error) => {
	        console.log(error);
	      }
	    );
	  } else {
	  	// this.dataService.updateClass(data).subscribe)}

	  }
  }

  cancelNewClass() {
    this.opened = !this.opened;
  }



}
