import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { CategoriasService } from './service/categorias.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit, AfterViewInit, OnDestroy{

  private destroy$ = new Subject();
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: String[] = ['nombre','estatus','acciones'];
nuevaCategoria: any; // Variable para almacenar la nueva categoría
  constructor(private dialog: MatDialog,
              private categoriaSvc: CategoriasService) {}

  ngOnInit(): void {
    this.listar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  listar() {
    this.categoriaSvc.listarCategorias()
    .pipe(takeUntil(this.destroy$))
    .subscribe( (categorias: any[]) => {
      this.dataSource.data = categorias;
    });
  }

  cambiarEstatus(categoria: any) {
    // Lógica para cambiar el estatus
  }

  eliminarCategoria(categoria: any) {
    if (this.tieneProductosAsignados(categoria)) {
      alert('No se puede eliminar una categoría que ya tiene algún producto asignado.');
      return;
    }
    // Lógica para eliminar la categoría
  }

  agregarCategoria(nuevaCategoria: any) {
    if (this.nombreCategoriaRepetido(nuevaCategoria.nombre)) {
      alert('El nombre de la categoría no debe repetirse.');
      return;
    }
    // Lógica para agregar la categoría
  }

  tieneProductosAsignados(categoria: any): boolean {
    // Lógica para verificar si la categoría tiene productos asignados
    // Esto puede ser una llamada al servicio que verifica esta condición
    return false;
  }

  nombreCategoriaRepetido(nombre: string): boolean {
    return this.dataSource.data.some((categoria: any) => categoria.nombre === nombre);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}