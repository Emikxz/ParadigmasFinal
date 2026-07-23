// ui/menu.ts

// menu muestra las opciones y devuelve la seleccion.

import { prompt } from "../prompt"

/**
 * Muestra el menú principal y devuelve
 * la opción ingresada por la persona usuaria.
 *
 * @returns Opción convertida a número.
 */
export const showMainMenu = (): number => {
    console.log("====================================")
    console.log("== MENU TASKLIST EMILIANO FIDALGO ==")
    console.log("====================================")
    console.log("[1] Ver tareas")
    console.log("[2] Buscar tarea")
    console.log("[3] Agregar tarea")
    console.log("[4] Eliminar tarea")
    console.log("[5] Restaurar tarea")
    console.log("[6] Estadísticas")
    console.log("[0] Salir")
    console.log("====================================")

    return Number(
        prompt("\nDigite su opción: ")
    )
}

/**
 * Muestra el submenú utilizado para consultar
 * las tareas mediante diferentes criterios.
 *
 * @returns Opción convertida a número.
 */
export const showViewTasksMenu = (): number => {
    console.log("============================")
    console.log("== ¿QUÉ TAREAS DESEA VER? ==")
    console.log("============================")
    console.log("[1] Ver todas las tareas")
    console.log("[2] Ver tareas pendientes")
    console.log("[3] Ver tareas en curso")
    console.log("[4] Ver tareas terminadas")
    console.log("[5] Ver tareas vencidas")
    console.log("[6] Ver tareas por título")
    console.log("[7] Ver tareas de alta prioridad")
    console.log("[0] Volver al menú principal")
    console.log("============================")

    return Number(
        prompt("\nDigite su opción: ")
    )
}

/**
 * Muestra el submenú con las diferentes
 * formas disponibles para buscar una tarea.
 *
 * @returns Opción convertida a número.
 */
export const showSearchMenu = (): number => {
    console.log("============================")
    console.log("== ¿CÓMO DESEA BUSCAR? ====")
    console.log("============================")
    console.log("[1] Buscar por ID")
    console.log("[2] Buscar por título")
    console.log("[3] Buscar tareas relacionadas")
    console.log("[0] Volver")
    console.log("============================")

    return Number(
        prompt("\nDigite su opción: ")
    )
}

/**
 * Muestra una confirmación específica
 * para editar una tarea.
 *
 * @returns 1 para confirmar o 2 para cancelar.
 */
export const showEditConfirmationMenu = (): number => {
    console.log("\n¿Desea editar esta tarea?")
    console.log("[1] Sí")
    console.log("[2] No")

    return Number(
        prompt("\nDigite su opción: ")
    )
}