import { DataTypes, Model, Optional, } from 'sequelize';
import sequelize from '@/database/connections';

interface CardCustomFieldAttributes {
  custom_field_id: string;
  card_id: string;
  value_user_id?: string;
  value_number?: number;
  value_string?: string;
  order: number;
  created_at?: Date;
  updated_at?: Date;
}

// @ts-ignore: Unreachable code error
interface CardCustomFieldCreationAttributes extends Optional<CardCustomFieldAttributes, 'id'>{ }

class CardCustomField extends Model<CardCustomFieldAttributes, CardCustomFieldCreationAttributes> implements CardCustomFieldAttributes {
  public custom_field_id!: string;
  public order!: number;
  public card_id!: string;
  public value_user_id?: string;
  public value_number?: number;
  public value_string?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CardCustomField.init(
  {
    custom_field_id: {
      type: DataTypes.UUID,
      primaryKey: true,
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
      primaryKey: true,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'card_custom_field',
    sequelize,
    defaultScope: {
      attributes: {exclude: ['id', 'created_at', 'updated_at']}
    },
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default CardCustomField