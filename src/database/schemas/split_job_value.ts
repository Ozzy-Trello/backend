import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface SplitJobValueAttributes {
  id: string;
  name: string;
  split_job_template_id: string;
  card_id: string;
  custom_field_id: string;
  value: number;
  created_at?: Date;
  updated_at?: Date;
}

interface SplitJobValueCreationAttributes extends Optional<SplitJobValueAttributes, 'id'> { }

class SplitJobValue extends Model<SplitJobValueAttributes, SplitJobValueCreationAttributes> implements SplitJobValueAttributes {
  public id!: string;
  public name!: string;
  public split_job_template_id!: string;
  public card_id!: string;
  public custom_field_id!: string;
  public value!: number;
  public created_at?: Date;
  public updated_at?: Date;
}

SplitJobValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    split_job_template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'split_job_template',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'card',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    custom_field_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'custom_field',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'split_job_value',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['split_job_template_id'],
      },
      {
        fields: ['card_id'],
      },
      {
        fields: ['custom_field_id'],
      },
    ],
  }
);

export default SplitJobValue;
