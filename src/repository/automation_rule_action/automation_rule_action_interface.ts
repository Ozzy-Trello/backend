import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface AutomationRuleActionRepositoryI {
  bulkCreateActions(actions: AutomationRuleActionDetail[]): Promise<ResponseData<AutomationRuleActionDetail[]>>
  getAction(filter: filterAutomationRuleAction): Promise<ResponseData<AutomationRuleActionDetail>>;
  createAction(data: filterAutomationRuleAction): Promise<ResponseData<AutomationRuleActionDetail>>;
  deleteAction(filter: filterAutomationRuleAction): Promise<number>;
  updateAction(filter: filterAutomationRuleAction, data: AutomationRuleActionUpdate): Promise<number>;
  getActionList(filter: filterAutomationRuleAction, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleActionDetail>>>;
  getByRuleId(rule_id: string): Promise<ResponseData<Array<AutomationRuleActionDetail>>>;
}

export interface filterAutomationRuleAction {
  id?: string;
  rule_id?: string;
  rule_ids?: string[];
  group_type?: string;
  type?: string;
  condition?: Record<string, any>;

  __orId?: string;
  __orRuleId?: string;
  __orGroupType?: string;
  __orType?: string;

  __notId?: string;
  __notRuleId?: string;
  __notGroupType?: string;
  __notType?: string;
}

export class AutomationRuleActionDetail {
  public id?: string;
  public rule_id!: string;
  public group_type!: string;
  public type!: string;
  public condition!: Record<string, any>;
  public created_at?: Date;

  constructor(payload: Partial<AutomationRuleActionDetail>) {
    Object.assign(this, payload);
  }
}

export class AutomationRuleActionUpdate {
  public group_type?: string;
  public type?: string;
  public condition?: any;

  constructor(payload: Partial<AutomationRuleActionUpdate>) {
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
