import { CardControllerI, CardCreateData, CardFilter, UpdateCardData } from "@/controller/card/card_interfaces";
import { Paginate } from "@/utils/data_utils";
import { CardRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class CardRestView implements CardRestViewI {
  private card_controller: CardControllerI

  constructor(card_controller: CardControllerI) {
    this.card_controller = card_controller;
    this.CreateCard = this.CreateCard.bind(this)
    this.GetCard = this.GetCard.bind(this)
    this.GetListCard = this.GetListCard.bind(this)
    this.UpdateCard = this.UpdateCard.bind(this)
    this.DeleteCard = this.DeleteCard.bind(this)
    this.AddCustomField = this.AddCustomField.bind(this)
    this.RemoveCustomField = this.RemoveCustomField.bind(this)
    this.UpdateCustomField = this.UpdateCustomField.bind(this)
    this.GetCustomField = this.GetCustomField.bind(this)
  }
  async UpdateCustomField(req: Request, res: Response): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async AddCustomField(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.AddCustomField(req.params.id?.toString(), req.params.custom_field_id?.toString())
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
  async RemoveCustomField(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.RemoveCustomField(req.params.id?.toString(), req.params.custom_field_id?.toString())
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
  }
  async GetCustomField(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.card_controller.GetListCustomField(req.params.id.toString(), paginate)
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

  async CreateCard(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.CreateCard(req.auth!.user_id, new CardCreateData({ 
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      list_id: req.body.list_id?.toString(),
      order: 1,
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

  async GetCard(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.GetCard(new CardFilter({
      id: req.params.id?.toString(),
      list_id: req.header('list-id')?.toString(),
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

  async GetListCard(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.card_controller.GetListCard(new CardFilter({
      list_id: req.header('list-id')?.toString(),
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

  async UpdateCard(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.card_controller.UpdateCard(new CardFilter({
      list_id: req.header('list-id')?.toString(),
      id: req.params.id?.toString(),
    }), new UpdateCardData({
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      list_id: req.body.list_id?.toString()
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

  async DeleteCard(req: Request, res: Response): Promise<void> {
    let delResponse = await this.card_controller.DeleteCard(new CardFilter({
      id: req.params.id?.toString(),
      list_id: req.header('list-id')?.toString(),
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