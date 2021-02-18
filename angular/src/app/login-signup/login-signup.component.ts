import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'login-signup',
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css']
})
export class LoginSignupComponent {

  user: User = {
    email: "",
    password: ""
  }

  constructor(private authService: AuthService, private toastr: ToastrService) {}

  //https://stackoverflow.com/questions/41195708/how-to-get-form-data-in-angular-2
  doLogin(model: User, isValid: boolean|null) {
    if (isValid) {
      this.authService.doLogin(model.email, model.password);
    } else {
      this.toastr.error('Form data is invalid...');
    }
    
  }

  doLogout() {
    this.authService.logout();
  }

  doFacebook() {
    console.log("Facebook");
    this.authService.doFacebook();
  }

  doGoogle() {
    console.log("Google");
    this.authService.doGoogle();
  }

}

interface User {
  email: string;
  password: string;
}