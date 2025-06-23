import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Zero Complain | External board
const ZERO_COMPLAIN_EXTERNAL_BOARD_ID = "82aaf8dc-69f4-43f5-b9a1-19e1f17d0cd6";

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
          replacements: { boardId: ZERO_COMPLAIN_EXTERNAL_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${ZERO_COMPLAIN_EXTERNAL_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Zero Complain | External", order: 0 },
        { name: "Altra", order: 1 },
        { name: "Maxima", order: 2 },
        { name: "Chester", order: 3 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: ZERO_COMPLAIN_EXTERNAL_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Zero Complain External board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_zero_complain_external_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Zero Complain External board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: ZERO_COMPLAIN_EXTERNAL_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Zero Complain External board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_zero_complain_external_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
