import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/database/connections';
import User from './user';


interface FileAttributes {
  id: string;
  name: string;
  url: string;
  size: number;
  size_unit: string;
  mime_type: string;
  created_by: string;
  card_id?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Some attributes are optional in `File.build` and `File.create` calls
interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'created_at' | 'updated_at'> {}

class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: string;
  public name!: string;
  public url!: string;
  public size!: number;
  public size_unit!: string;
  public mime_type!: string;
  public created_by!: string;
  public card_id?: string;
  
  // Timestamps
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
  
  // Associations
  public readonly user?: User;
}

File.init(
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    size_unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
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
    sequelize,
    tableName: 'file',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    underscored: true, // Use snake_case for column names
  }
);

// Define the associations
export const initFileAssociations = () => {
  
  File.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'user',
  });
  
};

export default File;