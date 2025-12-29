import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Empresa } from '../../../core/models/empresa.model';
declare var $:any ;

@Component({
  selector: 'app-index-empresa',
  standalone: false,
  templateUrl: './index-empresa.html',
  styleUrl: './index-empresa.scss',
})
export class IndexEmpresa implements OnInit {

   load_data: boolean = true;
   load_delete: boolean = true;
   load_empresa: boolean = true;
   filtro_empresa : string = '';
   page : number = 1;
   pageSize : number = 10;
   empresas : Empresa[] = [];
   empresas_const : Empresa[] = [];
   public createEmpresa : any = {
    nombre:'',
    direccion:'',
    telefono:'',
    correo:'',
    nit:''
   };
   public updateEmpresa : any = {
    nombre:'',
    direccion:'',
    telefono:'',
    correo:'',
    nit:''
   };

   constructor(
    private empresaService: EmpresaService,
   ){}

   ngOnInit(): void {
    setTimeout(() => {
        $('.selectpicker').selectpicker('refresh');
      }, 150);
     this.init_empresas();
   }

   init_empresas(){
      this.load_data = true;
      this.empresaService.getAllEmpresas().subscribe(
        response=>{
          this.empresas = response.data;
          this.empresas_const = this.empresas;
          this.load_data = false;
      })
    }

   filtrar(){
    if (!this.filtro_empresa) {
      this.empresas = [...this.empresas_const]; // Restablece la lista completa
      return;
    }
    var term = new RegExp(this.filtro_empresa, 'i');
    this.empresas = this.empresas_const.filter(item => term.test(item.nombre));
   }

    openCreateModal(){
      this.createEmpresa = { nombre: '', direccion: '', telefono: '', correo:'', nit:'' }; // Reinicia los valores
      this.load_empresa = true; // Reinicia el estado de carga
      $('#exampleModalCenter').modal('show'); 
    
      setTimeout(() => {
        $('.selectpicker').selectpicker('refresh'); // Refresca el selectpicker para evitar valores anteriores
      }, 150);
    }

   openEditModal(id: number) {
    this.updateEmpresa = {};

    this.empresaService.getByIdEmpresa(id).subscribe(response => {
      this.updateEmpresa = response.data;
      $('#exampleModalCenterUpdate').modal('show');
      setTimeout(() => {
        $('.selectpicker').selectpicker('refresh');
      }, 150);
    });
   }

   eliminar_empresa(idx:any){
     this.load_delete = true;
      this.empresaService.deleteEmpresa(idx).subscribe(
        response=>{          
          if (response.message && response.message === 'Empresa deshabilitada correctamente') {
            $.notify('Se desactivo la empresa', {
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
              $('#delete-'+idx).modal('hide');
              this.init_empresas();
          }else{
            $.notify(response.message || 'Error al eliminar la empresa', {
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
              $('#delete-'+idx).modal('hide');
          }
          this.load_delete = false;
          this.init_empresas();
        }
      );
   }

   save(){
    if (!this.createEmpresa.nombre) {
        $.notify('Ingrese el nombre de la empresa', {
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
      }else if (!this.createEmpresa.direccion) {
        $.notify('Ingrese la dirección de la empresa', {
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
      }else if (!this.createEmpresa.telefono) {
        $.notify('Ingrese el número de teléfono', {
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
      }else if (!this.createEmpresa.correo) {
        $.notify('Ingrese un correo para la empresa', {
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
      }else if (!this.createEmpresa.nit) {
        $.notify('Ingrese el número de NIT', {
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
        this.load_empresa = true;
        this.empresaService.createEmpresa(this.createEmpresa).subscribe(
         response=>{
           $.notify('Se registro la nueva empresa', {
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
             this.init_empresas(); 
             this.load_empresa = false; 
             this.createEmpresa = [];  
         }
        );
      }
   }

   actualizar(){
    this.empresaService.updateEmpresa(this.updateEmpresa.id,this.updateEmpresa).subscribe(
        response=>{
          $.notify('Se actualizó correctamente la empresa', {
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
            this.init_empresas();  
        }
      );
   } 

}
