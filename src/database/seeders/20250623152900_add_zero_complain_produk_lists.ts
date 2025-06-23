import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Zero Complain | Produk board
const ZERO_COMPLAIN_PRODUK_BOARD_ID = "2c2be45c-31db-4d5c-bd21-8b96d9943511";

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
          replacements: { boardId: ZERO_COMPLAIN_PRODUK_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${ZERO_COMPLAIN_PRODUK_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Zero Complain | Produk", order: 0 },
        { name: "Warehouse Bahan", order: 1 },
        { name: "Cutting", order: 2 },
        { name: "Finishing Packing", order: 3 },
        { name: "Sewing", order: 4 },
        { name: "Desainer Bordir", order: 5 },
        { name: "Operator Bordir", order: 6 },
        { name: "Finishing Bordir", order: 7 },
        { name: "DTF", order: 8 },
        { name: "Link Zero Complain", order: 9 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: ZERO_COMPLAIN_PRODUK_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Zero Complain Produk board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_zero_complain_produk_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Zero Complain Produk board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: ZERO_COMPLAIN_PRODUK_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Zero Complain Produk board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_zero_complain_produk_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
