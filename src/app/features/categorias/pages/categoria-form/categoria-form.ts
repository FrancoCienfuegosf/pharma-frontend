import { Component, inject, input, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CategoriaRequest } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
@Component({
selector: 'app-categoria-form',
imports: [ReactiveFormsModule, RouterLink],
templateUrl: './categoria-form.html',
styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit {
private readonly fb = inject(NonNullableFormBuilder);
private readonly categoriaService = inject(CategoriaService);
private readonly router = inject(Router);
/** Llega desde la ruta ':id/editar' gracias a withComponentInputBinding(). */
readonly id = input<string>();
protected readonly guardando = signal(false);
protected readonly error = signal<string | null>(null);
protected readonly erroresServidor = signal<Record<string, string>>({});
protected readonly form = this.fb.group({
nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
descripcion: ['', [Validators.maxLength(200)]],
estado: [true],
});
protected esEdicion(): boolean {
return !!this.id();
}
ngOnInit(): void {
const id = this.id();
if (id) {
this.categoriaService.obtener(Number(id)).subscribe({
next: c => this.form.setValue({
nombre: c.nombre,
descripcion: c.descripcion ?? '',
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
const dto: CategoriaRequest = {
nombre: valores.nombre.trim(),
descripcion: valores.descripcion.trim() || null,
estado: valores.estado,
};
const id = this.id();
const peticion = id
? this.categoriaService.actualizar(Number(id), dto)
: this.categoriaService.crear(dto);
this.guardando.set(true);
peticion.subscribe({
next: () => this.router.navigate(['/categorias']),
error: (err: HttpErrorResponse) => {
this.guardando.set(false);
this.error.set(mensajeError(err));
this.erroresServidor.set(erroresDeValidacion(err));
},
});
}
}