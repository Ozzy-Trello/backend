import { 
  IChecklistController, 
  IChecklistRepository, 
  ChecklistDTO, 
  CreateChecklistDTO, 
  UpdateChecklistDTO 
} from "./checklist_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";

export class ChecklistController implements IChecklistController {
  private checklistRepo: IChecklistRepository;

  constructor(checklistRepo: IChecklistRepository) {
    this.checklistRepo = checklistRepo;
  }

  async GetChecklistsByCardId(cardId: string): Promise<ResponseData<ChecklistDTO[]>> {
    try {
      return await this.checklistRepo.getChecklistsByCardId(cardId);
    } catch (error) {
      console.error("Error in ChecklistController.GetChecklistsByCardId:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklists",
        data: []
      };
    }
  }

  async GetChecklistById(id: string): Promise<ResponseData<ChecklistDTO>> {
    try {
      return await this.checklistRepo.getChecklistById(id);
    } catch (error) {
      console.error("Error in ChecklistController.GetChecklistById:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve checklist",
      };
    }
  }

  async CreateChecklist(data: CreateChecklistDTO): Promise<ResponseData<ChecklistDTO>> {
    try {
      return await this.checklistRepo.createChecklist(data);
    } catch (error) {
      console.error("Error in ChecklistController.CreateChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create checklist",
      };
    }
  }

  async UpdateChecklist(id: string, data: UpdateChecklistDTO): Promise<ResponseData<ChecklistDTO>> {
    try {
      return await this.checklistRepo.updateChecklist(id, data);
    } catch (error) {
      console.error("Error in ChecklistController.UpdateChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update checklist",
      };
    }
  }

  async DeleteChecklist(id: string): Promise<ResponseData<null>> {
    try {
      const result = await this.checklistRepo.deleteChecklist(id);
      
      if (result === StatusCodes.NOT_FOUND) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Checklist not found",
          data: null
        };
      }
      
      if (result === StatusCodes.BAD_REQUEST) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
          data: null
        };
      }
      
      return {
        status_code: StatusCodes.NO_CONTENT,
        message: "Checklist deleted successfully",
        data: null
      };
    } catch (error) {
      console.error("Error in ChecklistController.DeleteChecklist:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete checklist",
        data: null
      };
    }
  }
}
