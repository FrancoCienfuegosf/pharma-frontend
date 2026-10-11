export type EstadoVenta = 'REGISTRADA' | 'ANULADA';
/** Detalle tal como lo devuelve el backend (DetalleVentaResponseDTO). */
export interface DetalleVenta {
productoId: number;
productoNombre: string;
cantidad: number;
precio: number;
subtotal: number;
}
/** Cabecera con sus detalles (VentaResponseDTO). */
export interface Venta {
id: number;
fecha: string;
clienteId: number;
clienteNombre: string;
estado: EstadoVenta;
total: number;
detalles: DetalleVenta[];
}
/** Lo que se envía al registrar: solo ids y cantidades. */
export interface VentaRequest {
clienteId: number;
detalles: { productoId: number; cantidad: number }[];
}
/** Filtros opcionales de GET /ventas/buscar. */
export interface FiltroVentas {
clienteId: number | null;
estado: EstadoVenta | null;
desde: string | null; // AAAA-MM-DD
hasta: string | null;
}