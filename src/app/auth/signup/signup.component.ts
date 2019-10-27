import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthData } from '../authData.model';

// ne treba selector ukoliko ga ucitavam uz pomoc routera
@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
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
    this.authService.createUser(authData);
  }
}
