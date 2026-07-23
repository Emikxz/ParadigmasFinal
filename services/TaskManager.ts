// services/TaskManager.ts

// Este módulo depende de muchos otros y es el encargado de administrar la colección completa de tareas

import { randomUUID } from "crypto"
import { Task, TaskDifficulty, TaskStatus } from "../models/Task"
import { getRelatedTasksIds } from "../logic/taskRelations"
import { TaskRepository } from "./TaskRepository"
import { hasDueDate, hasStatus, isActiveTask, isDeletedTask, isTaskOverdue, titleIncludes } from "../utils/predicates"
import { sortTaskByDueDate, sortTaskByTitle } from "../utils/sorters"

export type TaskStats = { // Para las estadisticas
    total: number
    byStatus: Record<TaskStatus, number>                    // Record significa que debe existir una propiedad numérica por cada estado o dificultad permitida
    byDifficulty: Record<TaskDifficulty, number>            // Record obliga a incluir todos los estados o dificultades para poder hacer los cálculos
    percentagesByStatus: Record<TaskStatus, number>
    percentagesByDifficulty: Record<TaskDifficulty, number>
}

type TaskUpdates = {            // Con este tipo represneot los campos que van a poder modificarse durante una edición de tarea
    title?: string
    desc?: string
    status?: TaskStatus
    difficulty?: TaskDifficulty
    dueDate?: Date | null
}

/**
 * Administra la colección de tareas en memoria
 * Concentra la lógica del negocio principal como crear, editar, eliminar, restaurar
 * buscar, ordenar y calcular estadísticas
 * La persistencia de archivos la hice en TaskRepository
 */

export class TaskManager {
    private tasks: Task[] = [] // Para almacenar todas las tareas en memoria pero hago que empiece vacía

    // Inyecto dependencia
    // Repositorio que uso para cargar y guardar las tareas
    // Es privado porque solo TaskManager debe acceder a él
    // readonly significa que despues de asignar el repositorio en el constructor, no se puede reemplazar por otro.
    private readonly repository: TaskRepository  // TaskRepository lo creo para que se ocupe del archivo separando su responsabilidad.

    constructor(repository: TaskRepository = new TaskRepository()) { // Si no le pasamos un repositorio crea uno automáticamente
        this.repository = repository
    }


    /**
     * Crea una nueva tarea, le asigna un UUID y la agrega a la colección
     * Crea un nuevo arreglo para evitar mutar directamente la colección anterior
     * @param title Título de la tarea
     * @param desc Descripción de la tarea
     * @param dueDate Fecha de vencimiento o null
     * @param difficulty Dificultad de la tarea
     * @returns Tarea creada como pendiente
     */
    createTask(title: string, desc: string, dueDate: Date | null, difficulty: TaskDifficulty): Task {
        const newTask = new Task(randomUUID(), title, desc, dueDate, difficulty)
        this.tasks = [...this.tasks, newTask] // Agregamos sin mutar el arreglo directamente porq no uso push
        return newTask // Retorno la tarea creada
    }


    /**
     * Devuelve todas las tareas (activas y eliminadas) mediante un arreglo nuevo para
     * que otro módulo no modifique directamente la colección interna
     * @returns Copia 
     */
    getAllTasks(): Task[] {
        return [...this.tasks]
    }


    /**
     * Devuelve solo las tareas activas
     * @returns Copia de tareas activas (o sea no eliminadas)
     */
    getActiveTasks(): Task[] {
        return [...this.tasks.filter(isActiveTask)]
    }


    /**
     * Devuelve solo las tareas eliminadas lógicamente
     * @returns Copia de tareas eliminadas 
     */
    getDeletedTasks(): Task[] {
        return [...this.tasks.filter(isDeletedTask)]
    }


    /**
     * Busca una tarea a través del ID
     * @returns Tarea encontrada o undefined si no existe
     */
    findTaskById(id: string): Task | undefined {
        return this.tasks.find(task => task.getId() === id)
    }


    /**
     * Edita una tarea existente.
     * La validación de si puede modificarse está dentro de la entidad Task
     * @param id ID de la tarea a editar
     * @param updates Campos que deseamos modificar
     * @throws Error si no existe ninguna tarea con ese ID
     */
    updateTask(id: string, updates: TaskUpdates): void {
        const task = this.findTaskById(id)

        if (!task) {
            throw new Error("❌ No se encontró ninguna tarea con ese ID. ❌")
        }
        task.update(updates)
    }


    /**
     * Elimina una tarea de forma lógica
     * @param id ID de la tarea a eliminar
     * @throws Error si no existe ninguna tarea con ese ID
     */
    deleteTask(id: string): void {
        const task = this.findTaskById(id)

        if (!task) {
            throw new Error("❌ No se encontró ninguna tarea con ese ID. ❌")
        }
        task.delete()
    }


    /**
     * Restaura una tarea eliminada lógicamente
     * @param id ID de la tarea a restaurar
     * @throws Error si no existe ninguna tarea con ese ID
     */
    restoreTask(id: string): void {
        const task = this.findTaskById(id)

        if (!task) {
            throw new Error("❌ No se encontró ninguna tarea con ese ID. ❌")
        }

        task.restore()
    }


    /**
     * Filtra las tareas activas por estado
     * @param status Estado que se desea buscar
     * @return Tareas activas con el estado que se desea
     */
    getTasksByStatus(status: TaskStatus): Task[] {
        return this.getActiveTasks().filter(task => hasStatus(task, status))
    }


    /**
     * Busca tareas activas por una parte de su titulo
     * La búsqueda no distingue entre mayúsculas y minúsculas
     * @param title Texto que se desea buscar
     * @returns Tareas activas cuyo título contiene el texto
     */
    getTasksByTitle(title: string): Task[]{
        return this.getActiveTasks().filter(task => titleIncludes(task, title))
    }


    /**
     * Devuelve las tareas activas ordenadas por título alfabéticamente
     * @returns Nuevo arreglo ordenado por título
     */
    getTasksSortedByTitle(): Task[] {
        return sortTaskByTitle(this.getActiveTasks())
    } 


    /**
     * Devuelve las tareas activas ordenadas por fecha en orden ascendente
     * Las tareas sin vencimiento van al final
     * @returns Nuevo arreglo ordenado por vencimiento
     */
    getTasksSortedByDueDate(): Task[] {
        return sortTaskByDueDate(this.getActiveTasks())
    }


    /**
     * Obtiene las tareas activas vencidas
     * @returns Arreglo de tareas vencidas
     */
    getOverdueTasks(): Task[] {
        return this.getActiveTasks().filter(isTaskOverdue)
    }


    /**
     * Obtiene las tareas de prioridad alta, que son las que yo interpreto como muy cercanas a la fecha de vencimiento
     * @param limit Es la cantidad máxima de tareas que quiero que se muestren como prioridad
     * @return Tareas activas con fecha más próxima a vencer
     */
    getHighPriorityTasks(limit: number = 4): Task[] {
    return sortTaskByDueDate(this.getActiveTasks().filter(hasDueDate)).slice(0, limit)
}


    /**
     * Obtiene las tareas relacionadas con una tarea base, la lógica que se utiliza la tengo en logic/taskRelations.ts
     * @param taskId ID de la tarea base
     * @returns Tareas activas relacionadas
     * @throws Error Si la tarea base no existe o está eliminada
     */
    getRelatedTasks(taskId: string): Task[] {
        const baseTask = this.findTaskById(taskId)

        if (!baseTask) {
            throw new Error("❌ No se encontró la tarea base para buscar otras relacionadas a ella. ❌")
        }

        if (baseTask.isTaskDeleted()) {
            throw new Error("❌ No se pueden buscar tareas relacionadas a una tarea que fue eliminada. ❌")
        }

        const relatedIds = getRelatedTasksIds(this.getActiveTasks(), taskId)

        return this.getActiveTasks().filter(task => relatedIds.includes(task.getId()))
    }


    /**
     * Calcula estadísticas sobre las tareas activas
     * Uso reduce para poder procesar la colección con un enfoque funcional
     * @returns Cantidades y porcentajes agrupados por estado y dificultad
     */
    getStats(): TaskStats {                         // TaskStats es un OBJETO!
    const activeTasks = this.getActiveTasks()       // Primero obtenemos las tareas activas
    const total = activeTasks.length                // Luego guardo cuantas tengo en total

    const initialStats = {                          // Inicializo los contadores en 0
        byStatus: this.createEmptyStatusCounter(),
        byDifficulty: this.createEmptyDifficultyCounter()
    }

    const counters = activeTasks.reduce(        // Reduce en cada recorrido recibe dos cosas: accumulator, task
        (accumulator, task) => {                // accumulator es el resultado que se va construyendo hasta el momento
            return {                            // task es la tarea actual que se está procesando
                byStatus: {                     // En cada iteración devuelvo un objeto nuevo para el principio de inmutabilidad.
                    ...accumulator.byStatus,
                    [task.getStatus()]:
                        accumulator.byStatus[task.getStatus()] + 1 // Entre [] porque no sabemos cuál es contador de estado que estamos incrementando, sino que lo resuelve getStatus.
                },

                byDifficulty: {
                    ...accumulator.byDifficulty,
                    [task.getDifficulty()]:
                        accumulator.byDifficulty[task.getDifficulty()] + 1
                }
            }
        },
        initialStats
    )

    return {
          total,
         byStatus: counters.byStatus,
          byDifficulty: counters.byDifficulty,

         percentagesByStatus:
               this.calculateStatusPercentages(counters.byStatus, total),

         percentagesByDifficulty:
               this.calculateDifficultyPercentages(counters.byDifficulty, total)
        }
    }


    /**
     * Crea un contador inicial para los estados
     * @returns Contados con todos los estados en cero
     */
    private createEmptyStatusCounter(): Record<TaskStatus, number> {
        return {
            Pendiente: 0,
            "En Curso": 0,
            Terminada: 0,
            Cancelada: 0
        }
    }


    /**
     * Crea un contador inicial para las dificultades
     * @returns Contador con todas las dificultades en cero
     */
    private createEmptyDifficultyCounter(): Record<TaskDifficulty, number> {
        return {
            Facil: 0,
            Media: 0,
            Dificil: 0
        }
    }


    /**
     * Calcula el porcentaje correspondiente a cada estado
     * @param counters Cantidad de tareas por estado
     * @param total Cantidad total de tareas activas
     * @returns Porcentajes agrupados por estado
     */
    private calculateStatusPercentages(counters: Record<TaskStatus, number>, total: number): Record<TaskStatus, number> {
        return {
            Pendiente: this.calculatePercentage(counters.Pendiente, total),
            "En Curso": this.calculatePercentage(counters["En Curso"], total),
            Terminada: this.calculatePercentage(counters.Terminada, total),
            Cancelada: this.calculatePercentage(counters.Cancelada, total)
        }
    }


    /**
     * Calcula el porcentaje correspondiente a cada dificultad
     * @param counters Cantidad de tareas por dificultad
     * @param total Cantidad total de tareas activas
     * @returns Porcentajes agrupados por dificultad
     */
    private calculateDifficultyPercentages(counters: Record<TaskDifficulty, number>, total: number): Record <TaskDifficulty, number> {
        return {
            Facil: this.calculatePercentage(counters.Facil, total),
            Media: this.calculatePercentage(counters.Media, total),
            Dificil: this.calculatePercentage(counters.Dificil, total)
        }
    }

    /**
     * Calcula un porcentaje evitando dividir por cero
     * @param amount Cantidad parcial
     * @param total Cantidad total
     * @returns Porcentaje correspondiente
     */
    private calculatePercentage(amount: number, total: number): number {
        if (total === 0) return 0

        return (amount / total) * 100
    }

    
    /**
     * Carga las tareas desde el archivo JSON utilizando el repositorio
     * La operación es asincrónica porque realiza una lectura desde el sistema de archivos
     * @param filePath Ruta del archivo JSON
     */
    async loadFromFile(filePath: string): Promise<void> {
        this.tasks = await this.repository.load(filePath)
    }


    /**
     * Guarda todas las tareas actuales utilizando el repositorio
     * Es asincrónica porque realiza una escritura en el sistema de archivos.
     * @param filePath Ruta del archivo JSON
     */
    async saveToFile(filePath: string): Promise<void> {
        await this.repository.save(filePath, this.tasks)
    }
}