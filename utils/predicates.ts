// utils/predicates.ts

// Con este módulo reuno funciones que van a evaluar una condición y devolver true o false.
// Cada predicado expresa una idea única (programación lógica)

import { Task, TaskStatus } from "../models/Task"

/**
 * isActiveTask predicado: una tarea está activa cuando no fue eliminada lógicamente.
 * @param task Tarea que quiero evaluar
 * @returns true si la tarea está activa, false si fue eliminada lógicamente
 */
export const isActiveTask = (task: Task): boolean => !task.isTaskDeleted() 

/**
 * Predicado: una tarea está eliminada cuando fue marcada como eliminada lógicamente.
 * @param task Tarea que quiero evaluar
 * @returns true si la tarea está eliminada, false si está activa
 */
export const isDeletedTask = (task: Task): boolean => task.isTaskDeleted()

/**
 * Predicado: una tarea tiene que tener un status específico.
 * @param task Tarea a evaluar
 * @param status Estado que quiero que tenga la tarea
 * @returns true si la tarea tiene el status indicado, false si no lo tiene
 */
export const hasStatus = (task: Task, status: TaskStatus): boolean => task.getStatus() === status

/**
 * Predicado: una tarea contiene una parte del título buscado.
 * No se distingue entre mayúsculas y minúsculas.
 * @param task Tarea a evaluar
 * @param title Título que quiero buscar
 * @returns true si la tarea contiene el título buscado, false si no lo contiene
 */
export const titleIncludes = (task: Task, title: string): boolean => {
    const normalizedTitle = title.trim().toLowerCase()

    return task.getTitle().toLowerCase().includes(normalizedTitle)
}

/**
 * Predicado: una tarea tiene fecha de vencimiento.
 * @param task Tarea a evaluar
 * @returns true si tiene fecha de vencimiento
 */
export const hasDueDate = (task: Task): boolean => task.getDueDate() !== null

/**
 * Predicado: una tarea está vencida si tiene fecha de vencimiento y esa fecha es menor a la fecha actual.
 * @param task Tarea a evaluar
 * @returns true si la tarea está vencida, false si no 
 */
export const isTaskOverdue = (task: Task): boolean => task.isOverdue()