import { ResponseData } from "@/utils/response_utils";
import { CardBoardTimeDetail, CardBoardTimeRepositoryI, filterCardBoardTimeDetail } from "./card_board_time_interface";
import CardBoardTimeHistory from "@/database/schemas/card_board_time_history.ts";
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import Board from "@/database/schemas/board";
import { readableDuration } from "@/utils/date_utils";


export class CardBoardTimeRepository implements CardBoardTimeRepositoryI {
  createFilter(filter: filterCardBoardTimeDetail): any {
    const whereClause: any = {};
    const orConditions: any = [];
    const andConditions: any = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter) whereClause.card_id = filter.card_id;
    if (filter.board_id) whereClause.board_id = filter.board_id;

    return whereClause;
  }
  async createCardTimeInBoard(data: CardBoardTimeDetail): Promise<ResponseData<CardBoardTimeDetail>> {
    try {
      const cardBoardTime = await CardBoardTimeHistory.create({
        id: data.id || uuidv4(),
        card_id: data.card_id,
        board_id: data.board_id,
        entered_at: data.entered_at || new Date(),
      });

      return {
        status_code: StatusCodes.OK,
        message: "Card time in board created successfully",
        data: new CardBoardTimeDetail({
          id: cardBoardTime.id,
          card_id: cardBoardTime.card_id,
          board_id: cardBoardTime.board_id,
          entered_at: cardBoardTime.entered_at,
        })
      };
    } catch (e) {
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
    }
  }

  async updateTimeTrackingRecord(data: filterCardBoardTimeDetail): Promise<ResponseData<CardBoardTimeDetail>>{
    try {
      const filterData = this.createFilter(data);
      const effectedRows = await CardBoardTimeHistory.update(data, {where: filterData} );

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
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
    }
  }

  async getCardTimeInBoard(cardId: string, boardId: string): Promise<ResponseData<CardBoardTimeDetail>>{
    try {
      const cardBoardTime = await CardBoardTimeHistory.findOne({
        where: {
          card_id: cardId,
          board_id: boardId
        }
      });

      if (!cardBoardTime) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: 'No time tracking record found'
        });
      }

      const formattedDuration = readableDuration(cardBoardTime.entered_at, cardBoardTime.exited_at || new Date());
      const cardBoardTimeDetails = new CardBoardTimeDetail({
        id: cardBoardTime.id,
        card_id: cardBoardTime.card_id,
        board_id: cardBoardTime.board_id,
        entered_at: cardBoardTime.entered_at,
        exited_at: cardBoardTime?.exited_at || undefined,
        formatted_time_in_board: formattedDuration,
      });

      const board = await Board.findOne({
        where: {
          id: cardBoardTime.board_id
        }
      })

      if (board) {
        cardBoardTimeDetails.board_name = board?.name;
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: 'Card time in board retrieved successfully',
        data: cardBoardTimeDetails
      });
    } catch (e) {
      console.error(':', e);
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
    }
  }

  async getCardTimeInBoardList(cardIds: string[], boardId: string): Promise<ResponseData<Array<CardBoardTimeDetail>>> {
    try {
      console.log("========= in repo=============");
      console.log("boardId: %o", boardId);
      const cardBoardTimes = await CardBoardTimeHistory.findAll({
        where: {
          card_id: cardIds,
          board_id: boardId
        }
      });

      if (!cardBoardTimes) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: 'No time tracking record found'
        });
      }

      let results: CardBoardTimeDetail[] = [];
      cardBoardTimes.forEach((item) => {
        const formattedDuration = readableDuration(item.entered_at, item.exited_at || new Date());
        const cardBoardTimeDetails = new CardBoardTimeDetail({
          id: item.id,
          card_id: item.card_id,
          board_id: item.board_id,
          entered_at: item.entered_at,
          exited_at: item?.exited_at || undefined,
          formatted_time_in_board: formattedDuration,
        });
        results.push(cardBoardTimeDetails);
      })

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: 'Card time in board retrieved successfully',
        data: results
      });
    } catch (e) {
      console.error('Error retrieving card time in board:', e);
      if (e instanceof Error) {
        throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message);
      }
      throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
    }
  }

}