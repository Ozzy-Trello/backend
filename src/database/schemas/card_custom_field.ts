import { DataTypes, Model, Optional, } from 'sequelize';
import sequelize from '@/database/connections';

interface CardCustomFieldAttributes {
  custom_field_id: string;
  card_id: string;
  value_user_id?: string;
  value_number?: number;
  value_string?: string;
  order: number;
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

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    }
  },
  {
    tableName: 'card_custom_field',
    sequelize,
    defaultScope: {
      attributes: {exclude: ['id', 'createdAt', 'updatedAt']}
  },
  }
)

export default CardCustomField