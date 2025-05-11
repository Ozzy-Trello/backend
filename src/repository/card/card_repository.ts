import { validate as isValidUUID, v4 as uuidv4 } from "uuid";

import {
  filterCardDetail,
  CardDetail,
  CardDetailUpdate,
  CardRepositoryI,
  CardActionActivity,
  CardComment,
  CardActivity,
  CardActivityMoveList,
} from "@/repository/card/card_interfaces";
import Card from "@/database/schemas/card";
import { Error, Op } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import db from "@/database";
import { Database } from "@/types/database";
import { Transaction, sql } from "kysely";
import {
  CardActionType,
  CardActionValue,
  MoveListValue,
} from "@/types/custom_field";

export class CardRepository implements CardRepositoryI {
  createFilter(filter: filterCardDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = filter.name;
    if (filter.list_id) whereClause.list_id = filter.list_id;

    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orName) orConditions.push({ name: filter.__orName });
    if (filter.__orListId) orConditions.push({ list_id: filter.__orListId });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notName) notConditions.push({ name: filter.__notName });
    if (filter.__notListId) notConditions.push({ list_id: filter.__notListId });

    if (notConditions.length > 0) {
      whereClause[Op.not] = notConditions;
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    return whereClause;
  }

  async deleteCard(filter: filterCardDetail): Promise<number> {
    try {
      const card = await Card.destroy({ where: this.createFilter(filter) });
      if (card <= 0) {
        return StatusCodes.NOT_FOUND;
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

  async createCard(data: CardDetail): Promise<ResponseData<CardDetail>> {
    try {
      const card = await Card.create({
        name: data.name!,
        list_id: data.list_id!,
        description: data.list_id,
        order: data.order!,
      });
      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "create card success",
        data: new CardDetail({
          id: card.id,
          name: card.name,
          description: card.description,
          order: card.order,
        }),
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

  async getCard(filter: filterCardDetail): Promise<ResponseData<CardDetail>> {
    try {
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "card id is not valid uuid",
        };
      }
      const filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "get detail card without filter is not allowed",
        };
      }
      const card = await Card.findOne({ where: filterData });
      if (!card) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "card is not found",
        };
      }
      let result = new CardDetail({
        id: card.id,
        name: card.name,
        description: card.description,
        order: card.order,
        list_id: card.list_id,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "card detail",
        data: result,
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

  async getListCard(
    filter: filterCardDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardDetail>>> {
    let result: Array<CardDetail> = [];
    paginate.setTotal(await Card.count({ where: this.createFilter(filter) }));
    const lists = await Card.findAll({
      where: this.createFilter(filter),
      offset: paginate.getOffset(),
      limit: paginate.limit,
    });
    for (const card of lists) {
      result.push(
        new CardDetail({
          id: card.id,
          name: card.name,
          description: card.description,
          order: card.order,
          list_id: card.list_id,
        })
      );
    }
    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "card card",
        data: result,
      },
      paginate
    );
  }

  async updateCard(
    filter: filterCardDetail,
    data: CardDetailUpdate
  ): Promise<number> {
    try {
      const filterData = this.createFilter(filter);
      if (isFilterEmpty(filterData)) {
        return StatusCodes.NOT_FOUND;
      }
      const effected = await Card.update(data.toObject(), {
        where: filterData,
      });
      if (effected[0] == 0) {
        return StatusCodes.NOT_FOUND;
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

  async addActivity(
    filter: filterCardDetail,
    data: CardActivity
  ): Promise<ResponseData<CardActivity>> {
    let card = await this.getCard(filter);
    if (card.status_code != StatusCodes.OK) {
      return new ResponseData({
        status_code: card.status_code,
        message: card.message,
      });
    }

    if (data.action && data.action instanceof CardActionActivity) {
      let item: CardActionActivity = data.action as CardActionActivity;
      const trx = await db
        .transaction()
        .execute(async (tx: Transaction<Database>) => {
          const card_activiy = await tx
            .insertInto("card_activity")
            .values({
              id: uuidv4(),
              activity_type: data.activity_type,
              card_id: data.card_id,
              sender_user_id: data.sender_id,
            })
            .returning(["id"])
            .executeTakeFirst();

          await tx
            .insertInto("card_activity_action")
            .values({
              id: uuidv4(),
              action: item.action_type,
              activity_id: card_activiy?.id!,
              source: item.source,
            })
            .executeTakeFirst();

          return new ResponseData({
            status_code: StatusCodes.OK,
            message: "card detail",
            data: new CardActivity(
              {
                id: card_activiy?.id!,
                card_id: data.card_id,
                sender_id: data.sender_id,
              },
              item
            ),
          });
        });
      return trx;
    } else if (data.comment && data.comment instanceof CardComment) {
      let item: CardComment = data.comment as CardComment;
      const trx = await db
        .transaction()
        .execute(async (tx: Transaction<Database>) => {
          const card_activiy = await tx
            .insertInto("card_activity")
            .values({
              id: uuidv4(),
              activity_type: data.activity_type,
              card_id: data.card_id,
              sender_user_id: data.sender_id,
            })
            .returning(["id"])
            .executeTakeFirst();

          await tx
            .insertInto("card_activity_text")
            .values({
              id: uuidv4(),
              activity_id: card_activiy?.id!,
              text: item.text,
            })
            .executeTakeFirst();

          return new ResponseData({
            status_code: StatusCodes.OK,
            message: "card detail",
            data: new CardActivity(
              {
                id: card_activiy?.id!,
                card_id: data.card_id,
                sender_id: data.sender_id,
              },
              item
            ),
          });
        });
      return trx;
    } else {
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "data not support",
      });
    }
  }

  async getCardActivities(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<CardActivity[]>> {
    const result: CardActivity[] = [];

    const total = await db
      .selectFrom("card_activity")
      .where("card_id", "=", card_id)
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .executeTakeFirst();

    paginate.setTotal(total?.count ?? 0);

    const activities = await db
      .selectFrom("card_activity as ca")
      .leftJoin("card_activity_action as caa", "ca.id", "caa.activity_id")
      .leftJoin("card_activity_text as cat", "ca.id", "cat.activity_id")
      .where("ca.card_id", "=", card_id)
      .select([
        sql<string>`ca.id`.as("activity_id"),
        sql<CardActionType>`ca.activity_type`.as("activity_type"),
        sql<string>`ca.card_id`.as("card_id"),
        sql<string>`ca.sender_user_id`.as("sender_id"),
        sql<string>`caa.action`.as("action_type"),
        sql<CardActionValue>`caa.source`.as("source"),
        sql<string>`cat.text`.as("text"),
        sql<string>`"ca"."createdAt"`.as("xcreatedAt"),
      ])
      .orderBy("xcreatedAt", "desc")
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();

    for (const row of activities) {
      const act = {
        id: row.activity_id,
        card_id: row.card_id,
        sender_id: row.sender_id,
      };
      if (row.action_type) {
        const action = new CardActionActivity({
          action_type: row.action_type as CardActionType,
        });
        if (row.action_type == CardActionType.MoveList) {
          action.setMoveListValue(row.source as MoveListValue);
        }
        result.push(new CardActivity(act, action));
      } else if (row.text) {
        result.push(new CardActivity(act, new CardComment({ text: row.text })));
      }
    }

    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "card activity list",
        data: result,
      },
      paginate
    );
  }

  async getCardMoveListActivity(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CardActivityMoveList>>> {
    let result: Array<CardActivityMoveList> = [];

    const qry = db
      .selectFrom("card_activity_action as caa")
      .innerJoin("card_activity as ca", "caa.activity_id", "ca.id")
      .where("ca.card_id", "=", card_id)
      .where("caa.action", "=", CardActionType.MoveList);

    const total = await qry
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .executeTakeFirst();
    paginate.setTotal(total?.count!);

    const results = await qry
      .select([
        sql<string>`caa.createdAt`.as("xcreatedAt"),
        sql<string>`(caa.source ->> 'origin_list_id')`.as("origin_list_id"),
        sql<string>`(caa.source ->> 'destination_list_id')`.as(
          "destination_list_id"
        ),
      ])
      .orderBy("xcreatedAt", "asc")
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();

    for (const row of results) {
      const date_selected = new Date(row.xcreatedAt);
      const formatted = date_selected.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      result.push({ date: formatted, list_id: row.destination_list_id });
    }

    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "card list history",
        data: result,
      },
      paginate
    );
  }

  async getAllCards(): Promise<Array<CardDetail>> {
    let result: Array<CardDetail> = [];
    const cards = await Card.findAll();
    for (const card of cards) {
      result.push(
        new CardDetail({
          id: card.id,
          name: card.name,
          list_id: card.list_id,
          description: card.description,
        })
      );
    }
    return result;
  }
}
