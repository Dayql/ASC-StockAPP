import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Authorization': token ? token : '',
      'Content-Type': 'application/json'
    });
  }

  getAlerts(page: number = 1, limit: number = 5): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  getExceededAlerts(page: number = 1, limit: number = 4): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/exceeded?page=${page}&limit=${limit}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  createAlert(alertData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(this.apiUrl, alertData, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  updateAlert(alertId: number, updateData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/${alertId}`, updateData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAlert(alertId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${alertId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    return throwError(error);
  }
}
