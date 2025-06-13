import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Paginate } from "@/utils/data_utils";
import { RoleControllerI, RoleFilter } from "@/controller/role/role_interfaces";

export interface RoleRestViewI {
  GetRole(req: Request, res: Response): Promise<void>;
  GetRoleList(req: Request, res: Response): Promise<void>;
}

export default class RoleRestView implements RoleRestViewI {
  private role_controller: RoleControllerI;

  constructor(role_controller: RoleControllerI) {
    this.role_controller = role_controller;
    this.GetRole = this.GetRole.bind(this);
    this.GetRoleList = this.GetRoleList.bind(this);
  }

  async GetRole(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Role ID is required",
      });
      return;
    }

    const roleResponse = await this.role_controller.GetRole(id);

    if (roleResponse.status_code !== StatusCodes.OK) {
      if (roleResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(roleResponse.status_code).json({
          message: "Internal server error",
        });
        return;
      }
      res.status(roleResponse.status_code).json({
        message: roleResponse.message,
      });
      return;
    }

    res.status(roleResponse.status_code).json({
      data: roleResponse.data,
      message: roleResponse.message,
    });
  }

  async GetRoleList(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 1000;
    const paginate = new Paginate(page, limit);

    const filter = new RoleFilter({
      id: req.query.id?.toString(),
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
      default: req.query.default === "true",
    });

    const roleListResponse = await this.role_controller.GetRoleList(
      filter,
      paginate
    );

    if (roleListResponse.status_code !== StatusCodes.OK) {
      if (roleListResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(roleListResponse.status_code).json({
          message: "Internal server error",
        });
        return;
      }
      res.status(roleListResponse.status_code).json({
        message: roleListResponse.message,
      });
      return;
    }

    res.status(roleListResponse.status_code).json({
      data: roleListResponse.data,
      message: roleListResponse.message,
      paginate: roleListResponse.paginate,
    });
  }
}
