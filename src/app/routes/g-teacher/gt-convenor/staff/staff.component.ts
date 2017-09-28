import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit {

  me;

  constructor(private dataService: DataService, private authService: AuthService) { }

  ngOnInit() {
    this.me = this.authService.getUser();
  }

  resetPassword() {
  	if(!confirm("Do you really want to reset your password?")) return false;
  	this.authService.resetPassword({}).subscribe((response) => {
  		this.authService.logout();
      location.href="/";
  	})
  }

}
