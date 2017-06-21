import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roll-call',
  templateUrl: './roll-call.component.html',
  styleUrls: ['./roll-call.component.scss']
})
export class RollCallComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
  }

}
