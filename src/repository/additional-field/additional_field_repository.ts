import { 
  IAdditionalFieldRepository, 
  AdditionalFieldDTO, 
  CreateAdditionalFieldDTO, 
  UpdateAdditionalFieldDTO
} from "@/controller/additional-field/additional_field_interfaces";
import { ResponseData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { v4 as uuidv4 } from 'uuid';
import AdditionalField from "@/database/schemas/additional_field";
import { validate as isValidUUID } from 'uuid';

export class AdditionalFieldRepository implements IAdditionalFieldRepository {
  async getAdditionalFieldsByCardId(cardId: string): Promise<ResponseData<AdditionalFieldDTO[]>> {
    try {
      if (!cardId || !isValidUUID(cardId)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
        };
      }

      const additionalFields = await AdditionalField.findAll({
        where: { card_id: cardId },
        order: [['created_at', 'ASC']]
      });

      if (!additionalFields || additionalFields.length === 0) {
        return {
          status_code: StatusCodes.OK,
          message: "No additional fields found for this card",
          data: []
        };
      }

      const additionalFieldDTOs: AdditionalFieldDTO[] = additionalFields.map(field => ({
        id: field.id,
        card_id: field.card_id,
        data: field.data,
        created_at: field.created_at,
        updated_at: field.updated_at
      }));

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Additional fields retrieved successfully",
        data: additionalFieldDTOs
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async getAdditionalFieldById(id: string): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      if (!id || !isValidUUID(id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid additional field ID",
        };
      }

      const additionalField = await AdditionalField.findByPk(id);

      if (!additionalField) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Additional field not found",
        };
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Additional field retrieved successfully",
        data: {
          id: additionalField.id,
          card_id: additionalField.card_id,
          data: additionalField.data,
          created_at: additionalField.created_at,
          updated_at: additionalField.updated_at
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async createAdditionalField(data: CreateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      if (!data.card_id || !isValidUUID(data.card_id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid card ID",
        };
      }

      // Check if an additional field already exists for this card
      const existingField = await AdditionalField.findOne({
        where: { card_id: data.card_id }
      });

      // If exists, update it instead of creating a new one
      if (existingField) {
        existingField.data = data.data;
        await existingField.save();

        return new ResponseData({
          status_code: StatusCodes.OK,
          message: "Additional field updated successfully",
          data: {
            id: existingField.id,
            card_id: existingField.card_id,
            data: existingField.data,
            created_at: existingField.created_at,
            updated_at: existingField.updated_at
          }
        });
      }

      // Create new additional field
      const additionalField = await AdditionalField.create({
        id: uuidv4(),
        card_id: data.card_id,
        data: data.data || {}
      });

      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "Additional field created successfully",
        data: {
          id: additionalField.id,
          card_id: additionalField.card_id,
          data: additionalField.data,
          created_at: additionalField.created_at,
          updated_at: additionalField.updated_at
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async updateAdditionalField(id: string, data: UpdateAdditionalFieldDTO): Promise<ResponseData<AdditionalFieldDTO>> {
    try {
      if (!id || !isValidUUID(id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "Invalid additional field ID",
        };
      }

      const additionalField = await AdditionalField.findByPk(id);

      if (!additionalField) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "Additional field not found",
        };
      }

      await additionalField.update({ data: data.data });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Additional field updated successfully",
        data: {
          id: additionalField.id,
          card_id: additionalField.card_id,
          data: additionalField.data,
          created_at: additionalField.created_at,
          updated_at: additionalField.updated_at
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async deleteAdditionalField(id: string): Promise<number> {
    try {
      if (!id || !isValidUUID(id)) {
        return StatusCodes.BAD_REQUEST;
      }

      const deleted = await AdditionalField.destroy({
        where: { id }
      });

      if (deleted === 0) {
        return StatusCodes.NOT_FOUND;
      }

      return StatusCodes.NO_CONTENT;
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }
}
