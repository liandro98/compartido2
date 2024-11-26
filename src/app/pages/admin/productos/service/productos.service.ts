import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';
import { Producto } from '../../../../shared/models/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private snackBar: MatSnackBar, private http:HttpClient) { }

  listarProductos(): Observable<any[]>{
    return this.http.get<any[]>(`${environment.API_URL}/producto/`, { headers: { "requireToken": "true" } })
      .pipe(catchError((error) => this.handlerError(error)));
  }

  crearProducto(producto: any): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/producto`, producto, {
      headers: { requireToken: 'true' },
    });
  }

  listarCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/categoria`, {
      headers: { requireToken: 'true' },
    });
  }

  // Método para editar un producto
  editarProducto(producto: any): Observable<any> {
    return this.http.patch<any>(`${environment.API_URL}/producto/${producto.cveProducto}`, producto, { headers: { "requireToken": "true" } });
  }

  // Método para eliminar un producto
  eliminarProducto(cveProducto: number): Observable<any> {
    return this.http.delete<any>(`${environment.API_URL}/producto/${cveProducto}`, { headers: { "requireToken": "true" } });
  }
  

  private handlerError(error: any) {
    let message = "Ocurrió un error";
    if (error.error?.message) message = error.error.message;

    this.snackBar.open(message, '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'end'
    });

    return throwError(() => new Error(message));
  }
}
