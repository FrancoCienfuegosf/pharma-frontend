import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  // Estado de la paginación y el orden
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<'dni' | 'apellidos'>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');
  protected readonly tamanios = [5, 10, 20];

  // Respuesta del backend y estados de la pantalla
  protected readonly respuesta = signal<PaginaResponse<Cliente> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  // Filtra solo dentro de la página actual, por DNI o por nombres y apellidos
  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    const clientes = this.respuesta()?.contenido ?? [];
    return clientes.filter(c =>
      c.dni.includes(texto) ||
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(texto) ||
      `${c.apellidos} ${c.nombres}`.toLowerCase().includes(texto),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.clienteService
      .listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion())
      .subscribe({
        next: datos => {
          this.respuesta.set(datos);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  anterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update(p => p - 1);
      this.cargar();
    }
  }

  siguiente(): void {
    if (!this.respuesta()?.ultima) {
      this.pagina.update(p => p + 1);
      this.cargar();
    }
  }

  cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.pagina.set(0); // al cambiar el tamaño se vuelve a la primera página
    this.cargar();
  }

  ordenar(campo: 'dni' | 'apellidos'): void {
    if (this.ordenarPor() === campo) {
      // segundo clic sobre la misma columna: invierte la dirección
      this.direccion.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.pagina.set(0);
    this.cargar();
  }

  darDeBaja(cliente: Cliente): void {
    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }
    this.clienteService.eliminar(cliente.id).subscribe({
      // La baja es lógica: la fila no desaparece, así que se recarga la página
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}