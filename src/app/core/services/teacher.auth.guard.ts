import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class TeacherAuthGuard implements CanActivate {

	constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.authService.isLoggedIn() && ( this.authService.getUserRole()=='Teacher' || this.authService.getUserRole()=='Convenor')) {
			return true;
		}
		this.router.navigate(['/login'],{ queryParams: { returnUrl: state.url }});
		return false;
	}
}