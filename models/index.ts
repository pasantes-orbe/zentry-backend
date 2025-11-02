// models/index.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

const basename = path.basename(__filename);

// Conexión (forzar SSL siempre para Railway en Render)
export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // <-- clave para evitar "self-signed ..."
    },
  },
  logging: false,
} as any);

// Registry fuertemente tipado
type AnyModel = ModelStatic<Model<any, any>>;
type Registry = Record<string, AnyModel> & {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
};

const registry = {} as Registry;

// Carga dinámica de modelos compilados (.js) y, si existieran, .ts en dev
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file !== basename &&
      !file.endsWith('.d.ts') &&
      (file.endsWith('.js') || file.endsWith('.ts'))
  )
  .forEach((file) => {
    const modPath = path.join(__dirname, file);
    const mod = require(modPath);

    // Acepta varios estilos de export:
    // default function (sequelize, DataTypes) { return Model }
    // module.exports = function(sequelize, DataTypes) { return Model }
    // export const init = (sequelize, DataTypes) => Model
    const definer =
      (typeof mod === 'function' && mod) ||
      (typeof mod?.default === 'function' && mod.default) ||
      (typeof mod?.init === 'function' && ((s: any, D: any) => mod.init(s, D)));

    if (!definer) {
      const maybeModel = mod?.default || mod?.model || mod;
      if (maybeModel?.name && maybeModel?.sequelize) {
        registry[maybeModel.name] = maybeModel as AnyModel;
        return;
      }
      console.warn(`[models] Skip ${file}: no definer/init/model export`);
      return;
    }

    const model = definer(sequelize, DataTypes) as AnyModel;
    if (!model?.name) {
      console.warn(`[models] Skip ${file}: definer no devolvió un Model`);
      return;
    }
    registry[model.name] = model;
  });

// Associations
Object.keys(registry).forEach((name) => {
  const m = registry[name] as any;
  if (typeof m?.associate === 'function') m.associate(registry);
});

// Helpers
registry.sequelize = sequelize;
registry.Sequelize = Sequelize;

// Export principal
const db = registry;
export default db;
