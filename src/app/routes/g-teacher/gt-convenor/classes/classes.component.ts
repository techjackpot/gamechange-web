import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

declare var $:any;

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class ClassesComponent implements OnInit {

	classesList = [];
  teachersList = [];

  unitsList = [];

	selectedClass;

	opened = false;
  updating = false;
  loaded = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getTeacherList().subscribe((response) => {
        this.teachersList = response;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getClassesList().subscribe((response) => {
        this.classesList = response.Classes;
        resolve();
      });
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getUnitsList({}).subscribe((response) => {
        this.unitsList = response.Units;
        resolve();
      })
    })

    Promise.all([p1, p2, p3]).then(() => {
      this.loaded = true;
    })

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

  getIndexOfUnits(units, unit_id) {
    let index = -1;
    units.forEach((unit, i) => {
      if(unit._id == unit_id) {
        index = i;
      }
    });
    return index;
  }

  createNewClass() {
  	let newClass = {
  		Name: '',
      Description: '',
  		DateTime: '',
      TotalWeeks: 0,
  		Teachers: [],
      Room: '',
      Subject: '',
      Unit: ''
  	};

    this.teachersList.forEach((teacher) => {
      newClass.Teachers.push({ _id: teacher._id, use: false});
    });
  	this.selectClass(newClass);
    this.updating = false;
    this.opened = true;
  }

  editClass(classInfo) {

    let tDateTime = new Date(classInfo.DateTime);
    let newClass = {
      Name: classInfo.Name,
      Description: classInfo.Description,
      DateTime: (new Date(tDateTime.getTime()-tDateTime.getTimezoneOffset()*1000*60).toISOString()).slice(0,16),
      TotalWeeks: classInfo.TotalWeeks,
      Teachers: [],
      Room: classInfo.Room,
      Subject: classInfo.Subject,
      Unit: classInfo.Unit,
      _id: classInfo._id
    };

    this.teachersList.forEach((teacher) => {
      newClass.Teachers.push({ _id: teacher._id, use: (classInfo.Teachers.indexOf(teacher._id) >= 0)?true:false });
    });

    this.selectClass(newClass);
    this.updating = true;
    this.opened = true;
  }

  removeClass(classInfo) {
    if(!confirm("Do you really wanna remove this class?")) return;
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
  			// console.log(error);
  		}
  	);
  }

  onSubmitCreateClass(form: NgForm) {
    let data = {
      Name: this.selectedClass.Name,
      Description: this.selectedClass.Description,
      DateTime: new Date(this.selectedClass.DateTime).toString(),
      TotalWeeks: this.selectedClass.TotalWeeks,
      Teachers: [],
      Room: this.selectedClass.Room,
      Subject: this.selectedClass.Subject,
      Unit: this.selectedClass.Unit
		};
    this.selectedClass.Teachers.forEach(function (user) {
      if(user.use) {
        data.Teachers.push(user._id);
      }
    });

  	if(!this.selectedClass._id) {
	    this.dataService.createNewClass(data).subscribe(
	      response => {
	      	this.classesList.push(response.Class);
	      	this.opened = false;

          let class_id = response.Class._id;
          this.dataService.addMarkTypeToClass({
            Name: 'Multiple Choice',
            Description: '',
            Multiplier: 1.5,
            Weeks: 3,
            MinValue: 5,
            Class: class_id
          }).subscribe((response) => {
          });
          this.dataService.addMarkTypeToClass({
            Name: 'Group',
            Description: '',
            Multiplier: 1.5,
            Weeks: 3,
            MinValue: 5,
            Class: class_id
          }).subscribe((response) => {
          });
          this.dataService.addMarkTypeToClass({
            Name: 'Individual',
            Description: '',
            Multiplier: 1.5,
            Weeks: 3,
            MinValue: 5,
            Class: class_id
          }).subscribe((response) => {
          });
          this.dataService.addMarkTypeToClass({
            Name: 'Homework',
            Description: '',
            Multiplier: 1.5,
            Weeks: 3,
            MinValue: 5,
            Class: class_id
          }).subscribe((response) => {
          });
	      },
	      (error) => {
	        // console.log(error);
	      }
	    );
	  } else {
	  	// this.dataService.updateClass(data).subscribe)}

	  }
  }
  onSubmitUpdateClass(form: NgForm) {
    let data = {
      Name: this.selectedClass.Name,
      Description: this.selectedClass.Description,
      DateTime: new Date(this.selectedClass.DateTime).toString(),
      TotalWeeks: this.selectedClass.TotalWeeks,
      Teachers: [],
      Room: this.selectedClass.Room,
      Subject: this.selectedClass.Subject,
      Unit: this.selectedClass.Unit,
      _id: this.selectedClass._id
    };

    this.selectedClass.Teachers.forEach(function (user) {
      if(user.use) {
        data.Teachers.push(user._id);
      }
    });

    if(this.selectedClass._id) {
      this.dataService.updateClassInfo(data).subscribe(
        response => {
          this.classesList.splice(this.getIndexOfClasses(data._id), 1, response.Class);
          this.opened = false;
        },
        (error) => {
          // console.log(error);
        }
      );
    } else {
      // this.dataService.updateClass(data).subscribe)}

    }
  }

  cancelNewClass() {
    this.opened = !this.opened;
  }

  getUnitName(unit) {
    if(unit) {
      return this.unitsList[this.getIndexOfUnits(this.unitsList, unit)].Name;
    } else {
      return '';
    }
  }
}
