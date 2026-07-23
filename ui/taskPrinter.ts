// ui/taskPrinter.ts

// taskPrinter se encarga de mostrar tareas y estadísticas. 

import { Task } from "../models/Task"
import { TaskStats } from "../services/TaskManager"
import { formatDate } from "../utils/formatters"


/**
 * Muestra una sola tarea en detalle
 * @param task Tarea a imprimir
 */
export const printTask = (task: Task): void => {
    console.log("===============================")
    console.log(`ID: ${task.getId()}`)
    console.log(`Título: ${task.getTitle()}`)
    console.log(`Descripción: ${task.getDesc()}`)
    console.log(`Estado: ${task.getStatus()}`)

    console.log(`Dificultad: ${task.getFormattedDifficulty()} ` +
    `(${task.getDifficulty()})`)

    console.log(`Fecha de Creación: ${formatDate(task.getCreatedAt())}`)

    console.log(`Fecha de Última Edición: ${formatDate(task.getUpdatedAt())} `)

    console.log(`Fecha de Vencimiento: ${formatDate(task.getDueDate())}`)

    console.log(`Eliminada: ${task.isTaskDeleted() ? "Sí" : "No"}`)

    console.log("===============================")
}


/**
 * Para mostrar una lista de tareas en un formato simple
 * @param tasks Arreglo de tareas
 */
export const printTaskList = (tasks: Task[]): void => {

    if (tasks.length === 0) {
        console.log("No hay tareas para mostrar :( .")
        return
    }

    console.log("            IDENTIFICADOR            | CADUCACION |   ESTADO  | TITULO")
    console.log("=====================================|============|===========|===================================")
    
    tasks.forEach(task => {
        console.log(
            `${task.getId()} | ` +
            `${formatDate(task.getDueDate())} | ` +
            `${task.getStatus()} | ` +
            `${task.getTitle()}`
        )
    })
}


/**
 * Muestra la lista de tareas para búsquedas en un formato simple.
 */
export const printSearchResults = (tasks: Task[]): void => {

    if (tasks.length === 0) {
        console.log("No hay tareas para mostrar :( .")
        return
    }

    console.log("\nTAREAS ENCONTRADAS: \n")
    console.log("            IDENTIFICADOR            | TITULO")
    console.log("=====================================|===============================================")

    tasks.forEach(task => {
        console.log(`${task.getId()} | ${task.getTitle()} `)
    })
}


/**
 * Muestra las tareas de alta prioridad
 */
export const printHighPriorityTasks = (tasks: Task[]): void => {
    console.log("\nTAREAS DE ALTA PRIORIDAD\n")

    if (tasks.length === 0) {
        console.log("No hay tareas para mostrar :( .")
        return
    }

    tasks.forEach(task => {
        console.log(`- ${formatDate(task.getDueDate())} | ` + `${task.getTitle()}`) 
    })
}

/**
 * Muestra el listado de estadísticas
 */
export const printStats = (
    stats: TaskStats
): void => {
    console.log("\nESTADÍSTICAS")
    console.log("=======================")
    console.log(
        `Total de tareas activas: ${stats.total}`
    )
    console.log("=======================")
    console.log("")

    console.log("Por estado: ")

    console.log(
        `⏳ Pendientes: ` +
        `${stats.byStatus["Pendiente"]} ` +
        `(${stats.percentagesByStatus[
            "Pendiente"
        ].toFixed(2)}%)`
    )

    console.log(
        `🔄 En Curso: ` +
        `${stats.byStatus["En Curso"]} ` +
        `(${stats.percentagesByStatus[
            "En Curso"
        ].toFixed(2)}%)`
    )

    console.log(
        `✅ Terminadas: ` +
        `${stats.byStatus["Terminada"]} ` +
        `(${stats.percentagesByStatus[
            "Terminada"
        ].toFixed(2)}%)`
    )

    console.log(
        `❌ Canceladas: ` +
        `${stats.byStatus["Cancelada"]} ` +
        `(${stats.percentagesByStatus[
            "Cancelada"
        ].toFixed(2)}%)`
    )

    console.log("")
    console.log("Por dificultad: ")

    console.log(
        `🟢 Facil: ` +
        `${stats.byDifficulty["Facil"]} ` +
        `(${stats.percentagesByDifficulty[
            "Facil"
        ].toFixed(2)}%)`
    )

    console.log(
        `🟡 Media: ` +
        `${stats.byDifficulty["Media"]} ` +
        `(${stats.percentagesByDifficulty[
            "Media"
        ].toFixed(2)}%)`
    )

    console.log(
        `🔴 Dificil: ` +
        `${stats.byDifficulty["Dificil"]} ` +
        `(${stats.percentagesByDifficulty[
            "Dificil"
        ].toFixed(2)}%)`
    )
}