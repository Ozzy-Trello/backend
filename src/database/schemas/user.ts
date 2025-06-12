import {DataTypes, Model, Optional} from 'sequelize';
import {v4 as uuidv4} from 'uuid';
import sequelize from '@/database/connections';

interface UserAttributes {
	id: string;
	username: string;
	email: string;
	phone: string;
	password: string;
	role_id?: string | null;
	created_at?: Date;
	updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
	public id!: string;
	public username!: string;
	public email!: string;
	public phone!: string;
	public password!: string;
	public role_id?: string | null;

	public readonly created_at!: Date;
	public readonly updated_at!: Date;
}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: uuidv4,
			primaryKey: true,
		},
		username: {
			type: new DataTypes.STRING(128),
			allowNull: false,
		},
		email: {
			type: new DataTypes.STRING(128),
			allowNull: false,
			unique: true,
		},
		phone: {
			type: new DataTypes.STRING(20),
			allowNull: false,
			unique: true,
		},
		password: {
			type: new DataTypes.TEXT,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		tableName: 'user',
		sequelize, // passing the `sequelize` instance is required
		defaultScope: {
			attributes: {
				exclude: ['password']
			},
			order: [['created_at', 'DESC']]
		},
		scopes: {
			withPassword: {
				attributes: {
					include: ['password']
				}
			}
		},
		underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
	}
);

export default User;