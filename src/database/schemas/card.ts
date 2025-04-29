import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';
import { AllowNull } from 'sequelize-typescript';

interface CardAttributes {
    id : string;
    list_id: string;
    name: string;
    description : string;
    order : number;
    location?: string;
}

interface CardCreationAttributes extends Optional<CardAttributes, 'id'> {}

class Card extends Model<CardAttributes, CardCreationAttributes> implements CardAttributes {
    public id! : string;
    public list_id!: string;
    public name!: string;
    public description! : string;
    public order! : number;
    public location?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
    },
    {
        tableName: 'card',
        sequelize,
    }
)

export default Card