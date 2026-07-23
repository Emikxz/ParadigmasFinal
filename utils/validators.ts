// utils/validators.ts

// Con este módulo compruebo que las entradas sean correctas.

import type { TaskDifficulty, TaskStatus } from "../models/Task";   

/**
 * Con validateRequiredText valido que un texto obligatorio no esté vacío.
 * @param value Texto ingresado-
 * @param errorMessage Mensaje que lanzo si el texto está vacío.
 * @returns Texto validado y sin espacios.
 */
export const validateRequiredText = (value: string, errorMessage: string): string => {
    const trimmedValue = value.trim()

    if (trimmedValue === "") {
        throw new Error(errorMessage)
    }

    return trimmedValue
}

/**
 * Valida el título de una tarea
 * @param title Título ingresado
 * @returns Título validado
 */
export const validateTaskTitle = (title: string): string => {
    const validTitle = validateRequiredText(title, "❌ El título no puede estar vacío ❌")

    if (validTitle.length > 100) {
        throw new Error("❌ El título no puede tener más de 100 caracteres ❌")
    }
    return validTitle
}

/**
 * Valida que el texto para buscar una tarea sea válido
 * @param title Titulo buscado
 * @returns Texto validado
 */
export const validateSearchTitle = (title: string): string => {
    return validateRequiredText(title, "❌ Debe ingresar un texto para buscar ❌")
}

/**
 * Convierte la dificultad ingresada en una dificultad válida
 * @param value Dificultad ingresada
 * @returns Dificultad válida
 */
export const parseTaskDifficulty = (value: string): TaskDifficulty => {
    const validValue = value.trim().toLowerCase()

    if (validValue === "facil") return "Facil"
    if (validValue === "media") return "Media"
    if (validValue === "dificil") return "Dificil"

    throw new Error("❌ La dificultad ingresada no es válida ❌")
}

/**
 * Convierto el estado ingresado en un estado válido
 * @param value Estado ingresado
 * @returns Estado validado
 */
export const parseTaskStatus = (value: string): TaskStatus => {
    const validValue = value.trim().toLowerCase()

    if (validValue === "pendiente") return "Pendiente"
    if (validValue === "en curso") return "En Curso"
    if (validValue === "terminada") return "Terminada"
    if (validValue === "cancelada") return "Cancelada"

    throw new Error("❌ El estado indicado no es válido ❌")
}

/**
 * Convierte una fecha con formato YYYY-MM-DD en Date
 * Permite devolver null si el campo se puede dejar vacío
 * @param value Texto ingresado
 * @param allowEmpty Indica si se permite una fecha vacía
 * @return Fecha validada o null
 */
export const parseDueDateInput = (value: string, allowEmpty: boolean = true): Date | null => {
    const input = value.trim();

    if (input === "" && allowEmpty) { // Esta parte es para crear una tarea sin vencimiento
        return null
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // Esta es una expresión regular que exige exáctamente 4 dígitos - 2 dígitos - 2 dígitos

    if (!dateRegex.test(input)) { // test() devuelve true cuando el texto cumple con el patrón
        throw new Error( "❌ La fecha debe tener el formato YYYY-MM-DD ❌")
    }

    const [year, month, day] = input.split("-").map(Number) // Separación de año, mes y día
                                                            // Primero split produce algo tipo ["2026", "07", "25"]
                                                            // Después map(Number) transforma los textos en números [2026, 7, 25]
                                                            // Al final desestructuramos con const [year, month, day] para que quede
                                                            // year = 2026, month = 7, day = 25

    const parsedDate = new Date(input + "T00:00:00")        // Creo un objeto date y le agrego las horas para indicar el inicio del día en horario local.

    // Comprobamos que la fecha realmente exista
    if (
        isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day 
    ) {
        throw new Error("❌ La fecha ingresada no es válida ❌")
    }

    const today = new Date()
    today.setHours(0,0,0,0)

    // Evito que la fecha sea anterior a hoy
    if (parsedDate < today) {
        throw new Error("❌ La fecha de vencimiento no puede ser anterior a la actual ❌")
    }

    return parsedDate
}