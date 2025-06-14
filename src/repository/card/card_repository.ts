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
  filterMoveCard,
  filterCount,
  IItemDashcard,
} from "@/repository/card/card_interfaces";
import { Error, Op, Sequelize } from "sequelize";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";
import { isFilterEmpty, Paginate } from "@/utils/data_utils";
import db from "@/database";
import { CardTable, Database } from "@/types/database";
import {
  ExpressionBuilder,
  SelectQueryBuilder,
  Transaction,
  sql,
} from "kysely";
import { CardActionValue } from "@/types/custom_field";
import { CardType } from "@/types/card";
import Card from "@/database/schemas/card";
import { FilterConfig } from "@/controller/card/card_interfaces";
import { WhatsAppController } from "@/controller/whatsapp/whatsapp_controller";

export class CardRepository implements CardRepositoryI {
  createFilter(filter: filterCardDetail): any {
    const whereClause: any = {};
    const orConditions: any[] = [];
    const notConditions: any[] = [];

    if (filter.id) whereClause.id = filter.id;
    if (filter.name) whereClause.name = filter.name;
    if (filter.list_id) whereClause.list_id = filter.list_id;
    if (filter.archive) whereClause.archive = filter.archive;

    if (filter.__orId) orConditions.push({ id: filter.__orId });
    if (filter.__orName) orConditions.push({ name: filter.__orName });
    if (filter.__orListId) orConditions.push({ list_id: filter.__orListId });
    if (filter.__orArchive) orConditions.push({ archive: filter.__orArchive });

    if (filter.__notId) notConditions.push({ id: filter.__notId });
    if (filter.__notName) notConditions.push({ name: filter.__notName });
    if (filter.__notListId) notConditions.push({ list_id: filter.__notListId });
    if (filter.__notArchive)
      notConditions.push({ archive: filter.__notArchive });

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
    filter: filterCardDetail
  ) {
    let query = eb.and([]); // Inisialisasi sebagai kondisi AND kosong
    const orConditions = [];

    if (filter?.id) query = eb.and([query, eb("id", "=", filter.id)]);
    if (filter.name) query = eb.and([query, eb("name", "=", filter.name)]);
    if (filter?.list_id)
      query = eb.and([query, eb("list_id", "=", filter.list_id)]);
    if (filter?.archive)
      query = eb.and([query, eb("archive", "is", sql.lit(filter?.archive))]);
    if (!filter?.archive)
      query = eb.and([
        query,
        sql`(archive IS ${sql.lit(false)} OR archive IS ${sql.lit(null)})`,
      ]);

    if (filter.__orId) orConditions.push(eb("id", "=", filter.__orId));
    if (filter.__orName)
      orConditions.push(eb("name", "ilike", `%${filter.__orName}%`));
    if (filter.description)
      orConditions.push(
        eb("description", "ilike", `%${filter.__orDescription}%`)
      );
    if (filter.__orListId)
      orConditions.push(eb("list_id", "=", filter.__orListId));
    if (filter?.archive)
      orConditions.push(eb("archive", "is", sql.lit(filter?.archive)));
    // if (filter?.archive) {
    // 	orConditions.push(sql`archive IS ${sql.lit(false)} OR archive IS ${sql.lit(null)}`)
    // } else {
    // 	orConditions.push(eb('archive', 'is', sql.lit(true)))
    // }

    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }

    // NOT conditions
    const notConditions = [];
    if (filter.__notId) notConditions.push(eb("id", "!=", filter.__notId));
    if (filter.__notName)
      notConditions.push(eb("name", "!=", filter.__notName));
    if (filter.__notListId)
      notConditions.push(eb("workspace_id", "!=", filter.__notListId));
    if (filter.__notArchive)
      notConditions.push(eb("archive", "is not", sql.lit(filter?.archive)));

    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }

    return query;
  }

  async getTotalCardInList(list_id: string): Promise<ResponseData<number>> {
    let total = await db
      .selectFrom("card")
      .where("card.list_id", "=", list_id)
      .select(({ fn }) => fn.count<number>("card.id").as("total"))
      .executeTakeFirst();
    return new ResponseData({
      message: "Ok",
      status_code: StatusCodes.OK,
      data: total?.total!,
    });
  }

  async newTopOrderCard(list_id: string): Promise<ResponseData<number>> {
    const topCard = await db
      .selectFrom("card")
      .where("list_id", "=", list_id)
      .orderBy("order", "asc")
      .limit(1)
      .selectAll()
      .executeTakeFirst();
    const newOrder = topCard ? topCard.order - 1 : 1;
    return new ResponseData({
      data: newOrder,
      message: "top of list card",
      status_code: StatusCodes.OK,
    });
  }

  async newBottomOrderCard(list_id: string): Promise<ResponseData<number>> {
    // Dapatkan kartu dengan order terkecil (paling atas) saat ini
    const result = await db
      .selectFrom("card")
      .where("list_id", "=", list_id)
      .select(({ fn }) => [fn.max("order").as("maxOrder")])
      .executeTakeFirst();
    const maxOrder = result?.maxOrder ?? 0;
    const newOrder = maxOrder + 1;

    return new ResponseData({
      data: newOrder,
      message: "bottom of list card",
      status_code: StatusCodes.OK,
    });
  }

  private async getCardsByListWithTrx(
    trx: Transaction<Database>,
    list_id: string
  ): Promise<CardTable[]> {
    return trx
      .selectFrom("card")
      .where("list_id", "=", list_id)
      .orderBy("order", "asc")
      .selectAll()
      .execute();
  }

  private async normalizeCardOrders(
    trx: Transaction<Database>,
    list_id: string
  ): Promise<void> {
    const cards = await this.getCardsByListWithTrx(trx, list_id);
    const updatePromises = cards.map((card, index) => {
      const newOrder = (index + 1) * 1000; // Beri jarak 1000 untuk setiap kartu
      return trx
        .updateTable("card")
        .set({ order: newOrder })
        .where("id", "=", String(card.id))
        .execute();
    });

    await Promise.all(updatePromises);
  }

  async getMaxCardOrderInList(list_id: string): Promise<number> {
    const result = await db
      .selectFrom("card")
      .select((eb) => eb.fn.max("order").as("max_order"))
      .where("list_id", "=", list_id)
      .executeTakeFirst();

    return result?.max_order ?? 0;
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
      const card = await db.transaction().execute(async (trx) => {
        // Get the current maximum order value in the list
        const maxOrderResult = await trx
          .selectFrom("card")
          .where("list_id", "=", data.list_id)
          .select(sql<number>`COALESCE(MAX("order"), 0)`.as("max_order"))
          .executeTakeFirst();

        // Set new card order to be at the bottom (max + 10000)
        const newOrder = (maxOrderResult?.max_order || 0) + 10000;

        // Create new card with order at the bottom
        const newCard = await trx
          .insertInto("card")
          .values({
            id: uuidv4(),
            name: data.name!,
            list_id: data.list_id,
            description: "",
            order: newOrder,
            dash_config: data.dash_config,
            type: data.type,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        // Check if order values are getting too large, normalize if needed
        if (newOrder > 1000000) {
          // Threshold for normalization
          await this.normalizeCardOrders(trx, data.list_id);
          // Get the updated card after normalization
          const updatedCard = await trx
            .selectFrom("card")
            .where("id", "=", newCard.id)
            .selectAll()
            .executeTakeFirstOrThrow();
          return updatedCard;
        }

        return newCard;
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "create card success",
        data: new CardDetail({
          id: card.id,
          type: card.type,
          name: card.name,
          description: card.description,
          order: card.order,
          dash_config: card.dash_config,
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
        location: card?.location ?? "",
        archive: card?.archive,
        start_date: card?.start_date,
        dash_config: card?.dash_config,
        due_date: card?.due_date,
        due_date_reminder: card?.due_date_reminder,
      });

      if (card?.dash_config) {
        const dashConfig =
          typeof card.dash_config === "string"
            ? JSON.parse(card.dash_config)
            : card.dash_config;

        const filters = (dashConfig?.filters || []) as {
          type: string;
          value: string;
          operator: string;
        }[];

        const cardListDashCard: IItemDashcard[] = [];

        if (filters.length > 0) {
          for (const filter of filters) {
            const value = filter.value;
            const operator = filter.operator;
            const type = filter.type;

            if (type === "board") {
              const boardIds: string[] = [];

              if (value) {
                switch (operator) {
                  case "starts_with":
                    const queryBoardStartsWith = await db
                      .selectFrom("board")
                      .select(["id"])
                      .where((eb) => eb("name", "like", eb.val(`${value}%`)))
                      .execute();

                    boardIds.push(...queryBoardStartsWith.map((b) => b.id));
                    break;
                  case "matches_with":
                  case "any":
                  default:
                    const queryBoard = await db
                      .selectFrom("board")
                      .select(["id"])
                      .where("name", "=", value)
                      .execute();

                    boardIds.push(...queryBoard.map((b) => b.id));
                    break;
                }
              }

              if (boardIds.length > 0) {
                const lists = await db
                  .selectFrom("list")
                  .select(["id"])
                  .where((eb) => eb("board_id", "in", boardIds))
                  .execute();

                const listIds = lists.map((l) => l.id);

                if (listIds.length > 0) {
                  const cardList = await db
                    .selectFrom("card")
                    .select(["card.id", "card.name", "card.description"])
                    .where((eb) => eb("card.list_id", "in", listIds))
                    .execute();

                  const resultCards: IItemDashcard[] = cardList.map((card) => {
                    return {
                      id: card.id,
                      name: card.name,
                      description: card.description,
                      member: [],
                      columns: [],
                    };
                  });

                  for (let i = 0; i < resultCards.length; i++) {
                    const cardItem = resultCards[i];
                    const customFields = await db
                      .selectFrom("card_custom_field")
                      .leftJoin(
                        "custom_field",
                        "card_custom_field.custom_field_id",
                        "custom_field.id"
                      )
                      .select(["custom_field.name", "custom_field.type"])
                      .where("card_custom_field.card_id", "=", cardItem.id)
                      .execute();

                    const members = await db
                      .selectFrom("card_member")
                      .leftJoin("user", "card_member.user_id", "user.id")
                      .select(["user.id", "user.username"])
                      .where("card_member.card_id", "=", cardItem.id)
                      .execute();

                    cardItem.member = members.map((member) => ({
                      id: member.id,
                      name: member.username,
                    })) as any;
                    cardItem.columns = customFields.map((item) => {
                      return {
                        type: item.type,
                        column: item.name,
                        value: "",
                      };
                    }) as any;
                  }

                  cardListDashCard.push(...resultCards);
                }
              }
            }

            if (type === "list") {
              const listIds: string[] = [];
              if (value) {
                switch (operator) {
                  case "starts_with":
                    const queryListStartsWith = await db
                      .selectFrom("list")
                      .select(["id"])
                      .where((eb) => eb("name", "like", eb.val(`${value}%`)))
                      .execute();

                    listIds.push(...queryListStartsWith.map((l) => l.id));
                    break;
                  case "matches_with":
                  case "any":
                  default:
                    const queryList = await db
                      .selectFrom("list")
                      .select(["id"])
                      .where("name", "=", value)
                      .execute();

                    listIds.push(...queryList.map((l) => l.id));
                    break;
                }
              }

              if (listIds.length > 0) {
                // First get all cards
                const cardList = await db
                  .selectFrom("card")
                  .select(["card.id", "card.name", "card.description"])
                  .where((eb) => eb("card.list_id", "in", listIds))
                  .execute();

                // Then get all custom fields for these cards

                const resultCards: IItemDashcard[] = cardList.map((card) => {
                  return {
                    id: card.id,
                    name: card.name,
                    description: card.description,
                    member: [],
                    columns: [],
                  };
                });

                for (let i = 0; i < resultCards.length; i++) {
                  const cardItem = resultCards[i];
                  const customFields = await db
                    .selectFrom("card_custom_field")
                    .leftJoin(
                      "custom_field",
                      "card_custom_field.custom_field_id",
                      "custom_field.id"
                    )
                    .select(["custom_field.name", "custom_field.type"])
                    .where("card_custom_field.card_id", "=", cardItem.id)
                    .execute();

                  const members = await db
                    .selectFrom("card_member")
                    .leftJoin("user", "card_member.user_id", "user.id")
                    .select(["user.id", "user.username"])
                    .where("card_member.card_id", "=", cardItem.id)
                    .execute();

                  cardItem.member = members.map((member) => ({
                    id: member.id,
                    name: member.username,
                  })) as any;
                  cardItem.columns = customFields.map((item) => {
                    return {
                      type: item.type,
                      column: item.name,
                      value: "",
                    };
                  }) as any;
                }

                cardListDashCard.push(...resultCards);
              }
            }

            if (type === "assigned") {
              const cardIds: string[] = [];

              if (value) {
                switch (operator) {
                  case "includes_any_of":
                    console.log(value, "queryAssignInclude");
                    const queryAssignInclude = await db
                      .selectFrom("card_member")
                      .select(["card_id"])
                      .where("user_id", "in", [value])
                      .execute();

                    console.log({ queryAssignInclude }, "queryAssignInclude");
                    cardIds.push(...queryAssignInclude.map((a) => a.card_id));
                    break;

                  case "does_not_include":
                    const queryAssignNotInclude = await db
                      .selectFrom("card_member")
                      .select(["card_id"])
                      .where("user_id", "not in", [value])
                      .execute();
                    cardIds.push(
                      ...queryAssignNotInclude.map((a) => a.card_id)
                    );
                    break;

                  default:
                    break;
                }
              }

              if (cardIds.length > 0) {
                const cardList = await db
                  .selectFrom("card")
                  .select(["card.id", "card.name", "card.description"])
                  .where("card.id", "in", cardIds)
                  .execute();
                const resultCards: IItemDashcard[] = cardList.map((card) => {
                  return {
                    id: card.id,
                    name: card.name,
                    description: card.description,
                    member: [],
                    columns: [],
                  };
                });
                for (let i = 0; i < resultCards.length; i++) {
                  const cardItem = resultCards[i];
                  const customFields = await db
                    .selectFrom("card_custom_field")
                    .leftJoin(
                      "custom_field",
                      "card_custom_field.custom_field_id",
                      "custom_field.id"
                    )
                    .select(["custom_field.name", "custom_field.type"])
                    .where("card_custom_field.card_id", "=", cardItem.id)
                    .execute();
                  const members = await db
                    .selectFrom("card_member")
                    .leftJoin("user", "card_member.user_id", "user.id")
                    .select(["user.id", "user.username"])
                    .where("card_member.card_id", "=", cardItem.id)
                    .execute();
                  cardItem.member = members.map((member) => ({
                    id: member.id,
                    name: member.username,
                  })) as any;
                  cardItem.columns = customFields.map((item) => {
                    return {
                      type: item.type,
                      column: item.name,
                      value: "",
                    };
                  }) as any;
                }
                cardListDashCard.push(...resultCards);
              }
            }
          }
        }

        result.item_dashcard = Array.from(new Set(cardListDashCard));
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "card detail",
        data: result,
      });
    } catch (e) {
      console.log("errorBaba", e);
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
    let qry = db
      .selectFrom("card")
      .where((eb) => this.createKyFilter(eb, filter));

    let total = await qry
      .select(({ fn }) => fn.count<number>("card.id").as("total"))
      .executeTakeFirst();
    paginate.setTotal(total?.total!);

    let qryResult = await qry
      .selectAll()
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .orderBy("card.order asc")
      .execute();
    (qryResult as CardDetail[]).map((raw: CardDetail) => {
      result.push(
        new CardDetail({
          id: raw.id,
          name: raw.name,
          description: raw.description,
          order: raw.order,
          list_id: raw.list_id,
          type: raw.type,
          archive: raw.archive,
          location: raw.location ?? "",
          start_date: raw?.start_date || undefined,
          due_date: raw?.due_date || undefined,
          due_date_reminder: raw.due_date_reminder || undefined,
          dash_config: raw.dash_config || undefined,
          created_at: raw?.created_at || undefined,
          updated_at: raw?.updated_at || undefined,
        })
      );
    });

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
      // Cek apakah card adalah mirror
      const card = await db
        .selectFrom("card")
        .where("id", "=", filter.id!)
        .selectAll()
        .executeTakeFirst();
      if (card && card.mirror_id) {
        throw new InternalServerError(
          StatusCodes.BAD_REQUEST,
          "Tidak bisa mengubah mirror card"
        );
      }
      // Update card utama
      await db
        .updateTable("card")
        .set(data.toObject())
        .where((eb) => this.createKyFilter(eb, filter))
        .execute();

      // Cek apakah card ini card utama (bukan mirror)
      const mainCard = await db
        .selectFrom("card")
        .where("id", "=", filter.id!)
        .selectAll()
        .executeTakeFirst();
      if (mainCard && !mainCard.mirror_id) {
        // Siapkan data yang boleh di-mirror
        const mirrorUpdate: Partial<CardTable> = {
          name: data.name,
          description: data.description,
          dash_config: data.dash_config,
          location: data.location,
          archive: data.archive,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          due_date: data.due_date ? new Date(data.due_date) : undefined,
          due_date_reminder: data?.due_date_reminder,
          is_complete: data.is_complete,
          completed_at: data.completed_at
            ? new Date(data.completed_at)
            : undefined,
        };
        // Update semua mirror card
        await db
          .updateTable("card")
          .set(mirrorUpdate)
          .where("mirror_id", "=", filter.id!)
          .execute();
      }

      // Check for mentions in description and send notifications
      if (data.description) {
        // Extract mentioned user IDs from HTML content using the static method
        const mentionedUserIds = this.extractMentionedUserIds(data.description);
        
        if (mentionedUserIds.length > 0) {
          // Log the mentions for debugging
          console.log(`Found mentions in card ${filter.id}:`, mentionedUserIds);
          
          // Note: WhatsApp notification sending should be handled by the controller layer
          // This is just logging for now - the actual notification logic should be 
          // implemented in the service/controller layer that calls this repository method
        }
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
              // action: item.action_type,
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
        // sql<CardActionType>`ca.activity_type`.as('activity_type'),
        sql<string>`ca.card_id`.as("card_id"),
        sql<string>`ca.sender_user_id`.as("sender_id"),
        sql<string>`caa.action`.as("action_type"),
        sql<CardActionValue>`caa.source`.as("source"),
        sql<string>`cat.text`.as("text"),
        sql<string>`"ca"."created_at"`.as("xcreated_at"),
      ])
      .orderBy("xcreated_at", "desc")
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
        const action = new CardActionActivity({});
        // const action = new CardActionActivity({
        // 	action_type: row.action_type as CardActionType
        // });
        // if (row.action_type == CardActionType.MoveList){
        // 	action.setMoveListValue(row.source as MoveListValue);
        // }
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
      .where("ca.card_id", "=", card_id);
    // .where('caa.action', '=', CardActionType.MoveList)

    const total = await qry
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .executeTakeFirst();
    paginate.setTotal(total?.count!);

    const results = await qry
      .select([
        sql<string>`caa.created_at`.as("xcreated_at"),
        sql<string>`(caa.source ->> 'origin_list_id')`.as("origin_list_id"),
        sql<string>`(caa.source ->> 'destination_list_id')`.as(
          "destination_list_id"
        ),
      ])
      .orderBy("xcreated_at", "asc")
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();

    for (const row of results) {
      const date_selected = new Date(row.xcreated_at);
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

  async moveCard(filter: filterMoveCard): Promise<ResponseData<CardDetail>> {
    console.log("In repo: Move Card: %o", filter);
    try {
      return await db
        .transaction()
        .execute(async (tx: Transaction<Database>) => {
          const card = await tx
            .selectFrom("card")
            .where("id", "=", filter.id!)
            .selectAll()
            .executeTakeFirst();

          if (!card) {
            return new ResponseData({
              status_code: StatusCodes.NOT_FOUND,
              message: "Card not found",
            });
          }

          const sourceListId = filter.previous_list_id ?? card.list_id;
          const targetListId = filter.target_list_id ?? card.list_id;
          const isSameList = sourceListId === targetListId;

          if (!isSameList) {
            const targetList = await tx
              .selectFrom("list")
              .where("id", "=", targetListId)
              .select("id")
              .executeTakeFirst();

            if (!targetList) {
              return new ResponseData({
                status_code: StatusCodes.BAD_REQUEST,
                message: "Target list does not exist",
              });
            }
          }

          // Ambil semua card di list target
          let cardsInTargetList = await tx
            .selectFrom("card")
            .where("list_id", "=", targetListId)
            .orderBy("order", "asc")
            .select(["id", "order"])
            .execute();

          if (isSameList) {
            cardsInTargetList = cardsInTargetList.filter(
              (c) => c.id !== filter.id
            );
          }

          let targetPosition: number;

          // Check if user wants to move to top or bottom
          if (filter.target_position_top_or_bottom === "top") {
            targetPosition = 0;
          } else if (filter.target_position_top_or_bottom === "bottom") {
            targetPosition = cardsInTargetList.length;
          } else {
            // Use existing logic for numeric position
            targetPosition = Math.max(
              0,
              Math.min(
                filter.target_position ?? cardsInTargetList.length,
                cardsInTargetList.length
              )
            );
          }

          let newOrder: number;

          if (cardsInTargetList.length === 0) {
            newOrder = 10000;
          } else if (targetPosition === 0) {
            // Moving to top
            newOrder = Math.max(cardsInTargetList[0].order / 2, 1);
          } else if (targetPosition === cardsInTargetList.length) {
            // Moving to bottom
            newOrder =
              cardsInTargetList[cardsInTargetList.length - 1].order + 10000;
          } else {
            // Moving to specific position
            const prev = cardsInTargetList[targetPosition - 1];
            const next = cardsInTargetList[targetPosition];
            const gap = next.order - prev.order;

            if (gap <= 1) {
              // 🔧 Rebalance saat gap terlalu kecil
              await this.rebalanceCardOrders(targetListId, tx);

              // Ambil ulang data setelah rebalance
              cardsInTargetList = await tx
                .selectFrom("card")
                .where("list_id", "=", targetListId)
                .orderBy("order", "asc")
                .select(["id", "order"])
                .execute();

              if (isSameList) {
                cardsInTargetList = cardsInTargetList.filter(
                  (c) => c.id !== filter.id
                );
              }

              const prev = cardsInTargetList[targetPosition - 1];
              const next = cardsInTargetList[targetPosition];
              newOrder = Math.floor((prev.order + next.order) / 2);
            } else {
              newOrder = prev.order + Math.floor(gap / 2);
            }
          }

          // Update posisi card
          await tx
            .updateTable("card")
            .set({
              list_id: targetListId,
              order: newOrder,
            })
            .where("id", "=", filter.id!)
            .execute();

          const updatedCard = await tx
            .selectFrom("card")
            .where("id", "=", filter.id!)
            .selectAll()
            .executeTakeFirst();

          return new ResponseData({
            status_code: StatusCodes.OK,
            message: "Card moved successfully",
            data: new CardDetail({
              id: updatedCard!.id,
              name: updatedCard!.name,
              description: updatedCard!.description,
              order: updatedCard!.order,
              list_id: updatedCard!.list_id,
              location: (updatedCard as any)?.location ?? "",
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

  async rebalanceCardOrders(listId: string, tx: Transaction<Database>) {
    const cards = await tx
      .selectFrom("card")
      .where("list_id", "=", listId)
      .orderBy("order", "asc")
      .select(["id"])
      .execute();

    let baseOrder = 10000;
    const spacing = 10000;

    for (let i = 0; i < cards.length; i++) {
      const id = cards[i].id;

      await tx
        .updateTable("card")
        .set({ order: baseOrder + i * spacing })
        .where("id", "=", id)
        .execute();
    }
  }

  async countAllCards(): Promise<number> {
    try {
      const result = await db
        .selectFrom("card")
        .select((eb) => eb.fn.count<number>("card.id").as("count"))
        .where("card.type", "!=", "dashcard")
        .executeTakeFirst();

      return Number(result?.count || 0);
    } catch (e) {
      console.error("Error counting all cards:", e);
      return 0;
    }
  }

  async countCardsWithFilters(filters: FilterConfig[]): Promise<number> {
    try {
      // Join all tables
      let query = db
        .selectFrom("card")
        .leftJoin("list", "card.list_id", "list.id")
        .leftJoin("card_member", "card.id", "card_member.card_id")
        .leftJoin("card_custom_field", "card.id", "card_custom_field.card_id")
        .where("card.type", "!=", "dashcard");

      // Apply filters
      for (const filter of filters) {
        switch (filter.type) {
          case "board":
            if (filter.operator !== "any" && filter.value) {
              if (filter.operator === "matches_with") {
                query = query.where("list.board_id", "=", filter.value);
              } else if (
                filter.operator === "includes_any_of" &&
                Array.isArray(filter.value)
              ) {
                query = query.where("list.board_id", "in", filter.value);
              }
            }
            break;

          case "list":
            if (filter.operator !== "any" && filter.value) {
              if (filter.operator === "matches_with") {
                query = query.where("card.list_id", "=", filter.value);
              } else if (
                filter.operator === "includes_any_of" &&
                Array.isArray(filter.value)
              ) {
                query = query.where("card.list_id", "in", filter.value);
              }
            }
            break;

          case "assigned":
            if (filter.operator !== "any" && filter.value) {
              if (filter.operator === "includes_any_of") {
                if (Array.isArray(filter.value)) {
                  query = query.where("card_member.user_id", "in", "Garry");
                } else {
                  query = query.where("card_member.user_id", "=", filter.value);
                }
              }
            }
            break;

          case "custom_field":
            if (
              filter.id &&
              filter.operator !== "any" &&
              filter.value !== undefined
            ) {
              // Always restrict by custom_field_id for value-based operators
              switch (filter.operator) {
                case "equals":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where((eb) =>
                      eb.or([
                        eb("card_custom_field.value_option", "=", filter.value),
                        eb("card_custom_field.value_string", "=", filter.value),
                      ])
                    );
                  break;
                case "contains":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where((eb) =>
                      eb.or([
                        eb(
                          "card_custom_field.value_option",
                          "ilike",
                          filter.value
                        ),
                        eb(
                          "card_custom_field.value_string",
                          "ilike",
                          filter.value
                        ),
                      ])
                    );
                  break;
                case "starts_with":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where(
                      "card_custom_field.value_string",
                      "ilike",
                      `${filter.value}%`
                    );
                  break;
                case "ends_with":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where(
                      "card_custom_field.value_string",
                      "like",
                      `%${filter.value}`
                    );
                  break;
                case "greater_than":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where("card_custom_field.value_number", ">", filter.value);
                  break;
                case "less_than":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where("card_custom_field.value_number", "<", filter.value);
                  break;
                case "is_true":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where("card_custom_field.value_checkbox", "=", true);
                  break;
                case "is_false":
                  query = query
                    .where("card_custom_field.custom_field_id", "=", filter.id)
                    .where("card_custom_field.value_checkbox", "=", false);
                  break;
              }
            }
            break;
        }
      }

      const result = await query
        .select((eb) => eb.fn.count("card.id").distinct().as("count"))
        .executeTakeFirst();

      return Number(result?.count || 0);
    } catch (e) {
      console.error("Error counting cards with filters:", e);
      return 0;
    }
  }

  async copyCardWithMirror(
    card_id: string,
    target_list_id: string
  ): Promise<ResponseData<CardDetail>> {
    // Ambil data card utama
    const mainCardRes = await this.getCard({ id: card_id });
    if (mainCardRes.status_code !== StatusCodes.OK || !mainCardRes.data) {
      return new ResponseData({
        message: mainCardRes.message || "Card utama tidak ditemukan",
        status_code: mainCardRes.status_code,
      });
    }
    const mainCard = mainCardRes.data;
    // Dapatkan order paling bawah di list target
    const bottomOrderRes = await this.newBottomOrderCard(target_list_id);
    if (bottomOrderRes.status_code !== StatusCodes.OK) {
      return new ResponseData({
        message: bottomOrderRes.message,
        status_code: bottomOrderRes.status_code,
      });
    }
    // Insert card baru (mirror)
    const newCardId = uuidv4();
    const insertRes = await db
      .insertInto("card")
      .values({
        id: newCardId,
        name: mainCard.name!,
        description: mainCard.description,
        list_id: target_list_id,
        type: mainCard.type,
        order: bottomOrderRes.data!,
        dash_config: mainCard.dash_config,
        location: mainCard.location,
        archive: false,
        start_date: mainCard.start_date,
        due_date: mainCard.due_date,
        due_date_reminder: mainCard.due_date_reminder,
        is_complete: mainCard.is_complete,
        completed_at: mainCard.completed_at,
        mirror_id: mainCard.id,
      })
      .returning(["id"])
      .executeTakeFirst();
    if (!insertRes) {
      return new ResponseData({
        message: "Gagal membuat mirror card",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    const fullCard = await db
      .selectFrom("card")
      .where("id", "=", insertRes.id)
      .selectAll()
      .executeTakeFirst();
    if (!fullCard) {
      return new ResponseData({
        message: "Gagal mengambil detail card baru",
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    return new ResponseData({
      data: new CardDetail({
        id: fullCard.id,
        name: fullCard.name,
        description: fullCard.description,
        order: fullCard.order,
        list_id: fullCard.list_id,
        type: fullCard.type,
        dash_config: fullCard.dash_config,
        location: fullCard.location ?? "",
        archive: fullCard.archive,
        start_date: fullCard.start_date,
        due_date: fullCard.due_date,
        due_date_reminder: fullCard.due_date_reminder,
        is_complete: fullCard.is_complete,
        completed_at: fullCard.completed_at,
        mirror_id: fullCard.mirror_id,
        created_at: fullCard.created_at,
        updated_at: fullCard.updated_at,
      }),
      message: "success",
      status_code: StatusCodes.CREATED,
    });
  }

  extractMentionedUserIds(htmlContent: string): string[] {
    const mentionedUserIds: string[] = [];
    
    // Regex to match mention spans with data-id attribute
    const mentionRegex = /<span[^>]*class="mention"[^>]*data-id="([^"]*)"[^>]*>/g;
    
    let match;
    while ((match = mentionRegex.exec(htmlContent)) !== null) {
      const userId = match[1];
      if (userId && !mentionedUserIds.includes(userId)) {
        mentionedUserIds.push(userId);
      }
    }
    
    return mentionedUserIds;
  }
}
