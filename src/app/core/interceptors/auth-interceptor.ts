import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';
/**
* Agrega Authorization: Bearer <token> a cada petición dirigida a la API.
* Los servicios no necesitan saber nada del token.
*/
export const authInterceptor: HttpInterceptorFn = (req, next) => {
const token = inject(AuthService).token();
// Sin token, o hacia otro servidor: la petición sale tal cual.
if (!token || !req.url.startsWith(environment.apiUrl)) {
return next(req);
}
// HttpRequest es inmutable: se envía una copia con el encabezado.
return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};