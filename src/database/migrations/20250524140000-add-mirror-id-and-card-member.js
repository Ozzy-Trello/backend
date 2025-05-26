module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add mirror_id to card table
    await queryInterface.addColumn('card', 'mirror_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Create card_member table
    await queryInterface.createTable('card_member', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'card', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'user', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
    await queryInterface.addConstraint('card_member', {
      fields: ['card_id', 'user_id'],
      type: 'unique',
      name: 'unique_card_user'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('card', 'mirror_id');
    await queryInterface.dropTable('card_member');
  }
}; 