import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
selector: 'app-no-encontrado',
imports: [RouterLink],
template: `
<section class="card">
<h2>404 · Página no encontrada</h2>
<a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
</section>
`,
})
export class NoEncontrado {}