import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';
import { AuthService } from './auth.service';

// Mora da se injectuje u app.module
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // console.log('intercepted'); // u sve ajax metode se poziva

    const token = this.authService.getToken();
    // pravilo je da se kopira req da ne bi doslo do problema
    const reqCopy = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next.handle(reqCopy);
  }
}
