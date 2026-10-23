import { Permiso } from '../auth/auth.model';
export interface MenuItem {
etiqueta: string;
ruta: string;
icono: string;
/** Permiso necesario para ver la opción; sin permiso = visible para todos. */
permiso?: Permiso;
}
export const MENU: MenuItem[] = [
{ etiqueta: 'Inicio', ruta: '/inicio', icono: '🏠' },
{ etiqueta: 'Categorías', ruta: '/categorias', icono: '🗂️', permiso: 'CATALOGO_LEER' },
{ etiqueta: 'Productos', ruta: '/productos', icono: '💊', permiso: 'CATALOGO_LEER' },
{ etiqueta: 'Ventas', ruta: '/ventas', icono: '🧾', permiso: 'VENTAS_LEER' },
];