import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

	Groups = [];
  currentClass = null;
	studentList = [];
  model;
  GroupsLoaded = false;

  constructor(private dataService: DataService, private router: Router) {
    this.model = {
      Groups: 2, Members: 2
      //Groups: 6, Members: 10
    };
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    let that = this;
    this.dataService.getGroupsForClass(this.currentClass).subscribe(
      response => {
      	that.Groups = response.Groups;
        this.dataService.getClassStudents(that.currentClass).subscribe(
          response => {
            this.dataService.getStudentList(response).subscribe( response => {
              that.studentList = response;
              this.GroupsLoaded = true;
            })
          }
        );
      }
    );
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

  onSubmitGroups(form: NgForm) {
    let groups = [];
    for(var i=0; i<this.model.Groups; i++) {
      groups.push([]);
    }

    let gid = 0;
    let that = this;
    console.log(this.studentList);
    console.log(this.currentClass);

    this.studentList.forEach(function (student) {
      groups[gid++].push(student._id);
      if(gid>=that.model.Groups) gid=0;
    });

    this.dataService.createGroupsForClass({ current_class: this.currentClass, group_data: groups }).subscribe( response => {
      this.dataService.setCurrentClass(response.Class);
      this.currentClass = response.Class;
      this.dataService.getGroupsForClass(this.currentClass).subscribe(
        response=> {
          this.Groups = response.Groups;
          this.GroupsLoaded = true;
        }
      );
    });
  }

}
