import {
  IChecklistRepository,
  ChecklistDTO,
  CreateChecklistDTO,
  UpdateChecklistDTO,
  ChecklistItem,
} from "@/controller/checklist/checklist_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { v4 as uuidv4 } from "uuid";
import Checklist from "@/database/schemas/checklist";
import { validate as isValidUUID } from "uuid";
import { broadcastToWebSocket } from "@/server";

export class ChecklistRepository implements IChecklistRepository {
  async getChecklistsByCardId(
    cardId: string
  ): Promise<ResponseData<ChecklistDTO[]>> {
    try {
      if (!cardId || !isValidUUID(cardId)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
        };
      }

      const checklists = await Checklist.findAll({
        where: { card_id: cardId },
        order: [["created_at", "ASC"]],
      });

      if (!checklists || checklists.length === 0) {
        return {
          status_code: StatusCodes.OK,
          message: "No checklists found for this card",
          data: [],
        };
      }

      const checklistDTOs: ChecklistDTO[] = checklists.map((checklist) => ({
        id: checklist.id,
        card_id: checklist.card_id,
        title: checklist.title,
        data: checklist.data,
        created_at: checklist.created_at,
        updated_at: checklist.updated_at,
      }));

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Checklists retrieved successfully",
        data: checklistDTOs,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async getChecklistById(id: string): Promise<ResponseData<ChecklistDTO>> {
    try {
      if (!id || !isValidUUID(id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid checklist ID",
        };
      }

      const checklist = await Checklist.findByPk(id);

      if (!checklist) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Checklist not found",
        };
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Checklist retrieved successfully",
        data: {
          id: checklist.id,
          card_id: checklist.card_id,
          title: checklist.title,
          data: checklist.data,
          created_at: checklist.created_at,
          updated_at: checklist.updated_at,
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async createChecklist(
    data: CreateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>> {
    try {
      if (!data.card_id || !isValidUUID(data.card_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
        };
      }

      // No need to check for existing checklists since we now support multiple checklists per card
      const checklist = await Checklist.create({
        id: uuidv4(),
        card_id: data.card_id,
        title: data.title || "Checklist",
        data: data.data || [],
        ...(data.created_by ? { created_by: data.created_by } : {}),
      });

      const responsePayload = {
        id: checklist.id,
        card_id: checklist.card_id,
        title: checklist.title,
        data: checklist.data,
        created_at: checklist.created_at,
        updated_at: checklist.updated_at,
      };

      // broadcast websocket event
      broadcastToWebSocket("checklist:created", {
        checklist: responsePayload,
      });

      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "Checklist created successfully",
        data: responsePayload,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async createBulkChecklist(
    data: CreateChecklistDTO[]
  ): Promise<ResponseData<ChecklistDTO[]>> {
    try {
      const checklists = await Checklist.bulkCreate(data);
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "Checklists created successfully",
        data: checklists,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async updateChecklist(
    id: string,
    data: UpdateChecklistDTO
  ): Promise<ResponseData<ChecklistDTO>> {
    try {
      if (!id || !isValidUUID(id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid checklist ID",
        };
      }

      const checklist = await Checklist.findByPk(id);

      if (!checklist) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Checklist not found",
        };
      }

      const updateData: {
        title?: string;
        data?: ChecklistItem[];
        updated_by?: string;
      } = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.data !== undefined) updateData.data = data.data;
      if (data.updated_by !== undefined)
        updateData.updated_by = data.updated_by;

      await checklist.update(updateData);

      const responsePayload = {
        id: checklist.id,
        card_id: checklist.card_id,
        title: checklist.title,
        data: checklist.data,
        created_at: checklist.created_at,
        updated_at: checklist.updated_at,
      };

      broadcastToWebSocket("checklist:updated", {
        checklist: responsePayload,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Checklist updated successfully",
        data: responsePayload,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }

  async deleteChecklist(id: string): Promise<number> {
    try {
      if (!id || !isValidUUID(id)) {
        return StatusCodes.BAD_REQUEST;
      }

      const deleted = await Checklist.destroy({
        where: { id },
      });

      if (deleted === 0) {
        return StatusCodes.NOT_FOUND;
      }

      // broadcast deletion event regardless of found or not? only if deleted
      if (deleted > 0) {
        broadcastToWebSocket("checklist:deleted", {
          checklist_id: id,
        });
      }

      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          e.message
        );
      }
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e as string
      );
    }
  }
}
