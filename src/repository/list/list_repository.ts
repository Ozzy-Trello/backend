import { validate as isValidUUID, v4 as uuidv4 } from "uuid";

import {
  filterListDetail,
  filterMoveList,
  ListDetail,
  ListDetailUpdate,
  ListRepositoryI,
} from "@/repository/list/list_interfaces";
import List from "@/database/schemas/list";
import { Error, Op } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { Paginate } from "@/utils/data_utils";
import db from "@/database";
import { ExpressionBuilder, Transaction } from "kysely";
import { Database, ListTable } from "@/types/database";

export class ListRepository implements ListRepositoryI {
  createFilter(filter: filterListDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = filter.name;
    if (filter.board_id) whereClause.board_id = filter.board_id;

    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orName) orConditions.push({ name: filter.__orName });
    if (filter.__orBoardId) orConditions.push({ board_id: filter.__orBoardId });
    if (filter.__orCardLimit)
      orConditions.push({ card_limit: filter.__orCardLimit });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notName) notConditions.push({ name: filter.__notName });
    if (filter.__notBoardId)
      notConditions.push({ board_id: filter.__notBoardId });
    if (filter.__notCardLimit)
      notConditions.push({ card_limit: filter.__notCardLimit });

    if (notConditions.length > 0) {
      whereClause[Op.not] = notConditions;
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }
    return whereClause;
  }

  createKyFilter(
    eb: ExpressionBuilder<Database, any>,
    filter: filterListDetail
  ) {
    let query = eb.and([]);
    if (filter?.id) query = eb.and([query, eb("id", "=", filter.id)]);
    if (filter?.name) query = eb.and([query, eb("name", "=", filter.name)]);
    if (filter?.board_id)
      query = eb.and([query, eb("board_id", "=", filter.board_id)]);
    if (filter?.card_limit)
      query = eb.and([query, eb("card_limit", "=", filter.card_limit)]);

    const orConditions = [];
    if (filter.__orId) orConditions.push(eb("id", "=", filter.__orId));
    if (filter.__orName)
      orConditions.push(eb("name", "ilike", `%${filter.__orName}%`));
    if (filter.__orBoardId)
      orConditions.push(eb("board_id", "=", filter.__orBoardId));
    if (filter.__orCardLimit)
      orConditions.push(eb("card_limit", "=", filter.__orCardLimit));
    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }

    const notConditions = [];
    if (filter.__notId) notConditions.push(eb("id", "!=", filter.__notId));
    if (filter.__notName)
      notConditions.push(eb("name", "!=", filter.__notName));
    if (filter.__notBoardId)
      notConditions.push(eb("board_id", "!=", filter.__notBoardId));
    if (filter.__notCardLimit)
      notConditions.push(eb("card_limit", "!=", filter.__notCardLimit));
    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }

    return query;
  }

  async getTotalListInList(board_id: string): Promise<ResponseData<number>> {
    let total = await db
      .selectFrom("list")
      .where("list.board_id", "=", board_id)
      .select(({ fn }) => fn.count<number>("list.id").as("total"))
      .executeTakeFirst();
    return new ResponseData({
      message: "Ok",
      status_code: StatusCodes.OK,
      data: total?.total!,
    });
  }

  async newTopOrderList(board_id: string): Promise<ResponseData<number>> {
    const topCard = await db
      .selectFrom("list")
      .where("board_id", "=", board_id)
      .orderBy("order", "asc")
      .limit(1)
      .selectAll()
      .executeTakeFirst();
    const newOrder = topCard ? topCard.order - 10000 : 1;
    return new ResponseData({
      data: newOrder,
      message: "top of list",
      status_code: StatusCodes.OK,
    });
  }

  async newBottomOrderList(board_id: string): Promise<ResponseData<number>> {
    const maxOrder = await this.getMaxListOrderInBoard(board_id!);
    const newOrder = maxOrder + 10000;
    return new ResponseData({
      data: newOrder,
      message: "bottom of list",
      status_code: StatusCodes.OK,
    });
  }

  private async getListByListWithTrx(
    trx: Transaction<Database>,
    board_id: string
  ): Promise<ListTable[]> {
    return trx
      .selectFrom("list")
      .where("board_id", "=", board_id)
      .orderBy("order", "asc")
      .selectAll()
      .execute();
  }

  private async normalizeListOrders(
    trx: Transaction<Database>,
    board_id: string
  ): Promise<void> {
    const cards = await this.getListByListWithTrx(trx, board_id);
    const updatePromises = cards.map((card, index) => {
      const newOrder = (index + 1) * 500;
      return trx
        .updateTable("list")
        .set({ order: newOrder })
        .where("id", "=", String(card.id))
        .execute();
    });
    await Promise.all(updatePromises);
  }

  async getMaxListOrderInBoard(board_id: string): Promise<number> {
    const result = await db
      .selectFrom("list")
      .select((eb) => eb.fn.max("order").as("max_order"))
      .where("board_id", "=", board_id)
      .executeTakeFirst();
    return result?.max_order ?? 0;
  }

  async getAdjacentListIds(
    list_id: string,
    board_id: string
  ): Promise<
    ResponseData<{ previous_id: string | null; next_id: string | null }>
  > {
    try {
      const current_list = await db
        .selectFrom("list")
        .where("id", "=", list_id)
        .where("board_id", "=", board_id)
        .select(["id", "order"])
        .executeTakeFirstOrThrow();

      const previous_list = await db
        .selectFrom("list")
        .where("board_id", "=", board_id)
        .where("order", "<", current_list.order)
        .orderBy("order", "desc")
        .limit(1)
        .select("id")
        .executeTakeFirst();

      const next_list = await db
        .selectFrom("list")
        .where("board_id", "=", board_id)
        .where("order", ">", current_list.order)
        .orderBy("order", "asc")
        .limit(1)
        .select("id")
        .executeTakeFirst();

      return new ResponseData({
        message: "Adjacent lists found",
        status_code: StatusCodes.OK,
        data: {
          previous_id: previous_list?.id || null,
          next_id: next_list?.id || null,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return new ResponseData({
          message: `Error finding adjacent lists: ${error.message}`,
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
          data: { previous_id: null, next_id: null },
        });
      }

      return new ResponseData({
        message: "Unknown error finding adjacent lists",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { previous_id: null, next_id: null },
      });
    }
  }

  async deleteList(filter: filterListDetail): Promise<number> {
    try {
      const list = await List.destroy({ where: this.createFilter(filter) });
      if (list <= 0) {
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

  async createList(data: ListDetail): Promise<ResponseData<ListDetail>> {
    try {
      const list = await db.transaction().execute(async (trx) => {
        const bottom_position = await this.newBottomOrderList(data.board_id);
        if (bottom_position.status_code != StatusCodes.OK) {
          throw new InternalServerError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            bottom_position.message
          );
        }

        const new_list = await trx
          .insertInto("list")
          .values({
            id: uuidv4(),
            name: data.name!,
            background: data.background!,
            board_id: data.board_id!,
            order: bottom_position.data!,
            card_limit: data.card_limit,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        if (bottom_position.data! < -1000) {
          await this.normalizeListOrders(trx, data.board_id);
          const updated_list = await trx
            .selectFrom("list")
            .where("id", "=", new_list.id)
            .selectAll()
            .executeTakeFirstOrThrow();
          return updated_list;
        }
        return new_list;
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "create list success",
        data: new ListDetail({
          id: list.id,
          name: list.name,
          background: list.background,
          card_limit: list.card_limit,
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

  async getList(filter: filterListDetail): Promise<ResponseData<ListDetail>> {
    try {
      if (filter.id && !isValidUUID(filter.id)) {
        return {
          status_code: StatusCodes.BAD_REQUEST,
          message: "list id not valid uuid",
        };
      }
      const list = await List.findOne({ where: this.createFilter(filter) });
      if (!list) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "list is not found",
        };
      }
      let result = new ListDetail({
        id: list.id,
        name: list.name,
        background: list.background,
        board_id: list.board_id,
        card_limit: list.card_limit,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "list detail",
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

  async getListList(
    filter: filterListDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<ListDetail>>> {
    let result: Array<ListDetail> = [];
    let qry = db
      .selectFrom("list")
      .where((eb) => this.createKyFilter(eb, filter));

    let total = await qry
      .select(({ fn }) => fn.count<number>("list.id").as("total"))
      .executeTakeFirst();
    paginate.setTotal(total?.total!);

    let qryResult = await qry
      .selectAll()
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .orderBy("list.order asc")
      .execute();
    qryResult.map((raw) => {
      result.push(
        new ListDetail({
          id: raw.id,
          name: raw.name,
          background: raw.background,
          board_id: raw.board_id,
          card_limit: raw.card_limit,
        })
      );
    });

    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "list list",
        data: result,
      },
      paginate
    );
  }

  async updateList(
    filter: filterListDetail,
    data: ListDetailUpdate
  ): Promise<number> {
    try {
      const effected = await List.update(data.toObject(), {
        where: this.createFilter(filter),
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

  async moveList(filter: filterMoveList): Promise<ResponseData<ListDetail>> {
    try {
      if (!filter.id || !isValidUUID(filter.id)) {
        return new ResponseData({
          status_code: StatusCodes.BAD_REQUEST,
          message: "List ID is invalid",
        });
      }

      return await db
        .transaction()
        .execute(async (tx: Transaction<Database>) => {
          const list = await tx
            .selectFrom("list")
            .where("id", "=", filter.id!)
            .selectAll()
            .executeTakeFirst();

          if (!list) {
            return new ResponseData({
              status_code: StatusCodes.NOT_FOUND,
              message: "List not found",
            });
          }

          const listsInBoard = await tx
            .selectFrom("list")
            .where("board_id", "=", list.board_id)
            .where("id", "!=", filter.id!)
            .orderBy("order", "asc")
            .select(["id", "order"])
            .execute();

          let newOrder: number;
          let needsRebalance = false;

          if (
            filter.target_position === undefined ||
            filter.target_position >= listsInBoard.length
          ) {
            newOrder =
              listsInBoard.length > 0
                ? listsInBoard[listsInBoard.length - 1].order + 10000
                : 10000;
          } else if (filter.target_position === 0) {
            newOrder =
              listsInBoard.length > 0
                ? Math.max(listsInBoard[0].order / 2, 5000)
                : 10000;
            if (newOrder === listsInBoard[0]?.order) needsRebalance = true;
          } else {
            const prevList = listsInBoard[filter.target_position - 1];
            const nextList = listsInBoard[filter.target_position];
            const gap = nextList.order - prevList.order;

            if (gap < 1000) {
              needsRebalance = true;
              newOrder = prevList.order + 1;
            } else {
              newOrder = Math.floor((prevList.order + nextList.order) / 2);
            }
          }

          await tx
            .updateTable("list")
            .set({ order: newOrder })
            .where("id", "=", filter.id!)
            .execute();

          if (needsRebalance) {
            await this.rebalanceListOrders(list.board_id, tx);
          }

          const updatedList = await tx
            .selectFrom("list")
            .where("id", "=", filter.id!)
            .selectAll()
            .executeTakeFirst();

          return new ResponseData({
            status_code: StatusCodes.OK,
            message: "List moved successfully",
            data: new ListDetail({
              id: updatedList!.id,
              name: updatedList!.name,
              background: updatedList!.background,
              order: updatedList!.order,
              board_id: updatedList!.board_id,
            }),
          });
        });
    } catch (e) {
      console.error(e);
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message:
          e instanceof Error ? e.message : "An unexpected error occurred",
      });
    }
  }

  async rebalanceListOrders(boardId: string, tx: Transaction<Database>) {
    const lists = await tx
      .selectFrom("list")
      .where("board_id", "=", boardId)
      .orderBy("order", "asc")
      .select(["id"])
      .execute();

    let baseOrder = 10000;
    const spacing = 10000;

    for (let i = 0; i < lists.length; i++) {
      const id = lists[i].id;

      await tx
        .updateTable("list")
        .set({ order: baseOrder + i * spacing })
        .where("id", "=", id)
        .execute();
    }
  }
}
