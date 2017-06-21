import { Injectable, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class DataService {

  url = 'http://localhost:3001';

  public currentClassChanged: EventEmitter<Object>;

  constructor(private http: Http, private router: Router, private authService: AuthService) {
    this.currentClassChanged = new EventEmitter();
  }

  getHeaders(): Headers {
    return this.authService.getHeaders();
  }

  getTeacherID() {
    return this.authService.getUser()._id;
  }

  getUser(data) {
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getClassesList() {
		return this.http.post(this.url + '/api/user/classes/list', {}, { headers: this.getHeaders() })
			.map((response: Response) => response.json());
  }

  createNewClass(data) {
  	return this.http.post(this.url + '/api/user/classes/create', data, { headers: this.getHeaders() })
  		.map((response: Response) => response.json());
  }

  deleteClass(data) {
  	return this.http.post(this.url + '/api/user/classes/delete', data, { headers: this.getHeaders() })
  		.map((response: Response) => response.json());
  }

  getTeacherList() {
    return this.http.post(this.url + '/api/user/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => {
        return response.json().Users.filter(function (user) {
          return user.Role == 'Teacher';
        });
      });
  }

  setCurrentClass(data) {
    localStorage.setItem('currentClass', JSON.stringify(data));
    this.currentClassChanged.emit(data);
  }
  getCurrentClass() {
    return JSON.parse(localStorage.getItem('currentClass'));
  }

  getStudentList() {
    return this.http.post(this.url + '/api/user/list', {}, { headers: this.getHeaders() })
      .map((response: Response) => {
        return response.json().Users.filter(function (user) {
          return user.Role == 'Student';
        });
      });
  }

  getClassStudents(data) {
    return this.http.post(this.url + '/api/user/classes/get', data, { headers: this.getHeaders() })
      .map((response: Response) => {
        let classInfo = response.json().Class;
        if(classInfo) {
          return classInfo.Students;
        } else {
          return [];
        }
      });
  }

  updateClassStudents(data) {
    return this.http.post(this.url + '/api/user/classes/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
}
