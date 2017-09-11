import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  loading = true;
  valid = true;
  invalid_message = "";

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    // } else {
    //   this.loading = false;
    }
    this.loading = false;
  }

  navigateUser() {
    if (this.authService.isLoggedIn()) {
      if(this.authService.getUserRole()=='Student') {
        this.router.navigate(['/profile']);
      } else {
        this.router.navigate(['/classes']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmitLogin( form: NgForm ) {
    let data = {
			PassportCollection: {
				EmailPassports: [
					{
						Email: form.value.email,
						Password: form.value.password
					}
				]
			}
		};
    this.valid = true;
    this.invalid_message = "";
    this.authService.login(data).subscribe(
      response => {
        // this.authService.LoggedInEvent.emit(true);
        // login successful if there's a jwt token in the response
        if(response.ERR_CODE != 'ERR_NONE') {
          this.valid = false;
          this.invalid_message = "Email or Password does not match."
          setTimeout(() => {
            this.valid = true;
            this.invalid_message = "";
          }, 3000);
          return;
        }
        let user = response;
        if (user && user.Token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', JSON.stringify(user.Token));
          localStorage.setItem('user', JSON.stringify({ _id: user.ID}));

          this.authService.userInfo().subscribe(
            user => {
              localStorage.setItem('user', JSON.stringify(user.UserInfo));
              this.navigateUser();
            }
          );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
