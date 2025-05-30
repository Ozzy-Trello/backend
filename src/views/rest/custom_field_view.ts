import { CustomFieldControllerI, CustomFieldCreateData, CustomFieldFilter, UpdateCustomFieldData } from "@/controller/custom_field/custom_field_interfaces";
import { Paginate } from "@/utils/data_utils";
import { CustomFieldRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class CustomFieldRestView implements CustomFieldRestViewI {
  private custom_field_controller: CustomFieldControllerI

  constructor(custom_field_controller: CustomFieldControllerI) {
    this.custom_field_controller = custom_field_controller;
    this.CreateCustomField = this.CreateCustomField.bind(this)
    this.GetCustomField = this.GetCustomField.bind(this)
    this.GetListCustomField = this.GetListCustomField.bind(this)
    this.UpdateCustomField = this.UpdateCustomField.bind(this)
    this.DeleteCustomField = this.DeleteCustomField.bind(this)
  }

  async CreateCustomField(req: Request, res: Response): Promise<void> {
    let accResponse = await this.custom_field_controller.CreateCustomField(req.auth!.user_id, new CustomFieldCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      workspace_id: req.body.workspace_id?.toString(),
      source: req.body.source?.toString(),
      trigger_id: req.body.trigger_id
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

  async GetCustomField(req: Request, res: Response): Promise<void> {
    let accResponse = await this.custom_field_controller.GetCustomField(new CustomFieldFilter({
      id: req.params.id?.toString(),
      workspace_id: req.header('workspace-id')?.toString(),
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

  async GetListCustomField(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.custom_field_controller.GetListCustomField(new CustomFieldFilter({
      workspace_id: req.header('workspace-id')?.toString(),
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

  async UpdateCustomField(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.custom_field_controller.UpdateCustomField(new CustomFieldFilter({
      workspace_id: req.header('workspace-id')?.toString(),
      id: req.params.id?.toString(),
    }), new UpdateCustomFieldData({
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      workspace_id: req.body.workspace_id?.toString(),
      trigger_id: req.body.trigger_id,
      order: req.body.order
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

  async DeleteCustomField(req: Request, res: Response): Promise<void> {
    let delResponse = await this.custom_field_controller.DeleteCustomField(new CustomFieldFilter({
      id: req.params.id?.toString(),
      workspace_id: req.header('workspace-id')?.toString(),
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