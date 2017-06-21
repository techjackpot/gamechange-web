import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-gt-classes',
  templateUrl: './gt-classes.component.html',
  styleUrls: ['./gt-classes.component.scss']
})
export class GtClassesComponent implements OnInit {

	currentClass = null;

  constructor(private dataService: DataService) {
  	this.dataService.currentClassChanged.subscribe( data => this.onCurrentClassChanged(data) );
  }

  ngOnInit() {
  	this.currentClass = this.dataService.getCurrentClass();
  }

  onCurrentClassChanged(data) {
  	this.currentClass = data;
  }

}
