import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteRequest } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);

  /** Llega desde la ruta ':id/editar' gracias a withComponentInputBinding(). */
  readonly id = input<string>();

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true],
  });

  protected esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.clienteService.obtener(Number(id)).subscribe({
        next: c => this.form.setValue({
          dni: c.dni,
          nombres: c.nombres,
          apellidos: c.apellidos,
          email: c.email,
          telefono: c.telefono ?? '',
          direccion: c.direccion ?? '',
          estado: c.estado,
        }),
        error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const dto: ClienteRequest = {
      dni: valores.dni.trim(),
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      email: valores.email.trim(),
      // Los opcionales vacíos se envían como null, no como "" (si no, el backend responde 400)
      telefono: valores.telefono.trim() || null,
      direccion: valores.direccion.trim() || null,
      estado: valores.estado,
    };

    const id = this.id();
    const peticion = id
      ? this.clienteService.actualizar(Number(id), dto)
      : this.clienteService.crear(dto);

    this.guardando.set(true);
    peticion.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeError(err));
        this.erroresServidor.set(erroresDeValidacion(err));
      },
    });
  }
}