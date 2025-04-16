import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';
import { SourceType } from '@/types/custom_field';

interface CustomFieldAttributes {
  id: string;
  name: string;
  description: string;
  workspace_id: string;
  source: SourceType;
  trigger_id?: string;
}

interface CustomFieldCreationAttributes extends Optional<CustomFieldAttributes, 'id'> { }

class CustomField extends Model<CustomFieldAttributes, CustomFieldCreationAttributes> implements CustomFieldAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public workspace_id!: string;
  public source!: SourceType;
  public trigger_id?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomField.init(
  {
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
    trigger_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'trigger',
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
      type: new DataTypes.ENUM(SourceType.Product, SourceType.User),
      allowNull: false,
    },
  },
  {
    tableName: 'custom_field',
    sequelize,
  }
)

export default CustomField