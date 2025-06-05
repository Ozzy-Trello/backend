import { 
  IAdditionalFieldController, 
  IAdditionalFieldRepository, 
  AdditionalFieldDTO, 
  CreateAdditionalFieldDTO, 
  UpdateAdditionalFieldDTO 
} from "./additional_field_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";

export class AdditionalFieldController implements IAdditionalFieldController {
  private additionalFieldRepo: IAdditionalFieldRepository;

  constructor(additionalFieldRepo: IAdditionalFieldRepository) {
    this.additionalFieldRepo = additionalFieldRepo;
  }

  async GetAdditionalFieldsByCardId(cardId: string): Promise<ResponseData<AdditionalFieldDTO[]>> {
    try {
      return await this.additionalFieldRepo.getAdditionalFieldsByCardId(cardId);
    } catch (error) {
      console.error("Error in AdditionalFieldController.GetAdditionalFieldsByCardId:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve additional fields",
        data: []
      };
    }
  }

  async GetAdditionalFieldById(id: string): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      return await this.additionalFieldRepo.getAdditionalFieldById(id);
    } catch (error) {
      console.error("Error in AdditionalFieldController.GetAdditionalFieldById:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve additional field",
      };
    }
  }

  async CreateAdditionalField(data: CreateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      return await this.additionalFieldRepo.createAdditionalField(data);
    } catch (error) {
      console.error("Error in AdditionalFieldController.CreateAdditionalField:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create additional field",
      };
    }
  }

  async UpdateAdditionalField(id: string, data: UpdateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      return await this.additionalFieldRepo.updateAdditionalField(id, data);
    } catch (error) {
      console.error("Error in AdditionalFieldController.UpdateAdditionalField:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update additional field",
      };
    }
  }

  async DeleteAdditionalField(id: string): Promise<ResponseData<null>> {
    try {
      const result = await this.additionalFieldRepo.deleteAdditionalField(id);
      
      if (result === StatusCodes.NOT_FOUND) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Additional field not found",
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
        message: "Additional field deleted successfully",
        data: null
      };
    } catch (error) {
      console.error("Error in AdditionalFieldController.DeleteAdditionalField:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete additional field",
        data: null
      };
    }
  }
}
