// ========================= src/fp/fecha.ts =========================
// En este archivo pongo funciones de fecha.
// Son funciones PURAS: no tocan consola, ni archivos, ni nada externo.

export type NullableDate = Date | null;

// [PURA] recibe una fecha y devuelve la misma fecha pero "sin hora".
export function soloFecha(fecha: unknown): NullableDate {
  // Si no es una fecha válida, devuelvo null.
  if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
    return null;
  }

  // Creo una nueva fecha con solo año, mes y día.
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

// [PURA] chequea si algo es una fecha válida.
export function esFechaValida(valor: unknown): valor is Date {
  return valor instanceof Date && !isNaN(valor.getTime());
}

// [PURA] convierte un texto "dd/mm/aaaa" a Date o null si está mal.
export function parsearDDMMAAAA(textoFecha: string): NullableDate {
  const texto = (textoFecha || "").trim();
  if (texto === "") return null;

  const partes = texto.split("/");
  if (partes.length !== 3) return null;

  const [ddStr, mmStr, aaStr] = partes;
  const dia = Number(ddStr);
  const mes = Number(mmStr);
  const anio = Number(aaStr);

  // Si alguno no es número entero, ya está mal.
  if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anio)) {
    return null;
  }

  // Armo la fecha. Ojo: en JS el mes va de 0 a 11.
  const fecha = new Date(anio, mes - 1, dia);
  if (!esFechaValida(fecha)) return null;

  // Verifico que se haya armado bien (por ejemplo, 32/01 es inválido).
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return soloFecha(fecha);
}

// [PURA] formatea una fecha a "dd/mm/aaaa".
// Si es null o inválida, devuelve "Sin fecha".
export function formatearDDMMAAAA(fecha: NullableDate): string {
  if (!fecha || !esFechaValida(fecha)) return "Sin fecha";

  // padStart pone ceros adelante si hace falta (ejemplo: 3 -> "03").
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

// [PURA] compara dos fechas para poder ordenar.
// Si alguna es null, la mando al fondo (la trato como infinito).
export function compararFechasAsc(a: NullableDate, b: NullableDate): number {
  const av = a ? a.getTime() : Number.POSITIVE_INFINITY;
  const bv = b ? b.getTime() : Number.POSITIVE_INFINITY;
  return av - bv; // si da < 0, "a" va antes que "b"
}
