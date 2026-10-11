import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  listar(pagina = 0, tamanio = 20, ordenarPor = 'apellidos', direccion: 'asc' | 'desc' = 'asc'): Observable<PaginaResponse<Cliente>> {
    // Se envían los nombres en español y los de Spring; el backend usará los que reconozca
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion)
      .set('page', pagina)
      .set('size', tamanio)
      .set('sort', `${ordenarPor},${direccion}`);

    return this.http.get<any>(this.url, { params }).pipe(
      map(resp => {
        console.log('RESPUESTA /clientes', resp);

        // Si la API envuelve la página dentro de "data" (u otra propiedad), se desenvuelve
        const r = resp?.data && !Array.isArray(resp.data) ? resp.data : resp;

        const lista: Cliente[] = Array.isArray(r)
          ? r
          : (r?.contenido ?? r?.content ?? r?.data ?? r?.items ?? []);

        // Si el backend devolvió más registros de los pedidos, ignoró la paginación:
        // se corta la página aquí mismo.
        const sinPaginar = lista.length > tamanio;
        const visibles = sinPaginar
          ? lista.slice(pagina * tamanio, pagina * tamanio + tamanio)
          : lista;

        const totalElementos = sinPaginar
          ? lista.length
          : (r?.totalElementos ?? r?.totalElements ?? lista.length);

        const totalPaginas = Math.max(
          1,
          sinPaginar
            ? Math.ceil(lista.length / tamanio)
            : (r?.totalPaginas ?? r?.totalPages ?? Math.ceil(totalElementos / tamanio)),
        );

        const numero = Math.min(pagina, totalPaginas - 1);
        const ultima = numero >= totalPaginas - 1;
        const primera = numero === 0;

        return {
          ...(Array.isArray(r) ? {} : r),
          contenido: visibles,
          pagina: numero,
          number: numero,
          tamanio,
          size: tamanio,
          totalPaginas,
          totalPages: totalPaginas,
          totalElementos,
          totalElements: totalElementos,
          ultima,
          last: ultima,
          primera,
          first: primera,
        } as PaginaResponse<Cliente>;
      })
    );
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  crear(dto: any): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, dto);
  }

  actualizar(id: number, dto: any): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}