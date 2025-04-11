import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { SourceType, TriggerValue } from './custom_field';

export interface Database {
  board_member: BoardMemberTable;
  user: UserTable;
  workspace: WorkspaceTable;
  workspace_member: WorkspaceMemberTable;
  custom_field: CustomFieldTable;
  custom_value :CustomValueTable;
  trigger: TriggerTable;
  card_custom_field: CardCustomFieldTable;
  card: CardTable;
  board: BoardTable;
  list: ListTable;
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
  id: Generated<string>;
  name: string;
  workspace_id: string;
  trigger_id?: string;
  description: string;
  source: SourceType;
}

export interface CustomValueTable {
  id: Generated<string>;
  workspace_id: string;
  name: string;
  description: string;
}

export interface CustomOptionTable {
  id: Generated<string>;
  custom_value_id: string;
  value: string;
  description: string;
}

export interface CardCustomFieldTable {
  custom_field_id: string;
  order: number;
  card_id: string;
  value_user_id?: string;
  value_number?: number;
  value_string?: string;
  trigger_id?: string;
}

export interface CardTable {
  id: Generated<string>;
  list_id: string;
  name: string;
  description: string;
  order: number;
}

export interface BoardMemberTable {
  board_id: string;
  user_id: string;
  role_id: string;
}

export interface TriggerTable {
  id: Generated<string>;
  name?: string;
  description?: string;
  workspace_id: string;
  all_card: boolean;
  action: TriggerValue;
  condition_value: string;
}

export interface BoardTable {
  id: Generated<string>;
  workspace_id : string;
  name: string;
  description : string;
  background: string;
}

export interface ListTable {
  id : Generated<string>;
  board_id : string;
  order: number;
  name: string;
  background : string;
}