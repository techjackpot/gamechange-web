import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gt-classes',
  templateUrl: './gt-classes.component.html',
  styleUrls: ['./gt-classes.component.scss']
})
export class GtClassesComponent implements OnInit {

	currentClass = null;

  constructor(private dataService: DataService, private router: Router) {
  	this.dataService.currentClassChanged.subscribe( data => this.onCurrentClassChanged(data) );
  }

  ngOnInit() {
  	this.currentClass = this.dataService.getCurrentClass();
  }

  checkCurrentRoute() {
    return this.router.url=='/classes/choose';
  }

  onCurrentClassChanged(data) {
  	this.currentClass = data;
  }

}
