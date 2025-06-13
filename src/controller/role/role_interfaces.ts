import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { RoleDetail } from "@/repository/role_access/role_interfaces";

export interface RoleControllerI {
  GetRole(id: string): Promise<ResponseData<RoleResponse>>;
  GetRoleList(filter: RoleFilter, paginate: Paginate): Promise<ResponseListData<Array<RoleResponse>>>;
}

export class RoleFilter {
  public id?: string;
  public name?: string;
  public description?: string;
  public default?: boolean;

  constructor(payload: Partial<RoleFilter>) {
    Object.assign(this, payload);
  }
}

export class RoleResponse {
  public id!: string;
  public name!: string;
  public description!: string;
  public default!: boolean;

  constructor(payload: Partial<RoleResponse>) {
    Object.assign(this, payload);
  }
}

export function fromRoleDetailToRoleResponse(detail: RoleDetail): RoleResponse {
  return new RoleResponse({
    id: detail.id,
    name: detail.name,
    description: detail.description,
    default: detail.default,
  });
}
