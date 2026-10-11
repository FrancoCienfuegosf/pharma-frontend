/** Pasa a minúsculas y quita tildes: "Analgésicos" → "analgesicos". */
export function normalizar(texto: string): string {
return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
/** true si todas las palabras buscadas aparecen en alguno de los campos. */
export function coincide(busqueda: string, ...campos: string[]): boolean {
const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
const texto = normalizar(campos.join(' '));
return palabras.every(p => texto.includes(p));
}