import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add role_id column to user table
      await queryInterface.addColumn(
        'user',
        'role_id',
        {
          type: DataTypes.UUID,
          allowNull: true, // Temporarily allow null for existing users
          references: {
            model: 'role',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      // Add an index for better query performance
      await queryInterface.addIndex('user', ['role_id'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the role_id column
      await queryInterface.removeColumn('user', 'role_id', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
