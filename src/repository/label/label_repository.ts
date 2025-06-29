import db from "@/database";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import { ResponseData, ResponseListData } from "@/utils/response_utils";
import { Paginate } from "@/utils/data_utils";
import { LabelAttributes } from "@/database/schemas/label";
import {
  CardLabelDetail,
  CreateCardLabelData,
  LabelRepositoryI,
  filterLabelDetail,
} from "./label_interfaces";
import { ExpressionBuilder, sql } from "kysely";
import { CardLabelAttributes } from "@/database/schemas/card_label";
import { InternalServerError } from "@/utils/errors";

export class LabelRepository implements LabelRepositoryI {
  createValueFilter(
    eb: ExpressionBuilder<any, any>,
    filter: filterLabelDetail
  ) {
    let query = eb.and([]);
    if (filter.id) query = eb.and([query, eb("id", "=", filter.id)]);
    if (filter.name) query = eb.and([query, eb("name", "=", filter.name)]);
    if (filter.value) query = eb.and([query, eb("value", "=", filter.value)]);
    if (filter.value_type)
      query = eb.and([query, eb("value_type", "=", filter.value_type)]);
    if (filter.workspace_id)
      query = eb.and([query, eb("workspace_id", "=", filter.workspace_id)]);
    // OR conditions
    const orConditions = [];
    if (filter.__orId) orConditions.push(eb("id", "=", filter.__orId));
    if (filter.__orName) orConditions.push(eb("name", "=", filter.__orName));
    if (filter.__orValue) orConditions.push(eb("value", "=", filter.__orValue));
    if (filter.__orValueType)
      orConditions.push(eb("value_type", "=", filter.__orValueType));
    if (orConditions.length > 0) {
      query = eb.and([query, eb.or(orConditions)]);
    }
    // NOT conditions
    const notConditions = [];
    if (filter.__notId) notConditions.push(eb("id", "!=", filter.__notId));
    if (filter.__notName)
      notConditions.push(eb("name", "!=", filter.__notName));
    if (filter.__notValue)
      notConditions.push(eb("value", "!=", filter.__notValue));
    if (filter.__notValueType)
      notConditions.push(eb("value_type", "!=", filter.__notValueType));
    if (notConditions.length > 0) {
      query = eb.and([query, ...notConditions]);
    }
    return query;
  }

  async createLabel(
    data: Omit<LabelAttributes, "id" | "created_at" | "updated_at">
  ): Promise<ResponseData<LabelAttributes>> {
    const id = uuidv4();
    const now = new Date();
    await db
      .insertInto("label")
      .values({
        id,
        name: data.name,
        value: data.value,
        value_type: data.value_type,
        workspace_id: data.workspace_id!,
        created_at: now,
        updated_at: now,
      })
      .execute();
    const label = await db
      .selectFrom("label")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "Label created",
      data: label as LabelAttributes,
    });
  }

  async getLabel(
    filter: filterLabelDetail
  ): Promise<ResponseData<LabelAttributes>> {
    const label = await db
      .selectFrom("label")
      .selectAll()
      .where((eb) => this.createValueFilter(eb, filter))
      .executeTakeFirst();
    if (!label) {
      return new ResponseData({
        status_code: StatusCodes.NOT_FOUND,
        message: "Label not found",
      });
    }
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "OK",
      data: label as LabelAttributes,
    });
  }

  // async getLabels(filter: filterLabelDetail, paginate: Paginate): Promise<ResponseListData<LabelAttributes[]>> {
  //   const total = await db.selectFrom('label').select(({ fn }) => fn.count('id').as('count')).where((eb) => this.createValueFilter(eb, filter)).executeTakeFirst();
  //   paginate.setTotal(Number(total?.count ?? 0));
  //   const rows = await db.selectFrom('label')
  //     .selectAll()
  //     .where((eb) => this.createValueFilter(eb, filter))
  //     .orderBy('created_at', 'asc')
  //     .offset(paginate.getOffset())
  //     .limit(paginate.limit)
  //     .execute();
  //   return new ResponseListData({ status_code: StatusCodes.OK, message: 'OK', data: rows as LabelAttributes[] }, paginate);
  // }

  async updateLabel(
    id: string,
    data: Partial<LabelAttributes>
  ): Promise<ResponseData<LabelAttributes>> {
    const label = await db
      .selectFrom("label")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    if (!label) {
      return new ResponseData({
        status_code: StatusCodes.NOT_FOUND,
        message: "Label not found",
      });
    }
    await db
      .updateTable("label")
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute();
    const updated = await db
      .selectFrom("label")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "Label updated",
      data: updated as LabelAttributes,
    });
  }

  async deleteLabel(id: string): Promise<ResponseData<null>> {
    const label = await db
      .selectFrom("label")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    if (!label) {
      return new ResponseData({
        status_code: StatusCodes.NOT_FOUND,
        message: "Label not found",
      });
    }
    await db.deleteFrom("label").where("id", "=", id).execute();
    return new ResponseData({
      status_code: StatusCodes.NO_CONTENT,
      message: "Label deleted",
    });
  }

  // Card Label
  async addLabelToCard(
    data: CreateCardLabelData
  ): Promise<ResponseData<CardLabelDetail>> {
    const label = await db
      .selectFrom("label")
      .selectAll()
      .where("id", "=", data?.label_id)
      .executeTakeFirst();
    if (!label) {
      return new ResponseData({
        status_code: StatusCodes.NOT_FOUND,
        message: "Label not found",
      });
    }

    const card_label = await db
      .selectFrom("card_label")
      .selectAll()
      .where("card_id", "=", data?.card_id)
      .where("label_id", "=", data?.label_id)
      .executeTakeFirst();
    if (card_label) {
      return new ResponseData({
        status_code: StatusCodes.CONFLICT,
        message: "Label already assigned to the card",
      });
    }

    const now = new Date();
    await db
      .insertInto("card_label")
      .values({
        id: uuidv4(),
        card_id: data.card_id,
        label_id: data.label_id,
        created_by: data.created_by,
        created_at: now,
        updated_at: now,
      })
      .execute();
    return new ResponseData({
      status_code: StatusCodes.OK,
      message: "Label added to card",
    });
  }

  async removeLabelFromCard(
    label_id: string,
    card_id: string
  ): Promise<ResponseData<null>> {
    const label = await db
      .selectFrom("card_label")
      .selectAll()
      .where("card_id", "=", card_id)
      .where("label_id", "=", label_id)
      .executeTakeFirst();
    if (!label) {
      return new ResponseData({
        status_code: StatusCodes.NOT_FOUND,
        message: "Card Label not found",
      });
    }
    await db
      .deleteFrom("card_label")
      .where("card_id", "=", card_id)
      .where("label_id", "=", label_id)
      .execute();
    return new ResponseData({
      status_code: StatusCodes.NO_CONTENT,
      message: "Card Label deleted",
    });
  }

  async getLabels(
    workspace_id: string,
    card_id: string,
    paginate: Paginate
  ): Promise<ResponseListData<CardLabelDetail[]>> {
    try {
      const totalResult = await db
        .selectFrom("label as l")
        .leftJoin("card_label as cl", (join) =>
          join.onRef("l.id", "=", "cl.label_id").on("cl.card_id", "=", card_id)
        )
        .where("l.workspace_id", "=", workspace_id)
        .select(({ fn }) => fn.count("l.id").as("count"))
        .executeTakeFirst();

      paginate.setTotal(Number(totalResult?.count ?? 0));

      const result = await db
        .selectFrom("label as l")
        .leftJoin("card_label as cl", (join) =>
          join.onRef("l.id", "=", "cl.label_id").on("cl.card_id", "=", card_id)
        )
        .selectAll("l")
        .select([
          sql<string>`l.id`.as("label_id"),
          sql<string>`l.name`.as("name"),
          sql<string>`l.value`.as("value"),
          sql<string>`l.value_type`.as("value_type"),
          sql<string>`l.workspace_id`.as("workspace_id"),
          sql<string>`cl.id`.as("id"),
          sql<string>`cl.card_id`.as("card_id"),
          sql<string>`cl.created_by`.as("created_by"),
          sql<Date>`cl.updated_at`.as("value_date"),
          sql<boolean>`CASE WHEN cl.id IS NULL THEN false ELSE true END`.as(
            "is_assigned"
          ),
        ] as const)
        .where("l.workspace_id", "=", workspace_id)
        .orderBy([
          // First, sort assigned labels to the top
          sql<number>`CASE WHEN cl.id IS NOT NULL THEN 0 ELSE 1 END`,
          // Then sort by color hue/saturation for better visual grouping
          sql<number>`
            CASE 
              WHEN l.value IS NULL OR l.value = '' THEN 999
              WHEN l.value LIKE '#B9FBC0%' OR l.value LIKE '#A3D9A5%' OR l.value LIKE '#2A9D8F%' THEN 1  -- Greens
              WHEN l.value LIKE '#FAEDCD%' OR l.value LIKE '#FFE066%' OR l.value LIKE '#B08968%' THEN 2  -- Yellows/Browns
              WHEN l.value LIKE '#FCD5CE%' OR l.value LIKE '#FDBA74%' OR l.value LIKE '#E76F51%' THEN 3  -- Oranges
              WHEN l.value LIKE '#FEC5BB%' OR l.value LIKE '#FF6B6B%' OR l.value LIKE '#E63946%' THEN 4  -- Reds
              WHEN l.value LIKE '#E0BBE4%' OR l.value LIKE '#B39CD0%' OR l.value LIKE '#D291BC%' THEN 5  -- Purples/Pinks
              WHEN l.value LIKE '#7C83FD%' OR l.value LIKE '#007BFF%' OR l.value LIKE '#3182CE%' THEN 6  -- Blues
              WHEN l.value LIKE '#AEDFF7%' OR l.value LIKE '#C4F1F9%' OR l.value LIKE '#4DA8DA%' THEN 7  -- Light Blues
              WHEN l.value LIKE '#6DD3CE%' OR l.value LIKE '#90BE6D%' OR l.value LIKE '#2F855A%' THEN 8  -- Teals/Greens
              WHEN l.value LIKE '#C1E1C1%' OR l.value LIKE '#F9C6D3%' OR l.value LIKE '#D3D3D3%' THEN 9  -- Light colors
              WHEN l.value LIKE '#6C757D%' OR l.value LIKE '#C53030%' OR l.value LIKE '#2D3748%' THEN 10 -- Dark colors
              ELSE 11
            END
          `,
          // Finally, sort by name within each color group
          "l.name",
        ])
        .offset(paginate.getOffset())
        .limit(paginate.limit)
        .execute();

      return new ResponseListData(
        {
          status_code: StatusCodes.OK,
          message: "card label list",
          data: result,
        },
        paginate
      );
    } catch (e) {
      console.log("CardCustomFieldResponse: err: %o", e);
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getAssignedLabelInCard(
    workspace_id: string,
    card_id: string
  ): Promise<ResponseData<CardLabelDetail[]>> {
    try {
      const result = await db
        .selectFrom("label as l")
        .leftJoin("card_label as cl", (join) =>
          join.onRef("l.id", "=", "cl.label_id")
        )
        .selectAll("l")
        .select([
          sql<string>`l.id`.as("label_id"),
          sql<string>`l.name`.as("name"),
          sql<string>`l.value`.as("value"),
          sql<string>`l.value_type`.as("value_type"),
          sql<string>`l.workspace_id`.as("workspace_id"),
          sql<string>`cl.id`.as("id"),
          sql<string>`cl.card_id`.as("card_id"),
          sql<string>`cl.created_by`.as("created_by"),
          sql<Date>`cl.updated_at`.as("value_date"),
          sql<boolean>`CASE WHEN cl.id IS NULL THEN false ELSE true END`.as(
            "is_assigned"
          ),
        ] as const)
        .where("l.workspace_id", "=", workspace_id)
        .where("cl.card_id", "=", card_id)
        .orderBy([
          // Sort by color hue/saturation for better visual grouping
          sql<number>`
            CASE 
              WHEN l.value IS NULL OR l.value = '' THEN 999
              WHEN l.value LIKE '#B9FBC0%' OR l.value LIKE '#A3D9A5%' OR l.value LIKE '#2A9D8F%' THEN 1  -- Greens
              WHEN l.value LIKE '#FAEDCD%' OR l.value LIKE '#FFE066%' OR l.value LIKE '#B08968%' THEN 2  -- Yellows/Browns
              WHEN l.value LIKE '#FCD5CE%' OR l.value LIKE '#FDBA74%' OR l.value LIKE '#E76F51%' THEN 3  -- Oranges
              WHEN l.value LIKE '#FEC5BB%' OR l.value LIKE '#FF6B6B%' OR l.value LIKE '#E63946%' THEN 4  -- Reds
              WHEN l.value LIKE '#E0BBE4%' OR l.value LIKE '#B39CD0%' OR l.value LIKE '#D291BC%' THEN 5  -- Purples/Pinks
              WHEN l.value LIKE '#7C83FD%' OR l.value LIKE '#007BFF%' OR l.value LIKE '#3182CE%' THEN 6  -- Blues
              WHEN l.value LIKE '#AEDFF7%' OR l.value LIKE '#C4F1F9%' OR l.value LIKE '#4DA8DA%' THEN 7  -- Light Blues
              WHEN l.value LIKE '#6DD3CE%' OR l.value LIKE '#90BE6D%' OR l.value LIKE '#2F855A%' THEN 8  -- Teals/Greens
              WHEN l.value LIKE '#C1E1C1%' OR l.value LIKE '#F9C6D3%' OR l.value LIKE '#D3D3D3%' THEN 9  -- Light colors
              WHEN l.value LIKE '#6C757D%' OR l.value LIKE '#C53030%' OR l.value LIKE '#2D3748%' THEN 10 -- Dark colors
              ELSE 11
            END
          `,
          // Then sort by name within each color group
          "l.name",
        ])
        .execute();

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "card label list",
        data: result,
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  async getAllLabels(
    workspace_id: string
  ): Promise<ResponseData<LabelAttributes[]>> {
    try {
      const result = await db
        .selectFrom("label")
        .selectAll()
        .where("workspace_id", "=", workspace_id)
        .orderBy("created_at", "asc")
        .execute();

      return new ResponseData({
        status_code: StatusCodes.OK,
        message: "label list",
        data: result,
      });
    } catch (e) {
      throw new InternalServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        e instanceof Error ? e.message : String(e)
      );
    }
  }
}
