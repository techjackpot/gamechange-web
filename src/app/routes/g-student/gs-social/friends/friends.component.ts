import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

	studentList = [];
  currentStudent;
  friendList = [];

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.currentStudent = this.authService.getUser();
    this.dataService.getStudentFriends({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
      this.friendList = response.Friends.filter((friend) => {
        return friend.Approved || friend.To._id==this.currentStudent._id;
      });
    });
  }

  getFriendName(request) {
  	if(request.From._id == this.currentStudent._id) {
  		return request.To.DisplayName;
  	} else {
  		return request.From.DisplayName;
  	}
  }


  getIndexOfFriends(friends,request_id) {
    let index = -1;
    friends.forEach((friend, i) => {
      if(friend._id == request_id) {
        index = i;
      }
    });
    return index;
  }


  acceptFriend(friend) {
    this.dataService.approveFriendRequest({ request_id: friend._id }).subscribe( (response) => {
      this.friendList[this.getIndexOfFriends(this.friendList, friend._id)].Approved = true;
    });
  }

  rejectFriend(friend) {
    this.dataService.removeFriendRequest({ request_id: friend._id }).subscribe( (response) => {
      this.friendList.splice(this.getIndexOfFriends(this.friendList, friend._id), 1);
    });
  }

  removeFriend(friend) {
    if(confirm("Do you really want to remove this friend?")) {
      this.dataService.removeFriendRequest({ request_id: friend._id }).subscribe( (response) => {
        this.friendList.splice(this.getIndexOfFriends(this.friendList, friend._id), 1);
      });
    }
  }

}
