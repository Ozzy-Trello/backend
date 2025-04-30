import { validate as isValidUUID } from 'uuid';
import { CardAttachmentDetail, CardAttachmentDetailUpdate, CardAttachmentRepositoryI, filterCardAttachmentDetail } from "./card_attachment_interface";
import CardAttachment from '@/database/schemas/card_attachment';
import File from '@/database/schemas/file';
import { Error, Op, Transaction } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import { v4 as uuidv4 } from 'uuid';
import sequelize from '@/database/connections';

export class CardAttachmentRepository implements CardAttachmentRepositoryI {
  createFilter(filter: filterCardAttachmentDetail): any {
    const whereClause: any = {};

    if (filter.id) whereClause.id = filter.id;
    if (filter.card_id) whereClause.card_id = filter.card_id;
    if (filter.file_id) whereClause.file_id = filter.file_id;
    if (filter.is_cover !== undefined) whereClause.is_cover = filter.is_cover;
    if (filter.created_by) whereClause.created_by = filter.created_by;
    
    return whereClause;
  }

  async deleteCardAttachment(filter: filterCardAttachmentDetail): Promise<number> {
    try {
      const attachment = await CardAttachment.destroy({ where: this.createFilter(filter) });
      if (attachment <= 0) {
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

  async createCardAttachment(data: CardAttachmentDetail): Promise<ResponseData<CardAttachmentDetail>> {
    const transaction = await sequelize.transaction();
    
    try {
      // Generate a new UUID if not provided
      const id = data.id || uuidv4();
      
      // If set as cover, reset any existing covers for this card
      if (data.is_cover) {
        await this.resetCoverForCard(data.card_id, transaction);
      }
      
      let attachment = await CardAttachment.create({
        id,
        card_id: data.card_id,
        file_id: data.file_id,
        is_cover: data.is_cover,
        created_by: data.created_by!,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create card attachment success",
        data: new CardAttachmentDetail({
          id: attachment.id,
          card_id: attachment.card_id,
          file_id: attachment.file_id,
          is_cover: attachment.is_cover,
          created_by: attachment.created_by,
          created_at: attachment.created_at,
          updated_at: attachment.updated_at
        })
      });
    } catch (e) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async updateCardAttachment(filter: filterCardAttachmentDetail, data: CardAttachmentDetailUpdate): Promise<number> {
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      // check if the attachment exists
      const attachment = await CardAttachment.findOne({ 
        where: this.createFilter(filter),
        transaction
      });
      
      if (!attachment) {
        await transaction.rollback();
        return StatusCodes.NOT_FOUND;
      }
      
      // If set as a cover, reset any existing covers
      if (data.is_cover) {
        await this.resetCoverForCard(attachment.card_id, transaction);
      }
      
      // Update the attachment
      const updateData = data.toObject();
      const [affectedCount] = await CardAttachment.update(updateData, {
        where: this.createFilter(filter),
        transaction
      });
      
      if (affectedCount === 0) {
        await transaction.rollback();
        return StatusCodes.NOT_FOUND;
      }
      
      // Commit the transaction
      await transaction.commit();
      
      return StatusCodes.OK;
    } catch (e) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  /**
   * Helper method to reset is_cover flag for all attachments of a card except the current one
   */
  private async resetCoverForCard(cardId: string, transaction?: Transaction): Promise<void> {
    await CardAttachment.update(
      { is_cover: false },
      { 
        where: { 
          card_id: cardId,
          is_cover: true
        },
        transaction
      }
    );
  }

  async getCardAttachment(filter: filterCardAttachmentDetail): Promise<ResponseData<CardAttachmentDetail>> {
    try {
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "card attachment id is not valid uuid",
        };
      }

      let filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "you need filter to get card attachment",
        };
      }

      const attachment = await CardAttachment.findOne({ 
        where: filterData,
        include: [
          {
            model: File,
            as: 'file',
            required: false
          }
        ]
      });
      
      if (!attachment) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "card attachment is not found",
        };
      }
      
      let result = new CardAttachmentDetail({
        id: attachment.id,
        card_id: attachment.card_id,
        file_id: attachment.file_id,
        is_cover: attachment.is_cover,
        created_by: attachment.created_by,
        created_at: attachment.created_at,
        updated_at: attachment.updated_at,
        file: attachment.file
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "card attachment detail",
        data: result,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async getCardAttachmentList(filter: filterCardAttachmentDetail, paginate: Paginate): Promise<ResponseListData<Array<CardAttachmentDetail>>> {
    try {
      let result: Array<CardAttachmentDetail> = [];
      let filterData = this.createFilter(filter);
      
      paginate.setTotal(await CardAttachment.count({ where: filterData }));
      
      const attachments = await CardAttachment.findAll({
        where: filterData,
        offset: paginate.getOffset(),
        limit: paginate.limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: File,
            as: 'file',
            required: false
          }
        ]
      });
      
      for (const attachment of attachments) {
        result.push(new CardAttachmentDetail({
          id: attachment.id,
          card_id: attachment.card_id,
          file_id: attachment.file_id,
          is_cover: attachment.is_cover,
          created_by: attachment.created_by,
          created_at: attachment.created_at,
          updated_at: attachment.updated_at,
          file: attachment.file
        }));
      }
      
      return new ResponseListData({
        status_code: StatusCodes.OK,
        message: "list card attachment",
        data: result,
      }, paginate);
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }
  
  async getCoverAttachment(cardId: string): Promise<ResponseData<CardAttachmentDetail>> {
    try {
      if (!cardId || !isValidUUID(cardId)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "card id is not valid uuid",
        };
      }

      const filter = {
        card_id: cardId,
        is_cover: true
      };
      
      const attachment = await CardAttachment.findOne({ 
        where: filter,
        include: [
          {
            model: File,
            as: 'file',
            required: false
          }
        ]
      });
      
      if (!attachment) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "cover attachment not found",
        };
      }
      
      let result = new CardAttachmentDetail({
        id: attachment.id,
        card_id: attachment.card_id,
        file_id: attachment.file_id,
        is_cover: attachment.is_cover,
        created_by: attachment.created_by,
        created_at: attachment.created_at,
        updated_at: attachment.updated_at,
        file: attachment.file
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "cover attachment detail",
        data: result,
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }
}