// models/Task.ts

// Este módulo representa una tarea individual.

import { formatTaskDifficulty } from "../utils/formatters"

// Estos tipos los creo para que una variable de estos tipos solo pueda tener uno de los valores que se indican acá.
export type TaskStatus = "Pendiente" | "En Curso" | "Terminada" | "Cancelada"
export type TaskDifficulty = "Facil" | "Media" | "Dificil"

/**
 * StoredTask es un tipo de estructura que utilizo para representar una tarea dentro del archivo JSON.
    * Las fechas se guardan como string porque JSON no conserva instancias de la clase Date, sino que las convierte a string.
*/
export type StoredTask = {
    id: string
    title: string
    desc: string
    status: TaskStatus
    createdAt: string
    updatedAt: string
    dueDate: string | null
    difficulty: TaskDifficulty
    isDeleted: boolean
}

/**
 *  Task representa una tarea del sistema.
 *  La clase tiene los datos y comportamientos 
 *  correspondientes a una tarea.
 */

export class Task {
    private id: string
    private title: string
    private desc: string
    private status: TaskStatus
    private createdAt: Date
    private updatedAt: Date
    private dueDate: Date | null
    private difficulty: TaskDifficulty
    private isDeleted: boolean

    constructor(id: string, title: string, desc: string, duedate: Date | null, difficulty: TaskDifficulty) {
        this.id = id
        this.title = title
        this.desc = desc
        this.status = "Pendiente"
        this.createdAt = new Date()
        this.updatedAt = this.createdAt
        this.dueDate = duedate
        this.difficulty = difficulty
        this.isDeleted = false
    }

    getId(): string {
        return this.id
    }

    getTitle(): string {
        return this.title
    }

    getDesc(): string {
        return this.desc
    }

    getStatus(): TaskStatus {
        return this.status
    }

    getCreatedAt(): Date {
        return this.createdAt
    }

    getUpdatedAt(): Date {
        return this.updatedAt
    }

    getDueDate(): Date | null {
        return this.dueDate
    }

    getDifficulty(): TaskDifficulty {
        return this.difficulty
    }

    isTaskDeleted(): boolean {
        return this.isDeleted
    }

    /**
     * Update edita los datos de una tarea activa.
     * Solo modifica los campos que recibe y actualiza la fecha de última modificación.
     * 
     * @Param data es un objeto con los campos opcionales a modificar.
     * @throws Error si la tarea está eliminada.
     */
    update(data: { title?: string, desc?: string, status?: TaskStatus, dueDate?: Date | null, difficulty?: TaskDifficulty }): void {
        if (this.isDeleted) {
            throw new Error("No se puede editar una tarea eliminada.")
        }

        if (data.title !== undefined) {
            this.title = data.title
        }

        if (data.desc !== undefined) {
            this.desc = data.desc
        }

        if (data.status !== undefined) {
            this.status = data.status
        }

        if (data.dueDate !== undefined) {
            this.dueDate = data.dueDate
        }

        if (data.difficulty !== undefined) {
            this.difficulty = data.difficulty
        }

        this.updatedAt = new Date()
    }

    /**
     * delete marca la tarea como eliminada pero no la borra, o sea la elimina lógicamente.
     * @throws Error si la tarea ya está eliminada.
     */
    delete(): void {
        if (this.isDeleted) {
            throw new Error("La tarea ya está eliminada.")
        }
        this.isDeleted = true
        this.updatedAt = new Date()
    }

    /**
     * Restura una tarea eliminada lógicamente.
     * @throws Error si la tarea no está eliminada.
     */
    restore(): void {
        if (!this.isDeleted) {
            throw new Error("La tarea no se puede restaurar ya que no fue eliminada.")
        }
        this.isDeleted = false
        this.updatedAt = new Date()
    }

    /**
     * isOverdue indica si la tarea está vencida tomando como referencia el día actual.
     * Las tareas sin fecha de vencimiento no se consideran vencidas.
     * @returns true si la tarea tiene vencimiento anterior a hoy.
    */
   isOverdue(): boolean {
        if (!this.dueDate) return false // Si no tiene fecha de vencimiento, no está vencida xd

        const today = new Date()
        today.setHours(0, 0, 0, 0) // Establezco la hora a las 12pm para comparar solo la fecha

        return this.dueDate < today
    }

    /**
     * getFormattedDifficulty devuelve la dificultad representada con estrellas.
     */
    getFormattedDifficulty(): string {
        return formatTaskDifficulty(this.difficulty)
    }

    /**
     * fromStoredTask reconstruye una instancia real de Task a partir de los datos guardados en JSON.
     * Esto es necesario porque JSON no conversa métodos ni objetos de tipo Date.
     * 
     * @param data Datos planos almacenados en JSON.
     * @return Una instancia de Task lista para usar en el programa.
     */
    static fromStoredTask(data: StoredTask): Task { // Acá el método es estático porque normalmente para llamar un método necesitamos primero una instancia,
                                                    // pero fromStoredTask se utiliza precisamente cuando todavía no tenemos una instancia de Task, sino que 
                                                    // tenemos los datos planos de JSON. Por eso es estático, para poder llamarlo sin tener una instancia.
                                                    
        const task = new Task(  // Usamos el constructor existente para crear la instancia de Task a partir de los datos planos.
            data.id, 
            data.title,
            data.desc,
            data.dueDate ? new Date(data.dueDate) : null, // Si el json tiene una fecha lo convierte de string a date, si no tiene fecha lo deja como null.
            data.difficulty
        )

        task.status = data.status
        task.createdAt = new Date(data.createdAt)
        task.updatedAt = new Date(data.updatedAt)
        task.isDeleted = data.isDeleted

        return task
    }

    /**
     * toStoredTask convierte la tarea a un objeto plano apto para guardarse como JSON.
     * 
     * @returns Representación plana de la tarea lista para guardarse en JSON.
     */
    toStoredTask(): StoredTask {
        return {
            id: this.id,
            title: this.title,
            desc: this.desc,
            status: this.status,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            dueDate: this.dueDate ? this.dueDate.toISOString() : null,
            difficulty: this.difficulty,
            isDeleted: this.isDeleted
        }
    }
}