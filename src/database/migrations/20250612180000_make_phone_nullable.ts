import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.changeColumn(
        'user',
        'phone',
        {
          type: DataTypes.STRING(20),
          allowNull: true,
          unique: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // First, handle any null values if they exist
      await queryInterface.sequelize.query(
        `UPDATE "user" SET phone = CONCAT('unset-', id) WHERE phone IS NULL`,
        { transaction }
      );

      // Then make the column not nullable
      await queryInterface.changeColumn(
        'user',
        'phone',
        {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        { transaction }
      );
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
