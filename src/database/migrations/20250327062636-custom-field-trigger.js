'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("custom_field", "trigger_id", {
      type: Sequelize.UUID,
      allowNull: true, // Bisa diubah ke false jika wajib diisi
      references: {
        model: "trigger", // Nama tabel yang dijadikan referensi
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Bisa diganti "CASCADE" jika ingin dihapus otomatis
    });

    await queryInterface.addColumn("trigger", "all_card", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Bisa diganti "CASCADE" jika ingin dihapus otomatis
    });

    await queryInterface.addColumn("trigger", "board_id", {
      type: Sequelize.UUID,
      allowNull: true, // Bisa diubah ke false jika wajib diisi
      references: {
        model: "board", // Nama tabel yang dijadikan referensi
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Bisa diganti "CASCADE" jika ingin dihapus otomatis
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("custom_field", "trigger_id");
    await queryInterface.removeColumn("trigger", "all_card");
    await queryInterface.removeColumn("trigger", "board_id");
  }
};
