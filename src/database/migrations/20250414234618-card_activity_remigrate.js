'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.removeColumn("card_activity", "activity_type");
    await queryInterface.removeColumn("card_activity_action", "action");
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);
    await queryInterface.dropTable('card_activity_action');
    await queryInterface.dropTable('card_activity_text');
    await queryInterface.dropTable('card_activity');

    await queryInterface.createTable('card_activity', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
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
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });

    await queryInterface.createTable('card_activity_text', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING(8),
      },
      createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });

    await queryInterface.createTable('card_activity_action', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.ENUM('move_list', 'make_label', 'add_tag', 'remove_tag'),
        allowNull: false,
      },
      source: {
        type: DataTypes.JSONB,
      },
      createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Drop new tables
    await queryInterface.dropTable('card_activity_action');
    await queryInterface.dropTable('card_activity_text');
    await queryInterface.dropTable('card_activity');

    // Recreate old tables (based on assumption, adjust as needed)
    await queryInterface.createTable('card_activity', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });

    await queryInterface.createTable('card_activity_text', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });

    // Recreate ENUM type first
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_card_activity_action_action AS ENUM ('move_list', 'make_label', 'add_tag', 'remove_tag');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('card_activity_action', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: 'enum_card_activity_action_action',
        allowNull: false,
      },
      source: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: DataTypes.TIME,
      }
    });
  }
};