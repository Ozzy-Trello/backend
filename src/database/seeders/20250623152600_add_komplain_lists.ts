import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Komplain board
const KOMPLAIN_BOARD_ID = "987ca50e-b650-4a98-a9b2-b27d38576b9f";

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
          replacements: { boardId: KOMPLAIN_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${KOMPLAIN_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Komplain", order: 0 },
        { name: "Filter Komplain", order: 1 },
        { name: "Progress Penyelesaian", order: 2 },
        { name: "Done", order: 3 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: KOMPLAIN_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Komplain board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_komplain_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Komplain board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: KOMPLAIN_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Komplain board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_komplain_lists seeder (down):", error);
      throw error;
    }
  },
};
