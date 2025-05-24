'use strict';

const {v4: uuidv4} = require("uuid");
const id_data = uuidv4();
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    

    await queryInterface.bulkInsert('role', [{
      'id': id_data,
      'name': 'default',
      'description': 'Admin Role',
      'permissions': JSON.stringify({
        board: { create: true, read: true, update: true, delete: true },
        list: { create: true, read: true, update: true, delete: true },
        card: { create: true, read: true, update: true, delete: true },
      }),
      'created_at': "2023-05-19 16:53:39"
    }], {});

    await queryInterface.bulkInsert('user', [{
      'id': id_data,
      'username': 'admin',
      'email': 'admin@admin.com',
      'phone': '+6281234567890',
      'password': '$2b$10$xAvZsm7yRr2AXBVrIGPURuvaE8Y1Wj8bAxGnub/OYacThsRisCqDa',
      'created_at': "2023-05-19 16:53:39"
    }], {});

    await queryInterface.bulkInsert('workspace', [{
      'id': id_data,
      'name': 'Admin Workspace',
      'slug': 'admin-workspace',
      'description': 'Admin Workspace',
      'created_at': "2023-05-19 16:53:39"
    }], {});

    await queryInterface.bulkInsert('workspace_member', [{
      'user_id': id_data,
      'role_id': id_data,
      'workspace_id': id_data,
      'created_at': "2023-05-19 16:53:39"
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('user', {
      'email': 'admin@admin.com',
    }, {});

    await queryInterface.bulkDelete('workspace_member', {
      'created_at': "2023-05-19 16:53:39"
    }, {});

    await queryInterface.bulkDelete('workspace', {
      'slug': 'admin-workspace',
    }, {});

    await queryInterface.bulkDelete('role', {
      'name': 'default',
    }, {});
  }
};
