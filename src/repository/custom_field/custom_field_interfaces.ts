import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {Paginate} from "@/utils/data_utils";
import { FieldType } from "@/types/custom_field";

export interface CustomFieldRepositoryI {
  getCustomField(filter: filterCustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  createCustomField(data: CustomFieldDetail): Promise<ResponseData<CustomFieldDetail>>;
  deleteCustomField(filter: filterCustomFieldDetail): Promise<number>;
  updateCustomField(filter: filterCustomFieldDetail, data: CustomFieldDetailUpdate): Promise<number>;
  getListCustomField(filter: filterCustomFieldDetail, paginate: Paginate): Promise<ResponseListData<Array<CustomFieldDetail>>>;
}

export interface filterCustomFieldDetail {
  id?: string;
  name?: string;
  description?: string;
  workspace_id?: string;
  order?: number;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orWorkspaceId?: string;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notWorkspaceId?: string;
}

export class CustomFieldDetailUpdate {
  public name?: string;
  public description?: string;
  public order?: number;

  constructor(payload: Partial<CustomFieldDetailUpdate>) {
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

export class CustomFieldDetail {
  public id!: string;
  public name?: string;
  public description!: string;
  public workspace_id!: string;
  public order!: number;
  public field_type!:  FieldType

  constructor(payload: Partial<CustomFieldDetail>) {
    Object.assign(this, payload);
  }
}
