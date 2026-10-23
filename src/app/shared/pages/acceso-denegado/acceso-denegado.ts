import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
selector: 'app-acceso-denegado',
imports: [RouterLink],
template: `
<section class="card">
<h2>403 · Acceso denegado</h2>
<p>Su usuario no tiene permiso para abrir esta página. Si lo necesita, solicítelo al
administrador.</p>
<a routerLink="/inicio" class="btn btn-primary">Volver al inicio</a>
</section>
`,
})
export class AccesoDenegado {}