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

module.exports = db;

//24/08/25
//'use strict';

//const fs = require('fs');
//const path = require('path');
//const Sequelize = require('sequelize');
//const basename = path.basename(__filename);
//const { getDbInstance } = require('../DB/connection');

//const sequelizeInstance = getDbInstance();
//const db = {};

//fs
//  .readdirSync(__dirname)
//  .filter(file => {
    // Filtro simplificado: solo carga archivos que terminan en .model.js o .model.ts
//    return (
//      file.indexOf('.') !== 0 &&
//      file !== basename &&
//      (file.endsWith('.model.js') || file.endsWith('.model.ts'))
//    );
//  })
//  .forEach(file => {
//    const modelPath = path.join(__dirname, file);
//    const modelDefiner = require(modelPath);
//    // Asume que todos los archivos exportan una función por defecto
//    const model = modelDefiner.default(sequelizeInstance, Sequelize.DataTypes);
//    db[model.name] = model;
//  });

//Object.keys(db).forEach(modelName => {
//  if (db[modelName].associate) {
//    db[modelName].associate(db);
//  }
//});

//db.sequelize = sequelizeInstance;
//db.DataTypes = Sequelize.DataTypes;
//db.Sequelize = Sequelize;

//module.exports = db;




//'use strict';

//const fs = require('fs');
//const path = require('path');
//const Sequelize = require('sequelize');
//const process = require('process');
//const basename = path.basename(__filename);
//const env = process.env.NODE_ENV || 'development';
//const config = require(__dirname + '/../config/config.json')[env];
//const db = {};

//let sequelize;
//if (config.use_env_variable) {
//  sequelize = new Sequelize(process.env[config.use_env_variable], config);
//} else {
//  sequelize = new Sequelize(config.database, config.username, config.password, config);
//}

//fs
//  .readdirSync(__dirname)
//  .filter(file => {
//    return (
//      file.indexOf('.') !== 0 &&
//     file !== basename &&
//      file.slice(-3) === '.js' &&
//      file.indexOf('.test.js') === -1
//    );
//  })
//  .forEach(file => {
//    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//    db[model.name] = model;
//  });

//Object.keys(db).forEach(modelName => {
//  if (db[modelName].associate) {
//    db[modelName].associate(db);
//  }
//});

//db.sequelize = sequelize;
//db.Sequelize = Sequelize;

//module.exports = db;
