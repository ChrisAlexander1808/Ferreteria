import { Component, OnInit } from '@angular/core';
import { Modulo } from '../../../core/models/modulo.model';
import { ModuloService } from '../../../core/services/modulo.service';
declare var $: any;

@Component({
  selector: 'app-index-modulo',
  standalone: false,
  templateUrl: './index-modulo.html',
  styleUrl: './index-modulo.scss',
})
export class IndexModulo implements OnInit {

  load_data: boolean = true;
  load_delete: boolean = true;
  load_modulo: boolean = true;
  filtro_modulo: string = '';
  page: number = 1;
  pageSize: number = 10;
  modulos: Modulo[] = [];
  modulos_const: Modulo[] = [];
  public createModulo: any = {
    nombre: '',
    clave: '',
    descripcion: ''
  };
  public updateModulo: any = {
    nombre: '',
    clave: '',
    descripcion: ''
  };

  constructor(
    private moduloService: ModuloService
  ) { }

  ngOnInit(): void {
    this.init_modulos();
  }

  init_modulos() {
    this.load_data = true;
    this.moduloService.getAllModulos().subscribe(
      response => {
        this.modulos = response.data;
        this.modulos_const = this.modulos;
        this.load_data = false;
      }
    )
  }

  filtrar() {
    if (!this.filtro_modulo) {
      this.modulos = [...this.modulos_const];
      return;
    }
    var term = new RegExp(this.filtro_modulo, 'i');
    this.modulos = this.modulos_const.filter(item => term.test(item.nombre));
  }

  openCreateModal() {
    this.createModulo = { nombre: '', clave: '', descripcion: '' }; // Reinicia los valores
    this.load_modulo = true; // Reinicia el estado de carga
    $('#exampleModalCenter').modal('show');
  }

  save() {
    if (!this.createModulo.nombre) {
      $.notify('Ingrese el nombre del módulo', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
    } else if (!this.createModulo.clave) {
      $.notify('Ingrese la clave del módulo', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
    } else if (!this.createModulo.descripcion) {
      $.notify('Ingrese la descripción del módulo', {
        type: 'danger',
        spacing: 10,
        timer: 2000,
        placement: {
          from: 'top',
          align: 'right'
        },
        delay: 1000,
        animate: {
          enter: 'animated bounce',
          exit: 'animated bounce'
        }
      });
    } else {
      this.load_modulo = false;

      this.moduloService.createModulo(this.createModulo).subscribe({
        next: (response: any) => {
          // El backend manda: { message, data: { modulo, permisos } }
          const msg = response?.message || 'Se registró el módulo correctamente';

          $.notify(msg, {
            type: 'success',
            spacing: 10,
            timer: 2000,
            placement: {
              from: 'top',
              align: 'right'
            },
            delay: 1000,
            animate: {
              enter: 'animated bounce',
              exit: 'animated bounce'
            }
          });

          $('#exampleModalCenter').modal('hide');
          this.init_modulos();           // recarga la tabla
          this.load_modulo = true;
          // Reiniciamos el formulario a objeto vacío, NO a []
          this.createModulo = { nombre: '', clave: '', descripcion: '' };
        },
        error: (err) => {
          this.load_modulo = true;

          // El backend manda: { message: '...' }
          const backendMsg = err?.error?.message;

          let msg = 'Error al crear módulo';

          if (backendMsg) {
            msg = backendMsg; // Ej: 'Ya existe un módulo con ese nombre' o 'El nombre es obligatorio'
          }

          $.notify(msg, {
            type: 'danger',
            spacing: 10,
            timer: 2000,
            placement: {
              from: 'top',
              align: 'right'
            },
            delay: 1000,
            animate: {
              enter: 'animated bounce',
              exit: 'animated bounce'
            }
          });
        }
      });
    }
  }

  openEditModal(id: number) {
    this.updateModulo = {};
    this.moduloService.getByIdModulo(id).subscribe(response => {
      this.updateModulo = response.data;
      $('#exampleModalCenterUpdate').modal('show');
      setTimeout(() => {
        $('.selectpicker').selectpicker('refresh');
      }, 150);
    });
  }

  actualizar(){
    this.moduloService.updateModulo(this.updateModulo.id,this.updateModulo).subscribe(
      response=>{
        $.notify('Se actualizó correctamente el módulo', {
            type: 'success',
            spacing: 10,
              timer: 2000,
              placement:{
                from: 'top',
                align: 'right'              
              },
              delay: 1000,
              animate: {
                enter: 'animated' + 'bounce',
                exit: 'animated' + 'bounce'
              }
            }); 
            $('#exampleModalCenterUpdate').modal('hide');
            this.init_modulos();  
      }
    )
  }
}
