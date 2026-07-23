// prompt es lo que uso para configurar la interacción por consola con el usuario, me permite pedir datos y 
// que el usuario los ingrese, y luego puedo usar esos datos en mi programa

import PromptSync from "prompt-sync";

export const prompt = PromptSync({ sigint: true})