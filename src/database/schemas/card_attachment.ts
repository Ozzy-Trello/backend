import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';
import File from './file';
import Card from './card';
import User from './user';
import { AttachmentType } from '@/types/card_attachment';

interface CardAttachmentAttributes {
  id: string;
  card_id: string;
  attachable_type: AttachmentType;
  attachable_id: string;
  is_cover: boolean;
  metadata: any;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

interface TaskCreationAttributes extends CardAttachmentAttributes {}

class CardAttachment extends Model<CardAttachmentAttributes, TaskCreationAttributes> implements CardAttachmentAttributes {
  public id!: string;
  public card_id!: string;
  public attachable_type!: AttachmentType;
  public attachable_id!: string;
  public is_cover!: boolean;
  public metadata: any;
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
    attachable_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachable_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
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