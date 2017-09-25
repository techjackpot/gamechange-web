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
  requestList = [];

  timer = null;

  loaded = false;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.currentStudent = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getStudentFriends({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.requestList = response.Friends;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response.filter((student) => student._id!=this.currentStudent._id);
        resolve();
      })
    })

    Promise.all([p1, p2]).then(() => {
      this.loaded = true;
    });

    this.timer = setInterval(() => {
      this.dataService.getStudentFriends({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.requestList = response.Friends;
      });
    }, 1000 * 10);
  }

  ngOnDestroy() {
    if(this.timer) {
      clearInterval(this.timer);
    }
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

  getFriendName(request) {
  	if(request.From._id == this.currentStudent._id) {
  		return request.To.DisplayName;
  	} else {
  		return request.From.DisplayName;
  	}
  }

  getFriend(request) {
    if(request.From._id == this.currentStudent._id) {
      return this.studentList[this.getIndexOfFriends(this.studentList, request.To._id)];
    } else {
      return this.studentList[this.getIndexOfFriends(this.studentList, request.From._id)];
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

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }
  

  acceptFriend(friend) {
    this.dataService.approveFriendRequest({ request_id: friend._id }).subscribe( (response) => {
      this.requestList[this.getIndexOfFriends(this.requestList, friend._id)].Approved = true;
    });
  }

  rejectFriend(friend) {
    this.dataService.removeFriendRequest({ request_id: friend._id }).subscribe( (response) => {
      this.requestList.splice(this.getIndexOfFriends(this.requestList, friend._id), 1);
    });
  }

  removeFriend(friend) {
    if(confirm("Do you really want to remove this friend?")) {
      this.dataService.removeFriendRequest({ request_id: friend._id }).subscribe( (response) => {
        this.requestList.splice(this.getIndexOfFriends(this.requestList, friend._id), 1);
      });
    }
  }

  addFriendRequest(student_id) {
    this.dataService.sendFriendRequest({ from: this.currentStudent._id, to: student_id }).subscribe((response) => {
      let newRequest = {...response.FriendRequest};
      newRequest.From = this.currentStudent;
      newRequest.To = this.studentList[this.getIndexOfUsers(this.studentList, newRequest.To)];
      this.requestList.push(newRequest);
      console.log(this.requestList);
    });
  }

  checkFriendStatus(student_id) {
    let status = 'none';
    this.requestList.forEach((request) => {
      if((request.From == student_id || request.From._id == student_id || request.To == student_id || request.To._id == student_id) && request.Approved == false) {
        status = 'waiting';
      }
      if((request.From == student_id || request.From._id == student_id || request.To == student_id || request.To._id == student_id) && request.Approved == true) {
        status = 'approved';
      }
    });
    return status;
  }

  getSentRequestList() {
    return this.requestList.filter((request) => {
      return request.Approved==false && request.From._id==this.currentStudent._id;
    })
  }

  getReceivedRequestList() {
    return this.requestList.filter((request) => {
      return request.Approved==false && request.To._id==this.currentStudent._id;
    })
  }

  getApprovedRequestList() {
    return this.requestList.filter((request) => {
      return request.Approved==true;
    })
  }

  getNonFriendsList() {
    return this.studentList.filter((student) => {
      return !this.requestList.some((request) => request.From._id==student._id || request.To._id==student._id);
    })
  }

}
