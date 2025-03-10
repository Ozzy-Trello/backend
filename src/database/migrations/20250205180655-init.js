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
      slug: {
        type: new DataTypes.TEXT,
        allowNull: false,
        unique: true
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
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'workspace',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        allowNull: false,
        references: {
          model: 'workspace',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        primaryKey: true,
        references: {
          model: 'board',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'role',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        allowNull: false,
        references: {
          model: 'board',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        references: {
          model: 'list',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: new DataTypes.TEXT,
        allowNull: false,
      },
      order: {
        type: new DataTypes.INTEGER,
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
        references: {
          model: 'tag',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'card',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.createTable('role', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.createTable('custom_field', {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      name: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      workspace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'workspace',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: new DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: new DataTypes.ENUM('product', 'user'),
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

    await queryInterface.createTable('card_custom_field', {
      custom_field_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'custom_field',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order: {
        type: new DataTypes.INTEGER,
        allowNull: false,
      },
      card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'card',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value_user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value_number: {
        type: DataTypes.INTEGER,
      },
      value_string: {
        type: DataTypes.STRING(255),
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
    await queryInterface.removeConstraint('workspace_member', 'workspace_member_user_id_fkey')
    await queryInterface.removeConstraint('workspace_member', 'workspace_member_workspace_id_fkey')
    await queryInterface.removeConstraint('board', 'board_workspace_id_fkey')
    await queryInterface.removeConstraint('board_member', 'board_member_user_id_fkey')
    await queryInterface.removeConstraint('list', 'list_board_id_fkey')
    await queryInterface.removeConstraint('card', 'card_list_id_fkey')
    await queryInterface.removeConstraint('card_tag', 'card_tag_tag_id_fkey')
    await queryInterface.removeConstraint('card_tag', 'card_tag_card_id_fkey')
    await queryInterface.removeConstraint('custom_field', 'custom_field_workspace_id_fkey')
    await queryInterface.removeConstraint('card_custom_field', 'card_custom_field_value_user_id_fkey')
    await queryInterface.removeConstraint('card_custom_field', 'card_custom_field_card_id_fkey')
    // await queryInterface.removeConstraint('card_activity', 'card_activity_card_id_fkey')
    // await queryInterface.removeConstraint('card_activity', 'card_activity_user_id_fkey')
    // await queryInterface.removeConstraint('card_activity_text', 'card_activity_text_card_activity_id_fkey')
    // await queryInterface.removeConstraint('card_activity_action', 'card_activity_action_card_activity_id_fkey')
    
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
    await queryInterface.dropTable('role')
    await queryInterface.dropTable('card_custom_field')
    await queryInterface.dropTable('custom_field')
  }
};
