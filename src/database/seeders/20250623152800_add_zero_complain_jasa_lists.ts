import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Zero Complain | Jasa board
const ZERO_COMPLAIN_JASA_BOARD_ID = "e98ab7de-d349-4c3a-803e-e0ae12bcb1f2";

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
          replacements: { boardId: ZERO_COMPLAIN_JASA_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(
          `Board with ID ${ZERO_COMPLAIN_JASA_BOARD_ID} not found`
        );
      }

      // Define lists with sequential order
      const lists = [
        { name: "Zero Complain | Jasa", order: 0 },
        { name: "Deal Maker", order: 1 },
        { name: "Desain Grafis", order: 2 },
        { name: "Warehouse Produk", order: 3 },
        { name: "Product Advisor", order: 4 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: ZERO_COMPLAIN_JASA_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Zero Complain Jasa board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_zero_complain_jasa_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Zero Complain Jasa board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: ZERO_COMPLAIN_JASA_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Zero Complain Jasa board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_zero_complain_jasa_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
