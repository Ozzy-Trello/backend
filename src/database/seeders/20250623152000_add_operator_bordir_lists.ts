import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Operator Bordir | Produksi board
const OPERATOR_BORDIR_BOARD_ID = "d51c58e0-d5f7-4707-a1c4-41d1872a5891";

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
          replacements: { boardId: OPERATOR_BORDIR_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${OPERATOR_BORDIR_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Operator Bordir", order: 0 },
        { name: "Daily Monitoring", order: 1 },
        { name: "Performa Bulanan", order: 2 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: OPERATOR_BORDIR_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Operator Bordir board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_operator_bordir_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Operator Bordir board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: OPERATOR_BORDIR_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Operator Bordir board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_operator_bordir_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
