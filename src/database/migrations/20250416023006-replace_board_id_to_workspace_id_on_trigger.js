'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("trigger").catch(() => null);
    if (tableInfo?.board_id) {
      await queryInterface.removeColumn("trigger", "board_id");
    }

    await queryInterface.addColumn("trigger", "workspace_id", {
      type: Sequelize.UUID,
      allowNull: true, // Bisa diubah ke false jika wajib diisi
      references: {
        model: "workspace", // Nama tabel yang dijadikan referensi
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Bisa diganti "CASCADE" jika ingin dihapus otomatis
    });
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("trigger").catch(() => null);
    if (tableInfo?.workspace_id) {
      await queryInterface.removeColumn("trigger", "workspace_id");
    }

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
  }
};
