import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { PermissionStructure } from "@/utils/security_utils";

export interface RoleRepositoryI {
  getRole(filter: filterRoleDetail): Promise<ResponseData<RoleDetail>>;
  createRole(data: RoleDetail): Promise<ResponseData<RoleDetail>>;
  deleteRole(filter: filterRoleDetail): Promise<number>;
  updateRole(filter: filterRoleDetail, data: RoleDetailUpdate): Promise<number>;
  getRoleList(filter: filterRoleDetail, paginate: Paginate): Promise<ResponseListData<Array<RoleDetail>>>;
}

export interface filterRoleDetail {
  id?: string;
  name?: string;
  description?: string;
  permissions?: PermissionStructure;
  default?: boolean;

  __orId?: string;
  __orName?: string;
  __orDescription?: string;
  __orDefault?: boolean;

  __notId?: string;
  __notName?: string;
  __notDescription?: string;
  __notDefault?: boolean;
}

export class RoleDetailUpdate {
  public name?: string;
  public description?: string;
  public background?: string;
  public permissions?: PermissionStructure;

  constructor(payload: Partial<RoleDetailUpdate>) {
    Object.assign(this, payload);
  }

  public toObject(): any {
    const data: any = {};
    if (this.name) data.name = this.name;
    if (this.description) data.description = this.description;
    if (this.background) data.background = this.background;
    if (this.permissions) data.permissions = this.permissions;
    return data
  }
}

export class RoleDetail {
  public id!: string;
  public name!: string;
  public description!: string;
  public permissions!: PermissionStructure;
  public default!: boolean;

  constructor(payload: Partial<RoleDetail>) {
    Object.assign(this, payload);
  }
}
