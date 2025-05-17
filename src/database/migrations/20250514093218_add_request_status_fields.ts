import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('request', 'is_rejected', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    await queryInterface.addColumn('request', 'is_done', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    
    await queryInterface.addColumn('request', 'satuan', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('request', 'is_rejected');
    await queryInterface.removeColumn('request', 'is_done');
    await queryInterface.removeColumn('request', 'satuan');
  }
};
