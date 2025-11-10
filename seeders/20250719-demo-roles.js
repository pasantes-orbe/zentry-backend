// 20250719-demo-roles.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar todos los registros existentes en la tabla 'roles'
    await queryInterface.bulkDelete('roles', null, {});

    // Insertar los roles nuevos
    return queryInterface.bulkInsert('roles', [
      { id: 1, name: 'administrador' },
      { id: 2, name: 'propietario' },
      { id: 3, name: 'vigilador' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar los roles insertados por este seeder
    return queryInterface.bulkDelete('roles', null, {});
  }
};
