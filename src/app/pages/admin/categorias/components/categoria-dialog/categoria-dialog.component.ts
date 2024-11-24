import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { BaseForm } from '../../../../../shared/utilis/base-form';
import { CategoriasService } from '../../service/categorias.service';
import { Categoria } from '../../../../../shared/models/categoria.interface';

enum Action {
  EDIT = 'edit',
  NEW = 'new'
}

@Component({
  selector: 'app-categoria-dialog',
  templateUrl: './categoria-dialog.component.html',
  styleUrls: ['./categoria-dialog.component.scss']
})
export class CategoriaDialogComponent {
  private destroy$ = new Subject();
  titleButton = "Guardar";
  actionTODO = Action.NEW;
  categoria: Categoria[] = [];

  userForm = this.fb.group({
    cveCategoria: [''], 
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    activo: [true, [Validators.required]], 
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CategoriaDialogComponent>,
    private fb: FormBuilder,
    public baseForm: BaseForm,
    private categoriasSvc: CategoriasService
  ) { }

  ngOnInit(): void {
    // Listar categorías al inicio
    this.categoriasSvc.listarCategorias().pipe(takeUntil(this.destroy$)).subscribe((categoria: Categoria[]) => {
      this.categoria = categoria;
      this.pathData();
    });
  }

 
  pathData() {
    console.log(this.userForm.value);
    if (this.data.user?.cveCategoria) { 
      this.userForm.patchValue({
        cveCategoria: this.data.user.cveCategoria,
        descripcion: this.data.user.descripcion,
        activo: this.data.user.activo,
      });

      
      this.userForm.get('descripcion')?.disable();
      this.userForm.get('activo')?.setValidators(null); 
      this.userForm.updateValueAndValidity();

      this.titleButton = 'Actualizar';
      this.actionTODO = Action.EDIT;
    } else {
      this.titleButton = 'Guardar';
      this.actionTODO = Action.NEW;
    }
  }


  onSave() {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.getRawValue();
    const categoria: Categoria = {
      descripcion: formValue.descripcion!,
      activo: formValue.activo!,
      cveCategoria: parseInt (formValue.cveCategoria!)
    };

    if (this.actionTODO === Action.NEW) {
      this.categoriasSvc.insertarCategorias(categoria)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: Categoria) => {
          this.dialogRef.close(data);
        });
      }else{
        var updateUser : Categoria ={
          activo: formValue.activo!,
          cveCategoria: parseInt(formValue.cveCategoria!),
          descripcion: formValue.descripcion!
  
        };
  
        var cveCategoria: number = parseInt(formValue.cveCategoria!);
  
        this.categoriasSvc.actualizarCategorias(cveCategoria, updateUser)
          .pipe(takeUntil(this.destroy$))
          .subscribe((user)=>{
            this.dialogRef.close(user);
          });
      }
    }


  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();

  }
}