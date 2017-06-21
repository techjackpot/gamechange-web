import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {

	studentList = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
  	this.dataService.getStudentList().subscribe(
  		response => {
  			this.studentList = response;
  			console.log(this.studentList);
  		}
  	);
  }

}
