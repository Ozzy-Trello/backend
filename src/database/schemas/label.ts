import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';

export interface LabelAttributes {
  id: string;
  name: string;
  value?: string; // was color
  value_type: 'color' | 'user' | 'custom_field'; // new enum field
  created_at?: Date;
  updated_at?: Date;
}

interface LabelCreationAttributes extends Optional<LabelAttributes, 'id'> {}

class Label extends Model<LabelAttributes, LabelCreationAttributes> implements LabelAttributes {
  public id!: string;
  public name!: string;
  public value?: string;
  public value_type!: 'color' | 'user' | 'custom_field';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Label.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    value_type: {
      type: DataTypes.ENUM('color', 'user', 'custom_field'),
      allowNull: false,
      defaultValue: 'color',
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
    tableName: 'label',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Label;
