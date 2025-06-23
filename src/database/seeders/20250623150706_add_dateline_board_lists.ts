import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Dateline board
const DATELINE_BOARD_ID = "7c81b8c7-9d57-4a65-9e93-9c5d44218071";

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
          replacements: { boardId: DATELINE_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${DATELINE_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "FILTER DATELINE", order: 0 },
        { name: "FILTER PERSIAPAN", order: 1 },
        { name: "FILTER CUTTING", order: 2 },
        { name: "FILTER SEWING", order: 3 },
        { name: "FILTER OPERATOR BORDIR", order: 4 },
        { name: "FILTER DESAINER BORDIR", order: 5 },
        { name: "PO Masuk (DM)", order: 6 },
        { name: "Desain Fix (PPIC)", order: 7 },
        { name: "Purchasing", order: 8 },
        { name: "PO Stok & Pelengkap", order: 9 },
        { name: "Loading (Gudang)", order: 10 },
        { name: "Cutting", order: 11 },
        { name: "Numbering (Dist. Cutting)", order: 12 },
        { name: "Loading Line", order: 13 },
        { name: "Sewing", order: 14 },
        { name: "QC", order: 15 },
        { name: "Siap Bordir", order: 16 },
        { name: "Bordir / DTF", order: 17 },
        { name: "Finishing Packing", order: 18 },
        { name: "Delivery (PO Selesai)", order: 19 },
        { name: "PO Pelengkap Selesai", order: 20 },
        { name: "PO Stok Pabrik Selesai", order: 21 },
        { name: "Split Job Selesai", order: 22 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list, index) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: DATELINE_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_dateline_board_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Dateline board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: DATELINE_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_dateline_board_lists seeder (down):", error);
      throw error;
    }
  },
};
