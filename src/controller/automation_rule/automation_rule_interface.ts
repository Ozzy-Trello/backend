import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { validate as isValidUUID } from "uuid";
import { AutomationRuleDetail, filterAutomationRule } from "@/repository/automation_rule/automation_rule_interface";
import { AutomationRuleActionDetail } from "@/repository/automation_rule_action/automation_rule_action_interface";
import { CardDetail } from "@/repository/card/card_interfaces";
import { UserActionEvent } from "@/types/event";


export interface AutomationRuleControllerI {
  CreateAutomationRule(user_id: string, data: AutomationRuleCreateData): Promise<ResponseData<AutomationRuleDetail>>;
  // GetAutomationRule(filter: AutomationRuleFilter): Promise<ResponseData<AutomationRuleResponse>>;
  GetListAutomationRule(filter: AutomationRuleFilter, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleDetail>>>;
  // DeleteAutomationRule(filter: AutomationRuleFilter): Promise<ResponseData<null>>;
  // UpdateAutomationRule(filter: AutomationRuleFilter, data: UpdateAutomationRuleData): Promise<ResponseData<null>>;
  FindMatchingRules(recentUserAction: UserActionEvent, filter: AutomationRuleFilter): Promise<ResponseData<Array<AutomationRuleDetail>>>;
}

// represent 'yang baru aja dilakukan user'
export class RecentUserAction {
  card?: CardDetail
}

export class CreateAutomationRuleResponse {
  id!: string;
  constructor(payload: Partial<CreateAutomationRuleResponse>) {
    Object.assign(this, payload);
  }
}

export class AutomationRuleResponse {
  id!: string;
  type!: string;
  group_type?: string;
  condition?: Record<string, any>;
  actions?: Array<AutomationRuleActionResponse>;

  constructor(payload: Partial<AutomationRuleResponse>) {
    Object.assign(this, payload);
  }
}

export class AutomationRuleActionResponse {
  id!: string;
  rule_id!: string;
  type!: string;
  config?: string;

  constructor(payload: Partial<AutomationRuleActionResponse>) {
    Object.assign(this, payload);
  }
}

export function fromAutomationRuleDetailToResponse(
  detail: AutomationRuleDetail,
  actions?: AutomationRuleActionDetail[]
): AutomationRuleResponse {
  return new AutomationRuleResponse({
    id: detail.id,
    type: detail.type,
    group_type: detail.group_type,
    actions: actions?.map((a) => new AutomationRuleActionResponse(a)) || [],
  });
}

export class AutomationRuleFilter {
  id?: string;
  group_type?: string;
  type?: string;
  workspace_id?: string;
  condition?: Record<any, string>;

  constructor(payload: Partial<AutomationRuleFilter>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
    this.toFilterAutomationRuleDetail = this.toFilterAutomationRuleDetail.bind(this);
  }

  isEmpty(): boolean {
    return !this.id && !this.group_type && !this.workspace_id;
  }

  toFilterAutomationRuleDetail(): filterAutomationRule {
    return {
      id: this.id,
      group_type: this.group_type,
      workspace_id: this.workspace_id,
      condition: this.condition
    };
  }
}

export class AutomationRuleActionData {
  type!: string;
  groupType!: string;
  condition?: Record<string, any>;

  constructor(payload: Partial<AutomationRuleActionData>) {
    Object.assign(this, payload);
  }
}

export class AutomationRuleCreateData {
  id?: string;
  workspace_id!: string;
  group_type?: string;
  type!: string;
  condition!: Record<string, any>;
  action!: AutomationRuleActionData[];

  constructor(payload: Partial<AutomationRuleCreateData>) {
    Object.assign(this, payload);
    this.checkRequired = this.checkRequired.bind(this);
    this.getErrorField = this.getErrorField.bind(this);
    this.toAutomationRuleDetail = this.toAutomationRuleDetail.bind(this);
  }

  checkRequired(): string | null {
    if (!this.workspace_id) return "workspace_id";
    if (!this.type) return "type";
    if (!this.action || this.action.length === 0) return "action";
    return null;
  }

  getErrorField(): string | null {
    if (this.workspace_id && !isValidUUID(this.workspace_id)) {
      return "'workspace_id' is not a valid UUID";
    }

    if (this.condition?.board && !isValidUUID(this.condition.board)) {
      return "'condition.board' is not a valid UUID";
    }

    return null;
  }

  toAutomationRuleDetail(): AutomationRuleDetail {
    return new AutomationRuleDetail({
      id: this.id,
      workspace_id: this.workspace_id,
      group_type: this.group_type,
      type: this.type,
      condition: this.condition,
      action: this.action,
    });
  }
}

export class UpdateAutomationRuleData {
  type?: string;
  groupType?: string;

  constructor(payload: Partial<UpdateAutomationRuleData>) {
    Object.assign(this, payload);
    this.isEmpty = this.isEmpty.bind(this);
  }

  isEmpty(): boolean {
    return !this.type && !this.groupType;
  }

}
