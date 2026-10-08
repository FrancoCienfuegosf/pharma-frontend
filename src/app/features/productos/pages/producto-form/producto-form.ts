import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
@Component({
selector: 'app-producto-form',
imports: [ReactiveFormsModule, RouterLink],
templateUrl: './producto-form.html',
styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
private readonly fb = inject(NonNullableFormBuilder);
private readonly productoService = inject(ProductoService);
private readonly categoriaService = inject(CategoriaService);
private readonly router = inject(Router);
readonly id = input<string>();
protected readonly categorias = signal<Categoria[]>([]);
protected readonly categoriaOriginal = signal<number | null>(null);
protected readonly cargando = signal(true);
protected readonly guardando = signal(false);
protected readonly error = signal<string | null>(null);
protected readonly erroresServidor = signal<Record<string, string>>({});
protected readonly form = this.fb.group({
nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
stock: this.fb.control<number | null>(0, [Validators.required, Validators.min(0),
Validators.pattern(/^\d+$/)]),
estado: [true],
categoriaId: this.fb.control<number | null>(null, Validators.required),
});
/** Opciones del select: categorías activas + la que ya tenía el producto. */
protected readonly opciones = computed(() =>
this.categorias().filter(c => c.estado || c.id === this.categoriaOriginal()));
protected readonly hayCategoriasActivas = computed(() =>
this.categorias().some(c => c.estado));
/** Valor del select convertido en signal para validar la dependencia. */
private readonly categoriaElegida = toSignal(this.form.controls.categoriaId.valueChanges,
{ initialValue: null });
protected readonly categoriaInactiva = computed(() => {
const elegida = this.categorias().find(c => c.id === this.categoriaElegida());
return !!elegida && !elegida.estado;
});
protected esEdicion(): boolean {
    return !!this.id();
}
ngOnInit(): void {
const id = this.id();
if (id) {
// Categorías y producto se piden en paralelo; se continúa cuando llegan ambos.
forkJoin({
categorias: this.categoriaService.listar(),
producto: this.productoService.obtener(Number(id)),
}).subscribe({
next: ({ categorias, producto }) => {
this.categorias.set(categorias);
this.categoriaOriginal.set(producto.categoriaId);
this.form.setValue({
nombre: producto.nombre,
precio: producto.precio,
stock: producto.stock,
estado: producto.estado,
categoriaId: producto.categoriaId,
});
this.cargando.set(false);
},
error: (err: HttpErrorResponse) => this.fallarCarga(err),
});
} else {
this.categoriaService.listar().subscribe({
next: categorias => {
this.categorias.set(categorias);
this.cargando.set(false);
},
error: (err: HttpErrorResponse) => this.fallarCarga(err),
});
}
}
guardar(): void {
if (this.form.invalid || this.categoriaInactiva()) {
this.form.markAllAsTouched();
return;
}
const v = this.form.getRawValue();
const dto: ProductoRequest = {
nombre: v.nombre.trim(),
precio: Number(v.precio),
stock: Number(v.stock),
estado: v.estado,
categoriaId: Number(v.categoriaId),
};
const id = this.id();
const peticion = id
? this.productoService.actualizar(Number(id), dto)
: this.productoService.crear(dto);
this.guardando.set(true);
peticion.subscribe({
next: () => this.router.navigate(['/productos']),
error: (err: HttpErrorResponse) => {
this.guardando.set(false);
this.error.set(mensajeError(err));
this.erroresServidor.set(erroresDeValidacion(err));
},
});
}
private fallarCarga(err: HttpErrorResponse): void {
this.error.set(mensajeError(err));
this.cargando.set(false);
}
}