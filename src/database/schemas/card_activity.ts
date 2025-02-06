import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

interface CardActivityAttributes {
    id: string;
    card_id: string;
    sender_user_id: string;
    activity_type: string;  // comment, activity, action, dll
}

interface TaskCreationAttributes extends CardActivityAttributes {}

class CardActivity extends Model<CardActivityAttributes, TaskCreationAttributes> implements CardActivityAttributes {
    public id!: string;
    public card_id!: string;
    public sender_user_id!: string;
    public activity_type!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CardActivity.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: uuidv4,
        },
        card_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sender_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        activity_type: {
            type: DataTypes.ENUM('action', 'comment'),
            allowNull: false,
        },
    },
    {
        tableName: 'card_activity',
        sequelize,
    }
)

export default CardActivity