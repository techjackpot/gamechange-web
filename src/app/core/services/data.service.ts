import { Injectable, EventEmitter, Output } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class DataService {

  url = environment.serverUrl;

  public currentClassChanged: EventEmitter<Object>;

  constructor(private http: Http, private router: Router, private authService: AuthService) {
    this.currentClassChanged = new EventEmitter();
  }

  getHeaders(): Headers {
    return this.authService.getHeaders();
  }

  getTeacherID() {
    this.authService.veryfiyRole("Teacher");
    return this.authService.getUser()._id;
  }
  getStudentID() {
    this.authService.veryfiyRole("Student");
    return this.authService.getUser()._id;
  }

  getUser(data) {
    return this.http.post(this.url + '/api/user/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateUser(data) {
    return this.http.post(this.url + '/api/user/update', { Data: data}, { headers: this.getHeaders() })
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

  updateClassInfo(data) {
    return this.http.post(this.url + '/api/user/classes/update', data, { headers: this.getHeaders() })
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

  getStudentList(data = []) {
    return this.http.post(this.url + '/api/user/list', { ids: data }, { headers: this.getHeaders() })
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

  getClassGroups(data) {
    return this.http.post(this.url + '/api/user/classes/get', data, { headers: this.getHeaders() })
      .map((response: Response) => {
        let classInfo = response.json().Class;
        if(classInfo) {
          return classInfo.Groups;
        } else {
          return [];
        }
      });
    // return this.http.post(this.url + '/api/classes/groups/list', data, { headers: this.getHeaders() })
    //   .map((response: Response) => response.json());
  }

  getStudentListFromIds(data) {
    return this.http.post(this.url + '/api/students/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json().Users);
  }

  createGroupsForClass(data) {
    return this.http.post(this.url + '/api/classes/groups/create', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getGroupsForClass(data) {
    return this.http.post(this.url + '/api/classes/groups/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  createNewTask(data) {
    return this.http.post(this.url + '/api/tasks/create', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateClassTask(data) {
    return this.http.post(this.url + '/api/tasks/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  deleteClassTask(data) {
    return this.http.post(this.url + '/api/tasks/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getClassTasks(data) {
    return this.http.post(this.url + '/api/tasks/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  createNewUnit(data) {
    return this.http.post(this.url + '/api/units/create', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateUnit(data) {
    return this.http.post(this.url + '/api/units/update', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  deleteUnit(data) {
    return this.http.post(this.url + '/api/units/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  getUnitsList(data) {
    return this.http.post(this.url + '/api/units/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAttendClasses(data) {
    return this.http.post(this.url + '/api/students/getclass', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCurrentGroup(data) {
    return this.http.post(this.url + '/api/students/getgroup', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStudentTasks(data) {
    return this.http.post(this.url + '/api/students/gettask', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStudentFriends(data) {
    return this.http.post(this.url + '/api/students/getfriend', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  sendFriendRequest(data) {
    return this.http.post(this.url + '/api/students/sendfriendrequest', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  buildFriendConnection(data) {
    return this.http.post(this.url + '/api/students/buildfriendconnection', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }


  approveFriendRequest(data) {
    return this.http.post(this.url + '/api/students/acceptrequest', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  removeFriendRequest(data) {
    return this.http.post(this.url + '/api/students/removefriend', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  uploadProfilePicture(data) {
    let headers = this.getHeaders();
    headers.append('enctype', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    return this.http.post(this.url + '/api/user/uploadprofilepicture', data, { headers: headers})
      .map((response: Response) => response.json());

      // this.http.post(`${this.apiEndPoint}`, formData, { headers: headers })
      //   .map(res => res.json())
      //   .catch(error => Observable.throw(error))
      //   .subscribe(
      //       data => console.log('success'),
      //       error => console.log(error)
      //   )
  }

  getServerAssetUrl(url) {
    if(url) {
      return this.url + '/' + url;
    } else {
      return 'assets/images/placeholder.png';
    }
  }

  updateGroupStudent(data) {
    return this.http.post(this.url + '/api/classes/groups/movestudent', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  resetClassGroups(data) {
    return this.http.post(this.url + '/api/classes/groups/reset', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getCards(data) {
    return this.http.post(this.url + '/api/cards/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  deleteCard(data) {
    return this.http.post(this.url + '/api/cards/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  approveCard(data) {
    return this.http.post(this.url + '/api/cards/approve', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getAllCards(data) {
    return this.http.post(this.url + '/api/cards/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getGameInfo(data) {
    return this.http.post(this.url + '/api/games/get', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  createGame(data) {
    return this.http.post(this.url + '/api/games/create', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getClassMarkTypes(data) {
    return this.http.post(this.url + '/api/marks/gettypes', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  addMarkTypeToClass(data) {
    return this.http.post(this.url + '/api/marks/addtype', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  updateMarkTypeToClass(data) {
    return this.http.post(this.url + '/api/marks/updatetype', data, {headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  removeMarkTypeFromClass(data) {
    return this.http.post(this.url + '/api/marks/removetype', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getStudentBook(data) {
    return this.http.post(this.url + '/api/marks/getmarkhistory', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  updateStudentBook(data) {
    return this.http.post(this.url + '/api/marks/updatemarkhistory', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }

  getMarketItemTitles(data) {
    return this.http.post(this.url + '/api/marketplace/titles/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  getMarketItemBackgrounds(data) {
    return this.http.post(this.url + '/api/marketplace/backgrounds/list', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  addMarketItemTitle(data) {
    return this.http.post(this.url + '/api/marketplace/titles/create', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  removeMarketItemTitle(data) {
    return this.http.post(this.url + '/api/marketplace/titles/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  removeMarketItemBackground(data) {
    return this.http.post(this.url + '/api/marketplace/backgrounds/delete', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  buyMarketItemTitle(data) {
    return this.http.post(this.url + '/api/marketplace/titles/buy', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  buyMarketItemBackground(data) {
    return this.http.post(this.url + '/api/marketplace/backgrounds/buy', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  myMarketItemTitles(data) {
    return this.http.post(this.url + '/api/marketplace/titles/my', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
  myMarketItemBackgrounds(data) {
    return this.http.post(this.url + '/api/marketplace/backgrounds/my', data, { headers: this.getHeaders() })
      .map((response: Response) => response.json());
  }
}
