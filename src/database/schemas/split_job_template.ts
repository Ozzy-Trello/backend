import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface SplitJobTemplateAttributes {
  id: string;
  name: string;
  workspace_id: string;
  custom_field_id: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface SplitJobTemplateCreationAttributes extends Optional<SplitJobTemplateAttributes, 'id'> { }

class SplitJobTemplate extends Model<SplitJobTemplateAttributes, SplitJobTemplateCreationAttributes> implements SplitJobTemplateAttributes {
  public id!: string;
  public name!: string;
  public workspace_id!: string;
  public custom_field_id!: string;
  public description?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

SplitJobTemplate.init(
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
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workspace',
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'split_job_template',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['workspace_id'],
      },
      {
        fields: ['custom_field_id'],
      },
    ],
  }
);

export default SplitJobTemplate;
