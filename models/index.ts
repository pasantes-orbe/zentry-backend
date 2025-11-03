// models/index.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

const basename = path.basename(__filename);

const rawUrl = process.env.DATABASE_URL || '';
const dbUrl = rawUrl.trim();
if (!dbUrl) throw new Error('DATABASE_URL no definida');

// Detecta si la URL apunta a localhost
const isLocalHost = /(?:localhost|127\.0\.0\.1|::1)/i.test(dbUrl);

// Solo uso SSL cuando NO es localhost
const dialectOptions = isLocalHost ? {} : { ssl: { require: true, rejectUnauthorized: false } };

export const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions,
  logging: false,
} as any);

// --- resto igual ---
type AnyModel = ModelStatic<Model<any, any>>;
type Registry = Record<string, AnyModel> & { sequelize: Sequelize; Sequelize: typeof Sequelize; };
const registry = {} as Registry;

fs.readdirSync(__dirname)
  .filter(f => f !== basename && !f.endsWith('.d.ts') && /\.model\.(js|ts)$/.test(f))
  .forEach((file) => {
    const mod = require(path.join(__dirname, file));
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

Object.keys(registry).forEach((name) => {
  const m = registry[name] as any;
  if (typeof m?.associate === 'function') m.associate(registry);
});

registry.sequelize = sequelize;
registry.Sequelize = Sequelize;
const db = registry;
export default db;
