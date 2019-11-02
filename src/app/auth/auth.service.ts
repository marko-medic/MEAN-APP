import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './authData.model';
import { environment } from 'src/environments/environment';

interface SignupRespData {
  message: string;
  result: AuthData;
}

interface LoginRespData {
  token: string;
  expiresIn: number;
  userId: string;
}

const BACKEND_URL = `${environment.apiUrl}user/`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authSubject = new Subject<boolean>(); // slusa da li je user ulogovan
  private token: string;
  private isAuth = false;
  private authTimer: any;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string {
    return this.token;
  }

  getUserId(): string {
    return this.userId;
  }

  getIsAuth(): boolean {
    return this.isAuth;
  }

  createUser(authData: AuthData): void {
    this.http.post<SignupRespData>(BACKEND_URL + 'signup', authData).subscribe(
      resp => {
        console.log(resp);
        this.router.navigate(['/']);
      },
      error => {
        this.authSubject.next(false);
      }
    );
  }

  loginUser(authData: AuthData): void {
    this.http.post<LoginRespData>(BACKEND_URL + 'login', authData).subscribe(
      resp => {
        this.token = resp.token;
        if (this.token) {
          this.authSubject.next(true);
          this.isAuth = true;
          this.setAuthTimer(resp.expiresIn);
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + resp.expiresIn * 1000
          );
          this.userId = resp.userId;
          this.storeAuthInfo(resp.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      },
      error => {
        this.authSubject.next(false);
      }
    );
  }

  getAuthSubject(): Observable<boolean> {
    return this.authSubject.asObservable();
  }

  logOut(): void {
    this.token = null;
    this.isAuth = false;
    this.authSubject.next(false);
    clearInterval(this.authTimer);
    this.userId = null;
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
      this.userId = authInformation.userId;
      this.isAuth = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authSubject.next(true);
    }
  }

  private getStoredAuthInfo() {
    const expires = localStorage.getItem('expires');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!expires || !token || !userId) {
      return;
    }
    return {
      expireDate: new Date(expires),
      token,
      userId
    };
  }

  private storeAuthInfo(token: string, expires: Date, userId: string): void {
    localStorage.setItem('expires', expires.toISOString());
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  }

  private clearStoredAuthInfo(): void {
    localStorage.removeItem('expires');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }
}
