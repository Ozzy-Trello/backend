import { UpdateWorkspaceData, WorkspaceControllerI, WorkspaceCreateData, WorkspaceFilter } from "@/controller/workspace/workspace_interfaces";
import { Paginate } from "@/utils/data_utils";
import { WorkspaceRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";



export default class WorkspaceRestView implements WorkspaceRestViewI {
  private workspace_controller: WorkspaceControllerI

  constructor(workspace_controller: WorkspaceControllerI) {
    this.workspace_controller = workspace_controller;
    this.CreateWorkspace = this.CreateWorkspace.bind(this)
    this.GetWorkspace = this.GetWorkspace.bind(this)
    this.GetWorkspaceList = this.GetWorkspaceList.bind(this)
    this.GetDefaultWorkspace = this.GetDefaultWorkspace.bind(this)
    this.UpdateDefaultWorkspace = this.UpdateDefaultWorkspace.bind(this)
    this.UpdateWorkspace = this.UpdateWorkspace.bind(this)
    this.DeleteWorkspace = this.DeleteWorkspace.bind(this)
  }

  async GetDefaultWorkspace(req: Request, res: Response): Promise<void> {
    let accResponse = await this.workspace_controller.GetWorkspace(new WorkspaceFilter({
      user_id_owner: req.auth!.user_id,
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

  async UpdateDefaultWorkspace(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.workspace_controller.UpdateWorkspace(new WorkspaceFilter({
      user_id_owner: req.auth!.user_id,
    }), new UpdateWorkspaceData({
      name: req.body.email?.toString(),
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

  async CreateWorkspace(req: Request, res: Response): Promise<void> {
    let accResponse = await this.workspace_controller.CreateWorkspace(req.auth!.user_id, new WorkspaceCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
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

  async GetWorkspace(req: Request, res: Response): Promise<void> {
    let accResponse = await this.workspace_controller.GetWorkspace(new WorkspaceFilter({
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

  async GetWorkspaceList(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.workspace_controller.GetWorkspaceList(new WorkspaceFilter({}), paginate)
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

  async UpdateWorkspace(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.workspace_controller.UpdateWorkspace(new WorkspaceFilter({
      id: req.params.id?.toString(),
    }), new UpdateWorkspaceData({
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

  async DeleteWorkspace(req: Request, res: Response): Promise<void> {
    let delResponse = await this.workspace_controller.DeleteWorkspace(new WorkspaceFilter({
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