import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { AuthGuard } from './AuthGuard/Auth.guard';

const routes: Routes = [
  {path: '', component:RegisterComponent},
  {path: 'login', component:LoginComponent},
  {path: 'email-verification', component:EmailVerificationComponent},

  {
    path: 'features',
    loadChildren: () => import('../features/features.module').then(a => a.FeaturesModule), canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
