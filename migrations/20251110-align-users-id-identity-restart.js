'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alinear el IDENTITY de users.id con el MAX(id)+1 existente
    await queryInterface.sequelize.query(`
      DO $$
      DECLARE
        v_max_id BIGINT;
        v_next BIGINT;
      BEGIN
        SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM public.users;
        v_next := v_max_id + 1;
        BEGIN
          EXECUTE format('ALTER TABLE public.users ALTER COLUMN id RESTART WITH %s', v_next);
        EXCEPTION WHEN others THEN
          -- si no es IDENTITY (por alguna razón), intentar setval sobre una posible secuencia antigua
          BEGIN
            PERFORM setval('public.users_id_seq', v_max_id);
          EXCEPTION WHEN others THEN
            -- ignorar si tampoco existe la secuencia
          END;
        END;
      END$$;
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // No-op de forma segura
  }
};
