import { Generated } from "kysely";
import {
  CardActionValue,
  CardActivityType,
  ConditionType,
  EnumCustomFieldType,
  EnumCustomFieldSource,
  TriggerTypes,
} from "@/types/custom_field";
import { AutomationCondition } from "./trigger";
import { PermissionStructure } from "@/utils/security_utils";

export interface Database {
  board_member: BoardMemberTable;
  user: UserTable;
  workspace: WorkspaceTable;
  workspace_member: WorkspaceMemberTable;
  custom_field: CustomFieldTable;
  custom_value: CustomValueTable;
  trigger: TriggerTable;
  card_custom_field: CardCustomFieldTable;
  card: CardTable;
  board: BoardTable;
  list: ListTable;
  card_activity: CardActivityTable;
  card_activity_action: CardActivityActionTable;
  card_activity_text: CardActionTextTable;
  accurate_auth: AccurateAuth;
  request: RequestTable;
  role: RoleTable;
  label: LabelTable;
  card_label: CardLabelTable;
  card_member: CardMemberTable;
  split_job_template: SplitJobTemplateTable;
  split_job_value: SplitJobValueTable;
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
  source: EnumCustomFieldSource;
  type: EnumCustomFieldType;
  is_show_at_front: boolean;
  options?: any;
  order: number;
  can_view?: string[];
  can_edit?: string[];
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
  order?: number;
  card_id: string;
  value_user_id?: string;
  value_number?: number;
  value_string?: string;
  value_date?: Date;
  value_option?: string;
  value_checkbox?: boolean;
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
  location?: string;
  archive?: boolean;
  start_date?: Date;
  due_date?: Date;
  due_date_reminder?: string;
  is_complete?: boolean;
  completed_at?: Date;
  mirror_id?: string;
  created_at?: Date;
  updated_at?: Date;
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
  workspace_id: string;
  name: string;
  description: string;
  background: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ListTable {
  id: string;
  board_id: string;
  order: number;
  name: string;
  background: string;
  card_limit: number;
  created_by?: string;
  updated_by?: string;
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

export interface AccurateAuth {
  id: Generated<string>;
  token: string;
  db_session: string;
  expiry_date: Date;
}

export interface RequestTable {
  id: Generated<number>;
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  is_verified: boolean;
  adjustment_no?: string;
  description?: string;
  item_name?: string;
  adjustment_name?: string;
  request_sent?: number;
  request_received?: number;
  production_recieved?: boolean;
  warehouse_returned?: boolean;
  warehouse_final_used_amount?: number;
  authorized_by?: string;
  warehouse_user?: string;
  production_user?: string;
  is_rejected: boolean;
  is_done: boolean;
  satuan?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface RoleTable {
  id: Generated<string>;
  name: string;
  description: string;
  permissions: PermissionStructure;
  default: boolean;
}

export interface LabelTable {
  id: string;
  name: string;
  value?: string;
  workspace_id: string;
  value_type: "color" | "user" | "custom_field";
  created_at?: Date;
  updated_at?: Date;
}

export interface CardLabelTable {
  id: string;
  card_id: string;
  label_id: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CardMemberTable {
  id: string;
  card_id: string;
  user_id: string;
  created_at: Date;
}

export interface SplitJobTemplateTable {
  id: Generated<string>;
  name: string;
  workspace_id: string;
  custom_field_id: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface SplitJobValueTable {
  id: Generated<string>;
  name: string;
  split_job_template_id: string;
  card_id: string;
  custom_field_id: string;
  value: number;
  created_at?: Date;
  updated_at?: Date;
}
