import { Sequelize } from 'sequelize';
import sequelize from '@/database/connections';

import User from "@/database/schemas/user";
import Workspace from "@/database/schemas/workspace";
import WorkspaceMember from "@/database/schemas/workspace_member";

User.belongsToMany(Workspace, { 
  through: WorkspaceMember,
  foreignKey: "user_id",
  otherKey: "workspace_id"
});
Workspace.belongsToMany(User, { 
  through: WorkspaceMember,
  foreignKey: "workspace_id",
  otherKey: "user_id"
});

const db: { [key: string]: any } = {};
db[User.name] = User;
db[Workspace.name] = Workspace;
db[WorkspaceMember.name] = WorkspaceMember;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
