import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { SourceType } from './custom_field';

export interface Database {
  user: UserTable;
  workspace: WorkspaceTable;
  workspace_member: WorkspaceMemberTable;
  custom_field: CustomFieldTable;
  card_custom_field: CardCustomFieldTable;
  card: CardTable;
}

export interface UserTable {
  id: Generated<string>;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface WorkspaceTable {
  id: Generated<string>;
  name: string;
  slug: string;
  description: string;
}

export interface WorkspaceMemberTable {
  user_id: string;
  workspace_id: string;
  role_id: string;
}

export interface CustomFieldTable {
  id: string;
  name: string;
  workspace_id: string;
  description: string;
  source: SourceType;
}

export interface CardCustomFieldTable {
  custom_field_id: string;
  order: number;
  card_id: string;
  value_user_id?: string;
  value_number?: number;
  value_string?: string;
}

export interface CardTable {
  id: string;
  list_id: string;
  name: string;
  description: string;
  order: number;
}