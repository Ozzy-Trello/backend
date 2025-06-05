import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IChecklistController, CreateChecklistDTO, UpdateChecklistDTO } from "@/controller/checklist/checklist_interfaces";

export default class ChecklistRestView {
  private checklist_controller: IChecklistController;

  constructor(checklist_controller: IChecklistController) {
    this.checklist_controller = checklist_controller;
    
    // Bind methods to preserve 'this' context
    this.GetChecklistsByCardId = this.GetChecklistsByCardId.bind(this);
    this.GetChecklistById = this.GetChecklistById.bind(this);
    this.CreateChecklist = this.CreateChecklist.bind(this);
    this.UpdateChecklist = this.UpdateChecklist.bind(this);
    this.DeleteChecklist = this.DeleteChecklist.bind(this);
  }

  async GetChecklistsByCardId(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.cardId;
      
      if (!cardId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Card ID is required"
        });
        return;
      }

      const result = await this.checklist_controller.GetChecklistsByCardId(cardId);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in ChecklistRestView.GetChecklistsByCardId:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklists"
      });
    }
  }
  
  async GetChecklistById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Checklist ID is required"
        });
        return;
      }

      const result = await this.checklist_controller.GetChecklistById(id);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in ChecklistRestView.GetChecklistById:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklist"
      });
    }
  }

  async CreateChecklist(req: Request, res: Response): Promise<void> {
    try {
      const { card_id, title, data } = req.body;
      
      if (!card_id || !data) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Card ID and data are required"
        });
        return;
      }

      const checklistData: CreateChecklistDTO = {
        card_id,
        title: title || "Checklist",
        data
      };

      const result = await this.checklist_controller.CreateChecklist(checklistData);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in ChecklistRestView.CreateChecklist:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create checklist"
      });
    }
  }

  async UpdateChecklist(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { title, data } = req.body;
      
      if (!id || !data) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Checklist ID and data are required"
        });
        return;
      }

      const checklistData: UpdateChecklistDTO = {
        title,
        data
      };

      const result = await this.checklist_controller.UpdateChecklist(id, checklistData);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error("Error in ChecklistRestView.UpdateChecklist:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update checklist"
      });
    }
  }

  async DeleteChecklist(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status_code: StatusCodes.BAD_REQUEST,
          message: "Checklist ID is required"
        });
        return;
      }

      const result = await this.checklist_controller.DeleteChecklist(id);
      
      res.status(result.status_code).json({
        status_code: result.status_code,
        message: result.message
      });
    } catch (error) {
      console.error("Error in ChecklistRestView.DeleteChecklist:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete checklist"
      });
    }
  }
}
