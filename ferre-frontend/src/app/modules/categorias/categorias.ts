import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';

declare var $: any;

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
})
export class Categorias implements OnInit {
    canRead = false;
    canCreate = false;
    canUpdate = false;
    canDelete = false;

    load_data: boolean = true;
    load_categoria: boolean = true;
    load_update: boolean = true;
    load_delete: boolean = true;

    filtro_categoria: string = '';
    page: number = 1;
    pageSize: number = 10;

    categorias: Categoria[] = [];
    categorias_const: Categoria[] = [];

    public createCategoria: any = {
      nombre: '',
      descripcion: '',
    };

    public updateCategoria: any = {
      id: null,
      nombre: '',
      descripcion: '',
    };
    constructor(
      private auth: AuthService,
      private router: Router,
      private categoriaService: CategoriaService
    ){}

    ngOnInit(): void {
      this.canRead = this.auth.hasPermission('CATEGORIA_READ');
      this.canCreate = this.auth.hasPermission('CATEGORIA_CREATE');
      this.canUpdate = this.auth.hasPermission('CATEGORIA_UPDATE');
      this.canDelete = this.auth.hasPermission('CATEGORIA_DELETE');

      // Si ni siquiera puede leer, lo sacamos
      if (!this.canRead) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.init_categorias();
    }

    init_categorias() {
    this.load_data = true;
    this.categoriaService.getAllCategorias().subscribe({
      next: (response) => {
        this.categorias = response.data || [];
        this.categorias_const = [...this.categorias];
        this.load_data = false;
      },
      error: (err) => {
        console.error('Error al obtener categorías', err);
        this.load_data = false;
        $.notify('Error al obtener categorías', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
      },
    });
  }

  // 🔍 Filtro por nombre o descripción
  filtrar() {
    if (!this.filtro_categoria) {
      this.categorias = [...this.categorias_const];
      return;
    }

    const term = this.filtro_categoria.toLowerCase().trim();

    this.categorias = this.categorias_const.filter((item) => {
      const nombre = (item.nombre || '').toLowerCase();
      const descripcion = (item.descripcion || '').toLowerCase();
      return nombre.includes(term) || descripcion.includes(term);
    });
  }

  // 🟢 Modal crear
  openCreateModal() {
    if (!this.canCreate) return;

    this.createCategoria = {
      nombre: '',
      descripcion: '',
    };
    this.load_categoria = true;

    $('#modalCreateCategoria').modal('show');
  }

  save_create_categoria() {
    if (!this.canCreate) return;

    if (!this.createCategoria.nombre) {
      $.notify('Ingrese el nombre de la categoría', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.load_categoria = false;

    this.categoriaService.createCategoria(this.createCategoria).subscribe({
      next: (response) => {
        if (!response || !response.data) {
          $.notify(response?.message || 'No se pudo crear la categoría', {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });
          this.load_categoria = true;
          return;
        }

        $.notify('Categoría creada correctamente', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalCreateCategoria').modal('hide');
        this.init_categorias();
        this.load_categoria = true;
      },
      error: (err) => {
        console.error('Error al crear categoría', err);
        $.notify(err?.error?.message || 'Error al crear categoría', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_categoria = true;
      },
    });
  }

  // 🟠 Modal editar
  openEditModal(id: any) {
    if (!this.canUpdate) return;

    this.load_update = true;
    $('#modalUpdateCategoria').modal('show');

    this.categoriaService.getByIdCategoria(id).subscribe({
      next: (response) => {
        this.updateCategoria = response.data;
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al obtener categoría', err);
        $.notify('Error al obtener datos de la categoría', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_update = true;
      },
    });
  }

  actualizar() {
    if (!this.canUpdate) return;

    if (!this.updateCategoria.nombre) {
      $.notify('Ingrese el nombre de la categoría', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: { from: 'top', align: 'right' },
        delay: 1000,
        animate: { enter: 'animated bounce', exit: 'animated bounce' },
      });
      return;
    }

    this.load_update = false;

    const payload = {
      nombre: this.updateCategoria.nombre,
      descripcion: this.updateCategoria.descripcion,
    };

    this.categoriaService.updateCategoria(this.updateCategoria.id, payload).subscribe({
      next: (response) => {
        $.notify('Se actualizó correctamente la categoría', {
          type: 'success',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });

        $('#modalUpdateCategoria').modal('hide');
        this.init_categorias();
        this.load_update = true;
      },
      error: (err) => {
        console.error('Error al actualizar categoría', err);
        $.notify(err?.error?.message || 'Error al actualizar categoría', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.load_update = true;
      },
    });
  }

  eliminar_categoria(id: any) {
    if (!this.canDelete) return;

    this.load_delete = false;

    this.categoriaService.deleteCategoria(id).subscribe({
      next: (response) => {
        $.notify(
          response?.message || 'Categoría deshabilitada correctamente',
          {
            type: 'success',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          }
        );

        $('#delete-' + id).modal('hide');
        this.load_delete = true;
        this.init_categorias();
      },
      error: (err) => {
        console.error('Error al deshabilitar categoría', err);
        $.notify(err?.error?.message || 'Error al deshabilitar categoría', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        $('#delete-' + id).modal('hide');
        this.load_delete = true;
      },
    });
  }

}
