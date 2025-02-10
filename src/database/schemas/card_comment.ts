import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface ActivityCommentAttributes {
    id: string;
    activity_id: string;
    text: string;
}

interface TaskCreationAttributes extends ActivityCommentAttributes {}

class ActivityComment extends Model<ActivityCommentAttributes, TaskCreationAttributes> implements ActivityCommentAttributes {
    public id! : string;
    public activity_id!: string;
    public text!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ActivityComment.init(
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        activity_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        text: {
          type: DataTypes.STRING(8),
        }
    },
    {
        tableName: 'card_activity_text',
        sequelize,
    }
)

export default ActivityComment