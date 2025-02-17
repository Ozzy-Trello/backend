'use strict';

const {DataTypes} = require("sequelize");
const {v4: uuidv4} = require("uuid");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('user', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      username: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      email: {
        type: new DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: new DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      password: {
        type: new DataTypes.TEXT,
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

    await queryInterface.createTable('workspace', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: new DataTypes.TEXT,
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

    await queryInterface.createTable('workspace_member', {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      workspace_id: {
        type: DataTypes.UUID,
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

    await queryInterface.createTable('board', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      workspace_id: {
        type: DataTypes.UUID,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: new DataTypes.TEXT,
        allowNull: false,
      },
      background: {
        type: DataTypes.STRING(8),
        defaultValue: '#FFFFFF',
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

    await queryInterface.createTable('board_member', {
      board_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
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

    await queryInterface.createTable('list', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      board_id: {
        type: DataTypes.UUID,
      },
      order: {
        type: DataTypes.INTEGER,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      background: {
        type: DataTypes.STRING(8),
        defaultValue: '#797979',
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

    await queryInterface.createTable('card', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      list_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: new DataTypes.TEXT,
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

    await queryInterface.createTable('tag', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: new DataTypes.TEXT,
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

    await queryInterface.createTable('card_tag', {
      tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(8),
        defaultValue: '#FFFFFF',
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
        type: DataTypes.ENUM('move_card', 'assign_tag', 'unassign_tag'),
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

    await queryInterface.dropTable('user')
    await queryInterface.dropTable('workspace')
    await queryInterface.dropTable('workspace_member')
    await queryInterface.dropTable('board')
    await queryInterface.dropTable('board_member')
    await queryInterface.dropTable('list')
    await queryInterface.dropTable('card')
    await queryInterface.dropTable('tag')
    await queryInterface.dropTable('card_tag')
    await queryInterface.dropTable('card_activity')
    await queryInterface.dropTable('card_activity_text')
    await queryInterface.dropTable('card_activity_action')
  }
};
