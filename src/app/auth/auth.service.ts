import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './authData.model';

interface SignupRespData {
  message: string;
  result: AuthData;
}

interface LoginRespData {
  token: string;
  expiresIn: number;
}

const url = 'http://localhost:3000/api/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new Subject<boolean>(); // slusa da li je user ulogovan
  private token: string;
  private isAuth = false;
  private authTimer: NodeJS.Timer;

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string {
    return this.token;
  }

  getIsAuth() {
    return this.isAuth;
  }

  createUser(authData: AuthData): void {
    this.http
      .post<SignupRespData>(url + '/signup', authData)
      .subscribe(resp => {
        console.log(resp);
      });
  }

  loginUser(authData: AuthData): void {
    this.http.post<LoginRespData>(url + '/login', authData).subscribe(resp => {
      this.token = resp.token;
      if (this.token) {
        this.authSubject.next(true);
        this.isAuth = true;
        this.setAuthTimer(resp.expiresIn);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + resp.expiresIn * 1000);
        this.storeAuthInfo(resp.token, expirationDate);
        this.router.navigate(['/']);
      }
    });
  }

  getAuthSubject(): Observable<boolean> {
    return this.authSubject.asObservable();
  }

  logOut(): void {
    this.token = null;
    this.isAuth = false;
    this.authSubject.next(false);
    clearInterval(this.authTimer);
    this.clearStoredAuthInfo();
    this.router.navigate(['/']);
  }

  private setAuthTimer(expiresIn: number): void {
    this.authTimer = setTimeout(() => {
      this.logOut();
    }, expiresIn * 1000);
  }

  autoAuthUser() {
    const authInformation = this.getStoredAuthInfo();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expireDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuth = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authSubject.next(true);
    }
  }

  private getStoredAuthInfo() {
    const expires = localStorage.getItem('expires');
    const token = localStorage.getItem('token');

    if (!expires || !token) {
      return;
    }
    return {
      expireDate: new Date(expires),
      token
    };
  }

  private storeAuthInfo(token: string, expires: Date): void {
    localStorage.setItem('expires', expires.toISOString());
    localStorage.setItem('token', token);
  }

  private clearStoredAuthInfo(): void {
    localStorage.removeItem('expires');
    localStorage.removeItem('token');
  }
}
