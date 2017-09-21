import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

declare var $:any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

	roles = ['Student', 'Teacher', 'Convenor'];
	model ;
	loading = true;
  valid = true;
  invalid_message = "";
  test : Date = new Date();

  checkFullPageBackgroundImage(){
      var $page = $('.full-page');
      var image_src = $page.data('image');

      if(image_src !== undefined){
          var image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
          $page.append(image_container);
      }
  };
  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    // } else {
    // 	this.loading = false;
    }
    this.loading = false;
  	this.model = { firstname: '', lastname: '', email: '', password: '', confirm_password: '', role: '' }
  }

  ngOnInit() {
    this.checkFullPageBackgroundImage();
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
      Role: form.value.role=='Convenor'?'Teacher':form.value.role,
      IsConvenor: form.value.role=='Convenor'?true:false,
      DisplayName: form.value.firstname + ' ' + form.value.lastname,
      Name: {
        First: form.value.firstname,
        Last: form.value.lastname
      }
		};
    this.valid = true;
    this.invalid_message = "";
    this.authService.register(data).subscribe(
      response => {
        if(response.ERR_CODE == 'ERR_NONE') {
          this.router.navigate(['/login']);
        } else {
          this.valid = false;
          this.invalid_message = response.Message;
          setTimeout(() => {
            this.valid = true;
            this.invalid_message = "";
          }, 3000)
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
