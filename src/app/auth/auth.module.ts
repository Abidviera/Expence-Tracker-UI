import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    EmailVerificationComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule
  ],
  
})
export class AuthModule { }
