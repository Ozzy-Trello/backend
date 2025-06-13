import CardAttachment, {
  initCardAttachmentAssociations,
} from "./schemas/card_attachment";
import File, { initFileAssociations } from "./schemas/file";
import Card from "./schemas/card";
import User from "./schemas/user";
import Board from "./schemas/board";
import { BoardRole } from "./schemas/board_role";
import { Role } from "./schemas/role";

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

  console.log("Database associations initialized successfully");
}
