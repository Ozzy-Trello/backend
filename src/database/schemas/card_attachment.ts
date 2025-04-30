import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';
import File from './file';
import Card from './card';
import User from './user';

interface CardAttachmentAttributes {
  id: string;
  card_id: string;
  file_id: string;
  is_cover: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface TaskCreationAttributes extends CardAttachmentAttributes {}

class CardAttachment extends Model<CardAttachmentAttributes, TaskCreationAttributes> implements CardAttachmentAttributes {
  public id!: string;
  public card_id!: string;
  public file_id!: string;
  public is_cover!: boolean;
  public created_by!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
  
  // Define association accessors
  public readonly file?: File;
  public readonly card?: Card;
  public readonly user?: User;
}

CardAttachment.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    card_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'card',
        key: 'id',
      },
    },
    file_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'file',
        key: 'id',
      },
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'card_attachment',
    sequelize,
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

// Set up associations
export const initCardAttachmentAssociations = () => {
  CardAttachment.belongsTo(File, {
    foreignKey: 'file_id',
    as: 'file'
  });
  
  CardAttachment.belongsTo(Card, {
    foreignKey: 'card_id',
    as: 'card'
  });
  
  CardAttachment.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'user'
  });
};

export default CardAttachment;