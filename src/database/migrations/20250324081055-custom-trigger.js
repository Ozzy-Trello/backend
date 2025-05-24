'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("trigger", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      condition_value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      action: {
        type: Sequelize.JSONB, // Menggunakan JSONB untuk fleksibilitas format
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.createTable("custom_value", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.createTable("custom_option", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      custom_value_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "custom_value",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addColumn("card_custom_field", "trigger_id", {
      type: Sequelize.UUID,
      allowNull: true, // Bisa diubah ke false jika wajib diisi
      references: {
        model: "trigger", // Nama tabel yang dijadikan referensi
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Bisa diganti "CASCADE" jika ingin dihapus otomatis
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('card_custom_field', 'card_custom_field_trigger_id_fkey')
    await queryInterface.dropTable("custom_option");
    await queryInterface.dropTable("custom_value");
    await queryInterface.dropTable("trigger");
    await queryInterface.removeColumn("card_custom_field", "trigger_id");
  }
};
