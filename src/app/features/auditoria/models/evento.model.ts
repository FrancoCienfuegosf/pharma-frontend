export interface AuditoriaEvento {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalle: string | null;
  requestId: string | null;
}

export interface FiltroAuditoria {
  usuario: string;
  accion: string;
  desde: string;
  hasta: string;
  pagina: number;
  tamanio: number;
}