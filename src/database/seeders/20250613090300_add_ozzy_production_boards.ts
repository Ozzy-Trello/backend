import { QueryInterface } from "sequelize";

// Workspace ID for Ozzy Production
const OZZY_PRODUCTION_WORKSPACE_ID = "eb65c15c-12cc-49e4-9827-16ef1c838c4d";

const ROLE_IDS = {
  DEAL_MAKER: "29c11c13-89cb-4cc2-b7c3-1b82de1c197e",
  SPV_DEAL_MAKER: "ed377c33-b6cc-4f3b-930c-81c95f8fc007",
  DESAINER_OUTLET: "06c83a45-d0cd-4cc3-ae30-3c77c54f72b4",
  SPV_OUTLET: "146993a6-4865-4682-982a-24fc585ce213",
  PPIC: "e1988ff5-c257-4a2b-8913-1e58c6f5db96",
  PURCHASING: "2b6cf6fd-622e-4123-9584-65f09312d0d3",
  WAREHOUSE_BAHAN: "5e7d34db-bc4d-4528-a15a-018be6ae3d08",
  WAREHOUSE_PRODUK: "c5ec6dce-5cb3-4f99-a406-4762ec5466e5",
  KEPALA_PRODUKSI: "d47cbab7-03be-419c-ae33-30b4cd3c31d8",
  CUTTING: "e89805cd-89d5-4db7-b0f7-c76c71ff16a9",
  NUMBERING: "a8e4de42-2c4c-40e3-a1ff-8ee42dfd065f",
  HELPER_LINE: "b91d8ac4-08fa-4c4a-9347-4f97eb93cd49",
  SPV_SEWING: "24c6b4b8-645c-4b79-a2c6-f98fcde962c8",
  QC: "ce58a878-422c-4cbe-a85a-6e60e17ef342",
  SPV_DESIGNER_BORDIR: "b78ce640-418f-4076-b065-36a78db4f63d",
  DESAINER_BORDIR: "09b04c89-d80f-4cfd-a2f4-dfc739a2c020",
  SPV_OPERATOR_BORDIR: "77fd7079-6ddf-4035-8ee5-2a3bd0aa8826",
  OPERATOR_BORDIR: "c7c84070-f0c4-4961-92bb-0a38bb9cd153",
  FINISHING_BORDIR: "21f82c53-4899-4030-ae7c-4f365db2c6e4",
  FINISHING_PACKING: "df1ad0b1-6c2e-445c-9757-088f0fe1a105",
  SPV_KURIR: "97c2a01f-02b4-4a3d-92e3-83717479e52f",
  KURIR: "fb78b8bc-c4de-4403-91d7-46b0877b36d0",
  RND: "ac7a7e4b-84b2-43fd-9e90-4f66b23ab9cb",
  CONTENT_CREATOR: "dc7adab8-ec92-4953-a449-5e19df8cd29e",
  BE: "8126593e-18f4-48ea-b6c6-c2e5d65be5bc",
  ADVERTISER: "812fd3cb-c6b6-470c-9295-7f285f0b3b27",
  DESAIN_GRAFIS: "d2dd1838-f8cb-4c48-82f4-9367aa47fe9d",
  MULTI_MEDIA: "6847b166-24ed-4ab5-804b-7147681ffdab",
  MANAJER_SALES_MARKETING: "4497eab3-203f-4fc4-8377-963f9149de0a",
  SUPER_ADMIN: "f97c942c-5d0c-49c3-b74d-5b149c08634f",
};

const BOARDS = [
  {
    id: "7c81b8c7-9d57-4a65-9e93-9c5d44218071",
    name: "Dateline",
    description: "Board for tracking all project deadlines",
    background: "#F0F2F5",
    visibility: "public",
    visible_roles: [],
  },
  {
    id: "1b582fc3-c18e-4e99-8d9f-b8be5793f707",
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
    id: "577ef9e0-4466-4b4d-aeb7-c285c23c235f",
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
    id: "d51c58e0-d5f7-4707-a1c4-41d1872a5891",
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
    id: "2a3a2ff1-91dc-49ae-82c3-8b5b5c181d48",
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
    id: "d36f7e34-e990-4b42-bf7d-4900bb231e16",
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
    id: "fd0cfbbf-4e34-423c-b0eb-ef5c3dc8bd9a",
    name: "List Purchase | Umum",
    description: "Board for general purchases",
    background: "#E0F7FA",
    visibility: "role_based",
    visible_roles: [ROLE_IDS.PURCHASING, ROLE_IDS.SUPER_ADMIN],
  },
  {
    id: "4eb79b0e-8e5c-4f19-9018-f3c06cc417e2",
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
    id: "987ca50e-b650-4a98-a9b2-b27d38576b9f",
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
    id: "82aaf8dc-69f4-43f5-b9a1-19e1f17d0cd6",
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
    id: "e98ab7de-d349-4c3a-803e-e0ae12bcb1f2",
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
    id: "2c2be45c-31db-4d5c-bd21-8b96d9943511",
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
