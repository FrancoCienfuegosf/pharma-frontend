import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';

import { ClienteService } from '../../../clientes/services/cliente-service';
import { VentaComprobante } from '../../components/venta-comprobante/venta-comprobante';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-detalle',
  imports: [RouterLink, VentaComprobante],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  readonly id = input.required<string>();
  /** Llega como ?nueva=1 después de registrar. */
  readonly nueva = input<string>();
  /** Llega como ?imprimir=1 cuando se pide imprimir al abrir. */
  readonly imprimir = input<string>();
  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.ventaService.obtener(Number(this.id())).pipe(
      // El DNI no viene en la venta: se pide el cliente. Si falla, el comprobante sale sin DNI.
      switchMap(venta => this.clienteService.obtener(venta.clienteId).pipe(
        catchError(() => of(null)),
        map(cliente => ({ venta, cliente })),
      )),
    ).subscribe({
      next: ({ venta, cliente }) => {
        this.venta.set(venta);
        this.cliente.set(cliente);
      },
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }

  /** Se ejecuta cuando el comprobante diferido ya se pintó. */
  protected alMostrarComprobante(): void {
    if (this.imprimir()) window.print();
  }

  protected imprimirComprobante(): void {
    window.print();
  }
}