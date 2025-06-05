import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface AdditionalFieldAttributes {
  id: string;
  card_id: string;
  data: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

interface AdditionalFieldCreationAttributes extends Optional<AdditionalFieldAttributes, 'id'> {}

class AdditionalField extends Model<AdditionalFieldAttributes, AdditionalFieldCreationAttributes> implements AdditionalFieldAttributes {
  public id!: string;
  public card_id!: string;
  public data!: Record<string, any>;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AdditionalField.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
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
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    tableName: 'additional_fields',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default AdditionalField;
