import { CardAttachmentControllerI, CardAttachmentCreateData, CardAttachmentFilter, CardAttachmentResponse, CardAttachmentUpdateData } from "./card_attachment_interface";
import { CardAttachmentDetail, CardAttachmentDetailUpdate, CardAttachmentRepositoryI, filterCardAttachmentDetail } from "@/repository/card_attachment/card_attachment_interface";
import { FileRepositoryI, filterFileDetail  } from "@/repository/file/file_interface";
import { Paginate } from "@/utils/data_utils";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { validate as isValidUUID } from 'uuid';

export class CardAttachmentController implements CardAttachmentControllerI {
  private card_attachment_repository: CardAttachmentRepositoryI;
  private file_repository: FileRepositoryI;
  
  constructor(card_attachment_repository: CardAttachmentRepositoryI, file_repository: FileRepositoryI) {
    this.card_attachment_repository = card_attachment_repository;
    this.file_repository = file_repository;
  }
  
  async CreateCardAttachment(userId: string, data: CardAttachmentCreateData): Promise<ResponseData<CardAttachmentResponse>> {
    try {
      // Validate the request
      if (!data.card_id || !data.file_id) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "card_id and file_id are required",
          data: undefined
        };
      }
      
      if (!isValidUUID(data.card_id) || !isValidUUID(data.file_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for card_id or file_id",
          data: undefined
        };
      }
      
      // Create attachment detail
      const attachmentDetail = new CardAttachmentDetail({
        card_id: data.card_id,
        file_id: data.file_id,
        is_cover: data.is_cover,
        created_by: userId
      });
      
      // Save to repository
      const saveResult = await this.card_attachment_repository.createCardAttachment(attachmentDetail);
      
      if (saveResult.status_code !== StatusCodes.CREATED || !saveResult.data) {
        return {
          status_code: saveResult.status_code,
          message: saveResult.message,
          data: undefined
        };
      }
      
      // Convert to response format
      const response = new CardAttachmentResponse({
        id: saveResult.data.id!,
        card_id: saveResult.data.card_id,
        file_id: saveResult.data.file_id,
        is_cover: saveResult.data.is_cover,
        created_by: saveResult.data.created_by!,
        created_at: saveResult.data.created_at!,
        updated_at: saveResult.data.updated_at!,
        file: saveResult.data.file
      });
      
      return {
        status_code: StatusCodes.CREATED,
        message: "Card attachment created successfully",
        data: response
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.CreateCardAttachment:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to create card attachment",
        data: undefined
      };
    }
  }
  
  async GetCardAttachment(filter: CardAttachmentFilter): Promise<ResponseData<CardAttachmentResponse>> {
    try {
      // Validate the filter
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for id",
          data: undefined
        };
      }
      
      if (filter.card_id && !isValidUUID(filter.card_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for card_id",
          data: undefined
        };
      }
      
      // Convert to repository filter format
      const repoFilter: filterCardAttachmentDetail = {
        id: filter.id,
        card_id: filter.card_id,
        file_id: filter.file_id,
        is_cover: filter.is_cover,
        created_by: filter.created_by
      };
      
      // Get card attachment from repository
      const result = await this.card_attachment_repository.getCardAttachment(repoFilter);
      
      if (result.status_code !== StatusCodes.OK || !result.data) {
        return {
          status_code: result.status_code,
          message: result.message,
          data: undefined
        };
      }
      
      // Convert to response format
      const response = new CardAttachmentResponse({
        id: result.data.id!,
        card_id: result.data.card_id,
        file_id: result.data.file_id,
        is_cover: result.data.is_cover,
        created_by: result.data.created_by!,
        created_at: result.data.created_at!,
        updated_at: result.data.updated_at!,
        file: result.data.file
      });
      
      return {
        status_code: StatusCodes.OK,
        message: "Card attachment retrieved successfully",
        data: response
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.GetCardAttachment:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve card attachment",
        data: undefined
      };
    }
  }
  
  async GetCardAttachmentList(filter: CardAttachmentFilter, paginate: Paginate): Promise<ResponseListData<Array<CardAttachmentResponse>>> {
    try {
      // Validate the filter
      if (filter.card_id && !isValidUUID(filter.card_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for card_id",
          data: [],
          paginate: paginate
        };
      }
      
      // Convert to repository filter format
      const repoFilter: filterCardAttachmentDetail = {
        id: filter.id,
        card_id: filter.card_id,
        file_id: filter.file_id,
        is_cover: filter.is_cover,
        created_by: filter.created_by
      };
      
      // Get card attachments from repository
      const result = await this.card_attachment_repository.getCardAttachmentList(repoFilter, paginate);
      
      if (result.status_code !== StatusCodes.OK || !result.data) {
        return {
          status_code: result.status_code,
          message: result.message,
          data: [],
          paginate: paginate
        };
      }
      
      // Convert to response format
      const responses = result.data.map(attachment => new CardAttachmentResponse({
        id: attachment.id!,
        card_id: attachment.card_id,
        file_id: attachment.file_id,
        is_cover: attachment.is_cover,
        created_by: attachment.created_by!,
        created_at: attachment.created_at!,
        updated_at: attachment.updated_at!,
        file: attachment.file
      }));
      
      return {
        status_code: StatusCodes.OK,
        message: "Card attachment list retrieved successfully",
        data: responses,
        paginate: result.paginate!
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.GetCardAttachmentList:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve card attachment list",
        data: [],
        paginate: paginate
      };
    }
  }
  
  async UpdateCardAttachment(filter: CardAttachmentFilter, data: CardAttachmentUpdateData): Promise<ResponseData<null>> {
    try {
      // Validate the filter
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for id",
          data: null
        };
      }
      
      if (!filter.id && (!filter.card_id || !filter.file_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Either id or both card_id and file_id must be provided",
          data: null
        };
      }
      
      // Convert to repository filter and update data
      const repoFilter: filterCardAttachmentDetail = {
        id: filter.id,
        card_id: filter.card_id,
        file_id: filter.file_id,
        created_by: filter.created_by
      };
      
      const updateData = new CardAttachmentDetailUpdate({
        is_cover: data.is_cover !== undefined ? String(data.is_cover) : undefined
      });
      
      // Update the attachment
      const status = await this.card_attachment_repository.updateCardAttachment(repoFilter, updateData);
      
      if (status !== StatusCodes.OK) {
        return {
          status_code: status,
          message: status === StatusCodes.NOT_FOUND ? "Card attachment not found" : "Failed to update card attachment",
          data: null
        };
      }
      
      return {
        status_code: StatusCodes.OK,
        message: "Card attachment updated successfully",
        data: null
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.UpdateCardAttachment:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to update card attachment",
        data: null
      };
    }
  }
  
  async DeleteCardAttachment(filter: CardAttachmentFilter): Promise<ResponseData<null>> {
    try {
      // Validate the filter
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for id",
          data: null
        };
      }
      
      if (!filter.id && (!filter.card_id || !filter.file_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Either id or both card_id and file_id must be provided",
          data: null
        };
      }
      
      // Convert to repository filter format
      const repoFilter: filterCardAttachmentDetail = {
        id: filter.id,
        card_id: filter.card_id,
        file_id: filter.file_id,
        created_by: filter.created_by
      };
      
      // Delete the attachment
      const status = await this.card_attachment_repository.deleteCardAttachment(repoFilter);
      
      if (status !== StatusCodes.NO_CONTENT) {
        return {
          status_code: status,
          message: status === StatusCodes.NOT_FOUND ? "Card attachment not found" : "Failed to delete card attachment",
          data: null
        };
      }
      
      return {
        status_code: StatusCodes.OK,
        message: "Card attachment deleted successfully",
        data: null
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.DeleteCardAttachment:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to delete card attachment",
        data: null
      };
    }
  }
  
  async GetCoverAttachment(cardId: string): Promise<ResponseData<CardAttachmentResponse>> {
    try {
      if (!cardId || !isValidUUID(cardId)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid UUID format for card_id",
          data: undefined
        };
      }
      
      // Get the cover attachment from repository
      const result = await this.card_attachment_repository.getCoverAttachment(cardId);
      
      if (result.status_code !== StatusCodes.OK || !result.data) {
        return {
          status_code: result.status_code,
          message: result.message,
          data: undefined
        };
      }
      
      // Convert to response format
      const response = new CardAttachmentResponse({
        id: result.data.id!,
        card_id: result.data.card_id,
        file_id: result.data.file_id,
        is_cover: result.data.is_cover,
        created_by: result.data.created_by!,
        created_at: result.data.created_at!,
        updated_at: result.data.updated_at!,
        file: result.data.file
      });
      
      return {
        status_code: StatusCodes.OK,
        message: "Cover attachment retrieved successfully",
        data: response
      };
    } catch (error) {
      console.error("Error in CardAttachmentController.GetCoverAttachment:", error);
      return {
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to retrieve cover attachment",
        data: undefined
      };
    }
  }
}