import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response';
export function mensajeError(err: HttpErrorResponse): string {
if (err.status === 0) {
return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución y que CORS permita este origen.';
}
const cuerpo = err.error as ErrorResponse | null;
return cuerpo?.message ?? `Error ${err.status}: ${err.statusText}`;
}
export function erroresDeValidacion(err: HttpErrorResponse): Record<string, string> {
const cuerpo = err.error as ErrorResponse | null;
return cuerpo?.validationErrors ?? {};
}