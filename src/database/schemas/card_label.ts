import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

export interface CardLabelAttributes {
  id : string;
  card_id: string;
  label_id: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CardLabelCreationAttributes extends CardLabelAttributes {}

class CardLabel extends Model<CardLabelAttributes, CardLabelCreationAttributes> implements CardLabelAttributes {
    public id! : string;
    public card_id!: string;
    public label_id!: string;
    public created_by!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

CardLabel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    label_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
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
    tableName: 'card_label',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
)

export default CardLabel;