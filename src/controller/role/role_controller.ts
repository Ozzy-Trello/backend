import { StatusCodes } from "http-status-codes";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { 
  RoleControllerI, 
  RoleFilter, 
  RoleResponse, 
  fromRoleDetailToRoleResponse 
} from "@/controller/role/role_interfaces";
import { 
  RoleRepositoryI, 
  filterRoleDetail 
} from "@/repository/role_access/role_interfaces";
import { RepositoryContext } from "@/repository/repository_context";

export class RoleController implements RoleControllerI {
  private repository_context: RepositoryContext;

  constructor(repository_context: RepositoryContext) {
    this.repository_context = repository_context;
    this.GetRole = this.GetRole.bind(this);
    this.GetRoleList = this.GetRoleList.bind(this);
  }

  async GetRole(id: string): Promise<ResponseData<RoleResponse>> {
    try {
      const roleResponse = await this.repository_context.role.getRole(
        { id }
      );

      if (roleResponse.status_code !== StatusCodes.OK) {
        return new ResponseData({
          status_code: roleResponse.status_code,
          message: roleResponse.message,
        });
      }

      if (!roleResponse.data) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: "Role not found",
        });
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Role retrieved successfully",
        data: fromRoleDetailToRoleResponse(roleResponse.data),
      });
    } catch (e) {
      console.error("Error in GetRole:", e);
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async GetRoleList(
    filter: RoleFilter,
    paginate: Paginate
  ): Promise<ResponseListData<Array<RoleResponse>>> {
    try {
      const repoFilter = {
        id: filter.id,
        name: filter.name,
        description: filter.description,
        default: filter.default,
      };

      const roleListResponse = await this.repository_context.role.getRoleList(repoFilter, paginate);

      if (roleListResponse.status_code !== StatusCodes.OK) {
        return new ResponseListData({
          status_code: roleListResponse.status_code,
          message: roleListResponse.message,
          data: [],
        }, paginate);
      }

      const roleResponses = (roleListResponse.data || []).map(roleDetail => 
        fromRoleDetailToRoleResponse(roleDetail)
      );

      return new ResponseListData({
        status_code: StatusCodes.OK,
        message: "Roles retrieved successfully",
        data: roleResponses,
      }, paginate);
    } catch (e) {
      console.error("Error in GetRoleList:", e);
      return new ResponseListData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e instanceof Error ? e.message : String(e),
        data: [],
      }, paginate);
    }
  }
}
