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

  resetModel() {
    this.model = {
      title: '',
      group: '',
      content: ''
    }
  }

  constructor(private dataService: DataService, private router: Router) {
    this.resetModel();
  }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
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
    form.reset();
  }
}
