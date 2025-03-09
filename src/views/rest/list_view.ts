import { ListControllerI, ListCreateData, ListFilter, UpdateListData } from "@/controller/list/list_interfaces";
import { Paginate } from "@/utils/data_utils";
import { ListRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class ListRestView implements ListRestViewI {
  private list_controller: ListControllerI

  constructor(list_controller: ListControllerI) {
    this.list_controller = list_controller;
    this.CreateList = this.CreateList.bind(this)
    this.GetList = this.GetList.bind(this)
    this.GetListList = this.GetListList.bind(this)
    this.UpdateList = this.UpdateList.bind(this)
    this.DeleteList = this.DeleteList.bind(this)
  }

  async CreateList(req: Request, res: Response): Promise<void> {
    let accResponse = await this.list_controller.CreateList(req.auth!.user_id, new ListCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      background: req.body.background?.toString(),
      board_id: req.body.board_id?.toString(),
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

  async GetList(req: Request, res: Response): Promise<void> {
    let accResponse = await this.list_controller.GetList(new ListFilter({
      id: req.params.id?.toString(),
      board_id: req.header('board-id')?.toString(),
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

  async GetListList(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.list_controller.GetListList(new ListFilter({
      board_id: req.header('board-id')?.toString(),
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

  async UpdateList(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.list_controller.UpdateList(new ListFilter({
      board_id: req.header('board-id')?.toString(),
      id: req.params.id?.toString(),
    }), new UpdateListData({
      name: req.body.name?.toString(),
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

  async DeleteList(req: Request, res: Response): Promise<void> {
    let delResponse = await this.list_controller.DeleteList(new ListFilter({
      id: req.params.id?.toString(),
      board_id: req.header('board-id')?.toString(),
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