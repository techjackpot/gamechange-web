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
  loaded = false;
  isEditMode = false;

  resetModel() {
    this.model = {
      title: '',
      group: '-1',
      content: ''
    }
  }

  constructor(private dataService: DataService, private router: Router) {
    this.resetModel();
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) {
      this.router.navigate(['/classes']);
      return false;
    }
    this.currentClass = Object.assign( { _id: '' }, this.dataService.getCurrentClass() );

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getGroupsForClass(this.currentClass).subscribe(response => {
        this.Groups = response.Groups;
        resolve();
      });
    })

    let p2 = new Promise((resolve, reject) => {
      this.dataService.getClassTasks({ class_id: this.currentClass._id }).subscribe(response => {
        this.Tasks = response.Tasks;
        resolve();
      })
    })

    Promise.all([p1, p2]).then(() => {
      this.loaded = true;
    })
  }

  getIndexOfGroups(groups, group_id) {
    let index = -1;
    groups.forEach((group, i) => {
      if(group._id == group_id) {
        index = i;
      }
    });
    return index;
  }
  getIndexOfTasks(tasks, task_id) {
    let index = -1;
    tasks.forEach((task, i) => {
      if(task._id == task_id) {
        index = i;
      }
    });
    return index;
  }

  onSubmitNewTask() {
    if(!confirm("Do you really want to create this Task?")) return false;
  	this.dataService.createNewTask({
  		Title: this.model.title,
  		Content: this.model.content,
  		Class: this.currentClass._id,
  		Group: this.model.group!=0?this.model.group:null
  	}).subscribe( response => {
  		this.Tasks.unshift(response.Task);
  	})
    this.resetModel();
  }

  onSubmitUpdateTask() {
    if(!confirm("Do you really want to update this Task?")) return false;
    this.dataService.updateClassTask({
      _id: this.model._id,
      Title: this.model.title,
      Content: this.model.content,
      Class: this.currentClass._id,
      Group: this.model.group!=0?this.model.group:null
    }).subscribe( response => {
      this.Tasks.splice(this.getIndexOfTasks(this.Tasks, this.model._id), 1, response.Task);
      this.resetModel();
      this.isEditMode = false;
    })
  }

  onClickedEditTask(task_ind) {
    if(!confirm("Do you really want to edit this Task?")) return false;
    this.isEditMode = true;
    this.model = {
      _id: this.Tasks[task_ind]._id,
      title: this.Tasks[task_ind].Title,      
      group: this.Tasks[task_ind].Group==null?0:this.Tasks[task_ind].Group,
      content: this.Tasks[task_ind].Content
    };
  }
  onClickedDeleteTask(task_ind) {
    if(!confirm("Do you really want to remove this Task?")) return false;
    this.dataService.deleteClassTask({
      _id: this.Tasks[task_ind]
    }).subscribe( response => {
      this.Tasks.splice(task_ind, 1);
    })
  }
  onClickedCancelUpdate() {
    this.isEditMode = false;
    this.resetModel();
  }
}
