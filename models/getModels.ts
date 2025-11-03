import db from "./index";

/**
 * Devuelve los modelos on-demand para evitar undefined por orden de carga.
 * Úsalo dentro de cada método/handler, NO en la cabecera del archivo.
 */
export function getModels() {
  // devolvemos todo db para no perder nada (sequelize, Sequelize y modelos)
  return db as typeof db;
}
