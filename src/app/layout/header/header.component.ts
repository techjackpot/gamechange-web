import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

	userRole = "Choose";

  constructor(private authService: AuthService) { }

  ngOnInit() {
  	this.checkUserRole();
  }

  getUserDisplayName() {
    return this.authService.getUserDisplayName();
  }

  checkUserRole() {
  	this.userRole = this.authService.getUserRole();
  }
  isStudent() {
  	return this.userRole == 'Student';
  }
  isTeacher() {
  	return this.userRole == 'Teacher';
  }
  isConvenor() {
  	return this.userRole == 'Convenor';
  }
}
