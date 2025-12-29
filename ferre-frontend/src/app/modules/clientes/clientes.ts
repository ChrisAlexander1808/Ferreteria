import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Cliente } from '../../core/models/cliente.model';
import { ClienteService } from '../../core/services/cliente.service';
declare var $:any ;

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes implements OnInit {

    canRead = false;
    canCreate = false;
    canUpdate = false;
    canDelete = false;

    load_data: boolean = true;
    load_update: boolean = true;
    load_delete: boolean = true;
    load_cliente: boolean = true;
    filtro_cliente : string = '';
    page : number = 1;
    pageSize : number = 10;
    clientes : Cliente[] = [];
    clientes_const : Cliente[] = [];
    public createCliente : any = {
      nombre:'',
      direccion:'',
      telefono:'',
      correo:'',
      nit:'',
      tipo_cliente:'',
      limite_credito:''
    };
    public updateCliente : any = {
      nombre:'',
      direccion:'',
      telefono:'',
      correo:'',
      nit:'',
      tipo_cliente:'',
      limite_credito:''
    };

    constructor(
      private auth: AuthService,
      private router: Router,
      private clienteService: ClienteService
    ){}

    ngOnInit(): void {
      this.canRead   = this.auth.hasPermission('CLIENTES_READ');
      this.canCreate = this.auth.hasPermission('CLIENTES_CREATE');
      this.canUpdate = this.auth.hasPermission('CLIENTES_UPDATE');
      this.canDelete = this.auth.hasPermission('CLIENTES_DELETE');

      // Si ni siquiera puede leer, lo sacamos de aquí
      if (!this.canRead) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.init_clientes();
    }

    init_clientes(){
      this.load_data = true;
      this.clienteService.getAllClientes().subscribe(
        response=>{
          this.clientes = response.data;
          this.clientes_const = this.clientes;
          this.load_data = false;
        }
      )
    }

    filtrar(){
      // Si el campo de búsqueda está vacío, restauramos todos los módulos
        if (!this.filtro_cliente) {
          this.clientes = [...this.clientes_const]; // Restablece la lista completa
          return;
        }

        // Si hay texto, aplicamos el filtro con expresión regular
        var term = new RegExp(this.filtro_cliente, 'i');
        this.clientes = this.clientes_const.filter(item => term.test(item.nombre) || term.test(item.nit));
    }

    openCreateModal() {
      // Limpiamos el formulario
      this.createCliente = {
        nombre: '',
        direccion: '',
        telefono: '',
        correo: '',
        nit: '',
        tipo_cliente: '',
        limite_credito: 0
      };

      this.load_cliente = true;

      // Abrimos el modal
      $('#modalCreateCliente').modal('show');
    }

    save_create_cliente() {
      // Validaciones básicas
      if (!this.createCliente.nombre) {
        $.notify('Ingrese el nombre del cliente', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return;
      }

      if (!this.createCliente.nit) {
        $.notify('Ingrese el NIT del cliente (use CF si no tiene)', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return;
      }

      if (!this.createCliente.direccion) {
        $.notify('Ingrese la dirección del cliente', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return;
      }

      if (!this.createCliente.tipo_cliente) {
        $.notify('Seleccione el tipo de cliente', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        return;
      }

      // Normalizar límite de crédito
      this.createCliente.limite_credito = Number(this.createCliente.limite_credito) || 0;

      this.load_cliente = false;

      this.clienteService.createCliente(this.createCliente).subscribe({
        next: (response) => {
          if (!response || !response.data) {
            $.notify(response?.message || 'No se pudo crear el cliente', {
              type: 'danger',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: { enter: 'animated bounce', exit: 'animated bounce' },
            });
            this.load_cliente = true;
            return;
          }

          $.notify('Cliente creado correctamente', {
            type: 'success',
            spacing: 10,
            timer: 2000,
            placement: { from: 'top', align: 'right' },
            delay: 1000,
            animate: { enter: 'animated bounce', exit: 'animated bounce' },
          });

          // Cerrar modal
          $('#modalCreateCliente').modal('hide');

          // Refrescar listado
          this.init_clientes();
          this.load_cliente = true;
        },
        error: (err) => {
          console.error('Error al crear cliente', err);
          $.notify(
            err?.error?.message || 'Error al crear cliente',
            {
              type: 'danger',
              spacing: 10,
              timer: 2000,
              placement: { from: 'top', align: 'right' },
              delay: 1000,
              animate: { enter: 'animated bounce', exit: 'animated bounce' },
            }
          );
          this.load_cliente = true;
        },
      });
    }

    openEditModal(id:any){
      $('#modalUpdateCliente').modal('show');
      this.clienteService.getByIdCliente(id).subscribe(
         response=>{
           this.updateCliente = response.data;     
         }
       ); 
    }

    actualizar(){
      this.load_update = true;
      const payload: any = {
      nombre: this.updateCliente.nombre,
      direccion: this.updateCliente.direccion,
      telefono: this.updateCliente.telefono,
      correo: this.updateCliente.correo,
      nit: this.updateCliente.nit,
      tipo_cliente: this.updateCliente.tipo_cliente,
      limite_credito: Number(this.updateCliente.limite_credito) // 👈 aseguramos number
    };
       this.clienteService.updateCliente(this.updateCliente.id,payload).subscribe(
        response=>{
          $.notify('Se actualizó correctamente el cliente', {
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
            $('#modalUpdateCliente').modal('hide');
            this.init_clientes(); 
            this.load_update = false; 
        }
      );
    }

    eliminar_cliente(id:any){
      this.load_delete = true;
      this.clienteService.deleteCliente(id).subscribe(
        response=>{          
          if (response.message && response.message === 'Cliente eliminado correctamente.') {
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
              this.init_clientes();
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
          this.init_clientes();
        }
      );
    }
}
