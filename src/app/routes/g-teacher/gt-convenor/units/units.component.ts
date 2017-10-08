import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {

	unitsList = [];

	selectedUnit = null;

	opened = false;
  updating = false;

	loaded = false;

  constructor(private dataService: DataService) { }

  ngOnInit() {

  	let p1 = new Promise((resolve, reject) => {
  		this.dataService.getUnitsList({}).subscribe((response) => {
  			this.unitsList = response.Units;
  			resolve();
  		})
  	})

  	Promise.all([p1]).then(() => {
  		this.loaded = true;
  	})
  }

  selectUnit(unitInfo) {
    this.selectedUnit = unitInfo;
  }
  private getIndexOfUnits = (unitId) => {
    return this.unitsList.findIndex((unitInfo) => {
      return unitInfo._id === unitId;
    });
  }

  createNewUnit() {
  	let newUnit = {
  		Name: '',
      Description: ''
  	};

  	this.selectUnit(newUnit);
    this.updating = false;
    this.opened = true;
  }

  editUnit(unitInfo) {

    let tDateTime = new Date(unitInfo.DateTime);
    let newUnit = {
      Name: unitInfo.Name,
      Description: unitInfo.Description,
      _id: unitInfo._id
    };

    this.selectUnit(newUnit);
    this.updating = true;
    this.opened = true;
  }

  removeUnit(unitInfo) {
    if(!confirm("Do you really wanna remove this unit?")) return;
  	this.dataService.deleteUnit(unitInfo).subscribe( (response) => {
	    let idx = this.getIndexOfUnits(unitInfo._id);
	    if (idx !== -1) {
	      this.unitsList.splice(idx, 1);
	      this.selectUnit(null);
	    }
	    return this.selectedUnit;
  	});
  }

  onSubmitCreateUnit(form: NgForm) {
    let data = {
      Name: this.selectedUnit.Name,
      Description: this.selectedUnit.Description,
		};

  	if(!this.selectedUnit._id) {
	    this.dataService.createNewUnit(data).subscribe((response) => {
      	this.unitsList.push(response.Unit);
      	this.opened = false;
      });
	  } else {
	  }
  }
  onSubmitUpdateUnit(form: NgForm) {
    let data = {
      Name: this.selectedUnit.Name,
      Description: this.selectedUnit.Description,
      _id: this.selectedUnit._id
    };

    if(this.selectedUnit._id) {
      this.dataService.updateUnit(data).subscribe((response) => {
      	console.log(this.getIndexOfUnits(data._id), response.Unit);
        this.unitsList.splice(this.getIndexOfUnits(data._id), 1, response.Unit);
        this.opened = false;
      });
    } else {

    }
  }

  cancelNewUnit() {
    this.opened = !this.opened;
  }
}
