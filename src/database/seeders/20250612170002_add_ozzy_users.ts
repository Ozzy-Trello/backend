import { QueryInterface, QueryTypes } from "sequelize";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const USERS: UserData[] = [
  {
    id: uuidv4(),
    username: "henry",
    email: "henry@ozzyclothing.co.id",
    password: "1313",
    phone: "082118555569",
    role: "Super Admin",
  },
  {
    id: uuidv4(),
    username: "sianna",
    email: "sianna@ozzyclothing.co.id",
    password: "123456",
    phone: "087839404154",
    role: "SPV Deal Maker",
  },
  {
    id: uuidv4(),
    username: "lenni",
    email: "lenni@ozzyclothing.co.id",
    password: "123456",
    phone: "082177772724",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "ramli",
    email: "ramli@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "devi",
    email: "devi@ozzyclothing.co.id",
    password: "123456",
    phone: "082220014001",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "cipto",
    email: "cipto@ozzyclothing.co.id",
    password: "123456",
    phone: "087891979191",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "clarista",
    email: "clarista@ozzyclothing.co.id",
    password: "123456",
    phone: "089699999586",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "debby",
    email: "debby@ozzyclothing.co.id",
    password: "123456",
    phone: "082240014007",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "uswatun",
    email: "uswatun@ozzyclothing.co.id",
    password: "123456",
    phone: "081378847884",
    role: "Deal Maker",
  },
  {
    id: uuidv4(),
    username: "tyo",
    email: "tyo@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Desainer Outlet",
  },
  {
    id: uuidv4(),
    username: "raka",
    email: "raka@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Desainer Outlet",
  },
  {
    id: uuidv4(),
    username: "ridwan",
    email: "ridwan@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Desainer Outlet",
  },
  {
    id: uuidv4(),
    username: "winner",
    email: "winner@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Desainer Outlet",
  },
  {
    id: uuidv4(),
    username: "fananda",
    email: "fananda@ozzyclothing.co.id",
    password: "123456",
    phone: "",
    role: "Desainer Outlet",
  },
];

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Get all roles first
      const roles = (await queryInterface.sequelize.query<{
        id: string;
        name: string;
      }>("SELECT id, name FROM role", {
        type: QueryTypes.SELECT,
        transaction,
      })) as Array<{ id: string; name: string }>;

      const roleMap = new Map(roles.map((role) => [role.name, role.id]));

      // Process each user
      for (const userData of USERS) {
        // Check if user already exists
        const [existingUser] = (await queryInterface.sequelize.query<{
          id: string;
        }>('SELECT id FROM "user" WHERE email = :email', {
          replacements: { email: userData.email },
          type: QueryTypes.SELECT,
          transaction,
        })) as Array<{ id: string }>;

        if (!existingUser) {
          // Hash password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(
            userData.password,
            saltRounds
          );

          // Get role ID
          const roleId = roleMap.get(userData.role);

          if (!roleId) {
            console.warn(
              `Role '${userData.role}' not found for user ${userData.username}`
            );
            continue;
          }

          // Insert user
          await queryInterface.bulkInsert(
            "user",
            [
              {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                phone: userData.phone || null,
                role_id: roleId,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
            { transaction }
          );

          console.log(
            `Created user: ${userData.username} (${userData.email}) with role ${userData.role}`
          );
        } else {
          console.log(`User already exists: ${userData.email}`);
        }
      }

      await transaction.commit();
      console.log("Successfully seeded users");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in add_ozzy_users seeder:", error);
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete all users except the first one (usually the admin)
      await queryInterface.sequelize.query(
        'DELETE FROM "user" WHERE id NOT IN (SELECT id FROM "user" ORDER BY created_at LIMIT 1)',
        { transaction }
      );

      await transaction.commit();
      console.log("Successfully removed seeded users");
    } catch (error) {
      await transaction.rollback();
      console.error("Error rolling back add_ozzy_users seeder:", error);
      throw error;
    }
  },
};
