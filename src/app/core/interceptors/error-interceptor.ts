import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
/**
* Reacción común a los errores de seguridad:
*
* - 401: el token falta, venció o no es válido → se cierra la sesión y se
* vuelve al login recordando la página actual. Se excluye el propio login:
* allí el 401 significa «credenciales incorrectas» y lo muestra el formulario.
* - 403: el usuario SÍ está autenticado pero no tiene el permiso. No se cierra
* la sesión: el componente muestra el mensaje del backend.
*
* Código de seguimiento: si el backend devuelve requestId en el cuerpo del
* error (ErrorResponseDTO), se agrega al mensaje para que el usuario pueda
* dictárselo a soporte técnico, que lo busca en el log con grep.
*
* En todos los casos el error se vuelve a lanzar para que el componente lo reciba.
*/
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
const auth = inject(AuthService);
const router = inject(Router);
return next(req).pipe(
catchError((err: HttpErrorResponse) => {
if (err.status === 401 && !req.url.endsWith('/auth/login')) {
auth.cerrarSesion('expirada', router.url);
}
return throwError(() => conCodigoDeSeguimiento(err));
}),
);
};

/** Devuelve el mismo error con «Código de seguimiento: xxxxxxxx» al final del mensaje. */
function conCodigoDeSeguimiento(err: HttpErrorResponse): HttpErrorResponse {
const cuerpo = err.error;
const requestId: string | undefined = cuerpo?.requestId;
if (!requestId || typeof cuerpo?.message !== 'string') {
return err;
}
return new HttpErrorResponse({
error: {
...cuerpo,
message: `${cuerpo.message} · Código de seguimiento: ${requestId}`,
},
headers: err.headers,
status: err.status,
statusText: err.statusText,
url: err.url ?? undefined,
});
}