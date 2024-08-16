import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

ngOnInit(): void {
  this.isAdmin = this.authService.isAdmin();
  if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
    this.router.navigate(['/login']);
  }
}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  register() {
    const userData = { username: this.username, email: this.email, password: this.password };
    this.authService.register(userData).subscribe(
      response => {
        console.log('Registration successful', response);
        this.snackBar.open('Inscription réussie !', 'Fermer', {
          duration: 5000,
        });
      },
      error => {
        console.error('Registration failed', error);
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 5000,
        });
      }
    );
  }
}
