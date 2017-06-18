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
      token = JSON.parse(localStorage.getItem('token'));
    }
    return token;
  }

  getUser():any {
    let user = "";
    if (localStorage.getItem('user')) {
      user = JSON.parse(localStorage.getItem('user'));
    }
    return user;
  }

  getUserRole() {
    return this.getUser().Role;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
