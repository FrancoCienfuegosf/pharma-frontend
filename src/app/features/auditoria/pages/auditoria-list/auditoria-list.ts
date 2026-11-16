import { Component, computed, inject, input, linkedSignal, numberAttribute } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { AuditoriaEvento } from '../../models/evento.model';
import { AuditoriaService } from '../../services/auditoria-service';

@Component({
  selector: 'app-auditoria-list',
  imports: [DatePipe, Paginador],
  templateUrl: './auditoria-list.html',
  styleUrl: './auditoria-list.css',
})
export class AuditoriaList {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly router = inject(Router);

  // Llegan de la URL (?usuario=vendedor&accion=VENTA_REGISTRADA&desde=2026-11-01&pagina=0)
  readonly pagina = input(0, { transform: (v: unknown) => numberAttribute(v, 0) });
  readonly tamanio = input(20, { transform: (v: unknown) => numberAttribute(v, 20) });
  readonly usuario = input('', { transform: (v: string | undefined) => v ?? '' });
  readonly accion = input('', { transform: (v: string | undefined) => v ?? '' });
  readonly desde = input('', { transform: (v: string | undefined) => v ?? '' });
  readonly hasta = input('', { transform: (v: string | undefined) => v ?? '' });

  protected readonly recurso = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      usuario: this.usuario(),
      accion: this.accion(),
      desde: this.desde(),
      hasta: this.hasta(),
    }),
    stream: ({ params }) => this.auditoriaService.listar(params),
  });

  // Conserva la página anterior mientras llega la nueva (sin parpadeo)
  protected readonly resultado = linkedSignal<
    PaginaResponse<AuditoriaEvento> | undefined,
    PaginaResponse<AuditoriaEvento> | undefined
  >({
    source: () => this.recurso.value(),
    computation: (nueva, previa) => nueva ?? previa?.value,
  });

  protected readonly error = computed(() =>
    this.recurso.error() ? mensajeError(this.recurso.error() as HttpErrorResponse) : null,
  );

  protected filtrar(usuario: string, accion: string, desde: string, hasta: string): void {
    // Al cambiar un filtro se vuelve a la primera página
    this.navegar({
      usuario: usuario.trim() || null,
      accion: accion || null,
      desde: desde || null,
      hasta: hasta || null,
      pagina: 0,
    });
  }

  protected limpiar(): void {
    this.navegar({ usuario: null, accion: null, desde: null, hasta: null, pagina: 0 });
  }

  protected irA(pagina: number): void {
    this.navegar({ pagina });
  }

  protected cambiarTamanio(tamanio: number): void {
    this.navegar({ tamanio, pagina: 0 });
  }

  private navegar(cambios: Record<string, string | number | null>): void {
    this.router.navigate([], { queryParams: cambios, queryParamsHandling: 'merge' });
  }
}