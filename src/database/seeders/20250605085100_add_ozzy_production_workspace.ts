import { QueryInterface, QueryTypes } from "sequelize";

// Workspace ID for Ozzy Production
export const OZZY_PRODUCTION_WORKSPACE_ID =
  "eb65c15c-12cc-49e4-9827-16ef1c838c4d";

interface WorkspaceResult {
  id: string;
}

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if workspace already exists
      const results = await queryInterface.sequelize.query<WorkspaceResult>(
        `SELECT id FROM workspace WHERE id = :workspaceId`,
        {
          replacements: { workspaceId: OZZY_PRODUCTION_WORKSPACE_ID },
          type: QueryTypes.SELECT,
          transaction,
        }
      );

      const existingWorkspace = results[0] as WorkspaceResult | undefined;

      if (!existingWorkspace) {
        // Create Ozzy Production workspace
        await queryInterface.bulkInsert(
          "workspace",
          [
            {
              id: OZZY_PRODUCTION_WORKSPACE_ID,
              name: "Ozzy Production",
              description: "Main workspace for Ozzy Production",
              slug: "ozzy-production",
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_ozzy_production_workspace seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove the Ozzy Production workspace
      await queryInterface.bulkDelete(
        "workspace",
        { id: OZZY_PRODUCTION_WORKSPACE_ID },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error(
        "Error rolling back add_ozzy_production_workspace seeder:",
        error
      );
      throw error;
    }
  },
};
