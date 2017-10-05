import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from "@angular/common";


@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent implements OnInit {

  currentClass = null;
  me = null;
  cards = [];
  studentList = [];
  marktypes = [];
  studentBook = [];
  loading = '';
  selectedBonusPlayer = null;
  playerBonusSet = { Card: null, Point: 0, Gold: 0 };
  week_numbers = [];
  week_studentbook = 1;
  markHistory = [];
  Groups = [];

  ownedTitles = [];
  ownedBackgrounds = [];

  leftCollectionCardList = [];
  selectedLeftCards = [];

  loaded = false;

  timer = null;

  target_student = null;

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router, private authService: AuthService, private location: Location) { }

  ngOnInit() {

    if(this.route.params['_value'].student_id) {
      this.target_student = this.route.params['_value'].student_id;
    }

    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.me = this.authService.getUser();
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
        this.marktypes = response.MarkTypes;
        resolve();
      });
    });

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;

        for(let i=1;i<=this.currentClass.Weeks;i++) {
          this.week_numbers.push(i);
        }
        this.week_studentbook = this.currentClass.Weeks;

        resolve();
      });
    });

    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList().subscribe(response => {
        this.studentList = response;
        // console.log(this.studentList);

        resolve();
      });
    });

    let p4 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({_id: this.currentClass._id}).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      })
    })

    let p5 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemTitles({}).subscribe((response) => {
        this.ownedTitles = response.OwnedTitles;
        resolve();
      });
    })

    let p6 = new Promise((resolve, reject) => {
      this.dataService.myMarketItemBackgrounds({}).subscribe((response) => {
        this.ownedBackgrounds = response.OwnedBackgrounds;
        resolve();
      });
    })

    let p7 = new Promise((resolve, reject) => {

      this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe((response) => {
        this.markHistory = response.MarkHistory;
        let currentWeekHistory = this.markHistory.filter((history) => history.Week==this.week_studentbook);
        this.studentBook = this.currentClass.Students.map((student) => {
          let index = this.getIndexOfMarkHistory(currentWeekHistory, student);
          if(index<0) {
            return {
              Class: this.currentClass._id,
              Staff: this.me._id,
              Week: this.week_studentbook,
              Student: student,
              Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
              Attendance: false,
              Explained: false,
              Date: new Date().toJSON(),
              Note: ''
            };
          } else {
            return currentWeekHistory[index];
          }
        });
        resolve();
      })

    })

    Promise.all([p1, p2, p3, p4, p5, p6, p7]).then(() => {
      this.loaded = true;

      this.timer = setInterval(() => {
        this.updateCurrentStudentBook();

        this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
          this.currentClass = response.Class;
        });
      }, 1000*10);
    });

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
  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  getIndexOfMarkHistory(markhistory, student_id) {
    let index = -1;
    markhistory.forEach((history, i) => {
      if(history.Student == student_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfMark(marks, marktype) {
    let index = -1;
    marks.forEach((mark, i) => {
      if(mark.MarkType == marktype) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfMarkType(marktypes, marktype) {
    let index = -1;
    marktypes.forEach((_marktype, i) => {
      if(_marktype._id == marktype) {
        index = i;
      }
    });
    return index;
  }

  updateCurrentStudentBook() {
    this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe((response) => {
      this.markHistory = response.MarkHistory;
      let currentWeekHistory = this.markHistory.filter((history) => history.Week==this.week_studentbook);
      this.studentBook = this.currentClass.Students.map((student) => {
        let index = this.getIndexOfMarkHistory(currentWeekHistory, student);
        if(index<0) {
          return {
            Class: this.currentClass._id,
            Staff: this.me._id,
            Week: this.week_studentbook,
            Student: student,
            Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
            Attendance: false,
            Explained: false,
            Date: new Date().toJSON(),
            Note: ''
          };
        } else {
          return currentWeekHistory[index];
        }
      });
    })
  }
  updateStudentBook() {
    this.loading = '...';
    this.dataService.updateStudentBook({ data: this.studentBook }).subscribe((response) => {
      this.studentBook = response.MarkHistory;
      this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe((response) => {
        this.markHistory = response.MarkHistory;
      });
      this.loading = '';
    })
  }

  getIndexOfPlayers(players, player_id) {
    let index = -1;
    players.forEach((player, i) => {
      if(player.Player == player_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfHistory(historys, history_id) {
    let index = -1;
    historys.forEach((history, i) => {
      if(history._id == history_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfPlayersID(players, player_id) {
    let index = -1;
    players.forEach((player, i) => {
      if(player._id == player_id) {
        index = i;
      }
    });
    return index;
  }
  getPlayerByID(player_id) {
    return this.studentList[this.getIndexOfPlayersID(this.studentList, player_id)];
  }
  getIndexOfGroups(groups,group_id) {
    let index = -1;
    groups.forEach((group, i) => {
      if(group._id == group_id) {
        index = i;
      }
    });
    return index;
  }


  findStudentGroup(student_id) {
  	let group_id = 0;
  	this.Groups.some((group) => {
  		if(group.Students.indexOf(student_id) > -1) {
  			group_id = group._id;
  			return false;
  		}
  	})
  	return group_id;
  }
  findStudentGroupLabel(student_id) {
  	let group_id = this.findStudentGroup(student_id);
  	if(group_id) {
  		return this.Groups[this.getIndexOfGroups(this.Groups, group_id)].Title;
  	} else {
  		return '';
  	}
  }

  clickUpdateMarkValue(student_id, marktype_id, amount) {
    this.studentBook[this.getIndexOfMarkHistory(this.studentBook, student_id)].Marks[this.getIndexOfMark(this.studentBook[this.getIndexOfMarkHistory(this.studentBook, student_id)].Marks, marktype_id)].Value += amount;
    this.updateStudentBook();
  }

  getAverageMarkValue(student_id, marktype_id) {
    let s_mark = 0;
    let s_weeks = 0;
    this.markHistory.filter((history) => history.Student==student_id).forEach((history) => {
      s_mark += history.Marks[this.getIndexOfMark(this.studentBook[this.getIndexOfMarkHistory(this.studentBook, student_id)].Marks, marktype_id)].Value;
      if(!history.Explained) s_weeks++;
    })
    if(s_weeks==0) return 0;
    return (s_mark/s_weeks).toFixed(2);
  }

  formValueChanged() {
    this.updateStudentBook();
  }

  getMultiplierValue(student_id) {
    return this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players,student_id)].Multiplier.reduce((sum, multiplier) => sum+multiplier.Value, 0);
  }

  goBack() {
    this.location.back();
  }
}
