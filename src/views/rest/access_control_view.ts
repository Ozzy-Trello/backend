import { AccessControlControllerI, AccessControlCreateData, AccessControlFilter, UpdateAccessControlData } from "@/controller/access_control/access_control_interfaces";
import { Paginate } from "@/utils/data_utils";
import { AccessControlRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class AccessControlRestView implements AccessControlRestViewI {
  private access_control_controller: AccessControlControllerI

  constructor(access_control_controller: AccessControlControllerI) {
    this.access_control_controller = access_control_controller;
    this.CreateAccessControl = this.CreateAccessControl.bind(this)
    this.GetAccessControl = this.GetAccessControl.bind(this)
    this.GetAccessControlList = this.GetAccessControlList.bind(this)
    this.UpdateAccessControl = this.UpdateAccessControl.bind(this)
    this.DeleteAccessControl = this.DeleteAccessControl.bind(this)
  }

  async CreateAccessControl(req: Request, res: Response): Promise<void> {
    let accResponse = await this.access_control_controller.CreateAccessControl(req.auth!.user_id, new AccessControlCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      permissions: req.body.permissions?.toString(),
    }))
    if (accResponse.status_code !== StatusCodes.CREATED) {
      if (accResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(accResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(accResponse.status_code).json({
        "message": accResponse.message,
      })
      return
    }
    res.status(accResponse.status_code).json({
      "data": accResponse.data,
      "message": accResponse.message
    })
    return
  }

  async GetAccessControl(req: Request, res: Response): Promise<void> {
    let accResponse = await this.access_control_controller.GetAccessControl(new AccessControlFilter({
      id: req.params.id?.toString(),
    }))
    if (accResponse.status_code !== StatusCodes.OK) {
      if (accResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(accResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(accResponse.status_code).json({
        "message": accResponse.message,
      })
      return
    }
    res.status(accResponse.status_code).json({
      "data": accResponse.data,
      "message": accResponse.message
    })
    return
  }

  async GetAccessControlList(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.access_control_controller.GetAccessControlList(new AccessControlFilter({
      id : req.query.id?.toString(),
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
    }), paginate)
    if (accResponse.status_code !== StatusCodes.OK) {
      if (accResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(accResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(accResponse.status_code).json({
        "message": accResponse.message,
      })
      return
    }
    res.status(accResponse.status_code).json({
      "data": accResponse.data,
      "message": accResponse.message,
      "paginate": accResponse.paginate,
    })
    return
  }

  async UpdateAccessControl(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.access_control_controller.UpdateAccessControl(new AccessControlFilter({
      id: req.params.id?.toString(),
    }), new UpdateAccessControlData({
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
    }))
    if (updateResponse.status_code !== StatusCodes.OK) {
      if (updateResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(updateResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(updateResponse.status_code).json({
        "message": updateResponse.message,
      })
      return
    }
    res.status(updateResponse.status_code).json({
      "data": updateResponse.data,
      "message": updateResponse.message,
    })
    return
  }

  async DeleteAccessControl(req: Request, res: Response): Promise<void> {
    let delResponse = await this.access_control_controller.DeleteAccessControl(new AccessControlFilter({
      id: req.params.id?.toString(),
    }));
    if (delResponse.status_code !== StatusCodes.OK) {
      if (delResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(delResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(delResponse.status_code).json({
        "message": delResponse.message,
      })
      return
    }
    res.status(delResponse.status_code).json({
      "data": delResponse.data,
      "message": delResponse.message,
    })
    return
  }
}