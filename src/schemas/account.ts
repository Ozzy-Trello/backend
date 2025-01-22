import { Model, DataTypes } from 'sequelize';
import db from "@/schemas/connections";

class Account extends Model {
	public id!: number;
	public name!: string;
	public email!: string;
	public password!: string;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;
}

Account.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true
		}
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	sequelize: db,
	tableName: 'users'
});
