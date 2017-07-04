import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

	attendClasses = [];
	studentList = [];
  friendList = [];
	selectedClass = null;
	detailViewMode = false;
  currentStudent;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

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
    this.currentStudent = this.authService.getUser();
  	this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
  		this.attendClasses = response.Classes;
      this.dataService.getStudentList().subscribe( (students) => {
      	this.studentList = students;
      });
      this.dataService.getStudentFriends({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.friendList = response.Friends;
      });
  	});
  }

  viewMembers(classInfo) {
  	this.selectedClass = Object.assign({},classInfo);
    this.dataService.getCurrentGroup({ student_id: this.dataService.getStudentID(), class_id: this.selectedClass._id }).subscribe( (response) => {
      let groupMembers = [];
      response.Members.forEach((student_id) => {
        groupMembers.push(student_id.Student);
      });
      this.selectedClass.Students = this.selectedClass.Students.filter((student_id) => {
        return student_id != this.currentStudent._id;
      }).map((student_id) => {
        return { student_id: student_id, inGroup: (groupMembers.indexOf(student_id)!=-1)?true:false };
      });
      this.detailViewMode = true;
    });
  }

  goBackToList() {
  	this.detailViewMode = false;
  }

  addFriendRequest(student_id) {
    this.dataService.sendFriendRequest({ from: this.currentStudent._id, to: student_id }).subscribe((response) => {
      this.friendList.push(response.FriendRequest);
    });
  }

  checkFriendStatus(student_id) {
    let status = 'none';
    this.friendList.forEach((request) => {
      if((request.From == student_id || request.From._id == student_id || request.To == student_id || request.To._id == student_id) && request.Approved == false) {
        status = 'waiting';
      }
      if((request.From == student_id || request.From._id == student_id || request.To == student_id || request.To._id == student_id) && request.Approved == true) {
        status = 'approved';
      }
    });
    return status;
  }

}
