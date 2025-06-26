// Static Permission IDs - these match the UUIDs created in the setup migration
export const PERMISSION_IDS = {
  MEMBER: "00000000-0000-0000-0000-000000000001",
  OBSERVER: "00000000-0000-0000-0000-000000000002",
  MODERATOR: "00000000-0000-0000-0000-000000000003",
  ADMIN: "00000000-0000-0000-0000-000000000004",
} as const;

// Permission levels enum for type safety
export type PermissionLevel = keyof typeof PERMISSION_IDS;

// Helper function to get permission ID by level
export function getPermissionId(level: PermissionLevel): string {
  return PERMISSION_IDS[level];
}

// Default permission assignments for different role types
export const DEFAULT_ROLE_PERMISSIONS = {
  // Production roles - mostly MEMBER level with some MODERATOR
  PRODUCTION: PERMISSION_IDS.MEMBER,
  SUPERVISOR: PERMISSION_IDS.MODERATOR,
  WAREHOUSE: PERMISSION_IDS.MEMBER,
  QC: PERMISSION_IDS.MEMBER,

  // Management roles - ADMIN level
  MANAGEMENT: PERMISSION_IDS.ADMIN,
  SUPER_ADMIN: PERMISSION_IDS.ADMIN,

  // Creative roles - MEMBER level
  CREATIVE: PERMISSION_IDS.MEMBER,

  // Sales & Marketing - MODERATOR level
  SALES_MARKETING: PERMISSION_IDS.MODERATOR,
} as const;
