import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';


@Component({
  selector: 'app-edit-product-localisation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './edit-product-localisation.component.html',
  styleUrls: ['./edit-product-localisation.component.css']
})
export class EditProductLocalisationComponent implements OnInit {
  productId: number | null = null;
  isAdmin: boolean = false;
  searchQuery: string = '';
  localisations: any[] = [];
  newLocalisationId: number | null = null;

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();    
    this.productId = parseInt(this.getProductId() || '', 10);
    if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
    } else {
      this.loadLocalisations();
    }
  }

  loadLocalisations(): void {
    this.productService.getAllLocalisations().subscribe(
      (      data: any[]) => {
        this.localisations = data;
      },
      (      error: any) => {
        console.error('Erreur lors du chargement des localisations:', error);
        this.snackBar.open('Erreur lors du chargement des localisations', 'Fermer', {
          duration: 5000,
        });
      }
    );
  }

  updateLocalisation(): void {
    if (this.productId && this.newLocalisationId) {
      const updateData = { localisation_id: this.newLocalisationId }; 
      this.productService.updateProduct(this.productId, updateData).subscribe(
        response => {
          console.log('Localisation update successful', response);
          this.snackBar.open('Localisation mise à jour avec succès !', 'Fermer', {
            duration: 5000,
          });
          this.router.navigate(['/products'], { queryParams: { productId: this.productId, searchQuery: this.searchQuery } }); 
        },
        error => {
          console.error('Localisation update failed', error);
          this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
            duration: 5000,
          });
        }
      );
    } else {
      this.snackBar.open('Veuillez sélectionner une nouvelle localisation', 'Fermer', {
        duration: 5000,
      });
    }
  }
  

  returnToProduct(): void {
    this.router.navigate(['/products'], { queryParams: { productId: this.productId, searchQuery: this.searchQuery } });
  }

  getProductId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
