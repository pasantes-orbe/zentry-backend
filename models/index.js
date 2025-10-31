// models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    // AÑADIDO: Filtro más estricto
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== 'server.ts' && // Excluimos server.ts explícitamente
      file.slice(-3) === '.ts' &&
      file.indexOf('.d.ts') === -1 // Excluimos archivos de definición de tipos
    );
  })
  .forEach(file => {
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 🔽 Alias para compatibilidad entre snake_case y camelCase
if (db['password_change_request'] && !db.passwordChangeRequest) {
  db.passwordChangeRequest = db['password_change_request'];
}


module.exports = db;
