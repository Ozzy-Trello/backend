import { DataTypes } from "sequelize";
import sequelize from "@/database/connections";

// Workspace ID for Ozzy Production
const OZZY_PRODUCTION_WORKSPACE_ID = "eb65c15c-12cc-49e4-9827-16ef1c838c4d";

// Board IDs and names
const BOARDS = [
  {
    id: "371f1368-716e-4ecf-8957-7e515ce5784c",
    name: "REQUEST DESAIN",
    description: "Board for design requests",
    background: "#F0F2F5",
  },
  {
    id: "dc147510-35bb-4109-a42b-2f7542b500d8",
    name: "List PO",
    description: "Board for purchase orders",
    background: "#E4F0F6",
  },
  {
    id: "e4739db9-6700-4e6b-8683-cf369b712751",
    name: "DATELINE",
    description: "Board for tracking deadlines",
    background: "#F5EEE6",
  },
  {
    id: "baff92e9-aa95-465f-afcc-4ab53d9f67d7",
    name: "DELIVERY",
    description: "Board for delivery tracking",
    background: "#E8F4EA",
  },
  {
    id: "22dc238a-d5b3-486b-8ccd-ff1bdddec496",
    name: "PURCHASING",
    description: "Board for purchasing activities",
    background: "#FAF3E0",
  },
  {
    id: "497feccb-193e-4d44-adc8-2d8a8b8c4897",
    name: "OP. BORDIR",
    description: "Board for embroidery operations",
    background: "#EAE4F2",
  },
  {
    id: "3eb82ab9-2adc-42ad-b866-83d98ccafb64",
    name: "FINISHING BORDIR",
    description: "Board for embroidery finishing",
    background: "#FFEBEE",
  },
];

export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if the Ozzy Production workspace exists
    const workspace = await queryInterface.select(null, "workspace", {
      where: {
        id: OZZY_PRODUCTION_WORKSPACE_ID,
      },
    });

    if (!workspace || workspace.length === 0) {
      console.log(
        `Workspace with ID ${OZZY_PRODUCTION_WORKSPACE_ID} does not exist, skipping board creation`
      );
      return;
    }

    // Create each board with its specific ID
    for (const board of BOARDS) {
      // Check if board already exists
      const existingBoard = await queryInterface.select(null, "board", {
        where: {
          id: board.id,
        },
      });

      if (existingBoard && existingBoard.length > 0) {
        console.log(
          `Board with ID ${board.id} (${board.name}) already exists, skipping`
        );
        continue;
      }

      await queryInterface.bulkInsert("board", [
        {
          id: board.id,
          workspace_id: OZZY_PRODUCTION_WORKSPACE_ID,
          name: board.name,
          description: board.description,
          background: board.background,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      console.log(`Created board: ${board.name} with ID: ${board.id}`);
    }

    console.log("All Ozzy Production boards created successfully");
  } catch (error) {
    console.error("Error creating Ozzy Production boards:", error);
    throw error;
  }
}

export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Delete each board by ID
    for (const board of BOARDS) {
      await queryInterface.bulkDelete("board", {
        id: board.id,
      });
      console.log(`Deleted board: ${board.name} with ID: ${board.id}`);
    }

    console.log("All Ozzy Production boards deleted successfully");
  } catch (error) {
    console.error("Error deleting Ozzy Production boards:", error);
    throw error;
  }
}
