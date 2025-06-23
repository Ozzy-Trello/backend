import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Delivery board
const DELIVERY_BOARD_ID = "4eb79b0e-8e5c-4f19-9018-f3c06cc417e2";

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
          replacements: { boardId: DELIVERY_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${DELIVERY_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Delivery", order: 0 },
        { name: "Request Permintaan Stok", order: 1 },
        { name: "Request Umum", order: 2 },
        { name: "Dalam Pengiriman", order: 3 },
        { name: "Terkirim", order: 4 },
        { name: "PO Terkirim (PA)", order: 5 },
        { name: "Pending/Bermasalah", order: 6 },
        { name: "FILTER DELIVERY", order: 7 },
        { name: "Finishing Packing", order: 8 },
        { name: "Bordir / DTF", order: 9 },
        { name: "Delivery (PO Selesai)", order: 10 },
        { name: "Siap Bordir", order: 11 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: DELIVERY_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Delivery board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_delivery_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Delivery board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: DELIVERY_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Delivery board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_delivery_lists seeder (down):", error);
      throw error;
    }
  },
};
