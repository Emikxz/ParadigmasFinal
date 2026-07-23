// utils/sorters.ts

// Con este módulo ordeno mediante funciones sin modificar arreglos originales.

import { Task } from "../models/Task"

/**
 * Ordena tareas alfabéticamente por título.
 * Las tareas las mando al final del arreglo.
 * @param tasks Arreglo de tareas a ordenar.
 * @returns Nuevo arreglo ordenado por título ascendente. 
 */
export const sortTaskByTitle = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => a.getTitle().localeCompare(b.getTitle()))
}

/**
 * Ordena tareas por fecha de vencimiento en orden ascendente sin modificar el array original.
 * Las tareas sin fecha las mando al final.
 * @param tasks Tareas a ordenar
 * @returns Nuevo arreglo ordenado por vencimiento ascendente.
 */
export const sortTaskByDueDate = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
        const dueDateA = a.getDueDate()
        const dueDateB = b.getDueDate()

        if (!dueDateA && !dueDateB) return 0 // Caso que ninguna tenga fecha
        if (!dueDateA) return 1 // Caso que A no tenga fecha
        if (!dueDateB) return -1 // Caso que B no tenga fecha 

        return dueDateA.getTime() - dueDateB.getTime() // Si a da negativo, a va antes que b, si da positivo lo contrario.
    })
}