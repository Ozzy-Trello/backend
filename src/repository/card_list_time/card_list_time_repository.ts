import { ResponseData } from "@/utils/response_utils";
import { CardListTimeDetail, CardListTimeRepositoryI, filterCardListTimeDetail } from "./card_list_time_interface";
import CardListTimeHistory from "@/database/schemas/card_list_time_history";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { InternalServerError } from "@/utils/errors";
import { StatusCodes } from "http-status-codes";
import List from "@/database/schemas/list";
import { readableDuration } from "@/utils/date_utils";

export class CardListTimeRepository implements CardListTimeRepositoryI {
  createFilter(filter: filterCardListTimeDetail): any {
    const whereClause: any = {};
    const orConditions: any = [];
    const andConditions: any = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.card_id) whereClause.card_id = filter.card_id;
    if (filter.list_id) whereClause.list_id = filter.list_id;

    return whereClause;
  }
  async createCardTimeInList(data: CardListTimeDetail): Promise<ResponseData<CardListTimeDetail>> {
    try {
      const cardListTime = await CardListTimeHistory.create({
        id: data.id || uuidv4(),
        card_id: data.card_id,
        list_id: data.list_id,
        entered_at: data.entered_at || new Date(),
      });

      return {
        status_code: StatusCodes.OK,
        message: "Card time in list created successfully",
        data: new CardListTimeDetail({
          id: cardListTime.id,
          card_id: cardListTime.card_id,
          list_id: cardListTime.list_id,
          entered_at: cardListTime.entered_at,
        })
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
    }
  }

  async updateTimeTrackingRecord(data: filterCardListTimeDetail): Promise<ResponseData<CardListTimeDetail>>{
    try {
      const filterData = this.createFilter(data);
      const effectedRows = await CardListTimeHistory.update(data, {where: filterData} );

      if (effectedRows[0] === 0) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: 'No time tracking record found to update'
        });
      }
        
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: 'Time tracking record updated successfully'
      });
    } catch (e) {
      console.error('Error updating time tracking record:', e);
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }

  async getCardTimeInList(cardId: string): Promise<ResponseData<Array<CardListTimeDetail>>>{
    try {
      if (cardId && !isValidUUID(cardId)) {
        return new ResponseData({
          status_code: StatusCodes.BAD_REQUEST,
          message: 'card_id is not a valid UUID'
        });
      }

      const cardListTime = await CardListTimeHistory.findAll({
        where: {
          card_id: cardId
        }
      });
      
      const listIds = cardListTime.map(item => item.list_id);
      const list = await List.findAll({
        where: {
          id: listIds
        }
      });
      const listMap = new Map();
      list.forEach(item => {
        listMap.set(item.id, item.name);
      });

      // Format the data for better readability
      const formattedListTimes = cardListTime.map(item => {
        const listName = listMap.get(item.list_id) || 'Unknown List';
        const formattedDuration = readableDuration(item.entered_at, item.exited_at);
        return new CardListTimeDetail({
          id: item.id,
          card_id: item.card_id,
          list_id: item.list_id,
          entered_at: item.entered_at,
          exited_at: item?.exited_at || undefined,
          formatted_time_in_list: formattedDuration,
          list_name: listName
        });
      });
      
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: 'Card time in list retrieved successfully',
        data: formattedListTimes
      });

    } catch (e) {
      console.error('Error getting card time in lists:', e);
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string);
    }
  }
}