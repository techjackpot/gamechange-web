import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { DragulaService } from "ng2-dragula";
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

  constructor(private dataService: DataService, private router: Router, private dragulaService: DragulaService) {
    this.model = {
      Groups: 2, Members: 2
      //Groups: 6, Members: 10
    };

    const bag: any = this.dragulaService.find('students-bag');
    if (bag !== undefined ) this.dragulaService.destroy('students-bag');
    this.dragulaService.setOptions('students-bag', {
      moves: function (el, source, handle, sibling) {
        if(source.children.length <= 1) return false;
        return true;
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
}
