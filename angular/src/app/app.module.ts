import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';  

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginSignupComponent } from './login-signup/login-signup.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

import { EqualValidator } from './equal-validator.directive';

import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForgetEmailComponent } from './forget-email/forget-email.component';

import { ConfirmComponent } from './confirm/confirm.component';
import { Login2FAModal } from './login-signup/login-2FA-modal.component';
import { Activate2FAModal } from './login-signup/activate-2FA-modal.component';
import { TwoFactorModal } from './login-signup/2FA-modal.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AboutComponent } from './about/about.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginSignupComponent,
    Login2FAModal,
    Activate2FAModal,
    TwoFactorModal,
    RegisterComponent,
    ResetPasswordComponent,
    EqualValidator,
    ForgetEmailComponent,
    ConfirmComponent,
    UserProfileComponent,
    AboutComponent,
    SecuritySettingsComponent,
    NavBarComponent,
    UserSettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgbModule,
    CommonModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

//I dont know what this does, but it was causing ngOnInit twice
//platformBrowserDynamic().bootstrapModule(AppModule);