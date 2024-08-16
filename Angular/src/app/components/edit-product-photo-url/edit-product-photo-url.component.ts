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
  selector: 'app-edit-product-photo-url',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './edit-product-photo-url.component.html',
  styleUrls: ['./edit-product-photo-url.component.css']
})
export class EditProductPhotoUrlComponent implements OnInit {
  photoUrl: string = '';
  productId: number | null = null;
  isAdmin: boolean = false;
  searchQuery: string = '';

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
    }
  }

  updatePhotoUrl(): void {
    if (this.productId) {
      const updateData = { photo_url: this.photoUrl };
      this.productService.updateProduct(this.productId, updateData).subscribe(
        response => {
          console.log('Photo URL update successful', response);
          this.snackBar.open('URL de la photo mise à jour avec succès !', 'Fermer', {
            duration: 5000,
          });
          this.router.navigate(['/products'], { queryParams: { productId: this.productId, searchQuery: this.searchQuery } }); 
        },
        error => {
          console.error('Photo URL update failed', error);
          this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
            duration: 5000,
          });
        }
      );
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
