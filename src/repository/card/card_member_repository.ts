import db from "@/database";
import { v4 as uuidv4 } from "uuid";
import { CardMemberRepositoryI } from "./card_member_interfaces";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "@/utils/errors";

export class CardMemberRepository implements CardMemberRepositoryI {
  async getMembersByCard(
    card_id: string
  ): Promise<Array<{ id: string; username: string; email: string }>> {
    const data = await db
      .selectFrom("card_member")
      .innerJoin("user", "card_member.user_id", "user.id")
      .where("card_member.card_id", "=", card_id)
      .select([
        "user.id as id",
        "user.username as username",
        "user.email as email",
      ])
      .execute();
    return data;
  }

  async addMembersToCard(
    card_id: string,
    user_ids: string[]
  ): Promise<Array<{ id: string; username: string; email: string }>> {
    const now = new Date();
    for (const user_id of user_ids) {
      await db
        .insertInto("card_member")
        .values({ id: uuidv4(), card_id, user_id, created_at: now })
        .onConflict((oc) => oc.columns(["card_id", "user_id"]).doNothing())
        .execute();
    }
    return this.getMembersByCard(card_id);
  }

  async removeMemberFromCard(card_id: string, user_id: string): Promise<void> {
    await db
      .deleteFrom("card_member")
      .where("card_id", "=", card_id)
      .where("user_id", "=", user_id)
      .execute();
  }

  async isCardExist(card_id: string): Promise<boolean> {
    const card = await db
      .selectFrom("card")
      .where("id", "=", card_id)
      .select("id")
      .executeTakeFirst();
    return !!card;
  }

  async isUserExist(user_id: string): Promise<boolean> {
    const user = await db
      .selectFrom("user")
      .where("id", "=", user_id)
      .select("id")
      .executeTakeFirst();
    return !!user;
  }

  async isMember(card_id: string, user_id: string): Promise<boolean> {
    const member = await db
      .selectFrom("card_member")
      .where("card_id", "=", card_id)
      .where("user_id", "=", user_id)
      .select("id")
      .executeTakeFirst();
    return !!member;
  }

  async getExistingMemberIds(
    card_id: string,
    user_ids: string[]
  ): Promise<string[]> {
    const members = await db
      .selectFrom("card_member")
      .where("card_id", "=", card_id)
      .where("user_id", "in", user_ids)
      .select("user_id")
      .execute();
    return members.map((m) => m.user_id);
  }

  async removeAllMemberFromCard(card_id: string): Promise<number> {
    try {
      await db
        .deleteFrom("card_member")
        .where("card_id", "=", card_id)
        .execute();
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
}
