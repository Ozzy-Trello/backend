import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface CardTagAttributes {
    tag_id : string;
    card_id: string;
    color: string;
    created_at?: Date;
    updated_at?: Date;
}

interface TaskCreationAttributes extends CardTagAttributes {}

class CardTag extends Model<CardTagAttributes, TaskCreationAttributes> implements CardTagAttributes {
    public card_id! : string;
    public tag_id!: string;
    public color!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
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
        tableName: 'card_tag',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
)

export default CardTag


// assign member to to Card
// move card to done
// calculate done card