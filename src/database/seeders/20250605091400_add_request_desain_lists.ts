import sequelize from '@/database/connections';

// Request Desain board ID
const REQUEST_DESAIN_BOARD_ID = '371f1368-716e-4ecf-8957-7e515ce5784c';

// Lists for Request Desain board
const LISTS = [
  {
    id: '3e2c8981-2f8d-4d28-9e83-51e68d32b3f6',
    name: 'Filter Deal Maker',
    order: 1,
    card_limit: null,
    background: '#F0F2F5'
  },
  {
    id: 'f5a9c254-0a77-41c4-b317-3c4b57dcfa90',
    name: 'Filter Desain Terhandle',
    order: 2,
    card_limit: null,
    background: '#E4F0F6'
  },
  {
    id: '8bfc35a3-315b-4c87-a3e7-7b9f054ce67d',
    name: 'Filter Desain Pending',
    order: 3,
    card_limit: null,
    background: '#F5EEE6'
  },
  {
    id: '9a3d3be7-5b15-48ef-b15f-b6a9cb680812',
    name: 'Request New Desain',
    order: 4,
    card_limit: 9,
    background: '#E8F4EA'
  },
  {
    id: 'b1de4c60-4f03-4fc6-9b37-6c6f865659c0',
    name: 'Desain Terambil',
    order: 5,
    card_limit: 20,
    background: '#FAF3E0'
  },
  {
    id: '7f62b237-cf71-4688-bb0b-4bc4460a8d5d',
    name: 'Terbit PO',
    order: 6,
    card_limit: 1,
    background: '#EAE4F2'
  },
  {
    id: '5fd18642-08a3-4e7a-9675-7983cd75e1fd',
    name: 'Revisi Desain',
    order: 7,
    card_limit: 10,
    background: '#FFEBEE'
  },
  {
    id: 'b9ac3dc3-7319-43b1-9c3e-f5c9871b1516',
    name: 'Terkirim ke DM',
    order: 8,
    card_limit: 10,
    background: '#E0F7FA'
  },
  {
    id: '0dd3d6e6-5896-4704-b993-7b2df98ec71f',
    name: 'Terkirim ke Konsumen',
    order: 9,
    card_limit: 1,
    background: '#E8EAF6'
  },
  {
    id: '6bb32dc4-0c13-4190-9b9f-d43d25e2a59b',
    name: 'Desain ACC',
    order: 10,
    card_limit: 10,
    background: '#F3E5F5'
  },
  {
    id: 'a2c6dc9b-8f06-4e6a-8e42-46e4e6a6b7d5',
    name: 'Stamp',
    order: 11,
    card_limit: 100,
    background: '#FFF3E0'
  },
  {
    id: '6f1d6e2e-bdc2-4438-8f94-f1b81bc9609a',
    name: 'Follow Up Desain',
    order: 12,
    card_limit: 100,
    background: '#E0F2F1'
  },
  {
    id: 'd473fbfc-ecc3-4ecf-b3b0-557a160f25bb',
    name: 'Desain Closing',
    order: 13,
    card_limit: 1,
    background: '#FAFAFA'
  },
  {
    id: '2e6e0d61-0ef0-4cfa-8032-0b819ffcfb87',
    name: 'Closing Terpending',
    order: 14,
    card_limit: 1,
    background: '#ECEFF1'
  }
];

export async function up(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Check if the Request Desain board exists
    const board = await queryInterface.select(null, 'board', {
      where: {
        id: REQUEST_DESAIN_BOARD_ID
      }
    });

    if (!board || board.length === 0) {
      console.log(`Board with ID ${REQUEST_DESAIN_BOARD_ID} does not exist, skipping list creation`);
      return;
    }

    // Create each list with its specific ID
    for (const list of LISTS) {
      // Check if list already exists
      const existingList = await queryInterface.select(null, 'list', {
        where: {
          id: list.id
        }
      });

      if (existingList && existingList.length > 0) {
        console.log(`List with ID ${list.id} (${list.name}) already exists, skipping`);
        continue;
      }

      await queryInterface.bulkInsert('list', [{
        id: list.id,
        board_id: REQUEST_DESAIN_BOARD_ID,
        name: list.name,
        order: list.order,
        card_limit: list.card_limit,
        background: list.background,
        created_at: new Date(),
        updated_at: new Date()
      }]);

      console.log(`Created list: ${list.name} with ID: ${list.id}`);
    }

    console.log('All Request Desain lists created successfully');
  } catch (error) {
    console.error('Error creating Request Desain lists:', error);
    throw error;
  }
}

export async function down(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // Delete each list by ID
    for (const list of LISTS) {
      await queryInterface.bulkDelete('list', {
        id: list.id
      });
      console.log(`Deleted list: ${list.name} with ID: ${list.id}`);
    }
    
    console.log('All Request Desain lists deleted successfully');
  } catch (error) {
    console.error('Error deleting Request Desain lists:', error);
    throw error;
  }
}
