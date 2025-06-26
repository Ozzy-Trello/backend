import CardAttachment, {
  initCardAttachmentAssociations,
} from "./schemas/card_attachment";
import File, { initFileAssociations } from "./schemas/file";
import Card from "./schemas/card";
import User from "./schemas/user";
import Board from "./schemas/board";
import { BoardRole } from "./schemas/board_role";
import { Role } from "./schemas/role";
import Permission from "./schemas/permission";

export function initializeAssociations() {
  console.log("Initializing database associations...");
  initFileAssociations();

  // Initialize card attachment associations
  initCardAttachmentAssociations();

  Card.hasMany(CardAttachment, {
    foreignKey: "card_id",
    as: "attachments",
  });

  // Initialize Board and BoardRole associations
  // This is the critical association for board membership
  Board.hasMany(BoardRole, {
    foreignKey: "board_id",
    as: "members",
  });

  BoardRole.belongsTo(Board, {
    foreignKey: "board_id",
    as: "board",
  });

  // Role and Permission associations
  Role.belongsTo(Permission, {
    foreignKey: "permission_id",
    as: "permission",
  });

  Permission.hasMany(Role, {
    foreignKey: "permission_id",
    as: "roles",
  });

  // User and Role associations
  User.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });

  Role.hasMany(User, {
    foreignKey: "role_id",
    as: "users",
  });

  console.log("Database associations initialized successfully");
}
