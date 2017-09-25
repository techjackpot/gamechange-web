import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  Tasks = [];
  currentStudent;
  loaded  = false;

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) {}

  getIndexOfGroups(groups,group_id) {
    let index = -1;
    groups.forEach((group, i) => {
      if(group._id == group_id) {
        index = i;
      }
    });
    return index;
  }
  
  ngOnInit() {
    this.currentStudent = this.authService.getUser();

    let p1 = new Promise((resolve, reject) => {
      this.dataService.getStudentTasks({ student_id: this.dataService.getStudentID() }).subscribe((response) => {
        this.Tasks = response.Tasks;
        resolve();
      })
    })

    Promise.all([p1]).then(() => {
      this.loaded = true;
    })
  }

}
