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
      `SELECT id FROM "roles" WHERE name = 'administrador' LIMIT 1;`
    );

    // Si no se encuentra el rol, muestra un error y detiene la ejecución.
    if (role.length === 0) {
      console.error("El rol 'Administrador' no fue encontrado. Asegúrate de ejecutar primero el seeder de roles.");
      return;
    }

    const adminRoleId = role[0].id;

    // 2. Crea la contraseña encriptada para el usuario administrador (cámbiala si deseas)
    const hashedPassword = await bcrypt.hash('1234', 10);

    // 3. UPSERT por email para no borrar usuarios existentes
    const email = 'administrador@administrador.com';
    const name = 'Admin';
    const lastname = 'User';
    const isActive = true;

    // Usamos INSERT ... ON CONFLICT (email) DO UPDATE para Postgres
    await queryInterface.sequelize.query(
      `INSERT INTO "users" ("email", "name", "lastname", "password", "role_id", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("email") DO UPDATE SET
         "password" = EXCLUDED."password",
         "role_id" = EXCLUDED."role_id",
         "isActive" = EXCLUDED."isActive";`,
      {
        bind: [email, name, lastname, hashedPassword, adminRoleId, isActive],
        type: Sequelize.QueryTypes.INSERT,
      }
    );
    return;
  },

  // El método `down` se ejecuta cuando corres `db:seed:undo:all`
  down: async (queryInterface, Sequelize) => {
    // Elimina solo el usuario administrador insertado por este seeder
    return queryInterface.bulkDelete('users', { email: 'administrador@administrador.com' }, {});
  }
};
