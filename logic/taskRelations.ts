// logic/taskRelations.ts

// Este es el módulo que usa logicjs para encontrar las tareas relacionadas.

const { lvar, run, and, or, eq } = require("logicjs")

// lvar → Crea variables lógicas (incógnitas que pueden unificarse con valores)
// run  → Ejecuta consultas lógicas y devuelve los resultados
// and  → Operador lógico AND (todas las condiciones deben ser verdaderas)
// or   → Operador lógico OR (al menos una condición debe ser verdadera)
// eq   → Establece igualdad entre dos términos (eq(x, "juan") significa "x es igual a juan")

import { Task } from "../models/Task"

/**
 * Normaliza un título para utilizarlo
 * @param title Título de una tarea
 * @return Palabras en minúscula, sin espacios vacíos
 */
const normalizeWords = (title: string): string[] => {
    return title.toLowerCase().split(" ").map(word => word.trim()).filter(word => word !== "")
}



/**
 * Hecho lógico: con este hecho lo que hago es definir el universo en cierto sentido.
 * taskWord(taskId, word) se cumple si una tarea activa contiene esa palabra en su título
 * @param tasks Colección de tareas disponible
 * @param taskId ID de tarea
 * @param word Palabra del título
 * @returns Relación lógica entre tarea y palabra
 */
const taskWord = (tasks: Task[], taskId: string, word: string) => {

    const activeTasks = tasks.filter( // Primero filtro entre las tareas activas
        task => !task.isTaskDeleted()
    )

    const facts = activeTasks.flatMap(task => // Recorro cada tarea y transformo cada tarea en varios hechos, luego uno todos esos hechos en un solo arreglo.
        normalizeWords(task.getTitle()).map(currentWord => // Luego obtengo las palabras
            and(                            // Por cada palabra creo dos igualdades lógicas que deben cumplirse juntas
                eq(taskId, task.getId()),   // Relaciona la variable taskId con el ID real de la tarea.
                eq(word, currentWord)       // Relaciona la palabra con una palabra del título
            )
        )
    )

    return or(...facts) // Uno los hechos con or, el operador spread entrega cada hecho como argumento individual
}



/**
 * Regla lógica:
 * dos tareas están relacionadas si comparten al menos una palabra en el título
 * @param tasks Colección de tareas a consultar
 * @param baseTaskId ID de la tarea base
 * @returns IDs de las tareas relacionadas
 */
export const getRelatedTasksIds= (tasks: Task[], baseTaskId: string): string[] => {
    const otherId = lvar("otherId")         // Representa el ID de alguna otra tarea relacionada
    const sharedWord = lvar("sharedWord")   // Representa la palabra que ambas tareas tienen en común

    // Esta consulta dice tipo "buscá un otherId y una sharedWord tales que la tarea base tenga esa palabra y otra tarea también tenga la misma palabra."
    const results = run(
        and(taskWord(tasks, baseTaskId, sharedWord), // Esta primera condición significa que la tarea base contiene sharedWord
         taskWord(tasks, otherId, sharedWord)), // Esta segunda condición significa que alguna otra tarea contiene la misma sharedWord (como 1ra y 2da condición están en AND ambas deben cumplirse)
         otherId // Indica que queremos recibir los valores encontrados para otherId
    )
    return results.filter((id: string) => id !== baseTaskId) // La tarea base también comparte palabras con ella misma 
                                                             // por lo que eliminamos eso mediante id !== baseTaskId asi solo quedan las otras tareas
}