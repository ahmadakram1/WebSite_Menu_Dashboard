import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LanguageService, TranslatePipe } from '../../../core/i18n/language.service';
import { API_BASE } from '../../../core/api';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    TranslatePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  email = '';
  password = '';
  rememberMe = true;

  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  readonly languageService = inject(LanguageService);

  submit(): void {
    this.http
      .post<{ token: string }>(`${API_BASE}/login.php`, {
        email: this.email,
        password: this.password
      })
      .subscribe({
        next: (response) => {
          try {
            if (this.rememberMe) {
              sessionStorage.removeItem('auth_token');
              localStorage.setItem('auth_token', response.token);
            } else {
              localStorage.removeItem('auth_token');
              sessionStorage.setItem('auth_token', response.token);
            }
          } catch {
            // Ignore storage errors.
          }
          this.router.navigateByUrl('/admin');
        },
        error: () => {
          this.snackBar.open('Invalid email or password.', undefined, { duration: 2500 });
        }
      });
  }

  toggleLanguage(): void {
    this.languageService.toggle();
  }
}
