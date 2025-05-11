import {
  CreateRequestDTO,
  IRequestRepository,
  RequestDTO,
} from "./request_interfaces";
import db from "../../database";
import { sql } from "kysely";

type RequestRow = {
  id: number;
  card_id: string;
  request_type: string;
  requested_item_id: string;
  request_amount: number;
  is_verified: boolean;
  adjustment_no: string | null;
  description: string | null;
  item_name: string | null;
  adjustment_name: string | null;
  createdAt: Date;
  updatedAt: Date;
  card_name: string | null;
};

export class RequestRepository implements IRequestRepository {
  async createRequest(data: CreateRequestDTO): Promise<RequestRow> {
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

    const card = await db
      .selectFrom("card")
      .where("id", "=", data.card_id)
      .select(["name"])
      .executeTakeFirst();

    return {
      ...result,
      card_name: card?.name ?? null,
    } as RequestRow;
  }

  async create(data: CreateRequestDTO): Promise<RequestDTO> {
    const result = await this.createRequest(data);
    return this.mapToRequestDTO(result);
  }

  private mapToRequestDTO(row: RequestRow): RequestDTO {
    return {
      id: Number(row.id),
      card_id: row.card_id,
      request_type: row.request_type,
      requested_item_id: row.requested_item_id,
      request_amount: row.request_amount,
      is_verified: Boolean(row.is_verified),
      adjustment_no: row.adjustment_no ?? undefined,
      description: row.description ?? undefined,
      item_name: row.item_name ?? undefined,
      adjustment_name: row.adjustment_name ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      card_name: row.card_name ?? undefined,
    };
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

      return this.mapToRequestDTO(updatedRequest as RequestRow);
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

    const typedRequestsData = requestsData as unknown as RequestRow[];
    return {
      requests: typedRequestsData.map(this.mapToRequestDTO),
      total,
    };
  }

  async getRequestsByCardId(cardId: string): Promise<RequestDTO[]> {
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
      .where((eb) => eb.and([
        eb("request.card_id", "=", cardId),
        eb("request.is_verified", "=", true)
      ]))
      .orderBy("request.createdAt", "desc")
      .execute();

    const typedRequestsData = requestsData as unknown as RequestRow[];
    return typedRequestsData.map(this.mapToRequestDTO);
  }
}
