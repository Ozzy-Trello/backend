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
import { AttachmentType } from '@/types/card_attachment';
import { CardDetail } from '../card/card_interfaces';
import Card from '@/database/schemas/card';

export class CardAttachmentRepository implements CardAttachmentRepositoryI {
  createFilter(filter: filterCardAttachmentDetail): any {
    const whereClause: any = {};

    if (filter.id) whereClause.id = filter.id;
    if (filter.card_id) whereClause.card_id = filter.card_id;
    if (filter.attachable_type) whereClause.attachable_type = filter.attachable_type;
    if (filter.attachable_id) whereClause.attachable_id = filter.attachable_id;
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
      if (data.attachable_type == AttachmentType.File && data.is_cover) {
        await this.resetCoverForCard(data.card_id, transaction);
      }

      let attachment = await CardAttachment.create({
        id,
        card_id: data.card_id,
        attachable_type: data.attachable_type,
        attachable_id: data.attachable_id,
        is_cover: data.is_cover,
        metadata: data.metadata,
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
          attachable_type: attachment.attachable_type,
          attachable_id: attachment.attachable_id,
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
        attachable_type: attachment.attachable_type,
        attachable_id: attachment.attachable_id,
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
      let filterData = this.createFilter(filter);
      
      paginate.setTotal(await CardAttachment.count({ where: filterData }));
      
      // query attachment without includes
      const attachments = await CardAttachment.findAll({
        where: filterData,
        offset: paginate.getOffset(),
        limit: paginate.limit,
        order: [['created_at', 'DESC']]
      });

      // exctract associated attachable ids
      let fileIds: string[] = [];
      let targetCardIds: string[] = [];
      attachments?.forEach(attachment => {
        if (attachment.attachable_type == AttachmentType.File) {
          fileIds.push(attachment.attachable_id);
        } else if (attachment.attachable_type == AttachmentType.Card) {
          targetCardIds.push(attachment.attachable_id);
        }
      });

      // Fetch all related files in a single query
      const files = await File.findAll({
        where: {
          id: {
            [Op.in]: fileIds 
          }
        }
      });
      const fileMap = new Map(); // Create a map for quick lookup
      files.forEach(file => {
        fileMap.set(file.id, file);
      });

      // Fetch all related target cards in a single query
      const targetCard = await Card.findAll({
        where: {
          id: {
            [Op.in]: targetCardIds
          }
        }
      })
      const targetCardMap = new Map(); // Create a map for quick lookup
      targetCard.forEach(card => {
        targetCardMap.set(card.id, card);
      });

      
      // construct the result with the associated files
      const result = attachments.map(attachment => {
        const file = attachment.attachable_type == AttachmentType.File  ? fileMap.get(attachment.attachable_id) || null : null;
        const targetCard = attachment.attachable_type == AttachmentType.Card ? targetCardMap.get(attachment.attachable_id) || null : null;
        
        return new CardAttachmentDetail({
          id: attachment.id,
          card_id: attachment.card_id,
          attachable_type: attachment.attachable_type,
          attachable_id: attachment.attachable_id,
          is_cover: attachment.is_cover,
          created_by: attachment.created_by,
          created_at: attachment.created_at,
          updated_at: attachment.updated_at,
          file: file,
          target_card: targetCard
        });
      });
      
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
        attachable_type: attachment.attachable_type,
        attachable_id: attachment.attachable_id,
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