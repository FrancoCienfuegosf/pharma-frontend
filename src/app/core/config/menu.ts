export interface MenuItem {
etiqueta: string;
ruta: string;
icono: string;
}
export const MENU: MenuItem[] = [
{ etiqueta: 'Inicio', ruta: '/inicio', icono: '🏠' },
{ etiqueta: 'Categorías', ruta: '/categorias', icono: '🗂️' },
{ etiqueta: 'Productos', ruta: '/productos', icono: '💊' },
// Actividad autónoma: { etiqueta: 'Clientes', ruta: '/clientes', icono: '👥' },
];