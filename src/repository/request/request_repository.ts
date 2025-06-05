import {
  CreateRequestDTO,
  IRequestRepository,
  RequestDTO,
} from "@/controller/request/request_interfaces";
import { Database, UserTable } from "@/types/database";
import { Nullable, SelectExpression } from "kysely";
import db from "../../database";

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
      authorized_by_name: row.authorized_by_name ?? null,
      is_rejected: Boolean(row.is_rejected),
      is_done: Boolean(row.is_done),
      satuan: row.satuan,
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
      "request.is_rejected as is_rejected",
      "request.is_done as is_done",
      "request.satuan as satuan",
      "request.request_sent as request_sent",
      "request.request_received as request_received",
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
      is_rejected: data.is_rejected ?? false,
      is_done: data.is_done ?? false,
      satuan: data.satuan ?? null,
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
    filterData?: any
  ): Promise<{ requests: RequestDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    console.log(filterData, "<< ini isi filter");

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
    if (filterData) {
      // Process each filter field directly using type-safe column references
      if (filterData.isVerified !== undefined) {
        baseQuery = baseQuery.where(
          "request.is_verified",
          "=",
          filterData.isVerified
        );
      }

      if (filterData.isRejected !== undefined) {
        baseQuery = baseQuery.where(
          "request.is_rejected",
          "=",
          filterData.isRejected
        );
      }

      if (filterData.isDone !== undefined) {
        baseQuery = baseQuery.where("request.is_done", "=", filterData.isDone);
      }

      if (filterData.requestType) {
        baseQuery = baseQuery.where(
          "request.request_type",
          "=",
          filterData.requestType
        );
      }

      if (filterData.cardId) {
        baseQuery = baseQuery.where("request.card_id", "=", filterData.cardId);
      }

      if (filterData.requestAmount) {
        baseQuery = baseQuery.where(
          "request.request_amount",
          "=",
          filterData.requestAmount
        );
      }

      if (filterData.satuan) {
        baseQuery = baseQuery.where("request.satuan", "=", filterData.satuan);
      }

      // Handle date range filters
      if (
        filterData.requestReceived &&
        typeof filterData.requestReceived === "object"
      ) {
        if (filterData.requestReceived.from) {
          baseQuery = baseQuery.where(
            "request.updatedAt",
            ">=",
            filterData.requestReceived.from
          );
        }
        if (filterData.requestReceived.to) {
          baseQuery = baseQuery.where(
            "request.updatedAt",
            "<=",
            filterData.requestReceived.to
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
        "request.is_rejected",
        "request.is_done",
        "request.satuan",
        "card.name as card_name",
        "production_user.username as production_user_name",
        "warehouse_user.username as warehouse_user_name",
        "authorized_user.username as authorized_by_name",
      ])
      .orderBy("request.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    console.log(requestsData, "<< ini req data");

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
      is_rejected: Boolean(row.is_rejected),
      is_done: Boolean(row.is_done),
      satuan: row.satuan,
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
        .where("request.id", "=", id)
        .select(this.selectedValue)
        .executeTakeFirstOrThrow();

      return updatedRequest;
    });
  }
}
