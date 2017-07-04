import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

	Groups = [];
	model;
  currentClass = null;
  Tasks = [];

  constructor(private dataService: DataService, private router: Router) {
  	this.model = {
  		title: '',
  		group: -1,
  		content: ''
  	}
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );
    let that = this;
    this.dataService.getGroupsForClass(this.currentClass).subscribe(
      response => {
      	that.Groups = response.Groups;
        this.dataService.getClassTasks({ class_id: this.currentClass._id }).subscribe(
          response => {
            this.Tasks = response.Tasks;
          }
        );
      }
    );
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

  onSubmitTask(form: NgForm) {
  	this.dataService.createNewTask({
  		Title: this.model.title,
  		Content: this.model.content,
  		Class: this.currentClass._id,
  		Group: this.model.group!=0?this.model.group:null
  	}).subscribe( response => {
  		this.Tasks.push(response.Task);
  	})
  }
}
