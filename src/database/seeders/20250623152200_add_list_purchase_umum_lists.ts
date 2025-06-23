import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for List Purchase | Umum board
const LIST_PURCHASE_UMUM_BOARD_ID = "fd0cfbbf-4e34-423c-b0eb-ef5c3dc8bd9a";

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
          replacements: { boardId: LIST_PURCHASE_UMUM_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${LIST_PURCHASE_UMUM_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "List Purchase | Umum", order: 0 },
        { name: "Request", order: 1 },
        { name: "ACC by Henry", order: 2 },
        { name: "Dipesan", order: 3 },
        { name: "Diterima", order: 4 },
        { name: "Ditolak", order: 5 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: LIST_PURCHASE_UMUM_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added List Purchase Umum board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_list_purchase_umum_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the List Purchase Umum board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: LIST_PURCHASE_UMUM_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed List Purchase Umum board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_list_purchase_umum_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
