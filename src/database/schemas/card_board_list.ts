import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';
import Card from './card';
import Board from './board';
import User from './user';

interface CardBoardTimeHistoryAttributes {
  id: string;
  card_id: string;
  board_id: string;
  entered_at: Date;
  exited_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

class CardBoardTimeHistory extends Model<CardBoardTimeHistoryAttributes> implements CardBoardTimeHistoryAttributes {
  public id!: string;
  public card_id!: string;
  public board_id!: string;
  public entered_at!: Date;
  public exited_at!: Date | null;
  public created_at!: Date;
  public updated_at!: Date;
  
  // Define association accessors
  public readonly card?: Card;
  public readonly board?: Board;
}

CardBoardTimeHistory.init(
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
    board_id: {
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
    tableName: 'card_board_history',
    sequelize,
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Set up associations
export const initCardBoardHistoryAssociations = () => {
  CardBoardTimeHistory.belongsTo(Card, {
    foreignKey: 'card_id',
    as: 'card'
  });
  
  CardBoardTimeHistory.belongsTo(Board, {
    foreignKey: 'board_id',
    as: 'board'
  });
};

export default CardBoardTimeHistory;