export interface Cliente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
}

export interface ClienteRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  estado?: boolean;
}