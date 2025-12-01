// ========================= src/logic/estadosTarea.ts =========================
// Acá hago la parte de programación lógica para los ESTADOS de las tareas.
// Uso la librería logicjs, igual que en la teoría del profe.

import { EstadoTarea } from "../domain/Tarea";

// Uso require en vez de import para que TypeScript no pida tipos del módulo.
const logic = require("logicjs");
const { lvar, eq, and, or, run } = logic;

// Predicado lógico: estado_valido(estado)
// Devuelve un goal que se cumple si el estado es uno de los permitidos.
function estado_valido(estado: unknown) {
  return or(
    eq(estado, EstadoTarea.Pendiente),
    eq(estado, EstadoTarea.EnCurso),
    eq(estado, EstadoTarea.Completada),
    eq(estado, EstadoTarea.Cancelada)
  );
}

// Predicado lógico: puede_transicionar(desde, hacia)
// Define desde qué estados se puede pasar a cuáles.
// Pendiente -> En curso o Cancelada
// En curso  -> Completada o Cancelada
function puede_transicionar(desde: unknown, hacia: unknown) {
  return and(
    estado_valido(desde),
    estado_valido(hacia),
    or(
      // Reglas desde Pendiente
      and(
        eq(desde, EstadoTarea.Pendiente),
        or(
          eq(hacia, EstadoTarea.EnCurso),
          eq(hacia, EstadoTarea.Cancelada)
        )
      ),
      // Reglas desde En curso
      and(
        eq(desde, EstadoTarea.EnCurso),
        or(
          eq(hacia, EstadoTarea.Completada),
          eq(hacia, EstadoTarea.Cancelada)
        )
      )
    )
  );
}

// ---------------- Funciones que usa el resto del programa ----------------

// Devuelve true si el estado es válido según las reglas lógicas.
export function esEstadoValido(estado: EstadoTarea): boolean {
  const x = lvar(); // variable lógica
  const goal = and(estado_valido(x), eq(x, estado));
  const resultados = run(goal, x) as EstadoTarea[];
  return resultados.length > 0;
}

// Devuelve todos los estados a los que se puede pasar desde "desde".
export function estadosPermitidosDesde(desde: EstadoTarea): EstadoTarea[] {
  const x = lvar(); // nuevo estado
  const goal = puede_transicionar(desde, x);
  const resultados = run(goal, x) as EstadoTarea[];
  return resultados;
}

// Devuelve true si el cambio desde -> hacia está permitido.
export function puedeCambiarEstado(
  desde: EstadoTarea,
  hacia: EstadoTarea
): boolean {
  const x = lvar();
  const goal = and(
    puede_transicionar(desde, x),
    eq(x, hacia)
  );
  const resultados = run(goal, x) as EstadoTarea[];
  return resultados.length > 0;
}
