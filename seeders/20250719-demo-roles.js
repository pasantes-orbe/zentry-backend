'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar todos los registros existentes en la tabla 'roles'
    await queryInterface.bulkDelete('roles', null, {});

    // Insertar los roles nuevos
    return queryInterface.bulkInsert('roles', [
      { id: 1, name: 'Administrador' },
      { id: 2, name: 'Propietario' },
      { id: 3, name: 'Vigilador' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar los roles insertados por este seeder
    return queryInterface.bulkDelete('roles', null, {});
  }
};
