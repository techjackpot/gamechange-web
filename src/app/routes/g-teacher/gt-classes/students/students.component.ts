import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

	studentList = [];
  assignedStudents = [];
  currentClass = null;

  isEditMode = false;

  constructor(private dataService: DataService, private router: Router) { }

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
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    this.dataService.getClassStudents(this.currentClass).subscribe(
      response => {
        this.assignedStudents = response;
        this.dataService.getStudentList().subscribe(
          response => {
            let that = this;
            this.studentList = response.map(function (student) {
              return Object.assign({ use: (that.assignedStudents.indexOf(student._id)!=-1)?true:false }, student);
            });
          }
        );
      }
    );
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  refreshAssignedStudents() {
    this.assignedStudents = this.studentList.filter(function (student) {
      return student.use == true;
    }).map(function (student) {
      return student._id;
    });
  }

  onSubmitStudents(form: NgForm) {
    this.refreshAssignedStudents();
    let data = {
      '_id': this.currentClass._id,
      'Students': this.assignedStudents
    }
    this.dataService.updateClassStudents(data).subscribe(
      response => {
        this.isEditMode = !this.isEditMode;
      }
    );
  }

  removeStudentFromClass(student_id) {
    this.studentList[this.getIndexOfUsers(this.studentList, student_id)].use = false;
    this.refreshAssignedStudents();
  }

}
