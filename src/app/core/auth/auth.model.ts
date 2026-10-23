/** Permisos que emite PharmaBackend (enum Permiso del backend). */
export type Permiso =
| 'CATALOGO_LEER'
| 'CATALOGO_ESCRIBIR'
| 'CLIENTES_LEER'
| 'CLIENTES_ESCRIBIR'
| 'VENTAS_LEER'
| 'VENTAS_REGISTRAR'
| 'REPORTES_VER'
| 'USUARIOS_ADMINISTRAR';
/** Lo que se envía a POST /auth/login. */
export interface LoginRequest {
username: string;
password: string;
}
/** Lo que devuelve POST /auth/login (LoginResponseDTO). */
export interface LoginResponse {
token: string;
tipo: string;
expiraEnSegundos: number;
username: string;
nombreCompleto: string;
roles: string[];
permisos: Permiso[];
}
/** Sesión guardada en el navegador. */
export interface Sesion {
token: string;
/** Momento de expiración en milisegundos (Date.now() + expiraEnSegundos * 1000). */
expiraEn: number;
username: string;
nombreCompleto: string;
roles: string[];
permisos: Permiso[];
}