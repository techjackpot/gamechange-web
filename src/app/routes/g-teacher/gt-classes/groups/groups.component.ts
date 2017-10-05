import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DragulaService } from "ng2-dragula";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  me = null;
	Groups = [];
  currentClass = null;
	studentList = [];
  model;
  loaded = false;
  markHistory = [];
  markModel;
  week_numbers = [];
  groupmarktypes = [];
  marktypes = [];
  groupMarkModel = {};
  cards = [];

  constructor(private dataService: DataService, private router: Router, private dragulaService: DragulaService, private authService: AuthService) {
    this.model = {
      Groups: 2, Members: 2
      //Groups: 6, Members: 10
    };

    const bag: any = this.dragulaService.find('students-bag');
    if (bag !== undefined ) this.dragulaService.destroy('students-bag');
    this.dragulaService.setOptions('students-bag', {
      moves: function (el, source, handle, sibling) {
        if(source.children.length <= 1) return false;
        return handle.className.indexOf('handle')>=0;
      },
      accepts: function (el, target, source, sibling) {
        return true; // elements can be dropped in any of the `containers` by default
      },
      revertOnSpill: true
    });

    // dragulaService.drop.subscribe((value) => {
    //   console.log(`drop: ${value[0]}`);
    //   console.log(value);
    //   this.onDrop(value.slice(1));
    // });
    this.dragulaService.dropModel.subscribe((value) => {
      this.onDropModel(value.slice(1));
    });
  }
  
  private onDropModel(args) {
    let [el, target, source] = args;
    // do something else
    if(target == source) {
      return false;
    }
    //console.log(el.id, target.id, source.id);

    this.dataService.updateGroupStudent({ student_id: el.id, from_group: source.id, to_group: target.id, class_id: this.currentClass._id }).subscribe((response) => {

    });
  }

  getGroupTotalPoints(group) {
    if(this.currentClass.Players.length == 0) return 0;
    return group.Students.reduce((sum, student) => sum+this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, student)].Point, 0);
  }
  getGroupTotalMarks(group) {
    if(this.currentClass.Players.length == 0) return 0;
    return group.Students.reduce((total, student) => total+this.markHistory.filter((markhistory) => markhistory.Student==student).reduce((t_sum, markhistory) => t_sum+markhistory.Marks.reduce((sum, mark) => sum+mark.Value, 0), 0), 0);
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    this.me = this.authService.getUser();
    let p1 = new Promise((resolve, reject) => {
      this.dataService.getGameInfo({_id: this.currentClass._id}).subscribe(response => {
        this.currentClass = response.Class;
        resolve();
      });
    });
    let p2 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass({ _id: this.currentClass._id }).subscribe( response => {
        this.Groups = response.Groups;
        resolve();
      });
    });
    let p3 = new Promise((resolve, reject) => {
      this.dataService.getStudentList(this.currentClass.Students).subscribe( response => {
        this.studentList = response;
        resolve();
      });
    });
    let p4 = new Promise((resolve, reject) => {
      this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe( response => {
        this.markHistory = response.MarkHistory;
        resolve();
      })
    });
    let p5 = new Promise((resolve, reject) => {
      this.dataService.getClassMarkTypes({ Class: this.currentClass._id }).subscribe(response => {
        this.groupmarktypes = response.MarkTypes.filter((marktype) => marktype.ForGroup );
        this.marktypes = response.MarkTypes;
        resolve();
      });
    });
    let p6 = new Promise((resolve, reject) => {
      this.dataService.getAllCards({Approved: true}).subscribe((response) => {
        this.cards = response.Cards;

        resolve();
      });
    })

    Promise.all([p1, p2, p3, p4, p5, p6]).then(() => {
      this.loaded = true;
      this.resetMarkModel();
      for(let i=1;i<=this.currentClass.Weeks;i++) {
        this.week_numbers.push(i);
      }
      this.Groups.forEach((group) => {
        this.groupMarkModel[group._id] = {
          group: group._id,
          week: this.currentClass.Weeks,
          marktype: this.groupmarktypes[0]._id,
          value: 0
        }
      })
    });
  }

  resetMarkModel() {
    this.markModel = {
      group: '',
      week: 0,
      marktype: '',
      value: 0
    }
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
  getIndexOfUsers(users,user_id) {
    let index = -1;
    users.forEach((user, i) => {
      if(user._id == user_id) {
        index = i;
      }
    });
    return index;
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
  getIndexOfGroups(groups,group_id) {
    let index = -1;
    groups.forEach((group, i) => {
      if(group._id == group_id) {
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
        }
      );
    });
  }

  getServerAssetUrl(url) {
    return this.dataService.getServerAssetUrl(url);
  }

  resetGroups() {
      if(confirm("Do you really want to reset GROUPS? Tasks will also be reset once group is clear.")) {
      let data = {
        _id: this.currentClass._id
      };
      this.dataService.resetClassGroups(data).subscribe((response) => {
        this.Groups = [];

        this.dataService.setCurrentClass(response.Class);
        this.currentClass = response.Class;
        this.router.navigate(['/classes/chooseclass']);
      });
    }
  }

  onSubmitMarkGroup(form: NgForm) {
    if(confirm('Do you really want to set this mark to group?')) {

      let studentBook;

      this.dataService.getStudentBook({ Class: this.currentClass._id, Week: this.markModel.week}).subscribe((response) => {
        studentBook = this.Groups[this.getIndexOfGroups(this.Groups, this.markModel.group)].Students.map((student) => {
          let index = this.getIndexOfMarkHistory(response.MarkHistory, student);
          if(index<0) {
            return {
              Class: this.currentClass._id,
              Staff: this.me._id,
              Week: this.markModel.week,
              Student: student,
              Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
              Attendance: false,
              Explained: false,
              Date: new Date().toJSON(),
              Note: ''
            };
          } else {
            let markhistory = response.MarkHistory[index];
            markhistory.Marks = markhistory.Marks.map((mark) => {
              if(mark.MarkType == this.markModel.marktype) {
                return {
                  MarkType: mark.MarkType,
                  Value: this.markModel.value
                }
              } else {
                return mark;
              }
            });
            return markhistory;
          }
        });
        this.dataService.updateStudentBook({ data: studentBook }).subscribe((response) => {
          this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe( response => {
            this.markHistory = response.MarkHistory;
            this.resetMarkModel();
          })
        });
      });
    }
  }
  viewPlayerProfile(student) {
    this.router.navigate(['/classes/student', student]);
  }

  onSubmitMarkEachGroup(group_id) {
    let studentBook;

    this.dataService.getStudentBook({ Class: this.currentClass._id, Week: this.groupMarkModel[group_id].week}).subscribe((response) => {
      studentBook = this.Groups[this.getIndexOfGroups(this.Groups, this.groupMarkModel[group_id].group)].Students.map((student) => {
        let index = this.getIndexOfMarkHistory(response.MarkHistory, student);
        if(index<0) {
          return {
            Class: this.currentClass._id,
            Staff: this.me._id,
            Week: this.groupMarkModel[group_id].week,
            Student: student,
            Marks: this.marktypes.map((marktype) => { return { MarkType: marktype._id, Value: 0 }; } ),
            Attendance: false,
            Explained: false,
            Date: new Date().toJSON(),
            Note: ''
          };
        } else {
          let markhistory = response.MarkHistory[index];
          markhistory.Marks = markhistory.Marks.map((mark) => {
            if(mark.MarkType == this.groupMarkModel[group_id].marktype) {
              return {
                MarkType: mark.MarkType,
                Value: this.groupMarkModel[group_id].value
              }
            } else {
              return mark;
            }
          });
          return markhistory;
        }
      });
      this.dataService.updateStudentBook({ data: studentBook }).subscribe((response) => {
        this.dataService.getStudentBook({ Class: this.currentClass._id }).subscribe( response => {
          this.markHistory = response.MarkHistory;
          this.resetMarkModel();
        })
      });
    });
  }

  chooseCard(collection, target) {
    if(collection.length == 0) return null;

    //rarity

    let candidate = [];
    let rand, rarity;
    let candidate_card, pass=false;

    while(candidate.length==0) {
      rand = Math.floor(Math.random()*10);
      rarity = rand<2?'Rare':(rand<5?'Uncommon':'Common');


      collection.forEach((card_id) => {
        if(this.cards[this.getIndexOfCards(this.cards,card_id)].Rarity == rarity) candidate.push(card_id);
      });
    }


    while(!pass) {
      candidate_card = candidate[Math.floor(Math.random()*candidate.length)];

      if(target.indexOf(candidate_card)<0) {
        pass = true;
      } else {
        rand = Math.floor(Math.random()*5);
        if(rand < 2) {
          pass = true;
        } else if(rand < 4) {
          pass = false;
        } else {
          candidate = [];
          while(candidate.length==0) {
            rand = Math.floor(Math.random()*10);
            rarity = rand<2?'Rare':(rand<5?'Uncommon':'Common');


            collection.forEach((card_id) => {
              if(this.cards[this.getIndexOfCards(this.cards,card_id)].Rarity == rarity) candidate.push(card_id);
            });
          }

        }
      }
    }

    return candidate_card;

  }

  getIndexOfCards(cards,card_id) {
    let index = -1;
    cards.forEach((card, i) => {
      if(card._id == card_id) {
        index = i;
      }
    });
    return index;
  }

  onSubmitAddCardEachMember(group_id) {

    this.Groups[this.getIndexOfGroups(this.Groups, group_id)].Students.forEach((player_id) => {
      this.currentClass.Players[this.getIndexOfPlayers(this.currentClass.Players, player_id)].Hand.push(this.currentClass.Collection[Math.floor(this.currentClass.Collection.length*Math.random())]);
    })

    this.dataService.updateClassInfo({_id: this.currentClass._id, Players: this.currentClass.Players}).subscribe((response) => {
      this.currentClass = response.Class;
    });
  }
}
