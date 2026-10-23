
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
export const appConfig: ApplicationConfig = {
providers: [
provideBrowserGlobalErrorListeners(),
provideRouter(routes, withComponentInputBinding()),
// El orden importa: primero se agrega el token, luego se atienden los errores.
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
],
};