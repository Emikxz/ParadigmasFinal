// ========================= src/io/menu.ts =========================
// Acá está el menú y toda la parte que habla con la consola.
// Esta parte es IMPURA (usa console.log, lee del teclado, etc.).
// También es la parte más "estructurada": while, switch, etc.

import promptSync from "prompt-sync";
import { parsearDDMMAAAA, formatearDDMMAAAA } from "../fp/fecha";
import {
  Tarea,
  EstadoTarea,
  DificultadTarea,
  crearTareaCon,
  actualizarEstado,
} from "../domain/Tarea";
import {
  agregarTarea,
  eliminarFisico,
  eliminarLogico,
  filtrarNoEliminadas,
  ordenarPorVencimientoAsc,
  estadisticasPorEstado,
  estadisticasPorDificultad,
} from "../fp/lista";
import {
  puedeCambiarEstado,
  estadosPermitidosDesde,
} from "../logic/estadosTarea";

// ---------- Fecha de hoy y estado en memoria ----------

// Esta función devuelve la fecha actual.
// Es IMPURA porque usa new Date() (depende del reloj).
function dateProvider(): Date {
  return new Date();
}

// Acá genero la función que crea tareas usando la fecha actual.
const crearTarea = crearTareaCon(dateProvider);

// Variable con todas las tareas en memoria.
let tareas: ReadonlyArray<Tarea> = Object.freeze([]);

// Generador simple de IDs numéricos en string.
// No es perfecto, pero alcanza para el TP.
let ultimoId = 0;
function generarId(): string {
  ultimoId = ultimoId + 1;
  return String(ultimoId);
}

// prompt-sync: lib para leer por consola.
// sigint: true hace que con Ctrl+C puedas salir bonito del programa.
const prompt = promptSync({ sigint: true });

// [IMPURA] lee un texto de la consola.
function read(msg: string): string {
  return prompt(msg);
}

// [IMPURA] imprime en la consola.
function print(msg: string): void {
  console.log(msg);
}

// [IMPURA] pausa hasta que la persona toque Enter.
function pause(): void {
  read("\nPresione Enter para continuar...");
}

// [IMPURA] limpia la consola.
function clear(): void {
  console.clear();
}

// ---------- Lecturas con validación ----------

// [IMPURA] lee una opción de la lista de opciones válidas.
function leerOpcionValida(msg: string, opcionesValidas: string[]): string {
  while (true) {
    const valor = read(msg).trim();
    if (opcionesValidas.includes(valor)) return valor;
    print("\nOpción inválida. Intente nuevamente.");
  }
}

// [IMPURA] lee un texto que no puede estar vacío.
function leerTextoNoVacio(msg: string): string {
  while (true) {
    const valor = read(msg).trim();
    if (valor.length > 0) return valor;
    print("El texto no puede estar vacío.");
  }
}

// [IMPURA] lee una fecha opcional.
// Si la persona deja vacío, devuelvo null.
// Si escribe algo y está mal, aviso y devuelvo null.
function leerFechaOpcional(msg: string): Date | null {
  const texto = read(msg + ' (dd/mm/aaaa o vacío): ').trim();
  if (texto === "") return null;

  const fecha = parsearDDMMAAAA(texto);

  if (!fecha) {
    print("Fecha inválida. Se va a guardar sin la fecha de vencimiento.");
    return null;
  }

  return fecha;
}

// [IMPURA] lee la dificultad a través de un menú.
function leerDificultad(): DificultadTarea {
  print("\nDificultad:");
  print("1) Fácil");
  print("2) Media");
  print("3) Difícil");

  const op = leerOpcionValida("Seleccione la dificultad (1-3): ", ["1", "2", "3"]);

  if (op === "1") return DificultadTarea.Facil;
  if (op === "2") return DificultadTarea.Media;
  return DificultadTarea.Dificil;
}

// [IMPURA] lee un estado para la tarea usando un menú.
function leerEstado(): EstadoTarea {
  print("\nEstado:");
  print("1) Pendiente");
  print("2) En curso");
  print("3) Completada");
  print("4) Cancelada");

  const op = leerOpcionValida("Seleccione el estado (1-4): ", ["1", "2", "3", "4"]);

  if (op === "1") return EstadoTarea.Pendiente;
  if (op === "2") return EstadoTarea.EnCurso;
  if (op === "3") return EstadoTarea.Completada;
  return EstadoTarea.Cancelada;
}

// ---------- Acciones del menú ----------

// [IMPURA] crea una nueva tarea leyendo los datos desde consola.
function accionCrearTarea(): void {
  clear();
  print("=== Nueva Tarea ===\n");

  const titulo = leerTextoNoVacio("Título: ");
  const descripcion = read("Descripción (es opcional): ");
  const dificultad = leerDificultad();
  const fechaVencimiento = leerFechaOpcional("Fecha de vencimiento");

  const id = generarId();

  const nueva = crearTarea({
    id,
    titulo,
    descripcion,
    dificultad,
    fechaVencimiento,
  });

  // Uso la función pura agregarTarea, y actualizo la variable global.
  tareas = agregarTarea(tareas, nueva);

  print("\nTarea creada correctamente.");
  pause();
}

// [IMPURA] muestra las tareas ordenadas por fecha de vencimiento.
function accionListarTareas(): void {
  clear();
  print("=== Listado de Tareas (no eliminadas) ===\n");

  // Primero saco las eliminadas, después ordeno por vencimiento.
  const activas = ordenarPorVencimientoAsc(filtrarNoEliminadas(tareas));

  if (activas.length === 0) {
    print("No hay tareas para mostrar.");
  } else {
    activas.forEach(t => {
      print(`- [${t.id}] ${t.titulo}`);
      print(`    Estado: ${t.estado} | Dificultad: ${t.dificultad}`);
      print(
        `    Creada: ${formatearDDMMAAAA(t.fechaCreacion)} | Vence: ${formatearDDMMAAAA(
          t.fechaVencimiento
        )}`
      );
      print(`    Eliminada: ${t.eliminada ? "Sí (soft delete)" : "No"}`);
      print("");
    });
  }

  pause();
}

// [IMPURA] elimina una tarea (soft o hard) según lo que elija la persona.
function accionEliminarTarea(): void {
  clear();
  print("=== Eliminar Tarea ===\n");

  const id = leerTextoNoVacio("Ingrese ID de la tarea: ");

  print("\n1) Eliminación lógica (soft delete)");
  print("2) Eliminación física (hard delete)");

  const tipo = leerOpcionValida("Seleccione opción (1/2): ", ["1", "2"]);

  const antes = tareas.length;

  if (tipo === "1") {
    tareas = eliminarLogico(tareas, id);
  } else {
    tareas = eliminarFisico(tareas, id);
  }

  if (tareas.length < antes) {
    print("\nTarea eliminada correctamente.");
  } else {
    print("\nNo se encontró una tarea con ese ID.");
  }

  pause();
}

// [IMPURA] cambia el estado de una tarea usando las reglas lógicas de LogicJS.
function accionCambiarEstado(): void {
  clear();
  print("=== Cambiar estado de una tarea ===\n");

  const id = leerTextoNoVacio("Ingrese ID de la tarea: ");

  // Busco la tarea por id.
  const tarea = tareas.find(t => t.id === id);

  if (!tarea) {
    print("\nNo se encontró una tarea con ese ID.");
    pause();
    return;
  }

  print(`\nTarea: ${tarea.titulo}`);
  print(`Estado actual: ${tarea.estado}`);

  // Muestro los estados permitidos desde el actual (según LogicJS).
  const siguientes = estadosPermitidosDesde(tarea.estado);

  if (siguientes.length === 0) {
    print("\nDesde este estado no hay cambios permitidos.");
    pause();
    return;
  }

  print("\nEstados permitidos desde el estado actual (según las reglas lógicas):");
  siguientes.forEach(e => {
    print(`- ${e}`);
  });

  // Leo el nuevo estado que quiere la persona.
  const nuevoEstado = leerEstado();

  // Pregunto a LogicJS si este cambio está permitido.
  const permitido = puedeCambiarEstado(tarea.estado, nuevoEstado);

  if (!permitido) {
    print("\nEse cambio de estado NO está permitido por las reglas lógicas.");
    pause();
    return;
  }

  // Si está permitido, actualizo la lista usando la función pura actualizarEstado.
  tareas = Object.freeze(
    tareas.map(t => (t.id === id ? actualizarEstado(t, nuevoEstado) : t))
  );

  print("\nEstado cambiado correctamente.");
  pause();
}

// [IMPURA] muestra estadísticas por estado y dificultad.
function accionMostrarEstadisticas(): void {
  clear();
  print("=== Estadísticas ===\n");

  const activas = filtrarNoEliminadas(tareas);

  const porEstado = estadisticasPorEstado(activas);
  const porDificultad = estadisticasPorDificultad(activas);

  print("Por estado:");
  porEstado.forEach(e => {
    // toFixed(2) deja el número con 2 decimales.
    print(`- ${e.estado}: ${e.cantidad} (${e.porcentaje.toFixed(2)}%)`);
  });

  print("\nPor dificultad:");
  porDificultad.forEach(d => {
    print(`- ${d.dificultad}: ${d.cantidad} (${d.porcentaje.toFixed(2)}%)`);
  });

  pause();
}

// ---------- Menú principal ----------

// [IMPURA] bucle principal del programa.
// Muestra el menú, lee la opción y llama a la acción correspondiente.
export function ejecutarMenuPrincipal(): void {
  let salir = false;

  while (!salir) {
    clear();
    print("=== TaskList PdeP 2025 ===");
    print("1) Nueva tarea");
    print("2) Listado de tareas");
    print("3) Eliminar tarea (soft / hard)");
    print("4) Ver estadísticas");
    print("5) Cambiar el estado de una tarea (usa lógica)");
    print("0) Salir");

    const opcion = leerOpcionValida("\nSeleccione una opción: ", [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);

    switch (opcion) {
      case "1":
        accionCrearTarea();
        break;
      case "2":
        accionListarTareas();
        break;
      case "3":
        accionEliminarTarea();
        break;
      case "4":
        accionMostrarEstadisticas();
        break;
      case "5":
        accionCambiarEstado();
        break;
      case "0":
        salir = true;
        break;
    }
  }

  clear();
  print("¡Chau xD! 👋");
}
