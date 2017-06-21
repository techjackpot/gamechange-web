import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
  }

}
