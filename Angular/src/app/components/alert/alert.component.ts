import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert/alert.service';
import { ProductService } from '../../services/product/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  alerts: any[] = [];
  exceededAlerts: any[] = [];
  isAdmin: boolean = false;
  newAlert: any = {
    reference: '',
    seuil: 0
  };
  selectedAlert: any = { reference: '', seuil: 0 };
  currentPage: number = 1;
  totalPages: number = 1;
  exceededCurrentPage: number = 1;
  exceededTotalPages: number = 1;

  constructor(
    private alertService: AlertService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (!this.authService.isAuthenticated() || this.authService.isTokenExpired()) {
      this.router.navigate(['/login']);
    } else {
      this.loadAlerts();
      this.loadExceededAlerts();
    }
  }

  loadAlerts(page: number = 1): void {
    this.alertService.getAlerts(page).subscribe(
      (response) => {
        this.alerts = response.alerts;
        this.totalPages = response.totalPages;
        this.currentPage = page;
      },
      (error) => {
        console.error('Erreur lors du chargement des alertes', error);
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  loadExceededAlerts(page: number = 1): void {
    this.alertService.getExceededAlerts(page).subscribe(
      (response) => {
        this.exceededAlerts = response.alerts;
        this.exceededTotalPages = response.totalPages;
        this.exceededCurrentPage = page;
      },
      (error) => {
        console.error('Erreur lors du chargement des alertes dépassées', error);
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  createAlert(): void {
    if (!this.newAlert.reference || this.newAlert.reference.trim().length === 0) {
      this.snackBar.open('La référence du produit est requise', 'Fermer', {
        duration: 3000
      });
      return;
    }

    if (this.newAlert.seuil === undefined || this.newAlert.seuil === null || this.newAlert.seuil < 0) {
      this.snackBar.open('Le seuil est requis et ne peut pas être négatif', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.productService.getProductByReference(this.newAlert.reference).subscribe(
      (product) => {
        if (product && product.produit_id) {
          const alertData = {
            produit_id: product.produit_id,
            seuil: this.newAlert.seuil
          };
          this.alertService.createAlert(alertData).subscribe(
            (response) => {
              this.snackBar.open('Alerte créée avec succès', 'Fermer', {
                duration: 3000
              });
              this.loadAlerts();
              this.loadExceededAlerts()
              this.newAlert = { reference: '', seuil: 0 }; // Réinitialise le formulaire
            },
            (error) => {
              console.error('Erreur lors de la création de l\'alerte', error);
              this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
                duration: 3000
              });
            }
          );
        } else {
          this.snackBar.open('Produit non trouvé', 'Fermer', {
            duration: 3000
          });
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération du produit', error);
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  selectAlert(alert: any): void {
    this.selectedAlert = { ...alert };
  }

  updateAlert(): void {
    if (this.selectedAlert) {
      if (this.selectedAlert.seuil < 0) {
        this.snackBar.open('Le seuil ne peut pas être négatif', 'Fermer', {
          duration: 3000
        });
        return;
      }
      this.alertService.updateAlert(this.selectedAlert.alert_id, { seuil: this.selectedAlert.seuil }).subscribe(
        (response) => {
          this.snackBar.open('Alerte mise à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadAlerts();
          this.loadExceededAlerts()
          this.selectedAlert = { reference: '', seuil: 0 };
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'alerte', error);
          this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }

  deleteAlert(alertId: number): void {
    this.alertService.deleteAlert(alertId).subscribe(
      () => {
        this.snackBar.open('Alerte supprimée avec succès', 'Fermer', {
          duration: 3000
        });
        this.loadAlerts();
        this.loadExceededAlerts()
      },
      (error) => {
        console.error('Erreur lors de la suppression de l\'alerte', error);
        this.snackBar.open('Erreur : ' + (error?.error?.message), 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadAlerts(page);
    }
  }

  goToExceededPage(page: number): void {
    if (page >= 1 && page <= this.exceededTotalPages) {
      this.loadExceededAlerts(page);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
