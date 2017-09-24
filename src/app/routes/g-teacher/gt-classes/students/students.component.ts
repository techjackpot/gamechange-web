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
  me;

  marktypes = [];
  selectedMarkType = {
    Name: '',
    Description: '',
    Multiplier: 1.5,
    Weeks: 3,
    MinValue: 5,
    ForGroup: false
  };

  editingMark = false;

  isEditMode = false;

  loaded = false;

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
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getClassStudents(this.currentClass).subscribe(response => {
        this.assignedStudents = response;
        resolve();
      });
    })

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response.map((student) => {
          return {...student, use: this.assignedStudents.indexOf(student._id)>-1 };
        })
        resolve();
      })
    })

    Promise.all([p1, p2, p3]).then(() => {
      this.loaded = true;
    })

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
    if(!confirm("Do you really wanna kick off this student?")) return;
    this.studentList[this.getIndexOfUsers(this.studentList, student_id)].use = false;
    this.refreshAssignedStudents();
    let data = {
      '_id': this.currentClass._id,
      'Students': this.assignedStudents
    }
    this.dataService.updateClassStudents(data).subscribe(
      response => {
      }
    );
  }

  addMarkTypeToClass() {
    if(!this.selectedMarkType.Name) {
      return false;
    }
    if(confirm('Do you want to add Mark Type to this class')) {
      this.dataService.addMarkTypeToClass({ ...this.selectedMarkType, Class: this.currentClass._id }).subscribe((response) => {
        this.marktypes.push(response.MarkType);
      })
      this.resetSelectedMarkType();
    }
  }

  resetSelectedMarkType() {
    this.selectedMarkType = {
      Name: '',
      Description: '',
      Multiplier: 1.5,
      Weeks: 3,
      MinValue: 5,
      ForGroup: false
    };
    this.editingMark = false;
  }

  updateMarkTypeToClass() {
    if(!this.selectedMarkType.Name) {
      return false;
    }
    if(confirm('Do you want to update this Mark Type?')) {
      this.dataService.updateMarkTypeToClass({ ...this.selectedMarkType }).subscribe((response) => {
        this.marktypes[this.getIndexOfMarkTypes(this.marktypes, this.selectedMarkType['_id'])] = response.MarkType;
        this.resetSelectedMarkType();
      })
    }
  }
  cancelUpdateMarkTypeToClass() {
    if(confirm('Do you want to cancel the Update?')) {
      this.resetSelectedMarkType();
    }
  }

  getIndexOfMarkTypes(marktypes,marktype_id) {
    let index = -1;
    marktypes.forEach((marktype, i) => {
      if(marktype._id == marktype_id) {
        index = i;
      }
    });
    return index;
  }

  removeMarkTypeFromClass(marktype) {
    if(confirm('Do you really want to remove this Mark Type?')) {
      this.dataService.removeMarkTypeFromClass({ _id: marktype._id }).subscribe((response) => {
        this.marktypes.splice(this.getIndexOfMarkTypes(this.marktypes, marktype._id), 1);
        this.resetSelectedMarkType();
      });
    }
  }

  editMarkType(marktype) {
    if(confirm('Do you really want to edit this Mark Type?')) {
      this.selectedMarkType = { ...marktype };
      this.editingMark = true;
    }
  }
}
