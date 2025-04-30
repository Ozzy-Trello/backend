// src/views/rest/card_attachment_view.ts
import { CardAttachmentControllerI, CardAttachmentCreateData, CardAttachmentFilter } from "@/controller/card_attachment/card_attachment_interface";
import { Paginate } from "@/utils/data_utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export default class CardAttachmentRestView {
  private card_attachment_controller: CardAttachmentControllerI;

  constructor(card_attachment_controller: CardAttachmentControllerI) {
    this.card_attachment_controller = card_attachment_controller;
    
    // Bind methods to preserve 'this' context
    this.CreateCardAttachment = this.CreateCardAttachment.bind(this);
    this.GetCardAttachmentList = this.GetCardAttachmentList.bind(this);
    this.GetCardAttachment = this.GetCardAttachment.bind(this);
    this.DeleteCardAttachment = this.DeleteCardAttachment.bind(this);
  }

  async CreateCardAttachment(req: Request, res: Response): Promise<void> {
    try {
      // Create card attachment data from request
      const attachmentData = new CardAttachmentCreateData({
        card_id: req.body.card_id,
        file_id: req.body.file_id,
        is_cover: req.body.is_cover
      });

      // Create card attachment
      const response = await this.card_attachment_controller.CreateCardAttachment(req.auth!.user_id, attachmentData);

      if (response.status_code !== StatusCodes.CREATED) {
        if (response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(response.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(response.status_code).json({
          "message": response.message,
        });
        return;
      }
      
      res.status(response.status_code).json({
        "data": response.data,
        "message": response.message
      });
      return;
    } catch (error) {
      console.error("Error creating card attachment:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async GetCardAttachmentList(req: Request, res: Response): Promise<void> {
    try {
      // Parse pagination parameters
      let page = req.query.page ? parseInt(req.query.page.toString()) : 1;
      let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 10;
      let paginate = new Paginate(page, limit);
      
      // Create filter from request
      const filter = new CardAttachmentFilter({
        card_id: req.query.card_id?.toString() || req.header('card-id')?.toString()
      });
    
      // Get card attachment list
      const response = await this.card_attachment_controller.GetCardAttachmentList(filter, paginate);
    
      if (response.status_code !== StatusCodes.OK) {
        if (response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(response.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(response.status_code).json({
          "message": response.message,
        });
        return;
      }
    
      res.status(response.status_code).json({
        "data": response.data,
        "message": response.message,
        "paginate": response.paginate,
      });
      return;
    } catch (error) {
      console.error("Error getting card attachment list:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async GetCardAttachment(req: Request, res: Response): Promise<void> {
    try {
      // Create filter from request
      const filter = new CardAttachmentFilter({
        id: req.params.id
      });
    
      // Get card attachment
      const response = await this.card_attachment_controller.GetCardAttachment(filter);
    
      if (response.status_code !== StatusCodes.OK) {
        if (response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(response.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(response.status_code).json({
          "message": response.message,
        });
        return;
      }
    
      res.status(response.status_code).json({
        "data": response.data,
        "message": response.message
      });
      return;
    } catch (error) {
      console.error("Error getting card attachment:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }

  async DeleteCardAttachment(req: Request, res: Response): Promise<void> {
    try {
      // Create filter from request
      const filter = new CardAttachmentFilter({
        id: req.params.id
      });
    
      // Delete card attachment
      const response = await this.card_attachment_controller.DeleteCardAttachment(filter);
    
      if (response.status_code !== StatusCodes.OK) {
        if (response.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(response.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(response.status_code).json({
          "message": response.message,
        });
        return;
      }
    
      res.status(response.status_code).json({
        "message": response.message
      });
      return;
    } catch (error) {
      console.error("Error deleting card attachment:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }


  async getCardCover(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.cardId;
      
      if (!cardId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          "message": "Card ID is required",
        });
        return;
      }
      
      const coverResponse = await this.card_attachment_controller.GetCoverAttachment(cardId);
      
      if (coverResponse.status_code !== StatusCodes.OK) {
        if (coverResponse.status_code === StatusCodes.INTERNAL_SERVER_ERROR) {
          res.status(coverResponse.status_code).json({
            "message": "internal server error",
          });
          return;
        }
        res.status(coverResponse.status_code).json({
          "message": coverResponse.message,
        });
        return;
      }
      
      res.status(coverResponse.status_code).json({
        "data": coverResponse.data,
        "message": coverResponse.message
      });
      return;
    } catch (error) {
      console.error("Error getting card cover:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        "message": "internal server error",
      });
      return;
    }
  }
}

