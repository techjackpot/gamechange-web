import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {

  me;

  constructor(private router: Router, private dataService: DataService, private authService: AuthService, private http: Http) { }

  ngOnInit() {
    this.me = this.authService.getUser();
  }

  getServerAssetUrl(url) {
  	return this.dataService.getServerAssetUrl(url);
  }

	fileChange(event) {
	  let files = event.target.files;
	  if (files.length > 0) {
	    let formData: FormData = new FormData();
	    //for (let file of files) {
	    	let file = files[0];
	      formData.append('Profile', file, file.name);
	    //}
	    //let headers = this.dataService.getHeaders();
      let headers = new Headers();
      headers.set('Accept', 'application/json');
    	headers.append('x-chaos-token', JSON.parse(localStorage.getItem('token')));
	    //headers.set('Accept', 'application/json');
      let options = new RequestOptions({ headers: headers });
      this.http.post(this.dataService.url + '/api/user/uploadprofilepicture', formData, options)
        .map(res => res.json())
        .catch(error => Observable.throw(error))
        .subscribe(
        data => {
        	let url = data.URL;
        	this.me.DisplayPicture = url;
        	this.authService.updateUserData();
        },
        error => console.log(error),
        () => {
            //this.sleep(1000).then(() =>
                // .. Post Upload Delayed Action
            //)
        });
	    // this.dataService.uploadProfilePicture(formData).subscribe((response) => {
	    // 	console.log(response);
	    // });
	  }
	}
}
