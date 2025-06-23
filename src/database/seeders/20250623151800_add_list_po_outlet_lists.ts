import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for List PO | Outlet board
const LIST_PO_OUTLET_BOARD_ID = "577ef9e0-4466-4b4d-aeb7-c285c23c235f";

interface ListResult {
  id: string;
}

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if board exists
      const boardResults = await queryInterface.sequelize.query<ListResult>(
        `SELECT id FROM board WHERE id = :boardId`,
        {
          replacements: { boardId: LIST_PO_OUTLET_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${LIST_PO_OUTLET_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Filter", order: 0 },
        { name: "New PO", order: 1 },
        { name: "Revisi Desain", order: 2 },
        { name: "List PO Selesai", order: 3 },
        { name: "Terambil / Terkirim", order: 4 },
        { name: "Menunggu Resi", order: 5 },
        { name: "PO Stok Selesai", order: 6 },
        { name: "Lunas", order: 7 },
        { name: "Bordir / DTF", order: 8 },
        { name: "Finishing Packing", order: 9 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: LIST_PO_OUTLET_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added List PO Outlet board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_list_po_outlet_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the List PO Outlet board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: LIST_PO_OUTLET_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed List PO Outlet board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_list_po_outlet_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
