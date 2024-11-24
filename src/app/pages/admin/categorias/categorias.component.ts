import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, Input,Output,EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { CategoriasService } from './service/categorias.service';
import { CategoriaDialogComponent } from './components/categoria-dialog/categoria-dialog.component';
import { Categoria } from '../../../shared/models/categoria.interface';

enum Action {
  EDIT = 'edit',
  NEW = 'new'
}

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit, AfterViewInit, OnDestroy{

  private destroy$ = new Subject();
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: String[] = ['descripcion','estatus','acciones'];
  nuevaCategoria: any; // Variable para almacenar la nueva categoría

  // Logica para el la segunda opción de registro
  @Input() data?: Categoria; // Datos opcionales para editar
  userForm: FormGroup;
  actionTODO = Action.NEW;
  titleButton = 'Guardar';


  constructor(private dialog: MatDialog,
              private categoriaSvc: CategoriasService,
              private fb: FormBuilder, 
              private categoriasSvc: CategoriasService) {
                this.userForm = this.fb.group({
                  cveCategoria: ['', Validators.required],
                  descripcion: ['', [Validators.required, Validators.minLength(3)]],
                  activo: [true, Validators.required],
                });
              }


  // Inicia el listado de Categorias            
  ngOnInit(): void {
    this.listar();
    if (this.data) {
      this.userForm.patchValue(this.data);
      this.titleButton = 'Actualizar';
      this.actionTODO = Action.EDIT;
    }
  }

  // Crea un paginador
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Método que crea un listado de categorias
  listar() {
    this.categoriaSvc.listarCategorias()
    .pipe(takeUntil(this.destroy$))
    .subscribe( (categorias: any[]) => {
      this.dataSource.data = categorias;
    });
  }

  // Método de actualiza el estatus de una categoría
  cambiarEstatus(categoria: any) {
    // Lógica para cambiar el estatus
    const nuevoEstatus = !categoria.activo;
    this.categoriaSvc.cambiarEstatus(categoria.cveCategoria, nuevoEstatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          categoria.activo = nuevoEstatus; // Actualiza el estatus en la tabla
          window.location.reload()
        },
        error: (error) => {
          console.error('Error al cambiar estatus:', error);
          alert('Hubo un problema al actualizar el estatus.');
        }
      });
  }

  // Elimina el registro de un categoría
  eliminarCategoria(categoria: any) {
    if (this.tieneProductosAsignados(categoria)) {
      alert('No se puede eliminar una categoría que ya tiene algún producto asignado.');
      return;
    }
    // Lógica para eliminar la categoría
    console.log(categoria.cveCategoria);
    this.categoriaSvc.eliminarCategorias(categoria.cveCategoria)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((item: any) => item.cveCategoria !== categoria.cveCategoria);
        console.log('Categoría eliminada');
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        alert('Hubo un problema al eliminar la categoría.');
      }
    });
  }

  // Metodo para agregar una categoría opción 1
  agregarCategoria() {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, {
      width: '400px',
      data: { action: 'new' }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = [...this.dataSource.data, result]; // Añadir la nueva categoría
      }
    });
  }

  editarCategoria() {
    const dialogRef = this.dialog.open(CategoriaDialogComponent, {
      width: '400px',
      data: { action: 'edit' }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = [...this.dataSource.data, result]; // Añadir la nueva categoría
      }
    });
  }

  // Método para agregar una categoría opción 2
  agregarCategoria2(){
    // Verificar si el formulario es válido
  if (this.userForm.invalid) {
    this.userForm.markAllAsTouched(); // Marca los campos como "tocados" para mostrar errores
    return;
  }

  const formValue = this.userForm.getRawValue();
  const categoria: Categoria = {
    cveCategoria: parseInt(formValue.cveCategoria || '0', 10),
    descripcion: formValue.descripcion.trim(),
    activo: !!formValue.activo,
  };

  console.log('Guardando categoría:', categoria);

  // Enviar la categoría al servicio
  this.categoriaSvc.insertarCategorias(categoria).subscribe({
    next: () => {
      alert('Categoría guardada exitosamente.');
      this.listar(); // Refresca el listado
      this.userForm.reset(); // Limpia el formulario
    },
    error: (error) => {
      console.error('Error al guardar categoría:', error);
      alert('Hubo un problema al guardar la categoría.');
    }
  });
  }

  // Método para verificar si una categoría tiene productos asignados
  tieneProductosAsignados(categoria: any): boolean {
    // Lógica para verificar si la categoría tiene productos asignados
    // Esto puede ser una llamada al servicio que verifica esta condición
    return false;
  }

  // Método que valida si ya existe una categoría con ese nombre
  nombreCategoriaRepetido(nombre: string): boolean {
    return this.dataSource.data.some((categoria: any) => categoria.nombre === nombre);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}