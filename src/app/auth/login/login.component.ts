import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthData } from '../authData.model';

// ne treba selector ukoliko ga ucitavam uz pomoc routera
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
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
    this.authService.loginUser(authData);
  }
}
