import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';
import Card from './card';
import Board from './board';
import User from './user';

interface CardListTimeHistoryAttributes {
  id: string;
  card_id: string;
  list_id: string;
  entered_at: Date;
  exited_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

class CardListTimeHistory extends Model<CardListTimeHistoryAttributes> implements CardListTimeHistoryAttributes {
  public id!: string;
  public card_id!: string;
  public list_id!: string;
  public entered_at!: Date;
  public exited_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
  
  // Define association accessors
  public readonly card?: Card;
  public readonly board?: Board;
}

CardListTimeHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    list_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    entered_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    exited_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'card_list_time_history',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Set up associations
export const initCardBoardHistoryAssociations = () => {
  CardListTimeHistory.belongsTo(Card, {
    foreignKey: 'card_id',
    as: 'card'
  });
  
  CardListTimeHistory.belongsTo(Board, {
    foreignKey: 'list_id',
    as: 'lsit'
  });

};

export default CardListTimeHistory;