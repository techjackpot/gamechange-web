import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
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
    ForGroup: false,
    ForRollCall: false
  };

  editingMark = false;

  isEditMode = false;

  loaded = false;

  studentRecords = [];

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) { }

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
      ForGroup: false,
      ForRollCall: false
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

  onFileSelect(event) {
    this.studentRecords = [];
    this.studentRecords.length = 0;
    let files = event.srcElement.files;
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
    if(files[0].name.includes(".csv"))
    {
      let input = event.target;
      let reader = new FileReader();
     
      reader.onload = () => {
        let csvData = reader.result;
        let allTextLines = csvData.split(/\r\n|\n/);
        let headers = allTextLines[0].split(',');
        let lines = [];
       
        for (let i = 0; i < allTextLines.length; i++) {
          // split content based on comma
          let data = allTextLines[i].split(',');
          if (data.length == headers.length) {
            let tarr = [];
            for (let j = 0; j < headers.length; j++) {
              tarr.push(data[j]);
            }
            if(!isNumber(tarr[0])) continue;
            this.studentRecords.push({
              StudentNo: tarr[0],
              LastName: tarr[1],
              FirstName: tarr[2],
              MiddleName: tarr[3],
              Email: tarr[9],
              Password: this.randomPassword(15)
            });
          }
        }
      };
      reader.readAsText(input.files[0]);
    }
  }

  randomPassword(keyLength) {
    let i, key = "", characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", lowers = "abcdefghijklmnopqrstuvwxyz", uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", nums = "01234567890";


    let charactersLength = characters.length;

    key += lowers.substr(Math.floor((Math.random() * lowers.length) + 1), 1);
    key += uppers.substr(Math.floor((Math.random() * uppers.length) + 1), 1);
    key += nums.substr(Math.floor((Math.random() * nums.length) + 1), 1);

    for (i = 0; i < keyLength; i++) {
      key += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
    }

    return key;
  }

  importStudentsTo() {
    let ps = [];
    let emails = [];
    this.studentRecords.forEach((studentInfo) => {
      emails.push(studentInfo.Email);
      let data = {
        PassportCollection: {
          EmailPassports: [
            {
              Email: studentInfo.Email,
              Password: studentInfo.Password
            }
          ]
        },
        Role: 'Student',
        IsConvenor: false,
        DisplayName: studentInfo.FirstName + (studentInfo.MiddleName?' '+studentInfo.MiddleName:'') + ' ' + studentInfo.LastName,
        Name: {
          First: studentInfo.FirstName,
          Last: studentInfo.LastName
        },
        StudentNo: studentInfo.StudentNo
      };
      this.authService.register(data).subscribe(
        response => {
          console.log(response.ERR_CODE);
          if(response.ERR_CODE == 'ERR_NONE') {
            let p = new Promise((resolve, reject) => {
              this.authService.sendEmail({ Email: studentInfo.Email, Password: studentInfo.Password }).subscribe((response) => {
                resolve();
              });
            });
            ps.push(p);
          } else {
            console.log(response.Message)
          }
        },
        (error) => {
          console.log(error);
        }
      );
    });

    Promise.all([...ps]).then(() => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response.map((student) => {
          return {...student, use: (this.assignedStudents.indexOf(student._id)>-1 || emails.indexOf(student.Email)>-1) };
        });
        console.log(this.studentList);
        this.refreshAssignedStudents();
        let data = {
          '_id': this.currentClass._id,
          'Students': this.assignedStudents
        }
        this.dataService.updateClassStudents(data).subscribe(
          response => {
            console.log("Class Updated")
          }
        );
      })
    })
    console.log(this.studentRecords);
    this.studentRecords = [];
  }
}
