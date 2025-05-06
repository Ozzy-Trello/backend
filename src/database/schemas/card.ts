import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface CardAttributes {
    id : string;
    list_id: string;
    name: string;
    description : string;
    order : number;
    location?: string;
    created_at?: Date;
    updated_at?: Date;
}

interface CardCreationAttributes extends Optional<CardAttributes, 'id'> {}

class Card extends Model<CardAttributes, CardCreationAttributes> implements CardAttributes {
    public id! : string;
    public list_id!: string;
    public name!: string;
    public description! : string;
    public order! : number;
    public location?: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Card.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            primaryKey: true,
        },
        list_id: {
            type: DataTypes.UUID,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        description: {
            type: new DataTypes.TEXT,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        order: {
            type: new DataTypes.NUMBER,
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
        tableName: 'card',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
)

export default Card