import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core'; 
import { Permiso } from '../../core/auth/auth.model'; 
import { AuthService } from '../../core/auth/auth-service'; 
  
/** 
 * Muestra el elemento solo si el usuario tiene el permiso: 
 * 
 *   <a *appSiPermiso="'CATALOGO_ESCRIBIR'" routerLink="nuevo">+ Nuevo</a> 
 * 
 * Como tienePermiso() lee un signal, el effect vuelve a evaluarse si la 
 * sesión cambia (por ejemplo, al cerrar sesión). 
 */ 
@Directive({ selector: '[appSiPermiso]' }) 
export class SiPermiso { 
  private readonly auth = inject(AuthService); 
  private readonly plantilla = inject(TemplateRef); 
  private readonly contenedor = inject(ViewContainerRef); 
  private visible = false; 
  
  readonly appSiPermiso = input.required<Permiso>(); 
  
  constructor() { 
    effect(() => { 
      const permitido = this.auth.tienePermiso(this.appSiPermiso()); 
      if (permitido && !this.visible) { 
        this.contenedor.createEmbeddedView(this.plantilla); 
        this.visible = true; 
      } else if (!permitido && this.visible) { 
        this.contenedor.clear(); 
        this.visible = false; 
      } 
    }); 
  } 
} 