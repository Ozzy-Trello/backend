import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { SourceType } from "@/types/custom_field";

export interface CustomFieldRepositoryI {
  getCustomField(filter: filterCustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  createCustomField(data: CustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  deleteCustomField(filter: filterCustomFieldDetail): Promise<number>;
  updateCustomField(filter: filterCustomFieldDetail, data: CustomFieldDetailUpdate): Promise<number>;
  getListCustomField(filter: filterCustomFieldDetail, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldDetail>>>;

  assignToCard(id: string, card_id: string): Promise<number>;
  unAssignFromCard(id: string, card_id: string): Promise<number>;
  getListAssignCard(card_id: string, paginate: Paginate): Promise<ResponseListData<Array<AssignCardDetail>>>;
  updateAssignedCard(id: string, card_id: string, value: CustomFieldCardDetail): Promise<number>;
}

export interface filterCustomFieldDetail {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  source?: SourceType;
  order?: number;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;
  __orSource?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
  __notSource?: string;
}

export class CustomFieldDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;

  constructor(payload: Partial<CustomFieldDetailUpdate>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.order) data.order = this.order;
    return data
  }
}

export class CustomFieldDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public workspace_id!: string;
  public order!: number;
  public source!:  SourceType

  constructor(payload: Partial<CustomFieldDetail>) {
    Object.assign(this, payload);
  }
}

export class AssignCardDetail {
  public order?: number;
  public value?: string | number;

  constructor(payload: Partial<AssignCardDetail>) {
    Object.assign(this, payload);
  }
}

export class CustomFieldCardDetail {
  public order?: string;
  public card_id!: string;
  public value_user_id?: string;
  public value_string?: string;
  public value_number?: number;

  constructor(payload: Partial<CustomFieldDetail>) {
    Object.assign(this, payload);
    this.toObject = this.toObject.bind(this)
  }

  public toObject(): any {
    const data: any = {};
    if (this.order) data.order = this.order;
    if (this.card_id) data.card_id = this.card_id;
    if (this.value_user_id) data.value_user_id = this.value_user_id;
    if (this.value_string) data.value_string = this.value_string;
    if (this.value_number) data.value_number = this.value_number;
    return data
  }
}
