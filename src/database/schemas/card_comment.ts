import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface ActivityCommentAttributes {
    id: string;
    activity_id: string;
    text: string;
    created_at?: Date;
    updated_at?: Date;
}

interface TaskCreationAttributes extends ActivityCommentAttributes {}

class ActivityComment extends Model<ActivityCommentAttributes, TaskCreationAttributes> implements ActivityCommentAttributes {
    public id! : string;
    public activity_id!: string;
    public text!: string;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
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
        tableName: 'card_activity_text',
        sequelize,
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
)

export default ActivityComment