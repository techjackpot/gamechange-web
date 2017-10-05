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
  attendClasses = [];

  totalGold = 0;

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

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.attendClasses = response.Classes.filter((t_class) => this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)>=0 );
        this.attendClasses.sort((a, b) => {
          return parseFloat(b.Players[this.getIndexOfPlayers(b.Players, this.currentStudent._id)].Gold) - parseFloat(a.Players[this.getIndexOfPlayers(a.Players, this.currentStudent._id)].Gold);
        });
        resolve();
      });
    })

    Promise.all([p1, p2, p3]).then(() => {
      this.totalGold = this.attendClasses.reduce((sum, t_class) => {
        return sum + t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold;
      }, 0)
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

  getIndexOfPlayers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user.Player == user_id) {
        index = i;
      }
    });
    return index;
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
      return request.To;
    } else {
      return request.From;
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
    if(!confirm("Thist cost 5 Gold. Do you really want to continue?")) return false;

    let cost = 5;
    let ps = [];
    this.attendClasses.every((t_class, ii) => {
      let gold = t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold;
      let next = false;
      if(cost > t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold) {
        t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold = 0;
        cost -= gold;
        next = true;
      } else {
        t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold -= cost;;
        cost = 0;
        next = false;
      }
      let p = new Promise((resolve, reject) => {
        this.dataService.updateClassInfo({_id: t_class._id, Players: t_class.Players}).subscribe((response) => {
          resolve();
        })
      });
      ps.push(p);
      return next;
    })

    this.dataService.sendFriendRequest({ from: this.currentStudent._id, to: student_id }).subscribe((response) => {
      let newRequest = {...response.FriendRequest};
      newRequest.From = this.currentStudent;
      newRequest.To = this.studentList[this.getIndexOfUsers(this.studentList, newRequest.To)];
      this.requestList.push(newRequest);


      this.dataService.getAttendClasses({ student_id: this.dataService.getStudentID() }).subscribe( (response) => {
        this.attendClasses = response.Classes.filter((t_class) => this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)>=0 );
        this.attendClasses.sort((a, b) => {
          return parseFloat(b.Players[this.getIndexOfPlayers(b.Players, this.currentStudent._id)].Gold) - parseFloat(a.Players[this.getIndexOfPlayers(a.Players, this.currentStudent._id)].Gold);
        });
        this.totalGold = this.attendClasses.reduce((sum, t_class) => {
          return sum + t_class.Players[this.getIndexOfPlayers(t_class.Players, this.currentStudent._id)].Gold;
        }, 0)
      });
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
