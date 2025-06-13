import { ExpressionBuilder } from "kysely";
import { v4 as uuidv4 } from "uuid";

import db from "@/database";
import CardCustomField from "@/database/schemas/card_custom_field";
import { Role } from "@/database/schemas/role";
import User from "@/database/schemas/user";
import {
  AssignCardDetail,
  CardCustomFieldDetail,
  CardCustomFieldResponse,
  CardCustomFieldValueUpdate,
  CustomFieldCardDetail,
  CustomFieldDetail,
  CustomFieldDetailUpdate,
  CustomFieldRepositoryI,
  CustomValueDetail,
  CustomValueDetailUpdate,
  filterCustomFieldDetail,
  filterCustomValueDetail,
} from "@/repository/custom_field/custom_field_interfaces";
import {
  EnumCustomFieldSource,
  EnumCustomFieldType,
} from "@/types/custom_field";
import { Database } from "@/types/database";
import { Paginate } from "@/utils/data_utils";
import { InternalServerError } from "@/utils/errors";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { StatusCodes } from "http-status-codes";
import { Transaction, sql } from "kysely";
import { Error } from "sequelize";

export class CustomFieldRepository implements CustomFieldRepositoryI {
  createValueFilter(
    eb: ExpressionBuilder<Database, any>,
    filter: filterCustomFieldDetail
  ) {
    let query = eb.and([]); // Inisialisasi sebagai kondisi AND kosong

    if (filter.id) query = eb.and([query, eb("id", "=", filter.id)]);
    if (filter.name) query = eb.and([query, eb("name", "=", filter.name)]);
    if (filter.workspace_id)
      query = eb.and([query, eb("workspace_id", "=", filter.workspace_id)]);

    // OR conditions
    const orConditions = [];
    if (filter.__orId) orConditions.push(eb("id", "=", filter.__orId));
    if (filter.__orName) orConditions.push(eb("name", "=", filter.__orName));
    if (filter.__orWorkspaceId)
      orConditions.push(eb("workspace_id", "=", filter.__orWorkspaceId));
    // if (filter.__orSource) orConditions.push(eb('source', '=', filter.__orSource));

    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }

    // NOT conditions
    const notConditions = [];
    if (filter.__notId) notConditions.push(eb("id", "!=", filter.__notId));
    if (filter.__notName)
      notConditions.push(eb("name", "!=", filter.__notName));
    if (filter.__notWorkspaceId)
      notConditions.push(eb("workspace_id", "!=", filter.__notWorkspaceId));
    // if (filter.__notSource) notConditions.push(eb('source', '!=', filter.__notSource));

    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }

    return query;
  }

  async getListAssignCard(
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<Array<AssignCardDetail>>> {
    let result: Array<AssignCardDetail> = [];
    let qry = db
      .selectFrom("card_custom_field")
      .innerJoin(
        "custom_field",
        "card_custom_field.custom_field_id",
        "custom_field.id"
      )
      .where("card_custom_field.card_id", "=", card_id);
    let total = await qry
      .select(({ fn }) =>
        fn.count<number>("card_custom_field.card_id").as("total")
      )
      .executeTakeFirst();
    paginate.setTotal(total?.total!);

    let qryResult = await qry
      .select([
        "custom_field.id",
        "custom_field.name",
        "custom_field.source",
        "card_custom_field.order",
        "card_custom_field.value_number",
        "card_custom_field.value_string",
        "card_custom_field.value_user_id",
      ])
      .offset(paginate.getOffset())
      .limit(paginate.limit)
      .execute();
    qryResult.map((raw) => {
      result.push(
        new AssignCardDetail({
          id: raw.id,
          name: raw.name,
          source: raw.source,
          order: raw.order,
          value: (function (): undefined | string | number {
            if (raw.value_user_id) return raw.value_user_id;
            if (raw.value_string) return raw.value_string;
            if (raw.value_number) return raw.value_number;
            return undefined;
          })(),
        })
      );
    });
    return new ResponseListData(
      {
        status_code: StatusCodes.OK,
        message: "custom_field custom_field",
        data: result,
      },
      paginate
    );
  }

  async getAssignCard(
    id: string,
    card_id: string
  ): Promise<ResponseData<CardCustomFieldDetail>> {
    let result = await db
      .selectFrom("card_custom_field")
      .innerJoin(
        "custom_field",
        "card_custom_field.custom_field_id",
        "custom_field.id"
      )
      .where("card_custom_field.card_id", "=", card_id)
      .where("card_custom_field.custom_field_id", "=", id)
      .select([
        "custom_field.id",
        "custom_field.name",
        "custom_field.source",
        "card_custom_field.order",
        "card_custom_field.value_number",
        "card_custom_field.value_string",
        "card_custom_field.value_user_id",
        "card_custom_field.trigger_id",
      ])
      .executeTakeFirst();

    if (!result) {
      return {
        status_code: StatusCodes.NOT_FOUND,
        message: "custom_field is not found",
      };
    }
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "custom_field of card",
      data: new CardCustomFieldDetail({
        id: result.id,
        name: result.name,
        source: result.source,
        order: result.order,
        trigger_id: result.trigger_id,
        value: (function (): undefined | string | number {
          if (result.value_user_id) return result.value_user_id;
          if (result.value_string) return result.value_string;
          if (result.value_number) return result.value_number;
          return undefined;
        })(),
      }),
    });
  }

  async updateAssignedCard(
    id: string,
    card_id: string,
    value: CustomFieldCardDetail
  ): Promise<number> {
    try {
      let qry = await db
        .updateTable("card_custom_field")
        .set(value.toObject())
        .where("card_custom_field.custom_field_id", "=", id)
        .where("card_custom_field.card_id", "=", card_id)
        .executeTakeFirst();
      if (qry.numChangedRows! <= 0) {
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

  async assignToCard(
    id: string,
    payload: CustomFieldCardDetail
  ): Promise<number> {
    const trx = await db
      .transaction()
      .execute(async (tx: Transaction<Database>) => {
        try {
          let data: any = {
            card_id: payload.card_id,
            custom_field_id: id,
            value_user_id: payload.value_user_id,
            value_string: payload.value_string,
            value_number: payload.value_number,
          };

          const total = await tx
            .selectFrom("card_custom_field")
            .select(({ fn }) => fn.count<number>("card_id").as("count"))
            .where("card_custom_field.card_id", "=", payload.card_id)
            .where("card_custom_field.custom_field_id", "=", id)
            .executeTakeFirst();

          if (total?.count! > 0) {
            return StatusCodes.CONFLICT;
          }

          const selectedList = await tx
            .selectFrom("list")
            .innerJoin("card", "list.id", "card.list_id")
            .innerJoin("board", "list.board_id", "board.id")
            .select(["board.workspace_id"])
            .where("card.id", "=", payload.card_id)
            .executeTakeFirst();

          if (!selectedList) {
            return StatusCodes.BAD_REQUEST;
          }

          data.order = 1;
          await tx.insertInto("card_custom_field").values(data).execute();

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
      });
    return trx;
  }

  async unAssignFromCard(id: string, card_id: string): Promise<number> {
    try {
      const effected = await CardCustomField.destroy({
        where: {
          card_id: card_id,
          custom_field_id: id,
        },
      });
      if (effected <= 0) {
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

  async deleteCustomField(filter: filterCustomFieldDetail): Promise<number> {
    try {
      const result = await db
        .deleteFrom("custom_field")
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async createCustomField(
    data: CustomFieldDetail
  ): Promise<ResponseData<CustomFieldDetail>> {
    try {
      const id = uuidv4();
      await db
        .insertInto("custom_field")
        .values({
          workspace_id: data.workspace_id,
          description: data.description,
          name: data.name,
          type: data.type,
          is_show_at_front: data.is_show_at_front,
          options: data?.options
            ? sql`${JSON.stringify(data.options)}::jsonb`
            : sql`'[]'::jsonb`,
          order: data.order,
          source: data?.source || EnumCustomFieldSource.Custom,
          id: id,
          trigger_id: data.trigger?.id,
          can_view: data.can_view
            ? sql`${JSON.stringify(data.can_view)}::jsonb`
            : sql`'[]'::jsonb`,
          can_edit: data.can_edit
            ? sql`${JSON.stringify(data.can_edit)}::jsonb`
            : sql`'[]'::jsonb`,
        })
        .execute();
      console.log("in repo ini");
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create custom field success",
        data: new CustomFieldDetail({
          id: id,
          name: data.name,
          description: data.description,
          source: data.source,
          type: data.type,
          order: data.order,
          is_show_at_front: data.is_show_at_front,
          options: data?.options || {},
          can_view: data.can_view || [],
          can_edit: data.can_edit || [],
        }),
      });
    } catch (e) {
      console.log("in repo err: err: %o", e);
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async getCustomField(
    filter: filterCustomFieldDetail
  ): Promise<ResponseData<CustomFieldDetail>> {
    try {
      const custom_field = await db
        .selectFrom("custom_field")
        .selectAll()
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!custom_field) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "custom_field is not found",
        };
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "custom_field detail",
        data: new CustomFieldDetail(custom_field),
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

  async getListCustomField(
    filter: filterCustomFieldDetail,
    paginate: Paginate,
    user_id?: string
  ): Promise<ResponseListData<Array<CustomFieldDetail>>> {
    try {
      // Get user role information
      const user = await User.findOne({ where: { id: user_id } });
      const userRole = await Role.findOne({ where: { id: user?.role_id! } });
      const isSuperAdmin = userRole?.name === "Super Admin";

      // Build query
      let qry = db
        .selectFrom("custom_field")
        .leftJoin("trigger", "trigger.id", "custom_field.trigger_id")
        .where((eb) => {
          let query = eb.and([]);

          // Apply basic filters
          if (filter.id) {
            query = eb.and([query, eb("custom_field.id", "=", filter.id)]);
          }
          if (filter.name) {
            query = eb.and([query, eb("custom_field.name", "=", filter.name)]);
          }
          if (filter.workspace_id) {
            query = eb.and([
              query,
              eb("custom_field.workspace_id", "=", filter.workspace_id),
            ]);
          }

          // We'll handle role-based filtering in memory after fetching the data
          // to avoid the parameter binding issues with JSONB

          // OR conditions
          const orConditions = [];
          if (filter.__orId) {
            orConditions.push(eb("custom_field.id", "=", filter.__orId));
          }
          if (filter.__orName) {
            orConditions.push(eb("custom_field.name", "=", filter.__orName));
          }
          if (filter.__orWorkspaceId) {
            orConditions.push(
              eb("custom_field.workspace_id", "=", filter.__orWorkspaceId)
            );
          }
          if (orConditions.length > 0) {
            query = eb.and([query, eb.or(orConditions)]);
          }

          // NOT conditions
          if (filter.__notId) {
            query = eb.and([
              query,
              eb("custom_field.id", "!=", filter.__notId),
            ]);
          }
          if (filter.__notName) {
            query = eb.and([
              query,
              eb("custom_field.name", "!=", filter.__notName),
            ]);
          }
          if (filter.__notWorkspaceId) {
            query = eb.and([
              query,
              eb("custom_field.workspace_id", "!=", filter.__notWorkspaceId),
            ]);
          }

          return query;
        });

      if (!isSuperAdmin && user?.role_id) {
        qry = qry.where((eb) =>
          eb.or([
            eb("custom_field.can_view", "is", null),
            sql<boolean>`jsonb_array_length(custom_field.can_view) = 0`,
            sql<boolean>`custom_field.can_view @> ${sql.lit(
              JSON.stringify([user.role_id])
            )}::jsonb`,
          ])
        );
      }

      // Now get the correct filtered total
      const countResult = await qry
        .select(sql<number>`count(custom_field.id)::integer`.as("total"))
        .executeTakeFirst();
      paginate.setTotal(countResult?.total || 0);

      // console.log(qry.compile().sql);
      // console.log(qry.compile().parameters);

      let lists = await qry
        .select([
          "custom_field.id as id",
          "custom_field.name as name",
          "custom_field.description as description",
          "custom_field.type as type",
          "custom_field.workspace_id as workspace_id",
          "custom_field.source as source",
          "custom_field.order as order",
          "custom_field.is_show_at_front as is_show_at_front",
          "custom_field.options as options",
          "custom_field.can_view as can_view",
          "custom_field.can_edit as can_edit",
          "trigger.id as trigger_id",
          "trigger.condition as condition",
          "trigger.action as action",
        ])
        .orderBy("custom_field.order asc")
        .offset(paginate.getOffset())
        .limit(paginate.limit)
        .execute();

      return new ResponseListData(
        {
          status_code: StatusCodes.OK,
          message: "list custom field",
          data: lists.map(
            (item) =>
              new CustomFieldDetail({
                id: item.id,
                name: item.name,
                description: item.description,
                type: item.type,
                workspace_id: item.workspace_id,
                source: item.source,
                order: item.order,
                is_show_at_front: item.is_show_at_front ? true : false,
                options: item?.options,
                can_view: item?.can_view,
                can_edit: item?.can_edit,
              })
          ),
        },
        paginate
      );
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async updateCustomField(
    filter: filterCustomFieldDetail,
    data: CustomFieldDetailUpdate
  ): Promise<number> {
    try {
      // Create update object with proper JSONB handling
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.order) updateData.order = data.order;
      if (data.trigger_id) updateData.trigger_id = data.trigger_id;
      if (data.can_view)
        updateData.can_view = sql`${JSON.stringify(data.can_view)}::jsonb`;
      if (data.can_edit)
        updateData.can_edit = sql`${JSON.stringify(data.can_edit)}::jsonb`;

      const result = await db
        .updateTable("custom_field")
        .set(updateData)
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async deleteCustomValue(filter: filterCustomValueDetail): Promise<number> {
    try {
      const result = await db
        .deleteFrom("custom_value")
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!result.numDeletedRows || result.numDeletedRows <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async createCustomValue(
    data: CustomValueDetail
  ): Promise<ResponseData<CustomValueDetail>> {
    try {
      const custom_field = await db
        .insertInto("custom_value")
        .values({
          name: data.name!,
          description: data.description,
          workspace_id: data.workspace_id,
        })
        .returning(["id", "name", "description"])
        .executeTakeFirst();

      if (!custom_field) {
        return {
          status_code: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "failed to get custom value",
        };
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "create custom_field success",
        data: new CustomValueDetail(custom_field),
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getCustomValue(
    filter: filterCustomValueDetail
  ): Promise<ResponseData<CustomValueDetail>> {
    try {
      const custom_field = await db
        .selectFrom("custom_value")
        .selectAll()
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!custom_field) {
        return {
          status_code: StatusCodes.NOT_FOUND,
          message: "custom_field is not found",
        };
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "custom_field detail",
        data: new CustomValueDetail(custom_field),
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getListCustomValue(
    filter: filterCustomValueDetail,
    paginate: Paginate
  ): Promise<ResponseListData<Array<CustomValueDetail>>> {
    try {
      const total = await db
        .selectFrom("custom_value")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();
      paginate.setTotal(total?.count!);

      const lists = await db
        .selectFrom("custom_value")
        .selectAll()
        .where((eb) => this.createValueFilter(eb, filter))
        .offset(paginate.getOffset())
        .limit(paginate.limit)
        .execute();

      return new ResponseListData(
        {
          status_code: StatusCodes.OK,
          message: "custom_field list",
          data: lists.map((item) => new CustomValueDetail(item)),
        },
        paginate
      );
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async updateCustomValue(
    filter: filterCustomValueDetail,
    data: CustomValueDetailUpdate
  ): Promise<number> {
    try {
      const result = await db
        .updateTable("custom_value")
        .set(data.toObject())
        .where((eb) => this.createValueFilter(eb, filter))
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows <= 0) {
        return StatusCodes.NOT_FOUND;
      }
      return StatusCodes.NO_CONTENT;
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async assignAllBoardCustomFieldToCard(
    board_id: string,
    card_id: string
  ): Promise<ResponseData<null>> {
    // const trx = await db.transaction().execute(async (tx: Transaction<Database>) => {
    // 	const lists = await tx
    // 		.selectFrom('custom_field')
    // 		.selectAll()
    // 		.where("board_id", "=", board_id)
    // 		.limit(100)
    // 		.execute();

    // 	const data: Array<{ card_id: string; custom_field_id: string; order: number }> = lists.map((item) => ({
    // 		card_id,
    // 		custom_field_id: item.id,
    // 		order: 1
    // 	}));

    // 	if (data.length > 0) {
    // 		await tx
    // 		.insertInto("card_custom_field")
    // 		.values(data)
    // 		.execute();
    // 	}

    // 	return new ResponseData({
    // 		status_code: StatusCodes.OK,
    // 		message: "success assign all custom field board from card",
    // 		data: null
    // 	});
    // });
    // return trx;
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "success assign all custom field board from card",
      data: null,
    });
  }

  async unAssignAllBoardCustomFieldFromCard(
    board_id: string,
    card_id: string
  ): Promise<ResponseData<null>> {
    // const trx = await db.transaction().execute(async (tx: Transaction<Database>) => {
    // 	const customFields = await tx
    // 		.selectFrom('custom_field')
    // 		.select(['id'])
    // 		.where('board_id', '=', board_id)
    // 		.execute();

    // 	const customFieldIds = customFields.map((field) => field.id);

    // 	if (customFieldIds.length > 0) {
    // 		await tx
    // 			.deleteFrom('card_custom_field')
    // 			.where('card_id', '=', card_id)
    // 			.where('custom_field_id', 'in', customFieldIds)
    // 			.execute();
    // 	}

    // 	return new ResponseData({
    // 		status_code: StatusCodes.OK,
    // 		message: 'success un-assign all custom field board from card',
    // 		data: null,
    // 	});
    // });

    // return trx;

    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "success un-assign all custom field board from card",
      data: null,
    });
  }

  async getListCardCustomField(
    workspace_id: string,
    card_id: string,
    user_id?: string
  ): Promise<ResponseData<Array<CardCustomFieldResponse>>> {
    try {
      let isSuperAdmin = false;
      let role_id: string | undefined;

      if (user_id) {
        const user = await User.findOne({ where: { id: user_id } });
        if (user?.role_id) {
          role_id = user.role_id;
          const role = await Role.findOne({ where: { id: role_id } });
          isSuperAdmin = role?.name === "Super Admin";
        }
      }

      let query = db
        .selectFrom("custom_field as cs")
        .leftJoin("card_custom_field as ccs", (join) =>
          join
            .onRef("cs.id", "=", "ccs.custom_field_id")
            .on("ccs.card_id", "=", card_id)
        )
        .selectAll("cs")
        .select([
          sql<boolean>`ccs.value_checkbox`.as("value_checkbox"),
          sql<string>`ccs.value_user_id`.as("value_user_id"),
          sql<string>`ccs.value_option`.as("value_option"),
          sql<string>`ccs.value_string`.as("value_string"),
          sql<number>`ccs.value_number`.as("value_number"),
          sql<Date>`ccs.value_date`.as("value_date"),
        ] as const)
        .where("cs.workspace_id", "=", workspace_id)
        .orderBy("cs.order", "asc");

      if (!isSuperAdmin && role_id) {
        query = query.where((eb) =>
          eb.or([
            eb("cs.can_view", "is", null),
            sql<boolean>`jsonb_array_length(cs.can_view) = 0`,
            sql<boolean>`cs.can_view @> ${JSON.stringify([role_id])}::jsonb`,
          ])
        );
      }

      const result = await query.execute();

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "card custom field list",
        data: result.map((item) => new CardCustomFieldResponse(item)),
      });
    } catch (e) {
      console.log("CardCustomFieldResponse: err: %o", e);
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getCardCustomField(
    workspace_id: string,
    card_id: string,
    custom_field_id: string
  ): Promise<ResponseData<CardCustomFieldResponse>> {
    try {
      const result = await db
        .selectFrom("custom_field as cs")
        .leftJoin("card_custom_field as ccs", (join) =>
          join.onRef("cs.id", "=", "ccs.custom_field_id")
        )
        .selectAll("cs")
        .select([
          sql<boolean>`ccs.value_checkbox`.as("value_checkbox"),
          sql<string>`ccs.value_user_id`.as("value_user_id"),
          sql<string>`ccs.value_option`.as("value_option"),
          sql<string>`ccs.value_string`.as("value_string"),
          sql<number>`ccs.value_number`.as("value_number"),
          sql<Date>`ccs.value_date`.as("value_date"),
        ] as const)
        .where("cs.workspace_id", "=", workspace_id)
        .where("cs.id", "=", custom_field_id)
        .where("ccs.card_id", "=", card_id)
        .executeTakeFirst();

      if (!result) {
        return new ResponseData({
          status_code: StatusCodes.OK,
          message: "Card custom field found",
        });
      }

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Card custom field found",
        data: new CardCustomFieldResponse(result),
      });
    } catch (e) {
      console.log("CardCustomFieldResponse: err: %o", e);
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async createCardCustomField(
    custom_field_id: string,
    card_id: string,
    data: CardCustomFieldValueUpdate
  ): Promise<ResponseData<CardCustomFieldValueUpdate>> {
    try {
      await db
        .insertInto("card_custom_field")
        .values({
          card_id: card_id,
          custom_field_id: custom_field_id,
          value_string: data?.value_string,
          value_checkbox: data?.value_checkbox,
          value_option: data?.value_option,
          value_number: data?.value_number,
          value_user_id: data?.value_user_id,
        })
        .execute();
      console.log("in repo ini");
      return new ResponseData({
        status_code: StatusCodes.CREATED,
        message: "create card custom field success",
        data: data,
      });
    } catch (e) {
      console.log("in repo err: err: %o", e);
      return new ResponseData({
        status_code: StatusCodes.INTERNAL_SERVER_ERROR,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  async updateCardCustomField(
    custom_field_id: string,
    card_id: string,
    data: CardCustomFieldValueUpdate
  ): Promise<ResponseData<number>> {
    try {
      const result = await db
        .updateTable("card_custom_field")
        .set({
          value_checkbox: data?.value_checkbox,
          value_user_id: data?.value_user_id,
          value_number: data?.value_number,
          value_date: data?.value_date,
          value_string: data?.value_string,
          value_option: data?.value_option,
        })
        .where("custom_field_id", "=", custom_field_id)
        .where("card_id", "=", card_id)
        .executeTakeFirst();

      if (!result.numUpdatedRows || result.numUpdatedRows <= 0) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: "Card custom field not found or no changes made",
          data: 0,
        });
      }

      return new ResponseData({
        status_code: StatusCodes.NO_CONTENT,
        message: "Card custom field updated successfully",
        data: Number(result.numUpdatedRows),
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getCustomFieldById(
    id: string
  ): Promise<ResponseData<CustomFieldDetail | undefined>> {
    try {
      const result = await db
        .selectFrom("custom_field")
        .select([
          "custom_field.id",
          "custom_field.name",
          "custom_field.description",
          "custom_field.workspace_id",
          "custom_field.trigger_id",
          "custom_field.source",
          "custom_field.order",
          "custom_field.type",
          "custom_field.is_show_at_front",
          "custom_field.options",
        ])
        .where("custom_field.id", "=", id)
        .executeTakeFirst();

      if (!result) {
        return new ResponseData({
          status_code: StatusCodes.NOT_FOUND,
          message: "Custom field not found",
          data: undefined,
        });
      }

      const options = (() => {
        if (!result.options) return undefined;
        try {
          return typeof result.options === "string"
            ? JSON.parse(result.options)
            : result.options;
        } catch (e) {
          console.error("Error parsing options:", e);
          return undefined;
        }
      })();

      const customFieldDetail = new CustomFieldDetail({
        id: result.id,
        name: result.name,
        description: result.description,
        workspace_id: result.workspace_id,
        source: result.source as EnumCustomFieldSource,
        order: result.order,
        type: result.type as EnumCustomFieldType,
        is_show_at_front: Boolean(result.is_show_at_front),
        options: options,
      });

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "Custom field found",
        data: customFieldDetail,
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }
}
