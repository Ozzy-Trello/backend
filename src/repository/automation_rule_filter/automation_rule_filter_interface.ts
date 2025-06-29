import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";

export interface AutomationRuleFilterRepositoryI {
  bulkCreateFilters(actions: AutomationRuleFilterDetail[]): Promise<ResponseData<AutomationRuleFilterDetail[]>>
  getFilter(filter: filterAutomationRuleFilter): Promise<ResponseData<AutomationRuleFilterDetail>>;
  createFilter(data: filterAutomationRuleFilter): Promise<ResponseData<AutomationRuleFilterDetail>>;
  deleteFilter(filter: filterAutomationRuleFilter): Promise<number>;
  updateFilter(filter: filterAutomationRuleFilter, data: AutomationRuleFilterUpdate): Promise<number>;
  getFilterList(filter: filterAutomationRuleFilter, paginate: Paginate): Promise<ResponseListData<Array<AutomationRuleFilterDetail>>>;
  getByRuleId(rule_id: string): Promise<ResponseData<Array<AutomationRuleFilterDetail>>>;
}

export interface filterAutomationRuleFilter {
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

export class AutomationRuleFilterDetail {
  public id?: string;
  public rule_id!: string;
  public group_type!: string;
  public type!: string;
  public condition!: Record<string, any>;
  public created_at?: Date;

  constructor(payload: Partial<AutomationRuleFilterDetail>) {
    Object.assign(this, payload);
  }
}

export class AutomationRuleFilterUpdate {
  public group_type?: string;
  public type?: string;
  public condition?: any;

  constructor(payload: Partial<AutomationRuleFilterUpdate>) {
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
