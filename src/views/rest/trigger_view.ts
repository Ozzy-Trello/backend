import { TriggerControllerI, TriggerCreateData, TriggerFilter, UpdateTriggerData, createAutomationCondition, createTriggerCreateData } from "@/controller/trigger/trigger_interfaces";
import { Paginate } from "@/utils/data_utils";
import { TriggerRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class TriggerRestView implements TriggerRestViewI {
  private trigger_controller: TriggerControllerI

  constructor(trigger_controller: TriggerControllerI) {
    this.trigger_controller = trigger_controller;
    this.CreateTrigger = this.CreateTrigger.bind(this)
    this.GetTrigger = this.GetTrigger.bind(this)
    this.GetListTrigger = this.GetListTrigger.bind(this)
    this.UpdateTrigger = this.UpdateTrigger.bind(this)
    this.DeleteTrigger = this.DeleteTrigger.bind(this)
  }

  async CreateTrigger(req: Request, res: Response): Promise<void> {
    const data = createTriggerCreateData(req.body)
    if (data.status_code != StatusCodes.OK){
      res.status(data.status_code).json({
        "message": data.message,
      })
      return
    }
    let createTriggerResponse = await this.trigger_controller.CreateTrigger(data.data!)
    if (createTriggerResponse.status_code !== StatusCodes.CREATED) {
      if (createTriggerResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
        res.status(createTriggerResponse.status_code).json({
          "message": "internal server error",
        })
        return
      }
      res.status(createTriggerResponse.status_code).json({
        "message": createTriggerResponse.message,
      })
      return
    }
    res.status(createTriggerResponse.status_code).json({
      "data": createTriggerResponse.data,
      "message": createTriggerResponse.message
    })
    return
  }

  async GetTrigger(req: Request, res: Response): Promise<void> {
    let accResponse = await this.trigger_controller.GetTrigger(new TriggerFilter({
      id: req.params.id?.toString(),
      workspace_id: req.header('workspace-id')?.toString(),
      workspace_user_id_owner: req.header('my-default') ? req.auth?.user_id! : undefined
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

  async GetListTrigger(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.trigger_controller.GetListTrigger(new TriggerFilter({
      workspace_id: req.header('workspace-id')?.toString(),
      workspace_user_id_owner: req.header('my-default') ? req.auth?.user_id! : undefined
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

  async UpdateTrigger(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.trigger_controller.UpdateTrigger(new TriggerFilter({
      workspace_id: req.header('workspace-id')?.toString(),
      id: req.params.id?.toString(),
      workspace_user_id_owner: req.header('my-default') ? req.auth?.user_id! : undefined
    }), new UpdateTriggerData({
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      background: req.body.background?.toString()
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

  async DeleteTrigger(req: Request, res: Response): Promise<void> {
    let delResponse = await this.trigger_controller.DeleteTrigger(new TriggerFilter({
      id: req.params.id?.toString(),
      workspace_id: req.header('workspace-id')?.toString(),
      workspace_user_id_owner: req.header('my-default') ? req.auth?.user_id! : undefined
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