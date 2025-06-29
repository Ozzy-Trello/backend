import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const tables = await queryInterface.showAllTables();
      console.log("Available tables:", tables);

      // 1. Rename board_permissions table to permissions (global permissions)
      if (tables.includes("board_permissions")) {
        console.log("Renaming board_permissions to permissions...");
        await queryInterface.renameTable("board_permissions", "permissions", {
          transaction,
        });

        // Update the enum type name to be more generic
        await queryInterface.sequelize.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_type WHERE typname = 'enum_permission_level'
            ) THEN
              ALTER TYPE "enum_board_permission_level" RENAME TO "enum_permission_level";
            END IF;
          END
          $$;
        `, { transaction });

      } else {
        console.error("board_permissions table not found!");
        throw new Error("board_permissions table does not exist");
      }

      // 2. Check if role table has permissions column and remove it
      const roleColumns = await queryInterface.describeTable("role");
      if (roleColumns.permissions) {
        console.log("Removing permissions column from role table...");
        await queryInterface.removeColumn("role", "permissions", {
          transaction,
        });
      } else {
        console.log(
          "permissions column doesn't exist in role table, skipping..."
        );
      }

      // 3. Check if role table already has permission_id column
      if (!roleColumns.permission_id) {
        console.log("Adding permission_id to role table...");
        await queryInterface.addColumn(
          "role",
          "permission_id",
          {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
              model: "permissions",
              key: "id",
            },
          },
          { transaction }
        );

        // 4. Update existing roles to have default permission_id
        console.log("Setting default permission_id for existing roles...");
        await queryInterface.sequelize.query(
          `UPDATE role SET permission_id = '00000000-0000-0000-0000-000000000001' WHERE permission_id IS NULL;`,
          { transaction }
        );

        // 5. Make permission_id NOT NULL after setting default values
        console.log("Making permission_id NOT NULL...");
        await queryInterface.changeColumn(
          "role",
          "permission_id",
          {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
              model: "permissions",
              key: "id",
            },
          },
          { transaction }
        );
      } else {
        console.log("permission_id already exists in role table, skipping...");
      }

      // NOTE: We keep board_roles table intact for board access control
      console.log("Keeping board_roles table for board access control...");

      await transaction.commit();
      console.log("Migration completed successfully!");
    } catch (error) {
      console.error("Migration failed:", error);
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove permission_id from role table
      await queryInterface.removeColumn("role", "permission_id", {
        transaction,
      });

      // Add back permissions column to role table
      await queryInterface.addColumn(
        "role",
        "permissions",
        {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        { transaction }
      );

      // Rename permissions back to board_permissions
      await queryInterface.renameTable("permissions", "board_permissions", {
        transaction,
      });

      // Rename enum type back
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_permission_level" RENAME TO "enum_board_permission_level";`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
