import { Generated } from 'kysely';
import { CardActionValue, CardActivityType, ConditionType, SourceType, TriggerTypes } from '@/types/custom_field';
import { AutomationCondition } from './trigger';

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
  card_activity: CardActivityTable;
  card_activity_action: CardActivityActionTable;
  card_activity_text: CardActionTextTable;
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
  name?: string;
  workspace_id: string;
  trigger_id?: string;
  description: string;
  source: SourceType;
}

export interface BoardCustomFieldTable {
  board_id: string;
  custom_field_id: string;
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
  id: string;
  list_id: string;
  type: string;
  name: string;
  description: string;
  order: number;
  dash_config?: any;
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
  group_type: TriggerTypes;
  condition_type: ConditionType; //type
  action: string;
  condition: AutomationCondition;
}

export interface BoardTable {
  id: Generated<string>;
  workspace_id : string;
  name: string;
  description : string;
  background: string;
}

export interface ListTable {
  id : string;
  board_id : string;
  order: number;
  name: string;
  background : string;
  card_limit: number;
}

export interface CardActivityTable {
  id: Generated<string>;
  sender_user_id: string;
  card_id: string;
  activity_type: CardActivityType;
}

export interface CardActionTextTable {
  id: Generated<string>;
  activity_id: string;
  text: string;
}

export interface CardActivityActionTable {
  id: Generated<string>;
  activity_id: string;
  // action: CardActionType;
  source: CardActionValue;
}