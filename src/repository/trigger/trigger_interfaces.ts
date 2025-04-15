import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { TriggerValue } from "@/types/custom_field";

export interface TriggerRepositoryI {
  createTrigger(data : TriggerDetail): Promise<ResponseData<TriggerDetail>>;
  getTrigger(filter: filterTriggerDetail): Promise<ResponseData<TriggerDetail>>;
  deleteTrigger(filter: filterTriggerDetail): Promise<number>;
  updateTrigger(filter: filterTriggerDetail, data: TriggerDetailUpdate): Promise<number>;
  getListTrigger(filter: filterTriggerDetail, paginate: Paginate): Promise<ResponseListData<Array<TriggerDetail>>>;
}

export interface filterTriggerDetail {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;

  __orId?: string;
  __orName?: string;
  __orWorkspaceId?: string;
  __orDescription?: string;

  __notId?: string;
  __notName?: string;
  __notWorkspaceId?: string;
  __notDescription?: string;
}

export class TriggerDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;

  constructor(payload: Partial<TriggerDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    return data
  }
}

export class TriggerDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public condition_value!: string;
  public workspace_id!: string;
  public all_card?: boolean;
  public action!: TriggerValue;

  constructor(payload: Partial<TriggerDetail>) {
    Object.assign(this, payload);
  }
}
