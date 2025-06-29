import { DataTypes, Model } from 'sequelize';
import sequelize from '@/database/connections';

interface ActivityCommentAttributes {
    id: string;
    activity_id: string;
    text: string;
    created_at?: Date;
    updated_at?: Date;
    triggered_by?: string;
    created_by?:string;
}

interface TaskCreationAttributes extends ActivityCommentAttributes {}

class ActivityComment extends Model<ActivityCommentAttributes, TaskCreationAttributes> implements ActivityCommentAttributes {
    public id! : string;
    public activity_id!: string;
    public text!: string;
    public triggered_by?: string | undefined;
    created_by?: string | undefined;

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
        },
        triggered_by: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
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