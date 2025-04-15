'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("card_activity", "activity_type");
    await queryInterface.removeColumn("card_activity_action", "action");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);
    await queryInterface.dropTable('card_activity_action')
    await queryInterface.dropTable('card_activity_text')
    await queryInterface.dropTable('card_activity')


    await queryInterface.createTable('card_activity', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: uuidv4,
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.ENUM('action', 'comment'),
        allowNull: false,
      },
      createdAt: {
        type: new DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: new DataTypes.TIME,
      }
    })

    await queryInterface.createTable('card_activity_text', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING(8),
      },
      createdAt: {
        type: new DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: new DataTypes.TIME,
      }
    })

    await queryInterface.createTable('card_activity_action', {
      id: {
        type: DataTypes.UUID,   
        allowNull: false,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.ENUM('move_list', 'make_label', 'add_tag', 'remove_tag')
      },
      source: {
        type: DataTypes.JSONB,
      },
      createdAt: {
        type: new DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: new DataTypes.TIME,
      }
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
