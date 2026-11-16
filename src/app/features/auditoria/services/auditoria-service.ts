import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { AuditoriaEvento, FiltroAuditoria } from '../models/evento.model';

@Service()
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auditoria`;

  /** Solo se envían los filtros que tienen valor. */
  listar(f: FiltroAuditoria): Observable<PaginaResponse<AuditoriaEvento>> {
    let params = new HttpParams().set('pagina', f.pagina).set('tamanio', f.tamanio);
    if (f.usuario) params = params.set('usuario', f.usuario);
    if (f.accion) params = params.set('accion', f.accion);
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);
    return this.http.get<PaginaResponse<AuditoriaEvento>>(this.url, { params });
  }
}