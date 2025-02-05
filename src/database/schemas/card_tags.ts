import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface CardTagAttributes {
    tag_id : string;
    card_id: string;
    color: string;
}

interface TaskCreationAttributes extends CardTagAttributes {}

class CardTag extends Model<CardTagAttributes, TaskCreationAttributes> implements CardTagAttributes {
    public card_id! : string;
    public tag_id!: string;
    public color!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CardTag.init(
    {
        tag_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        card_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(8),
            defaultValue: '#FFFFFF',
        }
    },
    {
        tableName: 'card_tag',
        sequelize,
    }
)

export default CardTag