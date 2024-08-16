import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product/product.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, RouterModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent implements OnInit {
  isAdmin: boolean = false;
  product: any = {
    reference: '',
    nom: '',
    prix: 0,
    stock: 0,
    photo_url: '',
    localisation_description: ''
  };
  localisations: any[] = [];

  constructor(
    private router: Router,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
    }

    // Charger les localisations
    this.productService.getAllLocalisations().subscribe(
      (localisations) => {
        this.localisations = localisations;
      },
      (error) => {
        console.error('Erreur lors du chargement des localisations', error);
        this.snackBar.open('Erreur lors du chargement des localisations', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  createProduct(): void {
    this.productService.createProduct(this.product).subscribe(
      () => {
        this.snackBar.open('Produit créé avec succès', 'Fermer', {
          duration: 3000
        });
        this.router.navigate(['/user-management']);
      },
      (error) => {
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 5000
        });
        console.error('Erreur lors de la création du produit', error);
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/user-management']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
