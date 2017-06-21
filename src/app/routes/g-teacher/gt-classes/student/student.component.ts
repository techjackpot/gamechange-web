import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {

	StudentID;
	Student = null;

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) { }

  ngOnInit() {
    if(!this.dataService.getCurrentClass()) this.router.navigate(['/classes']);
  	this.StudentID = this.route.params["_value"].student_id;
  	this.dataService.getUser({ UserID: this.StudentID }).subscribe(
  		response => {
  			this.Student = response.UserInfo;
  		}
  	);
  }

}
