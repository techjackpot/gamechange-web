import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

	roles = ['Student', 'Teacher', 'Convenor'];
	model ;
	loading = true;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    } else {
    	this.loading = false;
    }
  	this.model = { firstname: '', lastname: '', email: '', password: '', confirm_password: '', role: 0 }
  }

  ngOnInit() {
  }

  navigateUser() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmitRegister( form: NgForm ) {
    let data = {
			PassportCollection: {
				EmailPassports: [
					{
						Email: form.value.email,
						Password: form.value.password
					}
				]
			},
      Role: form.value.role,
      DisplayName: form.value.firstname + ' ' + form.value.lastname,
      Name: {
        First: form.value.firstname,
        Last: form.value.lastname
      }
		};
    this.authService.register(data).subscribe(
      response => {
        this.router.navigate(['/login']);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
