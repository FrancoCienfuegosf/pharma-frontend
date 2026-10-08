import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { RouterLink } from '@angular/router';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';
import { mensajeError } from '../../../../core/utils/http-error';
@Component({
selector: 'app-categoria-list',
imports: [RouterLink],
templateUrl: './categoria-list.html',
styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit {
private readonly categoriaService = inject(CategoriaService);
protected readonly categorias = signal<Categoria[]>([]);
protected readonly cargando = signal(false);
protected readonly error = signal<string | null>(null);
protected readonly filtro = signal('');
protected readonly filtradas = computed(() => {
const texto = this.filtro().trim().toLowerCase();
return this.categorias().filter(c => c.nombre.toLowerCase().includes(texto));
});
ngOnInit(): void {
this.cargar();
}
cargar(): void {
this.cargando.set(true);
this.error.set(null);
this.categoriaService.listar().subscribe({
next: datos => {
this.categorias.set(datos);
this.cargando.set(false);
},
error: (err: HttpErrorResponse) => {
this.error.set(mensajeError(err));
this.cargando.set(false);
},
});
}
eliminar(categoria: Categoria): void {
if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
return;
}
this.categoriaService.eliminar(categoria.id).subscribe({
next: () => this.categorias.update(lista => lista.filter(c => c.id !== categoria.id)),
error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
});
}
}