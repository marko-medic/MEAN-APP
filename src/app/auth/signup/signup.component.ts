import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthData } from '../authData.model';

// ne treba selector ukoliko ga ucitavam uz pomoc routera
@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authSub: Subscription;
  constructor(private authService: AuthService) {}

  onFormSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    const authData: AuthData = {
      email: form.value.email,
      password: form.value.password
    };
    this.isLoading = true;
    this.authService.createUser(authData);
  }

  ngOnInit() {
    this.authSub = this.authService.getAuthSubject().subscribe(
      isAuth => {
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
