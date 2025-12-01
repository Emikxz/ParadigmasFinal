// ========================= src/fp/lista.ts =========================
// Acá tengo funciones que trabajan con listas de tareas.
// Uso funciones puras (no modifican el arreglo original).

import { compararFechasAsc } from "./fecha";
import {
  Tarea,
  EstadoTarea,
  DificultadTarea,
  marcarEliminada,
  estaVencida,
} from "../domain/Tarea";

// [PURA] devuelve una nueva lista con la tarea agregada.
export function agregarTarea(lista: ReadonlyArray<Tarea>, tarea: Tarea): ReadonlyArray<Tarea> {
  return Object.freeze([...lista, tarea]); // uso spread para copiar y agregar
}

// [PURA] elimina físicamente una tarea (hard delete) devolviendo una lista nueva.
export function eliminarFisico(
  lista: ReadonlyArray<Tarea>,
  id: string
): ReadonlyArray<Tarea> {
  return Object.freeze(lista.filter(t => t.id !== id));
}

// [PURA] hace soft delete: marca la tarea como eliminada.
export function eliminarLogico(
  lista: ReadonlyArray<Tarea>,
  id: string
): ReadonlyArray<Tarea> {
  return Object.freeze(
    lista.map(t => (t.id === id ? marcarEliminada(t) : t))
  );
}

// [PURA] devuelve solo las tareas que NO están eliminadas.
export function filtrarNoEliminadas(
  lista: ReadonlyArray<Tarea>
): ReadonlyArray<Tarea> {
  return Object.freeze(lista.filter(t => !t.eliminada));
}

// [PURA] filtra por estado.
export function filtrarPorEstado(
  lista: ReadonlyArray<Tarea>,
  estado: EstadoTarea
): ReadonlyArray<Tarea> {
  return Object.freeze(lista.filter(t => t.estado === estado));
}

// [PURA] filtra por dificultad.
export function filtrarPorDificultad(
  lista: ReadonlyArray<Tarea>,
  dificultad: DificultadTarea
): ReadonlyArray<Tarea> {
  return Object.freeze(lista.filter(t => t.dificultad === dificultad));
}

// [PURA] ordena las tareas por vencimiento, ascendente.
// Las que no tienen fecha de vencimiento terminan al final.
export function ordenarPorVencimientoAsc(
  lista: ReadonlyArray<Tarea>
): ReadonlyArray<Tarea> {
  // Hago copia con [...lista] para no tocar el original.
  return Object.freeze(
    [...lista].sort((a, b) => compararFechasAsc(a.fechaVencimiento, b.fechaVencimiento))
  );
}

// [PURA] devuelve las tareas que están vencidas a la fecha "hoy".
export function obtenerTareasVencidas(
  lista: ReadonlyArray<Tarea>,
  hoy: Date
): ReadonlyArray<Tarea> {
  return Object.freeze(lista.filter(t => estaVencida(t, hoy)));
}

// ---- Estadísticas ----

export type EstadisticaEstado = {
  estado: EstadoTarea;
  cantidad: number;
  porcentaje: number;
};

export type EstadisticaDificultad = {
  dificultad: DificultadTarea;
  cantidad: number;
  porcentaje: number;
};

// [PURA] arma estadísticas de cuántas tareas hay por estado.
export function estadisticasPorEstado(
  lista: ReadonlyArray<Tarea>
): ReadonlyArray<EstadisticaEstado> {
  const total = lista.length || 1; // si no hay tareas, evito división por 0
  const conteo: Record<string, number> = {}; // objeto para acumular cantidades

  // Recorro la lista y voy sumando 1 en el estado que corresponda.
  lista.forEach(t => {
    const key = t.estado;
    conteo[key] = (conteo[key] ?? 0) + 1;
  });

  // Paso el objeto {estado: cantidad} a un array de objetos más prolijos.
  const resultado = Object.entries(conteo).map(([estado, cant]) => ({
    estado: estado as EstadoTarea,
    cantidad: cant,
    porcentaje: (cant * 100) / total,
  }));

  return Object.freeze(resultado);
}

// [PURA] estadísticas por dificultad.
export function estadisticasPorDificultad(
  lista: ReadonlyArray<Tarea>
): ReadonlyArray<EstadisticaDificultad> {
  const total = lista.length || 1;
  const conteo: Record<string, number> = {};

  lista.forEach(t => {
    const key = t.dificultad;
    conteo[key] = (conteo[key] ?? 0) + 1;
  });

  const resultado = Object.entries(conteo).map(([dif, cant]) => ({
    dificultad: dif as DificultadTarea,
    cantidad: cant,
    porcentaje: (cant * 100) / total,
  }));

  return Object.freeze(resultado);
}
