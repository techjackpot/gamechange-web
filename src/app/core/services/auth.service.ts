import { Injectable, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  url = 'http://localhost:3001';

  constructor(private http: Http, private router: Router) { }

  getHeaders(): Headers {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (localStorage.getItem('token')) {
      headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
    }
    return headers;
  }

  getToken() {
    let token = "";
    if (localStorage.getItem('token')) {
      try {
        token = JSON.parse(localStorage.getItem('token'));
      } catch(e) {
        this.logout();
        location.href="/";
      }
    }
    return token;
  }

  getUser():any {
    let user = "";
    if (localStorage.getItem('user')) {
      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch(e) {
        this.logout();
        location.href="/";
      }
    }
    return user;
  }

  getUserRole() {
    let user = this.getUser();
    return user.IsConvenor?'Convenor':user.Role;
  }
  getUserDisplayName() {
    return this.getUser().DisplayName;
  }

  login(data) {
		return this.http.post(this.url + '/api/login', data, { headers: this.getHeaders() })
			.map((response: Response) => response.json());
  }

  logout() {
    // remove user from local storage to log user out
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    // localStorage.removeItem('currentClass');
    localStorage.clear();
  }

  isLoggedIn() {
    return this.getToken()!="" && this.getUser()!="";
  }
  
  @Output() userLoggedInEvent:EventEmitter<boolean> = new EventEmitter<boolean>();


  userInfo() {
    let data = { UserID: this.getUser()._id };
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  register(data) {
    return this.http.post(this.url + '/api/register', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  /*
	 *  Sample

		  sample(sample_args) {
		    return this.http.get(this.url + additional_urls, {data: sample_args}, {headers: this.getHeaders()})
		      .map((response: Response) => response.json());
		  }
	 *
  **/

}
