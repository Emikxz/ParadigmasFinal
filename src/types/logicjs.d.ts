// src/types/logicjs.d.ts
declare module "logicjs" {
  // Estos tipos los dejo simples (any) para no complicar el TP.
  export function lvar(): any;
  export function eq(a: any, b: any): any;
  export function and(...goals: any[]): any;
  export function or(...goals: any[]): any;
  export function run(goal: any, vars: any | any[]): any[];
}
