// services/TaskRepository.ts

// Este módulo se va a ocupar de leer y escribir tasks.json y manejar operaciones asincrónicas.

import { mkdir, readFile, writeFile } from "node:fs/promises" // mkdir es para crear carpetas
import {dirname} from "node:path" // dirname es para obtener la carpeta que contiene una ruta
import {Task, StoredTask} from "../models/Task"

/**
 * TaskRepository se encarga de la persistencia de tareas JSON.
 * Esta clase separa la lógica de almacenamiento de la lógica de negocio que hice en TaskManager.
 */
export class TaskRepository {

    /**
     * Lee las tareas guardadas y las reconstruye como instancias de Task
     * Si el archivo no existe entonces voy a devolver una colección vacía
     * @param filePath Ruta del archivo JSON
     * @returns Tareas reconstruidas desde el archivo
     * @throws Error si el archivo existe pero no puede leerse o parsearse correctamente
     */
    async load(filePath: string): Promise<Task[]> { // Un método async siempre devuelve una promesa
        try {
            const fileContent = await readFile(filePath, "utf-8")   // readFile() inicia la lectura del archivo
                                                                    // usamos await para esperar el resultado sin bloquear innecesariamente el programa
                                                                    // utf-8 indica que queremos que se reciba el contenido como texto

            const parsedTasks: StoredTask[] = JSON.parse(fileContent)   // fileContent es texto, JSON.parse transforma ese texto en objeto de JS
                                                                        // con StoredTask[] declaramos que esperamos un arreglo de objetos con la estructura utilizada en el JSON

            return parsedTasks.map(taskData => Task.fromStoredTask(taskData))   // Usamos Task.fromStoredTask(taskData) para convertir cada objeto plano en una instancia con métodos
                                                                                // Con map transformamos cada elemento y devolvemos un arreglo nuevo
        } catch (error) {
        const nodeError = error as NodeJS.ErrnoException // El error capturado inicialmente tiene un tipo general. Lo interpretamos como un error de Node para poder consultar

        if(nodeError.code === "ENOENT") { // ENOENT significa que el archivo o la ruta no existe, lo trato como error y devuelvo un arreglo vacío
            return []
        }
        throw new Error("⚠️📝 No se pudieron cargar las tareas desde el archivo 📝⚠️") // Si es otro error como archivo mal formado.
        }
    }

    /**
     * Guarda la colección actual de tareas en un archivo JSON
     * Antes de escribir me aseguro que la carpeta de destino exista
     * @param filePath es la ruta del archivo JSON
     * @param tasks Tareas a persistir 
     */
    async save(filePath: string, tasks: Task[]): Promise<void> {
         const storedTasks: StoredTask[] = tasks.map(task => task.toStoredTask())  // Las tareas son instancias de clase por lo que antes de escribirlas las convertimos en objetos planos.
                                                                                    // Tambien task.toStoredTask() lo que hacía era convertir Date en cadenas ISO para guardar en JSON.
         await mkdir(dirname(filePath), { // mkdir crea la carpeta en el directorio
            recursive: true // recursive: true permite que la carpeta se cree si no existe, no se produzca un error si ya existe, se creen carpetas intermedias si es necesario.
         })

         await writeFile(filePath, JSON.stringify(storedTasks, null, 2), "utf-8") // JSON.stringity transforma el arreglo en texto JSON.
                                                                                // storedTask son los datos que queremos transformar.
                                                                                // null: no usamos una función especial de reemplazo.
                                                                                // 2: identa el archivo con dos espacios para q sea mas legible el JSON.
    }



} // Corchete de cierre de la clase para no perderme 