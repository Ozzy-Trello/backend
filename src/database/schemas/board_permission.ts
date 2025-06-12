import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

export const BOARD_PERMISSIONS = [
  'MEMBER',
  'OBSERVER',
  'MODERATOR',
  'ADMIN'
] as const;

export type BoardPermissionLevel = typeof BOARD_PERMISSIONS[number];

interface BoardPermissionAttributes {
  id: string;
  level: BoardPermissionLevel;
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface BoardPermissionCreationAttributes extends Optional<BoardPermissionAttributes, 'id' | 'created_at' | 'updated_at'> {}

class BoardPermission extends Model<BoardPermissionAttributes, BoardPermissionCreationAttributes> implements BoardPermissionAttributes {
  public id!: string;
  public level!: BoardPermissionLevel;
  public description!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: any): typeof BoardPermission {
    BoardPermission.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        level: {
          type: DataTypes.ENUM(...BOARD_PERMISSIONS),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: '',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        tableName: 'board_permissions',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return BoardPermission;
  }
}

// Initialize the model
BoardPermission.initialize(sequelize);

export { BoardPermission };
export type { BoardPermissionAttributes, BoardPermissionCreationAttributes };
