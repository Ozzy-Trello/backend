'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // List of tables to modify
    const tables = [
      'role',
      'user',
      'workspace',
      'workspace_member',
      'board',
      'board_member',
      'list',
      'card',
      'tag',
      'card_tag',
      'card_activity',
      'card_activity_text',
      'card_activity_action',
      'custom_field',
      'card_custom_field'
    ];

    for (const table of tables) {
      // Check if the camelCase columns exist before trying to modify them
      const tableInfo = await queryInterface.describeTable(table);
      
      if (tableInfo.createdAt) {
        // Step 1: Create new column if it doesn't exist
        if (!tableInfo.created_at) {
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            ADD COLUMN created_at TIMESTAMP WITHOUT TIME ZONE
          `);
          
          // Step 2: Copy data directly with TO_TIMESTAMP function to handle time -> timestamp conversion
          await queryInterface.sequelize.query(`
            UPDATE "${table}" 
            SET created_at = TO_TIMESTAMP(EXTRACT(HOUR FROM "createdAt") || ':' || 
                             EXTRACT(MINUTE FROM "createdAt") || ':' || 
                             EXTRACT(SECOND FROM "createdAt"), 'HH24:MI:SS')
          `);
          
          // Step 3: Set not null and default constraints
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            ALTER COLUMN created_at SET NOT NULL,
            ALTER COLUMN created_at SET DEFAULT NOW()
          `);
          
          // Step 4: Drop old column
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            DROP COLUMN "createdAt"
          `);
        }
      }
      
      if (tableInfo.updatedAt) {
        // Step 1: Create new column if it doesn't exist
        if (!tableInfo.updated_at) {
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE
          `);
          
          // Step 2: Copy data directly with TO_TIMESTAMP function
          await queryInterface.sequelize.query(`
            UPDATE "${table}" 
            SET updated_at = 
              CASE 
                WHEN "updatedAt" IS NOT NULL THEN 
                  TO_TIMESTAMP(EXTRACT(HOUR FROM "updatedAt") || ':' || 
                               EXTRACT(MINUTE FROM "updatedAt") || ':' || 
                               EXTRACT(SECOND FROM "updatedAt"), 'HH24:MI:SS')
                ELSE NULL
              END
          `);
          
          // Step 3: Drop old column
          await queryInterface.sequelize.query(`
            ALTER TABLE "${table}" 
            DROP COLUMN "updatedAt"
          `);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // List of tables to revert
    const tables = [
      'role',
      'user',
      'workspace',
      'workspace_member',
      'board',
      'board_member',
      'list',
      'card',
      'tag',
      'card_tag',
      'card_activity',
      'card_activity_text',
      'card_activity_action',
      'custom_field',
      'card_custom_field'
    ];

    for (const table of tables) {
      // Check if the snake_case columns exist
      const tableInfo = await queryInterface.describeTable(table);
      
      if (tableInfo.created_at && !tableInfo.createdAt) {
        // Step 1: Create new column
        await queryInterface.sequelize.query(`
          ALTER TABLE "${table}" 
          ADD COLUMN "createdAt" TIME WITHOUT TIME ZONE
        `);
        
        // Step 2: Copy time part of the timestamp
        await queryInterface.sequelize.query(`
          UPDATE "${table}" 
          SET "createdAt" = created_at::time
        `);
        
        // Step 3: Set not null and default constraints
        await queryInterface.sequelize.query(`
          ALTER TABLE "${table}" 
          ALTER COLUMN "createdAt" SET NOT NULL,
          ALTER COLUMN "createdAt" SET DEFAULT NOW()
        `);
        
        // Step 4: Drop new column
        await queryInterface.sequelize.query(`
          ALTER TABLE "${table}" 
          DROP COLUMN created_at
        `);
      }
      
      if (tableInfo.updated_at && !tableInfo.updatedAt) {
        // Step 1: Create new column
        await queryInterface.sequelize.query(`
          ALTER TABLE "${table}" 
          ADD COLUMN "updatedAt" TIME WITHOUT TIME ZONE
        `);
        
        // Step 2: Copy time part of the timestamp
        await queryInterface.sequelize.query(`
          UPDATE "${table}" 
          SET "updatedAt" = 
            CASE 
              WHEN updated_at IS NOT NULL THEN updated_at::time
              ELSE NULL
            END
        `);
        
        // Step 3: Drop new column
        await queryInterface.sequelize.query(`
          ALTER TABLE "${table}" 
          DROP COLUMN updated_at
        `);
      }
    }
  }
};