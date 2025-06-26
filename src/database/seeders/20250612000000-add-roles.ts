import { QueryInterface } from "sequelize";
import {
  PERMISSION_IDS,
  DEFAULT_ROLE_PERMISSIONS,
} from "../../constants/permissions";

const ROLES = [
  {
    id: "29c11c13-89cb-4cc2-b7c3-1b82de1c197e",
    name: "Deal Maker",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SALES_MARKETING,
  },
  {
    id: "ed377c33-b6cc-4f3b-930c-81c95f8fc007",
    name: "SPV Deal Maker",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "06c83a45-d0cd-4cc3-ae30-3c77c54f72b4",
    name: "Desainer Outlet",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "146993a6-4865-4682-982a-24fc585ce213",
    name: "SPV Outlet",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "e1988ff5-c257-4a2b-8913-1e58c6f5db96",
    name: "PPIC",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "2b6cf6fd-622e-4123-9584-65f09312d0d3",
    name: "Purchasing",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "5e7d34db-bc4d-4528-a15a-018be6ae3d08",
    name: "Warehouse Bahan",
    permission_id: DEFAULT_ROLE_PERMISSIONS.WAREHOUSE,
  },
  {
    id: "c5ec6dce-5cb3-4f99-a406-4762ec5466e5",
    name: "Warehouse Produk",
    permission_id: DEFAULT_ROLE_PERMISSIONS.WAREHOUSE,
  },
  {
    id: "d47cbab7-03be-419c-ae33-30b4cd3c31d8",
    name: "Kepala Produksi",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "e89805cd-89d5-4db7-b0f7-c76c71ff16a9",
    name: "Cutting",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "a8e4de42-2c4c-40e3-a1ff-8ee42dfd065f",
    name: "Numbering",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "b91d8ac4-08fa-4c4a-9347-4f97eb93cd49",
    name: "Helper Line",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "24c6b4b8-645c-4b79-a2c6-f98fcde962c8",
    name: "SPV Sewing",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "ce58a878-422c-4cbe-a85a-6e60e17ef342",
    name: "QC",
    permission_id: DEFAULT_ROLE_PERMISSIONS.QC,
  },
  {
    id: "b78ce640-418f-4076-b065-36a78db4f63d",
    name: "SPV Desainer Bordir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "09b04c89-d80f-4cfd-a2f4-dfc739a2c020",
    name: "Desainer Bordir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "77fd7079-6ddf-4035-8ee5-2a3bd0aa8826",
    name: "SPV Operator Bordir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "c7c84070-f0c4-4961-92bb-0a38bb9cd153",
    name: "Operator Bordir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "21f82c53-4899-4030-ae7c-4f365db2c6e4",
    name: "Finishing Bordir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "df1ad0b1-6c2e-445c-9757-088f0fe1a105",
    name: "Finishing & Packing",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "97c2a01f-02b4-4a3d-92e3-83717479e52f",
    name: "SPV Kurir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPERVISOR,
  },
  {
    id: "fb78b8bc-c4de-4403-91d7-46b0877b36d0",
    name: "Kurir",
    permission_id: DEFAULT_ROLE_PERMISSIONS.PRODUCTION,
  },
  {
    id: "ac7a7e4b-84b2-43fd-9e90-4f66b23ab9cb",
    name: "RnD",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "dc7adab8-ec92-4953-a449-5e19df8cd29e",
    name: "Content Creator",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "8126593e-18f4-48ea-b6c6-c2e5d65be5bc",
    name: "BE",
    permission_id: DEFAULT_ROLE_PERMISSIONS.MANAGEMENT,
  },
  {
    id: "812fd3cb-c6b6-470c-9295-7f285f0b3b27",
    name: "Advertiser",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SALES_MARKETING,
  },
  {
    id: "d2dd1838-f8cb-4c48-82f4-9367aa47fe9d",
    name: "Desain Grafis",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "6847b166-24ed-4ab5-804b-7147681ffdab",
    name: "Multi Media",
    permission_id: DEFAULT_ROLE_PERMISSIONS.CREATIVE,
  },
  {
    id: "4497eab3-203f-4fc4-8377-963f9149de0a",
    name: "Manajer Sales & Marketing",
    permission_id: DEFAULT_ROLE_PERMISSIONS.MANAGEMENT,
  },
  {
    id: "f97c942c-5d0c-49c3-b74d-5b149c08634f",
    name: "Super Admin",
    permission_id: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
  },
];

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkInsert(
        "role",
        ROLES.map((role) => ({
          id: role.id,
          name: role.name,
          description: `Role for ${role.name}`,
          permission_id: role.permission_id,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction }
      );

      const superAdminId = ROLES.find((r) => r.name === "Super Admin")?.id;

      if (superAdminId) {
        await queryInterface.sequelize.query(
          `UPDATE "user" SET role_id = :roleId WHERE role_id IS NULL`,
          {
            replacements: { roleId: superAdminId },
            transaction,
          }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete("role", {
      id: ROLES.map((role) => role.id),
    });
  },
};
