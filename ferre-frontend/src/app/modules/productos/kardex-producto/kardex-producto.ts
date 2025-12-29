import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InventarioService } from '../../../core/services/inventario.service';

declare var $: any;

interface KardexRow {
  id: number;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  motivo?: string | null;
  referencia?: string | null;
  entrada: number;
  salida: number;
  saldo: number;
}

@Component({
  selector: 'app-kardex-producto',
  standalone: false,
  templateUrl: './kardex-producto.html',
  styleUrl: './kardex-producto.scss',
})
export class KardexProducto implements OnInit {

  canRead = false;

  loading = true;

  productoId: number = 0;

  producto: any = null; // {id,nombre,codigo,unidad_medida,stock_actual}
  kardex: KardexRow[] = [];

  // Filtros
  desde: string = '';
  hasta: string = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.canRead = this.auth.hasPermission('INVENTARIO_READ') || this.auth.hasPermission('PRODUCTO_READ');

    if (!this.canRead) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.productoId = Number(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.productoId) {
      this.router.navigate(['/inventario']);
      return;
    }

    // Default: último mes (puedes cambiarlo a último año o vacío)
    const hoy = new Date();
    const desdeDate = new Date();
    desdeDate.setDate(hoy.getDate() - 30);

    this.desde = desdeDate.toISOString().substring(0, 10);
    this.hasta = hoy.toISOString().substring(0, 10);

    this.cargarKardex();
  }

  cargarKardex(): void {
    this.loading = true;

    this.inventarioService.getKardexProducto(this.productoId, this.desde, this.hasta).subscribe({
      next: (res) => {
        this.producto = res.producto || null;
        this.kardex = res.kardex || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener kardex', err);
        $.notify(err?.error?.message || 'Error al obtener kardex', {
          type: 'danger',
          spacing: 10,
          timer: 2000,
          placement: { from: 'top', align: 'right' },
          delay: 1000,
          animate: { enter: 'animated bounce', exit: 'animated bounce' },
        });
        this.loading = false;
      },
    });
  }

  limpiarFiltros(): void {
    this.desde = '';
    this.hasta = '';
    this.cargarKardex();
  }

  volver(): void {
    this.router.navigate(['/productos']); 
  }

  // Totales para resumen
  get totalEntradas(): number {
    return this.kardex.reduce((acc, r) => acc + (Number(r.entrada) || 0), 0);
  }

  get totalSalidas(): number {
    return this.kardex.reduce((acc, r) => acc + (Number(r.salida) || 0), 0);
  }

  get saldoFinal(): number {
    if (!this.kardex.length) return 0;
    return Number(this.kardex[this.kardex.length - 1].saldo) || 0;
  }
}
