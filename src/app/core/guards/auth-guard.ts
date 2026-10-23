import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';
/**
* Solo deja pasar si hay sesión. Si no, envía al login y recuerda
* la URL pedida en ?returnUrl= para volver allí después de entrar.
*/
export const authGuard: CanActivateFn = (_route, state) => {
const auth = inject(AuthService);
if (auth.autenticado()) {
return true;
}
return inject(Router).createUrlTree(['/login'], {
queryParams: { returnUrl: state.url },
});
};
/** El login solo es para quien NO ha iniciado sesión. */
export const invitadoGuard: CanActivateFn = () => {
const auth = inject(AuthService);
return auth.autenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
};