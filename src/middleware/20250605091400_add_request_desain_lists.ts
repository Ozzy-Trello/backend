import { QueryInterface } from "sequelize";

// Workspace ID for Ozzy Production
const OZZY_PRODUCTION_WORKSPACE_ID = "eb65c15c-12cc-49e4-9827-16ef1c838c4d";

// Role IDs from the role seeder
const ROLE_IDS = {
  DEAL_MAKER: "a1e1a1e1-a1e1-4a1e-a1e1-a1e1a1e1a1e1",
  SPV_DEAL_MAKER: "b2e2b2e2-b2e2-4b2e-b2e2-b2e2b2e2b2e2",
  DESAINER_OUTLET: "c3e3c3e3-c3e3-4c3e-c3e3-c3e3c3e3c3e3",
  SPV_OUTLET: "d4e4d4e4-d4e4-4d4e-d4e4-d4e4d4e4d4e4",
  PPIC: "e5e5e5e5-e5e5-4e5e-e5e5-e5e5e5e5e5e5",
  PURCHASING: "f6f6f6f6-f6f6-4f6f-f6f6-f6f6f6f6f6f6",
  WAREHOUSE_BAHAN: "a7a7a7a7-a7a7-4a7a-a7a7-a7a7a7a7a7a7",
  WAREHOUSE_PRODUK: "b8b8b8b8-b8b8-4b8b-b8b8-b8b8b8b8b8b8",
  KEPALA_PRODUKSI: "c9c9c9c9-c9c9-4c9c-c9c9-c9c9c9c9c9c9",
  OPERATOR_BORDIR: "f9f9f9f9-f9f9-4f9f-f9f9-f9f9f9f9f9f9",
  FINISHING_BORDIR: "a0a0a0a0-a0a0-4a0a-a0a0-a0a0a0a0a0a0",
  KURIR: "d3d3d3d3-d3d3-4d3d-d3d3-d3d3d3d3d3d3",
  SUPER_ADMIN: "f7f7f7f7-f7f7-4f7f-f7f7-f7f7f7f7f7f7",
};

// Board definitions with visibility settings
const BOARDS = [
  {
    id: "00000000-0000-0000-0001-000000000001",
    name: "Dateline",
    description: "Board for tracking all project deadlines",
    background: "#F0F2F5",
    visibility: "public",
    visible_roles: [], // Public board accessible to all
  },
  {
    id: "00000000-0000-0000-0002-000000000001",
    name: "Request Desain | Outlet",
    description: "Board for outlet design requests",
    background: "#E4F0F6",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DESAINER_OUTLET,
      ROLE_IDS.SPV_OUTLET,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0003-000000000001",
    name: "List PO | Outlet",
    description: "Board for outlet purchase orders",
    background: "#F5EEE6",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DEAL_MAKER,
      ROLE_IDS.SPV_DEAL_MAKER,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0004-000000000001",
    name: "Operator Bordir | Produksi",
    description: "Board for embroidery operators",
    background: "#EAE4F2",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.OPERATOR_BORDIR,
      ROLE_IDS.KEPALA_PRODUKSI,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0005-000000000001",
    name: "Finishing Bordir | Produksi",
    description: "Board for embroidery finishing",
    background: "#FFEBEE",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.FINISHING_BORDIR,
      ROLE_IDS.KEPALA_PRODUKSI,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0006-000000000001",
    name: "List Purchase | Produksi",
    description: "Board for production purchases",
    background: "#E8F5E9",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.PURCHASING,
      ROLE_IDS.KEPALA_PRODUKSI,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0007-000000000001",
    name: "List Purchase | Umum",
    description: "Board for general purchases",
    background: "#E0F7FA",
    visibility: "role_based",
    visible_roles: [ROLE_IDS.PURCHASING, ROLE_IDS.SUPER_ADMIN],
  },
  {
    id: "00000000-0000-0000-0008-000000000001",
    name: "Delivery",
    description: "Board for delivery tracking",
    background: "#FFF3E0",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.KURIR,
      ROLE_IDS.WAREHOUSE_PRODUK,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0009-000000000001",
    name: "Komplain",
    description: "Board for complaint management",
    background: "#FFEBEE",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DEAL_MAKER,
      ROLE_IDS.SPV_DEAL_MAKER,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0010-000000000001",
    name: "Zero Complain | External",
    description: "Board for external zero complaint tracking",
    background: "#F3E5F5",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DEAL_MAKER,
      ROLE_IDS.SPV_DEAL_MAKER,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0011-000000000001",
    name: "Zero Complain | Jasa",
    description: "Board for service zero complaint tracking",
    background: "#E8EAF6",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DEAL_MAKER,
      ROLE_IDS.SPV_DEAL_MAKER,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
  {
    id: "00000000-0000-0000-0012-000000000001",
    name: "Zero Complain | Produk",
    description: "Board for product zero complaint tracking",
    background: "#E3F2FD",
    visibility: "role_based",
    visible_roles: [
      ROLE_IDS.DEAL_MAKER,
      ROLE_IDS.SPV_DEAL_MAKER,
      ROLE_IDS.SUPER_ADMIN,
    ],
  },
];

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Update existing boards or create new ones
    for (const board of BOARDS) {
      // Check if board exists
      const existingBoards = await queryInterface.select(null, "board", {
        where: { id: board.id },
      });

      const boardData = {
        workspace_id: OZZY_PRODUCTION_WORKSPACE_ID,
        name: board.name,
        description: board.description,
        background: board.background,
        visibility: board.visibility,
        updated_at: new Date(),
      };

      if (existingBoards.length > 0) {
        // Update existing board
        await queryInterface.bulkUpdate("board", boardData, { id: board.id });
        console.log(`Updated board: ${board.name}`);
      } else {
        // Create new board
        await queryInterface.bulkInsert("board", [
          {
            ...boardData,
            id: board.id,
            created_at: new Date(),
          },
        ]);
        console.log(`Created board: ${board.name}`);
      }

      // Set up role-based visibility
      if (
        board.visibility === "role_based" &&
        board.visible_roles &&
        board.visible_roles.length > 0
      ) {
        // Remove existing role associations
        await queryInterface.bulkDelete("board_roles", {
          board_id: board.id,
        });

        // Create role associations
        const boardRoles = board.visible_roles.map((roleId: string) => ({
          board_id: board.id,
          role_id: roleId,
          user_id: null, // No specific user, applies to all users with this role
          created_at: new Date(),
          updated_at: new Date(),
        }));

        if (boardRoles.length > 0) {
          await queryInterface.bulkInsert("board_roles", boardRoles);
          console.log(
            `  - Set visibility for ${board.visible_roles.length} roles on board "${board.name}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating boards:", error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove all the boards we created
  await queryInterface.bulkDelete("board", {
    id: BOARDS.map((b) => b.id),
  });

  // Remove all board-role associations
  await queryInterface.bulkDelete("board_roles", {
    board_id: BOARDS.map((b) => b.id),
  });
}
