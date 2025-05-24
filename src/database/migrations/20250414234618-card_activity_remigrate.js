'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Hapus kolom jika tabel dan kolom ada
    const tableInfo = await queryInterface.describeTable("card_activity").catch(() => null);
    if (tableInfo?.activity_type) {
      await queryInterface.removeColumn("card_activity", "activity_type");
    }

    const actionTableInfo = await queryInterface.describeTable("card_activity_action").catch(() => null);
    if (actionTableInfo?.action) {
      await queryInterface.removeColumn("card_activity_action", "action");
    }

    // Drop ENUM type if exists
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);

    // Drop table if exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity_action') THEN
          DROP TABLE card_activity_action;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity_text') THEN
          DROP TABLE card_activity_text;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity') THEN
          DROP TABLE card_activity;
        END IF;
      END $$;
    `);

    await queryInterface.createTable('card_activity', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
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
    // Hapus kolom jika tabel dan kolom ada
    const tableInfo = await queryInterface.describeTable("card_activity").catch(() => null);
    if (tableInfo?.activity_type) {
      await queryInterface.removeColumn("card_activity", "activity_type");
    }

    const actionTableInfo = await queryInterface.describeTable("card_activity_action").catch(() => null);
    if (actionTableInfo?.action) {
      await queryInterface.removeColumn("card_activity_action", "action");
    }

    // Drop ENUM type if exists
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_action_action;`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS enum_card_activity_activity_action;`);

    // Drop table if exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity_action') THEN
          DROP TABLE card_activity_action;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity_text') THEN
          DROP TABLE card_activity_text;
        END IF;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_activity') THEN
          DROP TABLE card_activity;
        END IF;
      END $$;
    `);

    // Recreate old tables (based on assumption, adjust as needed)
    await queryInterface.createTable('card_activity', {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
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