// main.ts

// en main conecto todos los módulos para controlar el flujo del programa.

import { TaskManager } from "./services/TaskManager"

import { showMainMenu, showViewTasksMenu, showSearchMenu } from "./ui/menu" 

import { askTitle, askConfirmation, askDescription, askDifficulty, askDueDate, askSearchTitle, askTaskId, askTaskUpdates } from "./ui/input"

import { printTask, printSearchResults, printHighPriorityTasks, printStats, printTaskList } from "./ui/taskPrinter"

import { prompt } from "./prompt"

import { resolve } from "node:path"

// Ruta del archivo utilizado para persistir las tareas.
const TASKS_FILE_PATH = resolve(process.cwd(), "data", "tasks.json")

// Única instancia principal del administrador de tareas.
const taskManager = new TaskManager()

// para detener la consola hasta que se apriete enter y luego limpia la pantalla
const pauseClear = (): void => {
    prompt("\nPresione ENTER para continuar...")
    console.clear()
}

/**
 *  Permite editar una tarea encontrada previamente
 *  @param taskId ID de la tarea que queremos editar
 *  @throws Error si no existe una tarea con ese ID
 */
const handleEditTask = async(taskId: string): Promise<void> => {
    const task = taskManager.findTaskById(taskId)

    if (!task) {
        throw new Error("❌ No se encontró ninguna tarea con ese ID ❌")
    }

    console.log("\nDeje vacío el campo que no quiera modificar.\n")

    const updates = askTaskUpdates(task)

    taskManager.updateTask(taskId, updates)

    await taskManager.saveToFile(TASKS_FILE_PATH)

    console.log("\n✅ TAREA EDITADA CON ÉXITO ✅")
}

// Función para manejar el submenú para ver las tareas :)
const handleViewTasks = (): void => {
    let option: number

    do {
        console.clear()
        option = showViewTasksMenu()
        console.log("")

        switch (option) {
            case 1:
                printTaskList(taskManager.getTasksSortedByDueDate())
                pauseClear()
                break
            case 2:
                printTaskList(taskManager.getTasksByStatus("Pendiente"))
                pauseClear()
                break
            case 3:
                printTaskList(taskManager.getTasksByStatus("En Curso"))
                pauseClear()
                break
            case 4:
                printTaskList(taskManager.getTasksByStatus("Terminada"))
                pauseClear()
                break
            case 5:
                printTaskList(taskManager.getOverdueTasks())
                pauseClear()
                break
            case 6:
                printTaskList(taskManager.getTasksSortedByTitle())
                pauseClear()
                break
            case 7:
                // Decidí que las tareas de alta prioridad sean las más próximas a vencer
                printHighPriorityTasks(taskManager.getHighPriorityTasks())
                pauseClear()
                break
            case 0:
                break
            default:
                console.log("La opción ingresada no es válida.")
                pauseClear()
                break
        }
    } while (option !== 0)
}

// Con esta función manejo la búsqueda por ID, título o por tareas relacionadas
// Es ASYNC porque si la persona quiere editar la tarea se van a guardar las modificaciones en el JSON mediante una operación asincrónica
const handleSearchTask = async (): Promise<void> => {
    let option: number

    do {
        console.clear()
        option = showSearchMenu()
        console.log("")

        switch (option) {
            case 1: {
                const taskId = askTaskId()
                const task = taskManager.findTaskById(taskId)

                if (!task || task.isTaskDeleted()) {
                    console.log("❌ NO SE ENCONTRÓ NINGUNA TAREA ACTIVA CON ESE ID ❌")
                    pauseClear()
                    break
                }

                printTask(task)

                const wantsToEdit = askConfirmation("🔨 ¿Desea editar esta tarea? 🔨")

                if (wantsToEdit) {
                    await handleEditTask(task.getId()) // Await
                }

                pauseClear()
                break
            }
            case 2: {

                const title = askSearchTitle()
                const results = taskManager.getTasksByTitle(title)

                if (results.length === 0) {
                    console.log("❌ NO SE ENCONTRARON TAREAS CON ESE TÍTULO ❌")
                    pauseClear()
                    break
                }

                printSearchResults(results)

                console.log("\nSi desea modificar una de estas tareas, ingrese el ID a continuación")
                const selectedId = askTaskId() 
                const selectedTask = taskManager.findTaskById(selectedId)

                if (!selectedTask || selectedTask.isTaskDeleted()) {
                    console.log("❌ NO SE ENCONTRARON TAREAS ACTIVAS CON ESE ID ❌")
                    pauseClear()
                    break
                }

                printTask(selectedTask)

                const wantToEdit = askConfirmation("🔨 ¿Desea editar esta tarea? 🔨")

                if (wantToEdit) {
                    await handleEditTask(selectedTask.getId())
                }
                
                pauseClear()
                break
            }
            case 3: {
                const taskId = askTaskId()

                const relatedTasks = taskManager.getRelatedTasks(taskId)

                if (relatedTasks.length === 0) {
                    console.log("❌ NO SE ENCONTRARON TAREAS RELACIONADAS ❌")
                  pauseClear()
                   break
              }

                console.log("\nTAREAS RELACIONADAS: ")

                printTaskList(relatedTasks)
                pauseClear()
                break;
            }
            case 0:
                break

            default:
                console.log("La opción ingresada no es válida.")
                pauseClear()
                break
        } 
    } while (option !== 0)
}


/**
 * Para coordinar la creación de una tarea nueva, solicita y valida los datos y crea la tarea
 * mediante TaskManager y guarda la actualización en el JSON.
 */
const handleCreateTask = async (): Promise<void> => {

    console.clear()

    const title = askTitle()
    const desc = askDescription()
    const difficulty = askDifficulty()
    const dueDate = askDueDate()

    const newTask = taskManager.createTask(title, desc, dueDate, difficulty)

    await taskManager.saveToFile(TASKS_FILE_PATH)

    console.log( `\n✅ TAREA CREADA CON ÉXITO, ID GENERADO: ${newTask.getId()} ✅`)

    pauseClear()
}


/**
 * Para realizar la eliminación lógica de una tarea.
 * Busca la tarea, se fija que esté activa, muestra sus datos, 
 * solicita una confirmación y guarda el cambio en el archivo JSON
 */
const handleDeleteTask = async (): Promise<void> => {

    console.clear()

    const taskId = askTaskId()

    const task = taskManager.findTaskById(taskId)

    if (!task || task.isTaskDeleted()) {
        throw new Error("❌ NO SE ENCONTRÓ NINGUNA TAREA ACTIVA CON ESE ID ❌")
    }

    printTask(task)

    const confirmed = askConfirmation("¿Desea eliminar esta tarea?")

    if (!confirmed) {
        console.log("\nOperación cancelada")
        pauseClear()
        return
    }

    taskManager.deleteTask(taskId)

    await taskManager.saveToFile(TASKS_FILE_PATH)

    console.log("\nTAREA ELIMINADA CON ÉXITO")

    pauseClear()
}


/**
 * Función que maneja la restauración de una tarea eliminada lógicamente
 */
const handleRestoreTask = async (): Promise<void> => {

    console.clear()

    const deletedTask = taskManager.getDeletedTasks()

    if (deletedTask.length === 0) {
        console.log("No hay tareas eliminadas para restaurar")
        pauseClear()
        return
    }

    console.log("TAREAS ELIMINADAS\n")
    printTaskList(deletedTask)
    console.log("")

    const taskId = askTaskId()

    taskManager.restoreTask(taskId)

    await taskManager.saveToFile(TASKS_FILE_PATH)

    console.log("\n🔄 TAREA RESTAURADA CON ÉXITO 🔄")

    pauseClear()
}


/**
 * Función para mostrar las estadísticas de las tareas activas
 */
const handleStatistics = (): void => {

    console.clear()

    const stats = taskManager.getStats()

    printStats(stats)

    pauseClear()
}


/**
 * Con esta función ejecuto la aplicación :D
 * Cargo las tareas almacenadas, mantengo el menu activo y coordino el manejo de errores.
 */
const runApp = async (): Promise <void> => {
    
    // Cargo las tareas guardadas primero que nada
    await taskManager.loadFromFile(TASKS_FILE_PATH)

    let option: number = -1

    do {
        try {
            console.clear()

            option = showMainMenu()

            console.log("")

            switch(option) {

                case 1:
                    handleViewTasks()
                    break

                case 2:
                    await handleSearchTask()
                    break
                
                case 3:
                    await handleCreateTask()
                    break
                
                case 4:
                    await handleDeleteTask()
                    break

                case 5:
                    await handleRestoreTask()
                    break

                case 6:
                    handleStatistics()
                    break
                
                case 0:
                    console.log("Cerrando el programa, gracias por usarlo, chauu 👋")
                    break

                default:
                    console.log("❌ La opción que ingresaste no es válida ❌")
                    pauseClear()
                    break
            }
        } catch (error) {
            // Hasta acá puedo tener errores de validación, de la lógica o persistencia
            if (error instanceof Error) {
                console.log(`\n${error.message}`)
            } else {
                console.log("\n⚠️🚨 Ocurrió un error inesperado 🚨⚠️")
            }
            pauseClear()
        }
    } while (option !== 0)
}

// Llamada para iniciar el programa!

runApp().catch(error => {
    if (error instanceof Error) {
        console.log(`\n${error.message}`)
    } else {
        console.log("\n⚠️🚨 Ocurrió un error al iniciar el programa 🚨⚠️")
    }
})