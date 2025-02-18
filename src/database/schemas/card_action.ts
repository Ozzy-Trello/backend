import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface ActivityActionAttributes {
    id: string;
    activity_id: string;
    action: string;
    source: string;
}

interface TaskCreationAttributes extends ActivityActionAttributes {}

class ActivityAction extends Model<ActivityActionAttributes, TaskCreationAttributes> implements ActivityActionAttributes {
    public id! : string;
    public activity_id!: string;
    public action!: string;
    public source!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ActivityAction.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        activity_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        action: {
            type: DataTypes.ENUM('move_card', 'assign_tag', 'unassign_tag'),
        },
        source: {
            type: DataTypes.JSONB,
            validate: {
                isValidJson(value: { from: any; to: any; }) {
                    if (typeof value !== 'object' || !value.from || !value.to) {
                        throw new Error('Invalid move list format');
                    }
                },
            },
        }
    },
    {
        tableName: 'card_activity_action',
        sequelize,
    }
)

export default ActivityAction