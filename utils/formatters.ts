// utils/formatters.ts

// Con este módulo lo que estoy buscando es convertir los datos a formatos de presentación.

import type { Task, TaskDifficulty } from "../models/Task"

/**
 * formatDate convierte una fecha al formato YYYY-MM-DD.
 * si la fecha no existe, devuelve un texto descriptivo.
 * @param date fecha que se desea formatear o null
 * @returns fecha formateada o "sin fecha"
 */
export const formatDate = (date: Date | null): string => { // La hice pura porque no modifica la fecha recibida, sino que devuelve un string con el formato deseado.
    if (!date) return "Sin Fecha "

    return date.toISOString().slice(0,10)
}

/**
 * formatTaskDifficulty convierte la dificultad a un formato visual con estrellas.
 * Es una función pura porque no modifica la dificultad recibida, sino que voy a devolver un string con el formato deseado.
 * @param difficulty dificultad de la tarea
 * @returns dificultad formateada con estrellas
 */
export const formatTaskDifficulty = ( difficulty: TaskDifficulty): string => {
    const difficultyFormat: Record<TaskDifficulty, string> = {
        // Record es un tipo genérico que me permite crear un objeto con claves de un tipo específico (en este caso TaskDifficulty) y valores de otro tipo (en este caso string).
        Facil: "★ ☆ ☆",
        Media: "★ ★ ☆",
        Dificil: "★ ★ ★"
    }
    return difficultyFormat[difficulty]
}
