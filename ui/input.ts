// ui/input.ts

// input se encarga de solicitar y validar datos.

import { prompt } from "../prompt"
import { Task, TaskDifficulty, TaskStatus } from "../models/Task"
import { parseDueDateInput, parseTaskDifficulty, parseTaskStatus, validateRequiredText, validateSearchTitle, validateTaskTitle } from "../utils/validators"    


/**
 * Para solicitar un texto obligatorio por consola.
 * @param message Mensaje que se muestra al usuario
 * @returns Texto validado
 */
export const askNonEmptyText = (message: string): string => {
    return validateRequiredText(prompt(message), "❌ El campo no puede estar vacío ❌")
}


/**
 * Solicita el título de una tarea (no puede estar vacío ni superar los 100 caracteres)
 * @returns Titulo validado
 */
export const askTitle = (): string => {
    return validateTaskTitle(prompt("Título: "))
}


/**
 * Solicita la descripción de una tarea (puede estar vacía)
 * @returns Descripción ingresada
 */
export const askDescription = (): string => {
    return prompt("Descripción: ").trim()
}

/**
 * Solicita la dificultad de una tarea y la convierte al tipo que uso en el sistema
 * @returns Dificultad validada
 */
export const askDifficulty = (): TaskDifficulty => {
    return parseTaskDifficulty(prompt("Dificultad [Facil, Media, Dificil]: "))
}


/**
 * Solicita el estado de una tarea y la convierte al tipo que uso en el sistema
 * @returns Estado validado
 */
export const askStatus = (): TaskStatus => {
    return parseTaskStatus(prompt("Estado [Pendiente, En Curso, Terminada, Cancelada]: "))
}


/**
 * Solicita una fecha de vencimiento de una tarea, si la deja vacía la tarea queda sin fecha
 * @returns Fecha validada o null
 */
export const askDueDate = (): Date | null => {
    return parseDueDateInput(prompt("Fecha de vencimiento [YYYY-MM-DD o dejar vacío]: "))
}

/**
 * Solicita un texto para buscar por título.
 * @returns Texto de búsqueda validado
 */
export const askSearchTitle = (): string => {
    return validateSearchTitle(prompt("Ingrese el título o parte del título: "))
}


/**
 * Solicita el ID de una tarea y comprueba que no esté vacío
 * @returns ID Ingresado
 */
export const askTaskId = (): string => {
    return validateRequiredText(prompt("ID de la tarea: "), "❌ El ID no puede estar vacío ❌")
}


/**
 * Lo hice para mostrar una confirmación simple.
 * @param message Mensaje de confirmación
 * @returns true para Sí y false para No.
 */
export const askConfirmation = (message: string): boolean => {
    const option = prompt(`${message} [1] Sí / [2] No: `).trim()

    if (option === "1") return true
    if (option === "2") return false

    throw new Error("❌ La opción ingresada no es válida ❌")
}


/**
 * Para solicitar un nuevo título cuando editamos. Si se deja vacío no se modifica.
 * @param currentTitle Título actual
 * @returns Nuevo título o undefined si no se modifica
 */
export const askNewTitle = (currentTitle: string): string | undefined => {
    const input = prompt(`Nuevo título [${currentTitle}]: `)

if (input.trim() === "") {
    return undefined
}

return validateTaskTitle(input)
}


/**
 * Para colocar una nueva descripción durante una edición. Si se deja vacío no se modifica.
 * @param currentDescription Descripción actual
 * @returns Nueva descripción o undefined si no se modifica.
 */
export const askNewDescription = (currentDescription: string): string | undefined => {

    const input = prompt(`Nueva descripción [${currentDescription}]: `).trim()

    if (input === "") {
        return undefined
    }

    return input
}


/**
 * Para colocar un nuevo estado durante una edición. Si se deja vacío no se modifica.
 * @param currentStatus descripción actual
 * @returns nueva descripción o undefined si no se modifica.
 */
export const askNewStatus = (currentStatus: TaskStatus): TaskStatus | undefined => {

    const input = prompt(`Nuevo estado [${currentStatus}]: `).trim()

    if (input === "") {
        return undefined
    }

    return parseTaskStatus(input)
}


/**
 * Para colocar una nueva dificultad durante una edición. Si se deja vacío no se modifica.
 * @param currentDiff Dificultad actual
 * @returns Nueva dificultad o undefined si no se modifica.
 */
export const askNewDifficulty = (currentDiff: TaskDifficulty): TaskDifficulty | undefined => {

    const input = prompt(`Nueva dificultad [${currentDiff}]: `).trim()

    if (input === "") return undefined

    return parseTaskDifficulty(input)
}


/**
 * Para editar la fecha de vencimiento. Si se deja vacío no se modifica.
 * @param currentDueDate Fecha de vencimiento actual.
 * @returns Nueva fecha, null o undefined si no se modifica.
 */
export const askNewDueDate = (currentDueDate: Date | null): Date | null | undefined => {

    const currentDateText = currentDueDate ? currentDueDate.toISOString().slice(0, 10): "Sin fecha"

    const input = prompt(`Nueva fecha de vencimiento (YYYY-MM-DD) [${currentDateText}]: `).trim()

    if (input === "") return undefined

    return parseDueDateInput(input, false)
}


export type TaskUpdates = {
    title?: string
    desc?: string
    status?: TaskStatus
    difficulty?: TaskDifficulty
    dueDate?: Date | null
}


/**
 * Aca reuno todos los datos opciones de edición para una tarea. 
 * Solo se van a incluir en el objeto final los campos que realmente se cambiaron.
 * @param task Tarea que se va a editar
 * @returns Objeto con los cambios solicitados.
 */
export const askTaskUpdates = (task: Task): TaskUpdates => {
    const updates: TaskUpdates = {}

    const newTitle = askNewTitle(task.getTitle())
    const newDescription = askNewDescription(task.getDesc())
    const newStatus = askNewStatus(task.getStatus())
    const newDifficulty = askNewDifficulty(task.getDifficulty())
    const newDueDate = askNewDueDate(task.getDueDate())

    if (newTitle !== undefined) updates.title = newTitle
    if (newDescription !== undefined) updates.desc = newDescription
    if (newStatus !== undefined) updates.status = newStatus
    if (newDifficulty !== undefined) updates.difficulty = newDifficulty
    if (newDueDate !== undefined) updates.dueDate = newDueDate

    return updates
}