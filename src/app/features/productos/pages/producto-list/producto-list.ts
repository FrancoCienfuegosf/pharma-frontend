import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, CurrencyPipe, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  // S14: el estado de la consulta llega de la URL (?pagina=1&tamanio=20&orden=precio&dir=desc)
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly orden = input<string>();
  readonly dir = input<string>();

  protected readonly ordenarPor = computed(
    () => (this.orden() || 'nombre') as OrdenProducto,
  );
  protected readonly direccion = computed<Direccion>(() =>
    this.dir() === 'desc' ? 'desc' : 'asc',
  );

  // S14: vuelve a pedir datos cuando cambia la URL y cancela la petición anterior
  private readonly consulta = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.ordenarPor(),
      direccion: this.direccion(),
    }),
    stream: ({ params }) =>
      this.productoService.listar(
        params.pagina,
        params.tamanio,
        params.ordenarPor,
        params.direccion,
      ),
  });

  // S14: conserva la página anterior mientras llega la nueva (sin parpadeo)
  protected readonly resultado = linkedSignal<
    PaginaResponse<Producto> | undefined,
    PaginaResponse<Producto> | null
  >({
    source: () => (this.consulta.hasValue() ? this.consulta.value() : undefined),
    computation: (nueva, previa) => nueva ?? previa?.value ?? null,
  });

  protected readonly cargando = computed(
    () => this.consulta.isLoading() && !this.resultado(),
  );

  private readonly errorAccion = signal<string | null>(null);
  protected readonly error = computed(() => {
    const e = this.consulta.error();
    return e ? mensajeError(e as HttpErrorResponse) : this.errorAccion();
  });

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);

  /** Filtra por categoría los productos de la página actual. */
  protected readonly productos = computed(() => {
    const filtro = this.categoriaFiltro();
    const lista = this.resultado()?.contenido ?? [];
    return filtro === null ? lista : lista.filter(p => p.categoriaId === filtro);
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: datos => this.categorias.set(datos),
      error: (err: HttpErrorResponse) => this.errorAccion.set(mensajeError(err)),
    });
  }

  irA(pagina: number): void {
    this.navegar({ pagina });
  }

  cambiarTamanio(valor: string | number): void {
    this.navegar({ tamanio: Number(valor), pagina: 0 });
  }

  ordenar(campo: OrdenProducto): void {
    const dir =
      this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }

  filtrarPorCategoria(valor: string): void {
    this.categoriaFiltro.set(valor ? Number(valor) : null);
  }

  darDeBaja(producto: Producto): void {
    if (!confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) {
      return;
    }
    this.productoService.darDeBaja(producto.id).subscribe({
      next: () => this.consulta.reload(),
      error: (err: HttpErrorResponse) => this.errorAccion.set(mensajeError(err)),
    });
  }

  private navegar(cambios: Record<string, string | number>): void {
    this.router.navigate([], { queryParams: cambios, queryParamsHandling: 'merge' });
  }
}