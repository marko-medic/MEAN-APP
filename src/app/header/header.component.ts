import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.components.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isUserAuth = false;
  private authSub: Subscription;
  constructor(private authService: AuthService) {}

  onLogOut() {
    this.authService.logOut();
  }

  ngOnInit() {
    this.isUserAuth = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthSubject().subscribe(isAuth => {
      this.isUserAuth = isAuth;
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
