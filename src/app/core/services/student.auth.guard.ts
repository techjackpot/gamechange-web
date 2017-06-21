import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class StudentAuthGuard implements CanActivate {

	constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if(this.authService.isLoggedIn() && this.authService.getUserRole()=='Student') {
			return true;
		}
		this.router.navigate(['/login'],{ queryParams: { returnUrl: state.url }});
		return false;
	}
}