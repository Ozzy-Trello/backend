import { CardControllerI, CardCreateData, CardFilter, CardMoveData, CardSearch, UpdateCardData } from "@/controller/card/card_interfaces";
import { Paginate } from "@/utils/data_utils";
import { CardRestViewI } from "@/views/rest/interfaces";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class CardRestView implements CardRestViewI {
  private card_controller: CardControllerI

  constructor(card_controller: CardControllerI) {
    this.card_controller = card_controller;
    this.ArchiveCard = this.ArchiveCard.bind(this)
    this.UnArchiveCard = this.UnArchiveCard.bind(this)
    this.CreateCard = this.CreateCard.bind(this)
    this.GetCard = this.GetCard.bind(this)
    this.GetListCard = this.GetListCard.bind(this)
    this.SearchCard = this.SearchCard.bind(this)
    this.MoveCard = this.MoveCard.bind(this)
    this.UpdateCard = this.UpdateCard.bind(this)
    this.DeleteCard = this.DeleteCard.bind(this)
    this.AddCustomField = this.AddCustomField.bind(this)
    this.RemoveCustomField = this.RemoveCustomField.bind(this)
    this.UpdateCustomField = this.UpdateCustomField.bind(this)
    this.GetCustomField = this.GetCustomField.bind(this)
    this.GetCardActivity = this.GetCardActivity.bind(this)
    this.GetCardTimeInList = this.GetCardTimeInList.bind(this)
    this.GetCardTimeInBoard = this.GetCardTimeInBoard.bind(this)
    this.GetDashcardCount = this.GetDashcardCount.bind(this)
    this.CompleteCard = this.CompleteCard.bind(this)
    this.IncompleteCard = this.IncompleteCard.bind(this)
  }
  
  async ArchiveCard(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.card_controller.ArchiveCard(req.auth!.user_id, req.params.id?.toString())
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
  }
  
  async UnArchiveCard(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.card_controller.UnArchiveCard(req.auth!.user_id, req.params.id?.toString())
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
  }

  async UpdateCustomField(req: Request, res: Response): Promise<void> {
    let updateResponse = await this.card_controller.UpdateCustomField(
      req.params.id?.toString(),
      req.params.custom_field_id?.toString(),
      req.body.value,
    )
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
      "warning": updateResponse.warning,
    })
    return
  }

  async AddCustomField(req: Request, res: Response): Promise<void> {
    if (req.body.trigger) {
      res.status(StatusCodes.BAD_REQUEST).json({
        "message": "create trigger from this endpoint not support anymore",
      })
      return
    }
    let accResponse = await this.card_controller.AddCustomField(
      req.params.id?.toString(),
      req.params.custom_field_id?.toString(),
      req.body.value
    )
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
      description: req.body?.description?.toString(),
      list_id: req.body.list_id?.toString(),
      type: req.body?.type?.toString(),
      order: 1,
      dash_config: req.body?.dash_config
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
      board_id: req.header('board-id')?.toString()
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
      board_id: req.header('board-id')?.toString()
    }), paginate);

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

  async SearchCard(req: Request, res: Response): Promise<void> {
    console.log("SearchCard: in rest..");
    let name = req.query.name?.toString() || "";
    let description = req.query.description?.toString() || "";
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);

    console.log("in view: name: ", name);
    console.log("in view: desc: ", description);
    
    let accResponse = await this.card_controller.SearchCard(new CardSearch({
      name: name,
      description: description,
    }), paginate);

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

  async MoveCard(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.MoveCard(req.auth!.user_id, new CardMoveData({
      id: req.params.id?.toString(),
      previous_list_id: req.body.previous?.toString(),
      target_list_id: req.body.target_list_id?.toString(),
      previous_position: req.body.order ? parseInt(req.body.order) : 0,
      target_position: req.body.target_position ? parseInt(req.body.target_position.toString()) : 0,
    }));

    console.log("in view: MoveCard: accResponse: %o",accResponse);

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

  async GetCardActivity(req: Request, res: Response): Promise<void> {
    let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
    let paginate = new Paginate(page, limit);
    let accResponse = await this.card_controller.GetCardActivity(req.params.id?.toString(), paginate)
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
    let updateResponse = await this.card_controller.UpdateCard(req.auth!.user_id, new CardFilter({
      list_id: req.header('list-id')?.toString(),
      id: req.params.id?.toString(),
    }), new UpdateCardData({
      name: req.body.name?.toString(),
      description: req.body.description?.toString(),
      list_id: req.body.list_id?.toString(),
      location: req.body.location?.toString()
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

  async GetCardTimeInList(req: Request, res: Response): Promise<void> {
    let accResponse = await this.card_controller.GetCardTimeInList(req.params.id?.toString())
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

  async GetCardTimeInBoard(req: Request, res: Response): Promise<void> {

    let accResponse = await this.card_controller.GetCardTimeInBoard(req.params.id?.toString(), req.params.board_id?.toString());
    
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

  async GetDashcardCount(req: Request, res: Response): Promise<void> {
    const cardId = req.params.id?.toString();
    if (!cardId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        "message": "id header is required",
      });
      return;
    }
    let accResponse = await this.card_controller.GetDashcardCount(cardId);
    
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

  async CompleteCard(req: Request, res: Response): Promise<void> {
    const user_id = req.auth!.user_id;
    const card_id = req.params.id?.toString();
    const result = await this.card_controller.CompleteCard(user_id, card_id);
    if (result.status_code !== StatusCodes.OK) {
      res.status(result.status_code).json({ message: result.message });
      return;
    }
    res.status(result.status_code).json({ message: result.message });
  }

  async IncompleteCard(req: Request, res: Response): Promise<void> {
    const user_id = req.auth!.user_id;
    const card_id = req.params.id?.toString();
    const result = await this.card_controller.IncompleteCard(user_id, card_id);
    if (result.status_code !== StatusCodes.OK) {
      res.status(result.status_code).json({ message: result.message });
      return;
    }
    res.status(result.status_code).json({ message: result.message });
  }
}