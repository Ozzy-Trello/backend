import {
  CreateRequestDTO,
  IRequestRepository,
  RequestDTO,
} from "@/controller/request/request_interfaces";
import db from "../../database";
import { Database } from "@/types/database";
import { Kysely, SelectExpression, ExpressionBuilder, sql } from "kysely";
import { Nullable } from "kysely";
import { UserTable } from "@/types/database";

// const selectedValue: readonly SelectExpression<Database, "request" | "card">[] =

export class RequestRepository implements IRequestRepository {
  async getRequestsByCardId(cardId: string): Promise<RequestDTO[]> {
    const requests = await db
      .selectFrom("request")
      .innerJoin("card", "request.card_id", "card.id")
      .leftJoin(
        "user as production_user",
        "request.production_user",
        "production_user.id"
      )
      .leftJoin(
        "user as warehouse_user",
        "request.warehouse_user",
        "warehouse_user.id"
      )
      .leftJoin(
        "user as authorized_user",
        "request.authorized_by",
        "authorized_user.id"
      )
      .where("request.card_id", "=", cardId)
      .select(this.selectedValue)
      .orderBy("request.createdAt", "desc")
      .execute();

    return requests.map((row: any) => ({
      id: Number(row.id),
      card_id: row.card_id,
      request_type: row.request_type,
      requested_item_id: row.requested_item_id,
      request_amount: row.request_amount,
      is_verified: Boolean(row.is_verified),
      adjustment_no: row.adjustment_no,
      description: row.description,
      item_name: row.item_name,
      adjustment_name: row.adjustment_name,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      request_sent: row.request_sent,
      request_received: row.request_received,
      card_name: row.card_name,
      production_recieved: Boolean(row.production_recieved),
      warehouse_returned: Boolean(row.warehouse_returned),
      warehouse_final_used_amount: row.warehouse_final_used_amount,
      authorized_by: row.authorized_by,
      warehouse_user: row.warehouse_user,
      production_user: row.production_user,
      production_user_name: row.production_user_name ?? null,
      warehouse_user_name: row.warehouse_user_name ?? null,
      authorized_by_name: row.authorized_by_name ?? null
    }));
  }


  selectedValue: readonly SelectExpression<
    Database & { production_user: Nullable<UserTable> } & {
      warehouse_user: Nullable<UserTable>;
    } & { authorized_user: Nullable<UserTable> },
    | "request"
    | "card"
    | "production_user"
    | "warehouse_user"
    | "authorized_user"
  >[] = [];

  constructor() {
    this.selectedValue = [
      "request.id as id",
      "request.card_id as card_id",
      "request.request_type as request_type",
      "request.requested_item_id as requested_item_id",
      "request.request_amount as request_amount",
      "request.is_verified as is_verified",
      "request.adjustment_no as adjustment_no",
      "request.description as description",
      "request.item_name as item_name",
      "request.adjustment_name as adjustment_name",
      "request.createdAt as createdAt",
      "request.updatedAt as updatedAt",
      "request.production_recieved as production_recieved",
      "request.warehouse_returned as warehouse_returned",
      "request.warehouse_final_used_amount as warehouse_final_used_amount",
      "request.authorized_by as authorized_by",
      "request.warehouse_user as warehouse_user",
      "request.production_user as production_user",
      "card.name as card_name",
      "production_user.username as production_user_name",
      "warehouse_user.username as warehouse_user_name",
      "authorized_user.username as authorized_by_name",
    ];
  }

  async createRequest(data: CreateRequestDTO) {
    // Create a values object with required fields
    const values: any = {
      card_id: data.card_id,
      request_type: data.request_type,
      requested_item_id: data.requested_item_id,
      request_amount: data.request_amount,
      is_verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      adjustment_no: data.adjustment_no,
      description: data.description,
      item_name: data.item_name,
      adjustment_name: data.adjustment_name,
      production_recieved: data.production_recieved ?? false,
      warehouse_returned: data.warehouse_returned ?? false,
      warehouse_final_used_amount: data.warehouse_final_used_amount ?? null,
      authorized_by: data.authorized_by ?? null,
      warehouse_user: data.warehouse_user ?? null,
      production_user: data.production_user ?? null,
    };

    const result = await db
      .insertInto("request")
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  async setRequestVerification(id: number, isVerified: boolean) {
    return await db.transaction().execute(async (trx) => {
      if (isVerified) {
        const existingRequest = await trx
          .selectFrom("request")
          .where("id", "=", id)
          .select(["id", "is_verified"])
          .executeTakeFirst();

        if (!existingRequest || existingRequest.is_verified) {
          return null;
        }
      }

      await trx
        .updateTable("request")
        .set({
          is_verified: isVerified,
          updatedAt: new Date(),
        })
        .where("id", "=", id)
        .execute();

      const updatedRequest = await trx
        .selectFrom("request")
        .where("request.id", "=", id)
        .innerJoin("card", "request.card_id", "card.id")
        .leftJoin(
          "user as production_user",
          "request.production_user",
          "production_user.id"
        )
        .leftJoin(
          "user as warehouse_user",
          "request.warehouse_user",
          "warehouse_user.id"
        )
        .leftJoin(
          "user as authorized_user",
          "request.authorized_by",
          "authorized_user.id"
        )
        .select(this.selectedValue)
        .executeTakeFirstOrThrow();

      return updatedRequest;
    });
  }

  async verifyRequest(id: number) {
    return this.setRequestVerification(id, true);
  }

  async unverifyRequest(id: number) {
    return this.setRequestVerification(id, false);
  }

  async getAllRequests(
    page: number,
    limit: number,
    filter?: any
  ): Promise<{ requests: RequestDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    // Build base query
    let baseQuery = db
      .selectFrom("request")
      .innerJoin("card", "request.card_id", "card.id")
      .leftJoin(
        "user as production_user",
        "request.production_user",
        "production_user.id"
      )
      .leftJoin(
        "user as warehouse_user",
        "request.warehouse_user",
        "warehouse_user.id"
      )
      .leftJoin(
        "user as authorized_user",
        "request.authorized_by",
        "authorized_user.id"
      );

    // Apply filters if they exist
    if (filter) {
      if (filter.request_type) {
        baseQuery = baseQuery.where(
          "request.request_type",
          "=",
          filter.request_type
        );
      }
      if (filter.is_verified !== undefined) {
        baseQuery = baseQuery.where(
          "request.is_verified",
          "=",
          filter.is_verified
        );
      }
      if (filter.card_id) {
        baseQuery = baseQuery.where("request.card_id", "=", filter.card_id);
      }
      if (filter.request_sent) {
        if (filter.request_sent.from) {
          baseQuery = baseQuery.where(
            "request.createdAt",
            ">=",
            filter.request_sent.from
          );
        }
        if (filter.request_sent.to) {
          baseQuery = baseQuery.where(
            "request.createdAt",
            "<=",
            filter.request_sent.to
          );
        }
      }
      if (filter.request_received) {
        if (filter.request_received.from) {
          baseQuery = baseQuery.where(
            "request.updatedAt",
            ">=",
            filter.request_received.from
          );
        }
        if (filter.request_received.to) {
          baseQuery = baseQuery.where(
            "request.updatedAt",
            "<=",
            filter.request_received.to
          );
        }
      }
    }

    // Get total count
    const countResult = await baseQuery
      .select(db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    const total = Number(Object.values(countResult)[0]);

    // Get paginated results
    const requestsData = await baseQuery
      .select([
        "request.id as id",
        "request.card_id",
        "request.request_type",
        "request.requested_item_id",
        "request.request_amount",
        "request.is_verified",
        "request.adjustment_no",
        "request.description",
        "request.item_name",
        "request.adjustment_name",
        "request.createdAt",
        "request.updatedAt",
        "request.request_sent",
        "request.request_received",
        "request.production_recieved",
        "request.warehouse_returned",
        "request.warehouse_final_used_amount",
        "request.authorized_by",
        "request.warehouse_user",
        "request.production_user",
        "card.name as card_name",
        "production_user.username as production_user_name",
        "warehouse_user.username as warehouse_user_name",
        "authorized_user.username as authorized_by_name",
      ])
      .orderBy("request.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    const requests: RequestDTO[] = requestsData.map((row: any) => ({
      id: Number(row.id),
      card_id: row.card_id,
      request_type: row.request_type,
      requested_item_id: row.requested_item_id,
      request_amount: row.request_amount,
      is_verified: Boolean(row.is_verified),
      adjustment_no: row.adjustment_no,
      description: row.description,
      item_name: row.item_name,
      adjustment_name: row.adjustment_name,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      request_sent: row.request_sent,
      request_received: row.request_received,
      card_name: row.card_name,
      production_recieved: Boolean(row.production_recieved),
      warehouse_returned: Boolean(row.warehouse_returned),
      warehouse_final_used_amount: row.warehouse_final_used_amount,
      production_user_name: row.production_user_name ?? null,
      warehouse_user_name: row.warehouse_user_name ?? null,
      authorized_by_name: row.authorized_by_name ?? null,
      authorized_by: row.authorized_by,
      warehouse_user: row.warehouse_user,
      production_user: row.production_user,
    }));

    return {
      requests,
      total,
    };
  }

  async patchRequest(id: number, patch: Partial<RequestDTO>) {
    return await db.transaction().execute(async (trx) => {
      // Convert the p
      // atch object to a valid update expression
      const updateData = Object.fromEntries(
        Object.entries(patch).filter(([_, value]) => value !== undefined)
      );

      await trx
        .updateTable("request")
        .set(updateData)
        .where("id", "=", id)
        .execute();

      const updatedRequest = await trx
        .selectFrom("request")
        .innerJoin("card", "request.card_id", "card.id")
        .leftJoin(
          "user as production_user",
          "request.production_user",
          "production_user.id"
        )
        .leftJoin(
          "user as warehouse_user",
          "request.warehouse_user",
          "warehouse_user.id"
        )
        .leftJoin(
          "user as authorized_user",
          "request.authorized_by",
          "authorized_user.id"
        )
        .select(this.selectedValue)
        .executeTakeFirstOrThrow();

      return updatedRequest;
    });
  }
}
