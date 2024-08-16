import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isAdmin: boolean = false;
  aisles: any[] = [];
  selectedAisle: number | null = null;
  aisleInfo: any = { products: [] };
  totalEstimatedPrice: number = 0;
  totalProducts: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
    } else {
      this.loadAisles();
    }
  }

  loadAisles(): void {
    this.dashboardService.getAllAisles().subscribe(
      (data: any[]) => {
        this.aisles = data;
      },
      (error: any) => {
        console.error('Erreur lors du chargement des allées:', error);
        this.snackBar.open('Erreur lors du chargement des allées', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  loadAisleDetails(): void {
    if (this.selectedAisle) {
      this.dashboardService.getAisleDetails(this.selectedAisle, this.currentPage, this.itemsPerPage).subscribe(
        (data: any) => {
          console.log('Détails de l\'allée :', data);
          this.aisleInfo = data;
  
          if (data.products && Array.isArray(data.products)) {
            this.totalProducts = data.totalProducts || data.products.length;
            this.totalEstimatedPrice = parseFloat(
              data.products.reduce((sum: number, product: any) => sum + (product.prix * product.stock), 0).toFixed(2)
            );
            this.totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
          } else {
            this.totalProducts = 0;
            this.totalEstimatedPrice = 0;
          }
        },
        (error: any) => {
          console.error('Erreur lors de la récupération des détails de l\'allée:', error);
          this.snackBar.open('Erreur lors de la récupération des détails de l\'allée', 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAisleDetails();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAisleDetails();
    }
  }

  onAisleSelect(): void {
    this.currentPage = 1;  // Réinitialiser à la première page lorsqu'une nouvelle allée est sélectionnée
    this.loadAisleDetails();
  }

  logout(): void {
    try {
      this.authService.logout();
      console.log('Déconnexion réussie');
      this.snackBar.open('Déconnexion réussie', 'Fermer', {
        duration: 3000
      });
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      this.snackBar.open('Erreur lors de la déconnexion', 'Fermer', {
        duration: 3000
      });
    }
  }
}

