import { afterNextRender, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Venta } from '../../models/venta.model';

@Component({
  selector: 'app-venta-comprobante',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './venta-comprobante.html',
  styleUrl: './venta-comprobante.css',
})
export class VentaComprobante {
  readonly venta = input.required<Venta>();
  readonly cliente = input<Cliente | null>(null);
  readonly listo = output<void>();
  protected readonly fechaImpresion = new Date();
  protected readonly numero = computed(() => String(this.venta().id ?? '').padStart(6, '0'));
  protected readonly unidades = computed(() =>
    this.venta().detalles.reduce((suma, d) => suma + d.cantidad, 0)
  );

  constructor() {
    afterNextRender(() => this.listo.emit());
  }
}