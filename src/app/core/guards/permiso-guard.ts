import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';
/**
* Exige el permiso declarado en la ruta: data: { permiso: 'VENTAS_LEER' }.
* Si falta, muestra la página de acceso denegado (no el login: el usuario
* ya está identificado).
*
* Es una ayuda para la experiencia de usuario: la protección real la hace
* el backend, que responde 403 aunque alguien modifique el JavaScript.
*/
export const permisoGuard: CanActivateFn = route => {
const permiso = route.data['permiso'] as Permiso | undefined;
if (!permiso || inject(AuthService).tienePermiso(permiso)) {
return true;
}
return inject(Router).createUrlTree(['/acceso-denegado']);
};