import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
  }

}
