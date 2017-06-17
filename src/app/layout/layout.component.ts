import { Component, OnInit } from '@angular/core';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {
  	this.authService.userInfo().subscribe(
  		user => {
        localStorage.setItem('user', JSON.stringify(user.UserInfo));
  		}
  	)
  }

}
