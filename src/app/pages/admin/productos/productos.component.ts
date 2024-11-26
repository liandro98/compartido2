import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { ProductosService } from './service/productos.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['descripcion', 'precio', 'cantidad', 'acciones'];
  private destroy$ = new Subject();
  formProducto!: FormGroup;
  categorias: any[] = [];
  productoEditando: boolean = false;

  constructor(private servicio:ProductosService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.inicializarFormulario();
    this.cargarCategorias();
    this.listar();
  }

  // Inicializa el formulario reactivo
  inicializarFormulario(): void {
    this.formProducto = this.fb.group({
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(1)]],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      cveCategoria: ['', Validators.required],
      cveProducto: [''] 
    });
  }

  // Carga las categorías desde el servicio
  cargarCategorias(): void {
    this.servicio.listarCategorias().subscribe(
      (data: any[]) => {
        this.categorias = data;
      },
      (error) => {
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000,
        });
      }
    );
  }

  // Registra un nuevo producto
  registrarProducto(): void {
    if (this.formProducto.valid) {
      const producto = this.formProducto.value;

      if (this.productoEditando) {
        // Editar producto
        this.servicio.editarProducto(producto).subscribe(() => {
          this.listar();  // Refrescar lista
          this.formProducto.reset();  // Limpiar formulario
          this.productoEditando = false;  // Cambiar el estado de edición a falso
        });
      } else {
        // Crear nuevo producto
        this.servicio.crearProducto(producto).subscribe(() => {
          this.listar();  // Refrescar lista
          this.formProducto.reset();  // Limpiar formulario
        });
      }
    }
  }

  // Crea un paginador
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  // Listado de productos
  listar(){
    this.servicio.listarProductos()
    .pipe(takeUntil(this.destroy$))
    .subscribe( (producto: any[]) => {
    this.dataSource.data = producto;
    });
  }


  // Método para editar un producto
  editarProducto() {
    if (this.formProducto.valid) {
      const producto = this.formProducto.value;
      this.servicio.editarProducto(producto).subscribe(() => {
        this.listar();  // Refrescar lista
        this.formProducto.reset();  // Limpiar formulario
      });
    }
  }

  // Método para eliminar un producto
  eliminarProducto(producto: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.servicio.eliminarProducto(producto.cveProducto).subscribe(() => {
        this.listar();  // Refrescar lista después de eliminar
      });
    }
  }

  // Método para rellenar el formulario con los datos de un producto
  editarFormulario(producto: any) {
    this.formProducto.setValue({
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: producto.cantidad,
      cveCategoria: producto.cveCategoria,
      cveProducto: producto.cveProducto  
    });
    this.productoEditando = true
  }

  cancelarEdicion() {
    this.formProducto.reset();  
    this.productoEditando = false;  
  }

  ngOnDestroy(): void {
    //this.destroy$.next();
    this.destroy$.complete();
  }
}
