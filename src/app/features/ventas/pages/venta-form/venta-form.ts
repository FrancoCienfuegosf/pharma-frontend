import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { coincide } from '../../../../core/utils/texto';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { VentaRequest } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

/** Controles de una línea de detalle. */
interface LineaForm {
  productoId: FormControl<number | null>;
  cantidad: FormControl<number>;
}

const MAX_RESULTADOS = 6;

/** Extrae la lista de una respuesta, sea un array directo o una página (contenido / content / data). */
function extraerLista<T>(respuesta: unknown): T[] {
  if (Array.isArray(respuesta)) return respuesta as T[];
  const r = respuesta as { contenido?: T[]; content?: T[]; data?: T[] } | null;
  return r?.contenido ?? r?.content ?? r?.data ?? [];
}

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly confirmando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Si está marcado, el comprobante se imprime apenas se registra la venta. */
  protected readonly imprimirAlRegistrar = signal(true);

  // ---------- Cabecera + detalle dinámico ----------
  // El detalle empieza vacío: las líneas se crean desde el buscador de productos.
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    detalles: this.fb.array<FormGroup<LineaForm>>([], Validators.required),
  });

  get detalles() {
    return this.form.controls.detalles;
  }

  private nuevaLinea(productoId: number): FormGroup<LineaForm> {
    return this.fb.group({
      productoId: this.fb.control<number | null>(productoId, Validators.required),
      cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
    });
  }

  quitarLinea(indice: number): void {
    this.detalles.removeAt(indice);
  }

  // ---------- Buscadores (controles fuera del formulario de la venta) ----------
  protected readonly buscarCliente = new FormControl('', { nonNullable: true });
  protected readonly buscarProducto = new FormControl('', { nonNullable: true });

  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges, { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges, { initialValue: '' });

  /** Clientes que coinciden por nombres, apellidos o DNI. */
  protected readonly clientesEncontrados = computed(() => {
    const texto = this.textoCliente().trim();
    if (!texto) return [];
    return this.clientes()
      .filter(c => coincide(texto, c.nombres, c.apellidos, c.dni))
      .slice(0, MAX_RESULTADOS);
  });

  /** Productos que coinciden por nombre o categoría. */
  protected readonly productosEncontrados = computed(() => {
    const texto = this.textoProducto().trim();
    if (!texto) return [];
    return this.productos()
      .filter(p => coincide(texto, p.nombre, p.categoriaNombre))
      .slice(0, MAX_RESULTADOS);
  });

  protected readonly hayBusquedaCliente = computed(() => this.textoCliente().trim().length > 0);
  protected readonly hayBusquedaProducto = computed(() => this.textoProducto().trim().length > 0);

  elegirCliente(cliente: Cliente): void {
    this.form.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
  }

  cambiarCliente(): void {
    this.form.controls.clienteId.setValue(null);
  }

  /** Si el producto ya está en el detalle, suma 1 a su cantidad; si no, crea la línea. */
  agregarProducto(producto: Producto): void {
    const linea = this.detalles.controls.find(l => l.controls.productoId.value === producto.id);
    if (linea) {
      linea.controls.cantidad.setValue(Number(linea.controls.cantidad.value) + 1);
    } else {
      this.detalles.push(this.nuevaLinea(producto.id));
    }
    this.buscarProducto.setValue('');
  }

  /** Enter en el buscador agrega el primer resultado sin enviar el formulario. */
  agregarPrimero(evento: Event): void {
    evento.preventDefault();
    const primero = this.productosEncontrados()[0];
    if (primero) this.agregarProducto(primero);
  }

  /** Cantidad que ya tiene un producto en el detalle (0 si no está). */
  cantidadEnDetalle(productoId: number): number {
    const linea = this.valor().detalles?.find(d => d.productoId === productoId);
    return linea ? Number(linea.cantidad) || 0 : 0;
  }

  // ---------- Cálculos a partir del valor del formulario ----------
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  private readonly productoPorId = computed(() =>
    new Map(this.productos().map(p => [p.id, p])));

  protected readonly lineas = computed(() =>
    (this.valor().detalles ?? []).map(d => {
      const producto = d.productoId ? this.productoPorId().get(d.productoId) : undefined;
      const cantidad = Number(d.cantidad) || 0;
      const precio = producto?.precio ?? 0;
      return {
        producto,
        precio,
        subtotal: redondear(precio * cantidad),
        excedeStock: !!producto && cantidad > producto.stock,
      };
    }));

  protected readonly total = computed(() =>
    redondear(this.lineas().reduce((suma, l) => suma + l.subtotal, 0)));

  protected readonly hayExcesoDeStock = computed(() => this.lineas().some(l => l.excedeStock));

  protected readonly clienteElegido = computed(() =>
    this.clientes().find(c => c.id === this.valor().clienteId));

  // ---------- Carga inicial ----------
  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(0, 100),
      productos: this.productoService.listar(0, 100, 'nombre', 'asc'),
    }).subscribe({
      next: ({ clientes, productos }) => {
        this.clientes.set(
          extraerLista<Cliente>(clientes).filter(c => c.estado)
        );
        this.productos.set(
          extraerLista<Producto>(productos).filter(p => p.estado && p.stock > 0)
        );
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  // ---------- Revisión, confirmación y registro ----------
  revisar(): void {
    if (this.form.invalid || this.hayExcesoDeStock()) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.confirmando.set(true);
  }

  confirmar(): void {
    const v = this.form.getRawValue();
    const dto: VentaRequest = {
      clienteId: Number(v.clienteId),
      detalles: v.detalles.map(d => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    };

    this.guardando.set(true);
    this.ventaService.registrar(dto).subscribe({
      next: venta => this.router.navigate(['/ventas', venta.id], {
        queryParams: this.imprimirAlRegistrar() ? { nueva: 1, imprimir: 1 } : { nueva: 1 },
      }),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.confirmando.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }
}