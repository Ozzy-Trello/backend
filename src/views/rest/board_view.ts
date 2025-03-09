import { BoardControllerI, BoardCreateData, BoardFilter, UpdateBoardData } from "@/controller/boards/board_interfaces";
import { Paginate } from "@/utils/data_utils";
import { BoardRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class BoardRestView implements BoardRestViewI {
  private board_controller: BoardControllerI

  constructor(board_controller: BoardControllerI) {
    this.board_controller = board_controller;
    this.CreateBoard = this.CreateBoard.bind(this)
    this.GetBoard = this.GetBoard.bind(this)
    this.GetBoardList = this.GetBoardList.bind(this)
    this.UpdateBoard = this.UpdateBoard.bind(this)
    this.DeleteBoard = this.DeleteBoard.bind(this)
  }

  async CreateBoard(req: Request, res: Response): Promise<void> {
    let accResponse = await this.board_controller.CreateBoard(req.auth!.user_id, new BoardCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      background: req.body.background?.toString(),
      workspace_id: req.body.workspace_id?.toString(),
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

  async GetBoard(req: Request, res: Response): Promise<void> {
    let accResponse = await this.board_controller.GetBoard(new BoardFilter({
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

  async GetBoardList(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.board_controller.GetBoardList(new BoardFilter({
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

  async UpdateBoard(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.board_controller.UpdateBoard(new BoardFilter({
      workspace_id: req.header('workspace-id')?.toString(),
      id: req.params.id?.toString(),
      workspace_user_id_owner: req.header('my-default') ? req.auth?.user_id! : undefined
    }), new UpdateBoardData({
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

  async DeleteBoard(req: Request, res: Response): Promise<void> {
    let delResponse = await this.board_controller.DeleteBoard(new BoardFilter({
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