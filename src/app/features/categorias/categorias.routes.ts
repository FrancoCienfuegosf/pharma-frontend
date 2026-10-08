import { Routes } from '@angular/router';
import { CategoriaList } from './pages/categoria-list/categoria-list';
import { CategoriaForm } from './pages/categoria-form/categoria-form';
export const CATEGORIAS_ROUTES: Routes = [
{ path: '', component: CategoriaList, title: 'Categorías' },
{ path: 'nuevo', component: CategoriaForm, title: 'Nueva categoría' },
{ path: ':id/editar', component: CategoriaForm, title: 'Editar categoría' },
];