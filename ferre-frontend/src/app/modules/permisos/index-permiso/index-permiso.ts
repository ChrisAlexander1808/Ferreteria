import { Component, OnInit } from '@angular/core';
import { PermisoService } from '../../../core/services/permiso.service';
import { Permiso } from '../../../core/models/permiso.model';
import { Modulo } from '../../../core/models/modulo.model';
import { ModuloService } from '../../../core/services/modulo.service';
declare var $:any ;

@Component({
  selector: 'app-index-permiso',
  standalone: false,
  templateUrl: './index-permiso.html',
  styleUrl: './index-permiso.scss',
})
export class IndexPermiso implements OnInit {

   load_data: boolean = true;
   load_delete: boolean = true;
   load_permiso: boolean = true;
   filtro_permiso : string = '';
   page : number = 1;
   pageSize : number = 10;
   permisos : Permiso[] = [];
   permisos_const : Permiso[] = [];
   modulos : Modulo[] = [];
   public createPermiso : any = {
      clave:'',
      descripcion:'',
      modulo_id:''
    };
   public updatePermiso : any = {
      clave:'',
      descripcion:'',
      modulo_id: ''
    };

    constructor(
      private permisoService: PermisoService,
      private moduloService: ModuloService
    ){}

    ngOnInit(): void {
      this.init_permisos();
      this.init_modulos();
    }

    init_permisos(){
      this.load_data = true;
      this.permisoService.getAllPermisos().subscribe(
        response=>{
          this.permisos = response.data;
          this.permisos_const = this.permisos;
          this.load_data = false;
        }
      )
    }

    init_modulos(){
      this.moduloService.getAllModulos().subscribe(
        response=>{
          this.modulos = response.data;
          setTimeout(()=>{
            $('.selectpicker').selectpicker('refresh');
          },150);
        }
      )
    }

    filtrar(){
      // Si el campo de búsqueda está vacío, restauramos todos los módulos
        if (!this.filtro_permiso) {
          this.permisos = [...this.permisos_const]; // Restablece la lista completa
          return;
        }

        // Si hay texto, aplicamos el filtro con expresión regular
        var term = new RegExp(this.filtro_permiso, 'i');
        this.permisos = this.permisos_const.filter(item => term.test(item.clave));
    }

    openCreateModal(){
      this.createPermiso = { clave: '', descripcion: '' };
      this.load_permiso = true;
      $('#exampleModalCenter').modal('show'); 
    }

    save(){
      if (!this.createPermiso.clave) {
        $.notify('Ingrese el nombre del permiso', {
          type: 'danger',
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
      }else if (!this.createPermiso.descripcion) {
        $.notify('Ingrese una descripción del permiso', {
          type: 'danger',
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
      }else if (!this.createPermiso.modulo_id) {
        $.notify('Seleccione un modulo del permiso', {
          type: 'danger',
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
      }else{
        this.load_permiso = true;
        this.permisoService.createPermiso(this.createPermiso).subscribe(
         response=>{
           $.notify('Se registro el nuevo permiso', {
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
             $('#exampleModalCenter').modal('hide');
             this.init_permisos(); 
             this.load_permiso = false; 
             this.createPermiso = [];  
         }
        );
      }
    }
   
    openEditModal(id:number){
      $('#exampleModalCenterUpdate').modal('show');
      this.permisoService.getPermisoById(id).subscribe(
         response=>{
           this.updatePermiso = response.data;     
           setTimeout(()=>{
            $('.selectpicker').selectpicker('refresh');
          },150);
         }
       );  
    }

    actualizar(){
      const payload: any = {
      clave: this.updatePermiso.clave,
      descripcion: this.updatePermiso.descripcion,
      modulo_id: Number(this.updatePermiso.modulo_id) // 👈 aseguramos number
    };
       this.permisoService.updatePermiso(this.updatePermiso.id,payload).subscribe(
        response=>{
          $.notify('Se actualizó correctamente el permiso', {
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
            this.init_permisos();  
        }
      );
    }

    eliminar_permiso(id:number){
       this.load_delete = true;
      this.permisoService.deletePermiso(id).subscribe(
        response=>{          
          if (response.message && response.message === 'Permiso eliminado correctamente.') {
            $.notify('Se elimino el permiso', {
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
              $('#delete-'+id).modal('hide');
              this.init_permisos();
          }else{
            $.notify(response.message || 'Error al eliminar el permiso', {
              type: 'danger',
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
              $('#delete-'+id).modal('hide');
          }
          this.load_delete = false;
          this.init_permisos();
        }
      );
    }
}
