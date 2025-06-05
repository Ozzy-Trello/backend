import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

// Interface
export interface AutomationRuleRepositoryI {
  getRule(filter: filterAutomationRule): Promise<ResponseData<AutomationRuleDetail>>;
  createRule(data: AutomationRuleDetail): Promise<ResponseData<AutomationRuleDetail>>;
  deleteRule(filter: filterAutomationRule): Promise<number>;
  updateRule(filter: filterAutomationRule, data: AutomationRuleUpdate): Promise<number>;
  getRuleList(filter: filterAutomationRule, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleDetail>>>;
  matchRules(filter: filterAutomationRule): Promise<ResponseData<Array<AutomationRuleDetail>>>
}

// Filter
export interface filterAutomationRule {
  id?: string;
  workspace_id?: string;
  group_type?: string;
  type?: string;
  condition?: Record<string, any>;

  __orId?: string;
  __orWorkspaceId?: string;
  __orGroupType?: string;
  __orType?: string;

  __notId?: string;
  __notWorkspaceId?: string;
  __notGroupType?: string;
  __notType?: string;
}

// Detail
export class AutomationRuleDetail {
  public id?: string;
  public workspace_id!: string;
  public group_type!: string;
  public type!: string;
  public condition!: any;
  public action?: any[];
  public created_at?: Date;
  public updated_at?: Date;

  constructor(payload: Partial<AutomationRuleDetail>) {
    Object.assign(this, payload);
  }
}

// Updater
export class AutomationRuleUpdate {
  public group_type?: string;
  public type?: string;
  public condition?: any;

  constructor(payload: Partial<AutomationRuleUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.group_type) data.group_type = this.group_type;
    if (this.type) data.type = this.type;
    if (this.condition) data.condition = this.condition;
    return data;
  }
}
