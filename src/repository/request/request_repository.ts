import {
  CreateRequestDTO,
  IRequestRepository,
  RequestDTO,
} from "@/controller/request/request_interfaces";
import db from "../../database";
import { sql } from "kysely";

export class RequestRepository implements IRequestRepository {
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
        .innerJoin("card", "request.card_id", "card.id")
        .where("request.id", "=", id)
        .select([
          "request.id",
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
          "card.name as card_name", // Alias done directly in the select array
        ])
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
    limit: number
  ): Promise<{ requests: RequestDTO[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await db
      .selectFrom("request")
      .select(db.fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    const total = Number(Object.values(countResult)[0]);

    const requestsData = await db
      .selectFrom("request")
      .leftJoin("card", "request.card_id", "card.id")
      .select([
        "request.id",
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
        "card.name as card_name",
      ])
      .orderBy("request.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    const requests: RequestDTO[] = requestsData.map((row) => ({
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
      card_name: row.card_name,
    }));

    return {
      requests,
      total,
    };
  }
}
