import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for Request Desain | Outlet board
const REQUEST_DESAIN_BOARD_ID = "1b582fc3-c18e-4e99-8d9f-b8be5793f707";

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
          replacements: { boardId: REQUEST_DESAIN_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${REQUEST_DESAIN_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "Filter Deal Maker", order: 0 },
        { name: "Filter Desain Terhandle", order: 1 },
        { name: "Filter Desain Pending", order: 2 },
        { name: "Request New Desain", order: 3 },
        { name: "Desain Terambil", order: 4 },
        { name: "Terbit PO", order: 5 },
        { name: "Revisi Desain", order: 6 },
        { name: "Terkirim ke DM", order: 7 },
        { name: "Terkirim ke Konsumen", order: 8 },
        { name: "Desain ACC", order: 9 },
        { name: "Stamp", order: 10 },
        { name: "Follow Up Desain", order: 11 },
        { name: "Desain Closing", order: 12 },
        { name: "Closing Terpending", order: 13 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: REQUEST_DESAIN_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added Request Desain board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_request_desain_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the Request Desain board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: REQUEST_DESAIN_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed Request Desain board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_request_desain_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
