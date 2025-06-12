import { QueryInterface, DataTypes, QueryTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop permissions column as we'll use a separate table for board permissions
      await queryInterface.removeColumn("role", "permissions", { transaction });

      // Keep name as string but ensure it's required and unique
      await queryInterface.changeColumn(
        "role",
        "name",
        {
          type: DataTypes.STRING(128),
          allowNull: false,
          unique: true,
        },
        { transaction }
      );

      // Create board_permissions table with ENUM type for level
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_board_permission_level" AS ENUM ('MEMBER', 'OBSERVER', 'MODERATOR', 'ADMIN');`,
        { transaction }
      );

      await queryInterface.createTable(
        "board_permissions",
        {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
          level: {
            type: DataTypes.ENUM("MEMBER", "OBSERVER", "MODERATOR", "ADMIN"),
            allowNull: false,
            unique: true,
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: "",
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction }
      );

      // Update board_member table if it exists (rename to board_members if needed)
      const boardMemberTableExists = await queryInterface
        .showAllTables()
        .then((tables) => tables.includes("board_member"));

      if (boardMemberTableExists) {
        await queryInterface.sequelize.query(
          `ALTER TABLE board_member RENAME TO board_members;`,
          { transaction }
        );
      }

      // Add permission_id to board_members
      await queryInterface.addColumn(
        "board_members",
        "permission_id",
        {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "board_permissions",
            key: "id",
          },
        },
        { transaction }
      );

      // Update role_id foreign key in board_members to reference the role table
      const constraints = (await queryInterface.getForeignKeysForTables([
        "board_members",
      ])) as {
        [key: string]: Array<{
          column_name: string;
          referenced_table_name: string;
          constraint_name: string;
        }>;
      };
      const boardMemberConstraints = constraints["board_members"] || [];
      const roleConstraint = boardMemberConstraints.find(
        (constraint) =>
          constraint.column_name === "role_id" &&
          constraint.referenced_table_name === "role"
      );

      if (roleConstraint) {
        await queryInterface.removeConstraint(
          "board_members",
          roleConstraint.constraint_name,
          { transaction }
        );
      }

      await queryInterface.changeColumn(
        "board_members",
        "role_id",
        {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "role",
            key: "id",
          },
        },
        { transaction }
      );

      // Remove role_id from workspace_member if it exists
      const tables = await queryInterface.showAllTables();
      const workspaceTableName = tables.includes('workspace_member') ? 'workspace_member' : 'workspace_members';
      
      try {
        const workspaceMemberColumns = await queryInterface.describeTable(workspaceTableName);
        if ("role_id" in workspaceMemberColumns) {
          await queryInterface.removeColumn(workspaceTableName, "role_id", {
            transaction,
          });
        }
      } catch (error) {
        console.log(`Table ${workspaceTableName} does not exist or cannot be described`);
      }

      // Insert default board permissions
      await queryInterface.bulkInsert(
        "board_permissions",
        [
          {
            id: "00000000-0000-0000-0000-000000000001",
            level: "MEMBER",
            description: "Can view and interact with boards",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "00000000-0000-0000-0000-000000000002",
            level: "OBSERVER",
            description: "Can view boards but not modify",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "00000000-0000-0000-0000-000000000003",
            level: "MODERATOR",
            description: "Can manage board content and members",
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: "00000000-0000-0000-0000-000000000004",
            level: "ADMIN",
            description: "Full control over the board",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert workspace_member changes if needed
      const tables = await queryInterface.showAllTables();
      const workspaceTableName = tables.includes('workspace_member') ? 'workspace_member' : 'workspace_members';
      
      try {
        // Add back role_id column to workspace_member/workspace_members
        await queryInterface.addColumn(
          workspaceTableName,
          "role_id",
          {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
              model: "role",
              key: "id",
            },
          },
          { transaction }
        );
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Could not add role_id to ${workspaceTableName}:`, errorMessage);
      }

      // Revert board_members changes if needed
      const boardMembersTableExists = await queryInterface
        .showAllTables()
        .then((tables) => tables.includes("board_members"));

      if (boardMembersTableExists) {
        // Remove permission_id column
        await queryInterface.removeColumn("board_members", "permission_id", {
          transaction,
        });

        // Rename back to board_member if it was renamed
        await queryInterface.sequelize.query(
          `ALTER TABLE board_members RENAME TO board_member;`,
          { transaction }
        );
      }

      // Drop the board_permissions table if it exists
      const boardPermissionsTableExists = await queryInterface
        .showAllTables()
        .then((tables) => tables.includes("board_permissions"));

      if (boardPermissionsTableExists) {
        await queryInterface.dropTable("board_permissions", { transaction });
      }

      // Revert role table changes - just drop the board permission enum
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "enum_board_permission_level";`,
        { transaction }
      );

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

      await queryInterface.sequelize.query(
        `ALTER TABLE "role" 
         RENAME COLUMN "created_at" TO "createdAt";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `ALTER TABLE "role" 
         RENAME COLUMN "updated_at" TO "updatedAt";`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
