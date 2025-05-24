import { ResponseData } from "@/utils/response_utils";

export interface CardBoardTimeRepositoryI {
  createCardTimeInBoard(data: CardBoardTimeDetail): Promise<ResponseData<CardBoardTimeDetail>>;
  updateTimeTrackingRecord(data: filterCardBoardTimeDetail): Promise<ResponseData<CardBoardTimeDetail>>;
  getCardTimeInBoard(cardId: string, boardId: string): Promise<ResponseData<CardBoardTimeDetail>>;
  getCardTimeInBoardList(cardIds: string[], boardIds: string): Promise<ResponseData<Array<CardBoardTimeDetail>>>;
}

export interface filterCardBoardTimeDetail {
  id?: string;
  card_id?: string;
  board_id?: string;
  entered_at?: Date;
  exited_at?: Date;
  formatted_time_in_board?: string;
  board_name?: string;
}
export class CardBoardTimeDetail { 
  public id?: string;
  public card_id!: string;
  public board_id!: string;
  public entered_at!: Date;
  public exited_at!: Date;
  public formatted_time_in_board?: string;
  public board_name?: string;

  constructor(payload: Partial<CardBoardTimeDetail>) {
    Object.assign(this, payload);
  }
}

