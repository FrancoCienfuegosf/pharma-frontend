/** Refleja PaginaResponseDTO de PharmaBackend. */
export interface Pagina<T> {
contenido: T[];
pagina: number; // empieza en 0
tamanio: number;
totalElementos: number;
totalPaginas: number;
ultima: boolean;
}
export interface ConsultaPagina {
pagina: number;
tamanio: number;
ordenarPor: string;
direccion: 'asc' | 'desc';
}
