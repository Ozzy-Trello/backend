import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IAdditionalFieldController, CreateAdditionalFieldDTO, UpdateAdditionalFieldDTO } from "@/controller/additional-field/additional_field_interfaces";

export default class AdditionalFieldRestView {
  private additionalField_controller: IAdditionalFieldController;

  constructor(additionalField_controller: IAdditionalFieldController) {
    this.additionalField_controller = additionalField_controller;
    
    // Bind methods to preserve 'this' context
    this.GetAdditionalFieldsByCardId = this.GetAdditionalFieldsByCardId.bind(this);
    this.GetAdditionalFieldById = this.GetAdditionalFieldById.bind(this);
    this.CreateAdditionalField = this.CreateAdditionalField.bind(this);
    this.UpdateAdditionalField = this.UpdateAdditionalField.bind(this);
    this.DeleteAdditionalField = this.DeleteAdditionalField.bind(this);
  }

  async GetAdditionalFieldsByCardId(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.cardId;
      
      if (!cardId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Card ID is required"
        });
        return;
      }

      const result = await this.additionalField_controller.GetAdditionalFieldsByCardId(cardId);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in AdditionalFieldRestView.GetAdditionalFieldsByCardId:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve additional fields"
      });
    }
  }
  
  async GetAdditionalFieldById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Additional field ID is required"
        });
        return;
      }

      const result = await this.additionalField_controller.GetAdditionalFieldById(id);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in AdditionalFieldRestView.GetAdditionalFieldById:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve additional field"
      });
    }
  }

  async CreateAdditionalField(req: Request, res: Response): Promise<void> {
    try {
      const { card_id, data } = req.body;
      
      if (!card_id || !data) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Card ID and data are required"
        });
        return;
      }

      const additionalFieldData: CreateAdditionalFieldDTO = {
        card_id,
        data
      };

      const result = await this.additionalField_controller.CreateAdditionalField(additionalFieldData);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in AdditionalFieldRestView.CreateAdditionalField:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create additional field"
      });
    }
  }

  async UpdateAdditionalField(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { data } = req.body;
      
      if (!id || !data) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Additional field ID and data are required"
        });
        return;
      }

      const additionalFieldData: UpdateAdditionalFieldDTO = {
        data
      };

      const result = await this.additionalField_controller.UpdateAdditionalField(id, additionalFieldData);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in AdditionalFieldRestView.UpdateAdditionalField:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update additional field"
      });
    }
  }

  async DeleteAdditionalField(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Additional field ID is required"
        });
        return;
      }

      const result = await this.additionalField_controller.DeleteAdditionalField(id);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message
      });
    } catch (error) {
      console.error("Error in AdditionalFieldRestView.DeleteAdditionalField:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete additional field"
      });
    }
  }
}
