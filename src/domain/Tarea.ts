// ========================= src/domain/Tarea.ts =========================
// Acá defino la clase Tarea y algunas funciones para crear y actualizar tareas.
// Mezcla de OOP (clase) y funciones puras para no andar mutando cosas.

import { NullableDate, soloFecha } from "../fp/fecha";

// Estados que puede tener una tarea.
export enum EstadoTarea {
  Pendiente = "Pendiente",
  EnCurso = "En curso",
  Completada = "Completada",
  Cancelada = "Cancelada",
}

// Dificultades posibles.
export enum DificultadTarea {
  Facil = "Fácil",
  Media = "Media",
  Dificil = "Difícil",
}

// Tipo para agrupar los datos que necesita la clase Tarea.
export type TareaProps = {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoTarea;
  dificultad: DificultadTarea;
  fechaCreacion: Date;
  fechaVencimiento: NullableDate;
  eliminada: boolean; // para soft delete
};

// Clase Tarea: representa una tarea individual.
export class Tarea {
  public readonly id: string;
  public titulo: string;
  public descripcion?: string;
  public estado: EstadoTarea;
  public dificultad: DificultadTarea;
  public readonly fechaCreacion: Date;
  public fechaVencimiento: NullableDate;
  public eliminada: boolean;

  constructor(props: TareaProps) {
    this.id = props.id;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.estado = props.estado;
    this.dificultad = props.dificultad;

    // Guardo las fechas "sin hora" para que sea más prolijo.
    this.fechaCreacion = soloFecha(props.fechaCreacion) ?? new Date(props.fechaCreacion);
    this.fechaVencimiento = props.fechaVencimiento ? soloFecha(props.fechaVencimiento) : null;

    this.eliminada = props.eliminada;
  }
}

// -------------------------- Funciones puras --------------------------

// DateProvider es una función que devuelve la fecha de "hoy".
// Lo hago así para poder testear fácil y no mezclar new Date() por todos lados.
export type DateProvider = () => Date;

// [PURA] esta función genera otra función que crea tareas.
// No hace I/O. La fecha de hoy viene de dateProvider (se inyecta desde afuera).
export function crearTareaCon(dateProvider: DateProvider) {
  return function crearTarea(params: {
    id: string;
    titulo: string;
    descripcion?: string;
    dificultad: DificultadTarea;
    fechaVencimiento?: NullableDate;
  }): Tarea {
    const hoy = soloFecha(dateProvider())!;

    return new Tarea({
      id: params.id,
      titulo: params.titulo.trim(),
      descripcion: params.descripcion?.trim(),
      estado: EstadoTarea.Pendiente,
      dificultad: params.dificultad,
      fechaCreacion: hoy,
      fechaVencimiento: params.fechaVencimiento ? soloFecha(params.fechaVencimiento) : null,
      eliminada: false,
    });
  };
}

// [PURA] devuelve una nueva tarea con el estado cambiado.
export function actualizarEstado(tarea: Tarea, nuevoEstado: EstadoTarea): Tarea {
  return new Tarea({
    ...tarea, // copio todo
    estado: nuevoEstado, // cambio solo el estado
  });
}

// [PURA] devuelve una nueva tarea con la dificultad cambiada.
export function actualizarDificultad(
  tarea: Tarea,
  nuevaDificultad: DificultadTarea
): Tarea {
  return new Tarea({
    ...tarea,
    dificultad: nuevaDificultad,
  });
}

// [PURA] marca la tarea como eliminada (soft delete) devolviendo una copia.
export function marcarEliminada(tarea: Tarea): Tarea {
  return new Tarea({
    ...tarea,
    eliminada: true,
  });
}

// [PURA] dice si la tarea está vencida o no, comparando con la fecha de hoy.
export function estaVencida(tarea: Tarea, hoy: Date): boolean {
  if (!tarea.fechaVencimiento) return false;

  const soloHoy = soloFecha(hoy)!;
  return tarea.fechaVencimiento.getTime() < soloHoy.getTime();
}
