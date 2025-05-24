import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';
import { CardType } from '@/types/card';

interface CardAttributes {
    id : string;
    list_id: string;
    type: string;
    name: string;
    description : string;
    order : number;
    location?: string;
    start_date?: Date;
    archive?: Boolean;
    due_date?: Date;
    due_date_reminder?: string;
    dash_config?: JSON;
    created_at?: Date;
    updated_at?: Date;
    is_complete?: boolean; // Added
    completed_at?: Date;   // Added
}

interface CardCreationAttributes extends Optional<CardAttributes, 'id'> {}

class Card extends Model<CardAttributes, CardCreationAttributes> implements CardAttributes {
    public id! : string;
    public list_id!: string;
    public type!: string;
    public name!: string;
    public description! : string;
    public order! : number;
    public location?: string;
    public archive?: boolean;
    public start_date?: Date;
    public due_date?: Date;
    public due_date_reminder?: string;
    public dash_config?: JSON;
    public is_complete?: boolean; // Added
    public completed_at?: Date;   // Added

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
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [[CardType.Regular, CardType.Dashcard]]
            }
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
        archive: {
            type: new DataTypes.BOOLEAN,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        due_date_reminder: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dash_config: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        is_complete: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
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