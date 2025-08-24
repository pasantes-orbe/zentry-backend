'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // El método `up` se ejecuta cuando corres `db:seed:all`
  up: async (queryInterface, Sequelize) => {
    // 1. Busca el ID del rol 'Administrador'
    // Se usa una consulta SQL nativa para asegurar que se encuentra el ID
    // del rol que necesitamos.
    const [role] = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE name = 'Administrador' LIMIT 1;`
    );

    // Si no se encuentra el rol, muestra un error y detiene la ejecución.
    if (role.length === 0) {
      console.error("El rol 'Administrador' no fue encontrado. Asegúrate de ejecutar primero el seeder de roles.");
      return;
    }

    const adminRoleId = role[0].id;

    // 2. Crea la contraseña encriptada para el usuario administrador
    // En este ejemplo, la contraseña es '1234'.
    const hashedPassword = await bcrypt.hash('1234', 10);

    // 3. Opcional: Elimina cualquier usuario existente antes de insertar el nuevo
    // Esto es útil para limpiar la tabla antes de sembrar nuevos datos.
    await queryInterface.bulkDelete('users', null, {});

    // 4. Inserta el usuario administrador en la tabla 'users'
    return queryInterface.bulkInsert('users', [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'administrador@administrador.com',
        password: hashedPassword,
        roleId: adminRoleId,
        status: true,
        google: false,
        img: '',
        //createdAt: new Date(), // Campo para la fecha de creación
        //updatedAt: new Date()  // Campo para la fecha de actualización
      }
    ], {});
  },

  // El método `down` se ejecuta cuando corres `db:seed:undo:all`
  down: async (queryInterface, Sequelize) => {
    // Elimina el usuario administrador que fue insertado en el método `up`
    // Se busca por el email para no afectar a otros usuarios si existieran.
    return queryInterface.bulkDelete('users', { email: 'administrador@administrador.com' }, {});
  }
};
