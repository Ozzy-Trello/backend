import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

// Board ID for List Purchase | Produksi board
const LIST_PURCHASE_PRODUKSI_BOARD_ID = "d36f7e34-e990-4b42-bf7d-4900bb231e16";

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
          replacements: { boardId: LIST_PURCHASE_PRODUKSI_BOARD_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      if (boardResults.length === 0) {
        throw new Error(`Board with ID ${LIST_PURCHASE_PRODUKSI_BOARD_ID} not found`);
      }

      // Define lists with sequential order
      const lists = [
        { name: "List Purchase | Produksi", order: 0 },
        { name: "Filter Purchase Produk", order: 1 },
        { name: "Pending List (Pesanan yang dihold)", order: 2 },
        { name: "Request", order: 3 },
        { name: "Dipesan", order: 4 },
        { name: "Krah Manset Dipesan", order: 5 },
        { name: "Diterima", order: 6 },
        { name: "Request Retur Bahan", order: 7 },
        { name: "Proses Retur", order: 8 },
      ];

      // Prepare list records with UUIDs
      const now = new Date();
      const listRecords = lists.map((list) => ({
        id: uuidv4(),
        name: list.name,
        order: list.order,
        board_id: LIST_PURCHASE_PRODUKSI_BOARD_ID,
        created_at: now,
        updated_at: now,
      }));

      // Insert all lists in a single query
      await queryInterface.bulkInsert("list", listRecords, { transaction });
      await transaction.commit();
      console.log("Successfully added List Purchase Produksi board lists");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_list_purchase_produksi_lists seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all lists for the List Purchase Produksi board
      await queryInterface.sequelize.query(
        `DELETE FROM list WHERE board_id = :boardId`,
        {
          replacements: { boardId: LIST_PURCHASE_PRODUKSI_BOARD_ID },
          type: QueryTypes.DELETE,
          transaction,
        }
      );

      await transaction.commit();
      console.log("Successfully removed List Purchase Produksi board lists");
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error in add_list_purchase_produksi_lists seeder (down):",
        error
      );
      throw error;
    }
  },
};
